import {
  BUSINESS_RULES,
  localDayKey,
  REQUIRED_DOCUMENTS,
  type DomainErrorCode,
} from '@wakasafe/domain';

import {
  createMemoryKeyValueStore,
  createMockRepositories,
  createSeed,
  DATABASE_STORAGE_KEY,
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  DEMO_USER_IDS,
  MockDatabaseSchema,
} from '../index';

const NOW = new Date('2026-05-10T10:00:00.000Z');
const clock = { now: () => NOW };

function expectCode(promise: Promise<unknown>, code: DomainErrorCode) {
  return expect(promise).rejects.toMatchObject({ code });
}

describe('demo seed', () => {
  const seed = createSeed(NOW);

  it('passes the domain schemas', () => {
    expect(MockDatabaseSchema.safeParse(seed).success).toBe(true);
  });

  it('is deterministic for a given date', () => {
    expect(createSeed(NOW)).toEqual(seed);
  });

  it('covers the three pilot cities with plausible coordinates', () => {
    const cities = new Set(seed.reports.map((r) => r.city));
    expect(cities).toEqual(new Set(['Yaoundé', 'Douala', 'Bafoussam']));
    for (const report of seed.reports) {
      expect(report.location.latitude).toBeGreaterThan(3.7);
      expect(report.location.latitude).toBeLessThan(5.6);
      expect(report.location.longitude).toBeGreaterThan(9.6);
      expect(report.location.longitude).toBeLessThan(11.6);
    }
  });

  it('keeps references between entities consistent', () => {
    const userIds = new Set(seed.users.map((u) => u.id));
    const reportIds = new Set(seed.reports.map((r) => r.id));
    const agencyIds = new Set(seed.agencies.map((a) => a.id));
    const sources = new Set([
      ...reportIds,
      ...seed.attempts.map((a) => a.id),
      ...seed.ratings.map((r) => r.id),
    ]);

    expect(seed.reports.every((r) => userIds.has(r.authorId))).toBe(true);
    expect(seed.reportValidations.every((v) => reportIds.has(v.reportId))).toBe(true);
    expect(seed.reportValidations.every((v) => userIds.has(v.userId))).toBe(true);
    expect(seed.drivers.every((d) => userIds.has(d.userId) && agencyIds.has(d.agencyId))).toBe(
      true,
    );
    expect(seed.pointEntries.every((p) => userIds.has(p.userId) && sources.has(p.sourceId))).toBe(
      true,
    );
    expect(seed.notifications.every((n) => userIds.has(n.userId))).toBe(true);
    expect(seed.credentials.map((c) => c.userId).sort()).toEqual([...userIds].sort());
    expect(seed.preferences.map((p) => p.userId).sort()).toEqual([...userIds].sort());
  });

  it('matches vote counters and voting rules', () => {
    for (const report of seed.reports) {
      const votes = seed.reportValidations.filter((v) => v.reportId === report.id);
      expect(votes.filter((v) => v.verdict === 'CONFIRM')).toHaveLength(report.confirmations);
      expect(votes.filter((v) => v.verdict === 'REFUTE')).toHaveLength(report.refutations);
      expect(votes.some((v) => v.userId === report.authorId)).toBe(false);
      expect(new Set(votes.map((v) => v.userId)).size).toBe(votes.length);
      if (report.status === 'VALIDATED') {
        expect(report.confirmations).toBeGreaterThanOrEqual(
          BUSINESS_RULES.reports.validationThreshold,
        );
      }
    }
  });

  it('gives one rating per passenger, driver and period, and quiz days under the limit', () => {
    const keys = seed.ratings.map((r) => `${r.passengerId}|${r.driverId}|${r.periodKey}`);
    expect(new Set(keys).size).toBe(keys.length);

    const perDay = new Map<string, number>();
    for (const attempt of seed.attempts) {
      const key = `${attempt.userId}|${attempt.localDay}`;
      perDay.set(key, (perDay.get(key) ?? 0) + 1);
    }
    expect(Math.max(...perDay.values())).toBeLessThanOrEqual(BUSINESS_RULES.quiz.questionsPerDay);
    // Nobody has used today's quota yet, so the quiz can be demonstrated.
    expect(seed.attempts.some((a) => a.localDay === localDayKey(NOW))).toBe(false);
  });

  it('marks every quiz as placeholder content', () => {
    expect(seed.quizzes).toHaveLength(4);
    expect(seed.quizzes.every((q) => q.isPlaceholderContent)).toBe(true);
    expect(seed.questions).toHaveLength(20);
  });

  it('provides the required documents and a matching profile for each request', () => {
    for (const request of seed.profileRequests) {
      const types = seed.supportingDocuments
        .filter((d) => d.profileRequestId === request.id)
        .map((d) => d.type);
      expect(types).toEqual(REQUIRED_DOCUMENTS[request.requestedRole]);
    }
    const driverIds = seed.users.filter((u) => u.role === 'DRIVER').map((u) => u.id);
    expect(seed.drivers.map((d) => d.userId).sort()).toEqual(driverIds.sort());
  });

  it('exposes demo accounts that exist in the seed', () => {
    for (const account of DEMO_ACCOUNTS) {
      const user = seed.users.find((u) => u.id === account.userId);
      expect(user?.phone).toBe(account.phone);
      expect(user?.role).toBe(account.role);
    }
  });
});

