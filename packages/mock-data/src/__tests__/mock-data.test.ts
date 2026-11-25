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
