import {
  automaticSuspensionEnd,
  collectFieldErrors,
  formatCameroonPhone,
  getClientCapabilities,
  isAbnormalReportFrequency,
  isAccountSuspended,
  isOpenToVotes,
  isPubliclyVisible,
  localDayKey,
  LoginInputSchema,
  monthKey,
  nearestPilotCity,
  normalizeCameroonPhone,
  PasswordSchema,
  PhoneInputSchema,
  PointEntrySchema,
  ProfileRequestSubmissionSchema,
  QuestionSchema,
  ratingAverage,
  ratingPeriodKey,
  RegisterInputSchema,
  reportQuota,
  statusAfterVote,
  validateInput,
  yearKey,
} from '../index';

describe('normalizeCameroonPhone', () => {
  it.each([
    ['6 00 00 00 01', '+237600000001'],
    ['+237 600-000-001', '+237600000001'],
    ['00237600000001', '+237600000001'],
    ['237600000001', '+237600000001'],
    ['(222) 22.22.22', '+237222222222'],
  ])('normalises %s', (input, expected) => {
    expect(normalizeCameroonPhone(input)).toBe(expected);
  });

  it.each(['', '60000000', '7000000001', '+33600000001', '6000000012', 'abc'])(
    'rejects %s',
    (input) => {
      expect(normalizeCameroonPhone(input)).toBeNull();
    },
  );

  it('formats canonical numbers for display', () => {
    expect(formatCameroonPhone('+237600000001')).toBe('+237 600 00 00 01');
    expect(formatCameroonPhone('invalid')).toBe('invalid');
  });
});

describe('Africa/Douala calendar keys', () => {
  it('switches day at local midnight (23:00 UTC), not at UTC midnight', () => {
    expect(localDayKey(new Date('2026-03-31T22:59:59.000Z'))).toBe('2026-03-31');
    expect(localDayKey(new Date('2026-03-31T23:00:00.000Z'))).toBe('2026-04-01');
  });

  it('resets the monthly and annual keys at local midnight', () => {
    expect(monthKey(new Date('2026-03-31T23:00:00.000Z'))).toBe('2026-04');
    expect(yearKey(new Date('2026-12-31T22:59:59.000Z'))).toBe('2026');
    expect(yearKey(new Date('2026-12-31T23:00:00.000Z'))).toBe('2027');
  });

  it('groups ratings in fixed 30-day periods', () => {
    const start = new Date('2026-01-01T12:00:00.000Z');
    const sameDay = new Date('2026-01-01T20:00:00.000Z');
    const later = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    expect(ratingPeriodKey(start)).toBe(ratingPeriodKey(sameDay));
    expect(ratingPeriodKey(later)).not.toBe(ratingPeriodKey(start));
    expect(ratingPeriodKey(start)).toMatch(/^P30-\d+$/);
  });
});

describe('getClientCapabilities', () => {
  const now = new Date('2026-05-10T10:00:00.000Z');
  const active = { status: 'ACTIVE' as const, suspendedUntil: null };

  it('gives full Citizen rights to an active citizen', () => {
    const caps = getClientCapabilities({
      user: { ...active, role: 'CITIZEN' },
      latestRequest: null,
      now,
    });
    expect(caps).toMatchObject({
      canUseClientApp: true,
      isReadOnly: false,
      canReport: true,
      canVote: true,
      canTakeQuiz: true,
      canRate: true,
      canAccessDriverArea: false,
      pendingRequestRole: null,
    });
  });

  it('keeps Citizen rights while a Driver request is pending', () => {
    const caps = getClientCapabilities({
      user: { ...active, role: 'CITIZEN' },
      latestRequest: { requestedRole: 'DRIVER', status: 'PENDING' },
      now,
    });
    expect(caps.canReport).toBe(true);
    expect(caps.canAccessDriverArea).toBe(false);
    expect(caps.pendingRequestRole).toBe('DRIVER');
    expect(caps.canRequestProfile).toBe(false);
  });

  it('lets an active citizen request a profile, again after a rejection', () => {
    const citizen = { ...active, role: 'CITIZEN' as const };
    const request = (latestRequest: Parameters<typeof getClientCapabilities>[0]['latestRequest']) =>
      getClientCapabilities({ user: citizen, latestRequest, now }).canRequestProfile;
    expect(request(null)).toBe(true);
    expect(request({ requestedRole: 'DRIVER', status: 'REJECTED' })).toBe(true);
    expect(
      getClientCapabilities({
        user: { ...citizen, status: 'SUSPENDED', suspendedUntil: null },
        latestRequest: null,
        now,
      }).canRequestProfile,
    ).toBe(false);
    expect(
      getClientCapabilities({ user: { ...active, role: 'DRIVER' }, latestRequest: null, now })
        .canRequestProfile,
    ).toBe(false);
  });

  it('opens the driver area to validated drivers only', () => {
    const caps = getClientCapabilities({
      user: { ...active, role: 'DRIVER' },
      latestRequest: { requestedRole: 'DRIVER', status: 'APPROVED' },
      now,
    });
    expect(caps.canAccessDriverArea).toBe(true);
    expect(caps.pendingRequestRole).toBeNull();
  });

  it('makes a suspended account read-only until the end of the suspension', () => {
    const user = {
      role: 'CITIZEN' as const,
      status: 'SUSPENDED' as const,
      suspendedUntil: '2026-05-11T10:00:00.000Z',
    };
    const caps = getClientCapabilities({ user, latestRequest: null, now });
    expect(caps.isReadOnly).toBe(true);
    expect(caps.canReport || caps.canVote || caps.canTakeQuiz || caps.canRate).toBe(false);
    expect(isAccountSuspended(user, new Date('2026-05-11T10:00:01.000Z'))).toBe(false);
    expect(isAccountSuspended({ ...user, suspendedUntil: null }, now)).toBe(true);
  });

  it('refuses the client app to administrators', () => {
    const caps = getClientCapabilities({
      user: { ...active, role: 'ADMIN' },
      latestRequest: null,
      now,
    });
    expect(caps.canUseClientApp).toBe(false);
    expect(caps.canReport).toBe(false);
  });
});

