import {
  formatCameroonPhone,
  getClientCapabilities,
  isAccountSuspended,
  localDayKey,
  monthKey,
  normalizeCameroonPhone,
  PointEntrySchema,
  QuestionSchema,
  ratingAverage,
  ratingPeriodKey,
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