describe('mock repositories', () => {
  it('signs in with a demo account and restores the session from the store', async () => {
    const store = createMemoryKeyValueStore();
    const repos = createMockRepositories({ store, clock });

    const result = await repos.auth.login('6 00 00 00 01', DEMO_PASSWORD);
    expect(result.user.id).toBe(DEMO_USER_IDS.citizen);
    expect(result.session.role).toBe('CITIZEN');

    const reopened = createMockRepositories({ store, clock });
    const restored = await reopened.auth.getSession();
    expect(restored?.user.id).toBe(DEMO_USER_IDS.citizen);

    await reopened.auth.logout();
    expect(await reopened.auth.getSession()).toBeNull();
  });

  it('rejects a wrong password or an unknown phone number', async () => {
    const repos = createMockRepositories({ store: createMemoryKeyValueStore(), clock });
    await expectCode(repos.auth.login('+237600000001', 'wrong'), 'INVALID_CREDENTIALS');
    await expectCode(repos.auth.login('+237699999999', DEMO_PASSWORD), 'INVALID_CREDENTIALS');
    await expectCode(repos.auth.login('not a phone', DEMO_PASSWORD), 'INVALID_CREDENTIALS');
  });

  it('reads the profile data of phase 1', async () => {
    const repos = createMockRepositories({ store: createMemoryKeyValueStore(), clock });
    const request = await repos.profileRequests.getForUser(DEMO_USER_IDS.pendingDriver);
    expect(request?.status).toBe('PENDING');
    expect(await repos.profileRequests.listDocuments(request!.id)).toHaveLength(2);
    expect(await repos.users.listSafetyContacts(DEMO_USER_IDS.citizen)).toHaveLength(2);
    expect((await repos.users.getPreferences(DEMO_USER_IDS.citizen)).language).toBe('fr');
    expect(await repos.users.list({ role: 'DRIVER' })).toHaveLength(4);
    expect(await repos.agencies.list()).toHaveLength(3);
    await expectCode(repos.users.getById('missing'), 'NOT_FOUND');
  });

  it('returns copies that cannot alter the stored data', async () => {
    const repos = createMockRepositories({ store: createMemoryKeyValueStore(), clock });
    const user = await repos.users.getById(DEMO_USER_IDS.citizen);
    user.firstName = 'Modifié';
    expect((await repos.users.getById(DEMO_USER_IDS.citizen)).firstName).toBe('Nadège');
  });

  it('replaces an invalid stored database with a fresh seed', async () => {
    const store = createMemoryKeyValueStore({ [DATABASE_STORAGE_KEY]: '{"version":0}' });
    const repos = createMockRepositories({ store, clock });
    expect((await repos.agencies.list()).length).toBe(3);
    const stored = JSON.parse((await store.get(DATABASE_STORAGE_KEY))!);
    expect(MockDatabaseSchema.safeParse(stored).success).toBe(true);
  });

  it('resets the demo and signs the user out', async () => {
    const store = createMemoryKeyValueStore();
    const repos = createMockRepositories({ store, clock });
    await repos.auth.login('+237600000002', DEMO_PASSWORD);
    await store.set(DATABASE_STORAGE_KEY, 'corrupted');

    await repos.resetDemo();

    expect(await repos.auth.getSession()).toBeNull();
    const stored = JSON.parse((await store.get(DATABASE_STORAGE_KEY))!);
    expect(MockDatabaseSchema.safeParse(stored).success).toBe(true);
  });

  it('flags the operations of later phases as not implemented', async () => {
    const repos = createMockRepositories({ store: createMemoryKeyValueStore(), clock });
    await expect(repos.reports.list()).rejects.toMatchObject({
      code: 'NOT_IMPLEMENTED',
      details: { phase: 3 },
    });
    await expectCode(repos.quiz.getDailyQuestions(DEMO_USER_IDS.citizen), 'NOT_IMPLEMENTED');
  });
});