describe('account inputs (M1)', () => {
  function firstError(schema: Parameters<typeof validateInput>[0], input: unknown) {
    const result = schema.safeParse(input);
    return result.success ? null : collectFieldErrors(result.error);
  }

  it.each([
    ['', 'REQUIRED'],
    ['abc1', 'PASSWORD_TOO_SHORT'],
    ['12345678', 'PASSWORD_NEEDS_LETTER'],
    ['motdepasse', 'PASSWORD_NEEDS_DIGIT'],
    ['x'.repeat(72) + '1', 'PASSWORD_TOO_LONG'],
  ])('rejects the password "%s" with %s', (password, code) => {
    expect(firstError(PasswordSchema, password)).toEqual({ _form: code });
  });

  it('accepts a password with a letter and a digit, accents included', () => {
    expect(PasswordSchema.safeParse('sécurité2026').success).toBe(true);
  });

  it('normalises the phone input and reports blank or invalid numbers', () => {
    expect(PhoneInputSchema.parse('6 99 12 34 56')).toBe('+237699123456');
    expect(firstError(PhoneInputSchema, ' ')).toEqual({ _form: 'REQUIRED' });
    expect(firstError(PhoneInputSchema, '0612')).toEqual({ _form: 'PHONE_INVALID' });
  });

  it('signs in without applying the password policy', () => {
    expect(LoginInputSchema.parse({ phone: '600 00 00 01', password: 'demo-wakasafe' })).toEqual({
      phone: '+237600000001',
      password: 'demo-wakasafe',
    });
    expect(firstError(LoginInputSchema, { phone: '', password: '' })).toEqual({
      phone: 'REQUIRED',
      password: 'REQUIRED',
    });
  });

  it('reports the first error of each registration field', () => {
    expect(
      firstError(RegisterInputSchema, {
        firstName: '  ',
        lastName: 'Atangana',
        phone: '12',
        password: 'court',
        photoUrl: null,
      }),
    ).toEqual({ firstName: 'REQUIRED', phone: 'PHONE_INVALID', password: 'PASSWORD_TOO_SHORT' });
  });

  it('requires the agency of a Driver and the function of an Authority', () => {
    const base = { agencyId: null, organization: ' ', position: null };
    expect(
      firstError(ProfileRequestSubmissionSchema, { ...base, requestedRole: 'DRIVER' }),
    ).toEqual({ agencyId: 'REQUIRED' });
    expect(
      firstError(ProfileRequestSubmissionSchema, { ...base, requestedRole: 'AUTHORITY' }),
    ).toEqual({ organization: 'REQUIRED', position: 'REQUIRED' });
    expect(
      ProfileRequestSubmissionSchema.parse({
        requestedRole: 'DRIVER',
        agencyId: 'agency-1',
        organization: 'ignored',
        position: 'ignored',
      }),
    ).toEqual({
      requestedRole: 'DRIVER',
      agencyId: 'agency-1',
      organization: null,
      position: null,
    });
  });

  it('throws a VALIDATION_FAILED domain error with the field errors', () => {
    expect(() => validateInput(PhoneInputSchema, 'abc')).toThrow(
      expect.objectContaining({
        code: 'VALIDATION_FAILED',
        details: { fields: { _form: 'PHONE_INVALID' } },
      }),
    );
  });
});

