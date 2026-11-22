import type { AuthRepository, AuthResult } from '@wakasafe/data-contracts';
import { DomainError, normalizeCameroonPhone, SessionSchema, type Session } from '@wakasafe/domain';

import { SESSION_STORAGE_KEY } from '../database';
import { demoPasswordHash } from '../password';
import { clone, newId, notImplemented } from '../utils';
import type { MockContext } from './context';

export function createAuthRepository({ db, store, clock, wait }: MockContext): AuthRepository {
  async function readSession(): Promise<Session | null> {
    const raw = await store.get(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = SessionSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  return {
    async login(phoneInput, password) {
      await wait();
      const phone = normalizeCameroonPhone(phoneInput);
      const data = await db.read();
      const user = phone ? data.users.find((u) => u.phone === phone) : undefined;
      const credential = user && data.credentials.find((c) => c.userId === user.id);
      if (!user || credential?.passwordHash !== demoPasswordHash(password, user.id)) {
        throw new DomainError('INVALID_CREDENTIALS', 'Invalid phone number or password');
      }
      const session: Session = {
        token: newId('demo-session'),
        userId: user.id,
        role: user.role,
        startedAt: clock.now().toISOString(),
      };
      await store.set(SESSION_STORAGE_KEY, JSON.stringify(session));
      return { session, user: clone(user) };
    },

    async logout() {
      await store.remove(SESSION_STORAGE_KEY);
    },

    async getSession(): Promise<AuthResult | null> {
      const session = await readSession();
      if (!session) return null;
      const user = (await db.read()).users.find((u) => u.id === session.userId);
      if (!user) {
        await store.remove(SESSION_STORAGE_KEY);
        return null;
      }
      return { session: { ...session, role: user.role }, user: clone(user) };
    },

    register: () => notImplemented('auth.register', 2),
    requestPasswordReset: () => notImplemented('auth.requestPasswordReset', 2),
    resetPassword: () => notImplemented('auth.resetPassword', 2),
  };
}