describe('mock accounts and profiles (M1)', () => {
  const newcomer = {
    firstName: ' Aïcha ',
    lastName: 'Bello',
    phone: '6 99 11 22 33',
    password: 'Securite2026',
    photoUrl: null,
  };

  function setup(now: () => Date = clock.now) {
    const store = createMemoryKeyValueStore();
    return { store, repos: createMockRepositories({ store, clock: { now } }) };
  }

  it('registers an active citizen, opens a session and accepts the new password', async () => {
    const { repos } = setup();
    const { user, session } = await repos.auth.register(newcomer);

    expect(user).toMatchObject({
      firstName: 'Aïcha',
      phone: '+237699112233',
      role: 'CITIZEN',
      status: 'ACTIVE',
    });
    expect(session.userId).toBe(user.id);
    expect((await repos.auth.getSession())?.user.id).toBe(user.id);
    expect((await repos.users.getPreferences(user.id)).nearbyDangerAlerts).toBe(true);
    await expect(repos.auth.login('+237699112233', 'Securite2026')).resolves.toBeTruthy();
  });

  it('rejects an invalid registration with field codes and a phone already in use', async () => {
    const { repos } = setup();
    await expect(
      repos.auth.register({ ...newcomer, firstName: '', password: 'court' }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      details: { fields: { firstName: 'REQUIRED', password: 'PASSWORD_TOO_SHORT' } },
    });
    await expect(
      repos.auth.register({ ...newcomer, phone: '+237600000001' }),
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      details: { reason: 'PHONE_TAKEN', fields: { phone: 'PHONE_TAKEN' } },
    });
  });

  it('resets a password with the code, once, and closes the session of the account', async () => {
    const { repos } = setup();
    await repos.auth.login('+237600000001', DEMO_PASSWORD);

    const unknown = await repos.auth.requestPasswordReset('+237699999999');
    expect(unknown.demoCode).toBeNull();

    const { demoCode, expiresAt } = await repos.auth.requestPasswordReset('6 00 00 00 01');
    expect(demoCode).toMatch(/^\d{6}$/);
    expect(new Date(expiresAt).getTime() - NOW.getTime()).toBe(
      BUSINESS_RULES.accounts.resetCodeValidityMinutes * 60_000,
    );

    const wrongCode = demoCode === '000000' ? '111111' : '000000';
    const reset = { phone: '+237600000001', code: wrongCode, newPassword: 'NouveauCode9' };
    await expectCode(repos.auth.resetPassword(reset), 'INVALID_RESET_CODE');
    await repos.auth.resetPassword({ ...reset, code: demoCode! });

    expect(await repos.auth.getSession()).toBeNull();
    await expectCode(repos.auth.login('+237600000001', DEMO_PASSWORD), 'INVALID_CREDENTIALS');
    await expect(repos.auth.login('+237600000001', 'NouveauCode9')).resolves.toBeTruthy();
    await expectCode(repos.auth.resetPassword({ ...reset, code: demoCode! }), 'INVALID_RESET_CODE');
  });

  it('invalidates a reset code after it expires or after too many wrong attempts', async () => {
    let now = NOW;
    const { repos } = setup(() => now);
    const reset = { phone: '+237600000001', newPassword: 'NouveauCode9' };

    const first = await repos.auth.requestPasswordReset(reset.phone);
    now = new Date(first.expiresAt);
    await expectCode(
      repos.auth.resetPassword({ ...reset, code: first.demoCode! }),
      'INVALID_RESET_CODE',
    );

    const second = await repos.auth.requestPasswordReset(reset.phone);
    const wrongCode = second.demoCode === '000000' ? '111111' : '000000';
    for (let i = 0; i < BUSINESS_RULES.accounts.resetCodeMaxAttempts; i += 1) {
      await expectCode(
        repos.auth.resetPassword({ ...reset, code: wrongCode }),
        'INVALID_RESET_CODE',
      );
    }
    await expectCode(
      repos.auth.resetPassword({ ...reset, code: second.demoCode! }),
      'INVALID_RESET_CODE',
    );
  });

  it('updates the profile and the preferences but never the phone number', async () => {
    const { repos } = setup();
    const user = await repos.users.updateProfile(DEMO_USER_IDS.citizen, {
      firstName: 'Nadia',
      phone: '+237699000000',
    } as never);
    expect(user).toMatchObject({
      firstName: 'Nadia',
      lastName: 'Atangana',
      phone: '+237600000001',
    });

    const preferences = await repos.users.updatePreferences(DEMO_USER_IDS.citizen, {
      quizReminders: false,
    });
    expect(preferences).toMatchObject({ quizReminders: false, nearbyDangerAlerts: true });
    await expectCode(
      repos.users.updateProfile(DEMO_USER_IDS.citizen, { lastName: ' ' }),
      'VALIDATION_FAILED',
    );
  });

  it('manages up to the maximum number of distinct safety contacts', async () => {
    const { repos } = setup();
    const userId = DEMO_USER_IDS.citizen;
    const existing = await repos.users.listSafetyContacts(userId);
    const { maxSafetyContacts } = BUSINESS_RULES.accounts;

    await expect(
      repos.users.upsertSafetyContact(userId, {
        name: 'Doublon',
        phone: existing[0]!.phone,
        relation: null,
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT', details: { reason: 'SAFETY_CONTACT_DUPLICATE' } });

    for (let i = existing.length; i < maxSafetyContacts; i += 1) {
      await repos.users.upsertSafetyContact(userId, {
        name: `Contact ${i}`,
        phone: `+23769900000${i}`,
        relation: ' ',
      });
    }
    await expect(
      repos.users.upsertSafetyContact(userId, {
        name: 'De trop',
        phone: '+237699000099',
        relation: null,
      }),
    ).rejects.toMatchObject({
      code: 'QUOTA_EXCEEDED',
      details: { reason: 'SAFETY_CONTACTS_LIMIT' },
    });

    const updated = await repos.users.upsertSafetyContact(userId, {
      ...existing[0]!,
      relation: 'Cousin',
    });
    expect(updated).toMatchObject({ id: existing[0]!.id, relation: 'Cousin' });

    await repos.users.removeSafetyContact(userId, existing[0]!.id);
    expect(await repos.users.listSafetyContacts(userId)).toHaveLength(maxSafetyContacts - 1);
    await expectCode(repos.users.removeSafetyContact(userId, existing[0]!.id), 'NOT_FOUND');
    await expectCode(
      repos.users.removeSafetyContact(DEMO_USER_IDS.driver, existing[1]!.id),
      'NOT_FOUND',
    );
  });

  it('submits one pending profile request at a time and collects its documents', async () => {
    const { repos } = setup();
    const userId = DEMO_USER_IDS.citizen;
    const agencyId = (await repos.agencies.list())[0]!.id;

    await expect(
      repos.profileRequests.submit(userId, {
        requestedRole: 'DRIVER',
        agencyId: 'agency-unknown',
        organization: null,
        position: null,
      }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      details: { fields: { agencyId: 'INVALID' } },
    });

    const request = await repos.profileRequests.submit(userId, {
      requestedRole: 'DRIVER',
      agencyId,
      organization: 'ignorée',
      position: null,
    });
    expect(request).toMatchObject({ status: 'PENDING', agencyId, organization: null });
    expect((await repos.users.getById(userId)).role).toBe('CITIZEN');

    await expect(
      repos.profileRequests.submit(userId, {
        requestedRole: 'AUTHORITY',
        agencyId: null,
        organization: 'Police',
        position: 'Agent',
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT', details: { reason: 'PROFILE_REQUEST_PENDING' } });

    await repos.profileRequests.uploadDocument(request.id, { type: 'ID_CARD', fileUrl: 'a.jpg' });
    await repos.profileRequests.uploadDocument(request.id, { type: 'ID_CARD', fileUrl: 'b.jpg' });
    await expect(
      repos.profileRequests.uploadDocument(request.id, {
        type: 'FUNCTION_PROOF',
        fileUrl: 'c.jpg',
      }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
      details: { fields: { type: 'INVALID' } },
    });
    const documents = await repos.profileRequests.listDocuments(request.id);
    expect(documents).toEqual([expect.objectContaining({ type: 'ID_CARD', fileUrl: 'b.jpg' })]);
  });

  it('applies the profile request rules to granted, rejected and suspended accounts', async () => {
    const { repos } = setup();
    const authority = {
      requestedRole: 'AUTHORITY' as const,
      agencyId: null,
      organization: 'Mairie',
      position: 'Agent',
    };

    await expect(
      repos.profileRequests.submit(DEMO_USER_IDS.driver, authority),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', details: { reason: 'PROFILE_ALREADY_GRANTED' } });
    await expectCode(
      repos.profileRequests.submit(DEMO_USER_IDS.suspended, authority),
      'ACCOUNT_SUSPENDED',
    );
    await expect(repos.profileRequests.submit('user-106', authority)).resolves.toMatchObject({
      status: 'PENDING',
    });

    const reviewed = await repos.profileRequests.getForUser(DEMO_USER_IDS.driver);
    await expect(
      repos.profileRequests.uploadDocument(reviewed!.id, { type: 'ID_CARD', fileUrl: 'a.jpg' }),
    ).rejects.toMatchObject({ code: 'CONFLICT', details: { reason: 'PROFILE_REQUEST_CLOSED' } });
  });
});