describe('domain schemas', () => {
  it('rejects a question whose correct answer is not one of its choices', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      quizId: 'quiz1',
      statement: 'Question ?',
      choices: [
        { id: 'a', label: 'A', position: 0 },
        { id: 'b', label: 'B', position: 1 },
      ],
      correctChoiceId: 'c',
      explanation: 'Explication.',
      position: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a point entry whose source type does not match its reason', () => {
    const result = PointEntrySchema.safeParse({
      id: 'p1',
      userId: 'u1',
      reason: 'QUIZ_CORRECT_ANSWER',
      points: 2,
      sourceType: 'REPORT',
      sourceId: 'r1',
      createdAt: '2026-05-10T10:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('averages the 4 rating criteria', () => {
    expect(
      ratingAverage({ courtesy: 5, punctuality: 4, safeDriving: 3, vehicleCleanliness: 4 }),
    ).toBe(4);
  });
});

describe('report rules (M2)', () => {
  const now = new Date('2026-05-10T10:00:00.000Z');
  const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();
  const tally = (confirmations: number, refutations: number, refutationsSinceValidation = 0) => ({
    confirmations,
    refutations,
    refutationsSinceValidation,
  });

  it('places a point in the zone of the nearest pilot city', () => {
    expect(nearestPilotCity({ latitude: 3.87, longitude: 11.52 })).toBe('Yaoundé');
    expect(nearestPilotCity({ latitude: 4.06, longitude: 9.73 })).toBe('Douala');
    expect(nearestPilotCity({ latitude: 5.2, longitude: 10.2 })).toBe('Bafoussam');
  });

  it('validates a new report at 3 confirmations and invalidates it when refutations win', () => {
    expect(statusAfterVote('CREATED', tally(2, 0))).toBe('CREATED');
    expect(statusAfterVote('CREATED', tally(3, 1))).toBe('VALIDATED');
    expect(statusAfterVote('CREATED', tally(2, 3))).toBe('INVALIDATED');
    expect(statusAfterVote('CREATED', tally(2, 2))).toBe('CREATED');
  });

  it('flags a validated report contested by 3 later refutations', () => {
    expect(statusAfterVote('VALIDATED', tally(4, 3, 2))).toBe('VALIDATED');
    expect(statusAfterVote('VALIDATED', tally(4, 3, 3))).toBe('SUSPICIOUS');
    expect(statusAfterVote('HANDLED', tally(3, 5, 5))).toBe('HANDLED');
  });

  it('shows and opens to votes only the relevant statuses', () => {
    expect(isPubliclyVisible('HANDLED')).toBe(true);
    expect(isPubliclyVisible('SUSPICIOUS')).toBe(false);
    expect(isOpenToVotes('VALIDATED')).toBe(true);
    expect(isOpenToVotes('HANDLED')).toBe(false);
  });

  it('detects more than 5 reports within 10 minutes', () => {
    const five = [1, 2, 3, 4, 5].map(minutesAgo);
    expect(isAbnormalReportFrequency(five, now)).toBe(false);
    expect(isAbnormalReportFrequency([...five, minutesAgo(0)], now)).toBe(true);
    expect(isAbnormalReportFrequency([...five, minutesAgo(11)], now)).toBe(false);
  });

  it('counts the report quota over a rolling 24 h window', () => {
    const tenReports = Array.from({ length: 10 }, (_, i) => minutesAgo(60 * (i + 1)));
    expect(reportQuota(tenReports.slice(1), now)).toEqual({ remaining: 1, availableAt: null });
    expect(reportQuota([...tenReports, minutesAgo(60 * 25)], now)).toEqual({
      remaining: 0,
      // The oldest report of the window (10 h ago) frees a slot 24 h after it was sent.
      availableAt: '2026-05-11T00:00:00.000Z',
    });
  });

  it('suspends for 72 h after 3 abuse alerts within 7 days', () => {
    const day = 24 * 60;
    expect(automaticSuspensionEnd([minutesAgo(day), minutesAgo(2 * day)], now)).toBeNull();
    expect(
      automaticSuspensionEnd([minutesAgo(8 * day), minutesAgo(day), minutesAgo(0)], now),
    ).toBeNull();
    expect(automaticSuspensionEnd([minutesAgo(6 * day), minutesAgo(day), minutesAgo(0)], now)).toBe(
      '2026-05-13T10:00:00.000Z',
    );
  });
});
