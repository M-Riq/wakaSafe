import type { AuthRepository, AuthResult } from '@wakasafe/data-contracts';
import {
  BUSINESS_RULES,
  DomainError,
  normalizeCameroonPhone,
  PasswordResetRequestInputSchema,
  RegisterInputSchema,
  ResetPasswordInputSchema,
  SessionSchema,
  validateInput,
  type Session,
  type User,
} from '@wakasafe/domain';

import { SESSION_STORAGE_KEY } from '../database';
import { demoPasswordHash } from '../password';
import type { MockDatabase } from '../schema';
import { clone, newId } from '../utils';
import type { MockContext } from './context';

const { resetCodeLength, resetCodeMaxAttempts, resetCodeValidityMinutes } = BUSINESS_RULES.accounts;

/** Demo only: a real backend sends a code from a cryptographically secure generator by SMS. */
function randomDigits(length: number): string {
  let code = '';
  for (let i = 0; i < length; i += 1) code += Math.floor(Math.random() * 10).toString();
  return code;
}

function removeReset(data: MockDatabase, userId: string) {
  data.passwordResets = data.passwordResets.filter((r) => r.userId !== userId);
}

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

  async function openSession(user: User): Promise<AuthResult> {
    const session: Session = {
      token: newId('demo-session'),
      userId: user.id,
      role: user.role,
      startedAt: clock.now().toISOString(),
    };
    await store.set(SESSION_STORAGE_KEY, JSON.stringify(session));
    return { session, user: clone(user) };
  }

  return {
    async register(input) {
      await wait();
      const data = validateInput(RegisterInputSchema, input);
      const user = await db.update((state) => {
        if (state.users.some((u) => u.phone === data.phone)) {
          throw new DomainError('CONFLICT', 'Phone number already registered', {
            reason: 'PHONE_TAKEN',
            fields: { phone: 'PHONE_TAKEN' },
          });
        }
        // F1.3: the account is an active Citizen; a Driver or Authority profile is a separate request.
        const created: User = {
          id: newId('user'),
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          photoUrl: data.photoUrl,
          role: 'CITIZEN',
          status: 'ACTIVE',
          suspendedUntil: null,
          createdAt: clock.now().toISOString(),
        };
        state.users.push(created);
        state.credentials.push({
          userId: created.id,
          passwordHash: demoPasswordHash(data.password, created.id),
        });
        state.preferences.push({
          userId: created.id,
          nearbyDangerAlerts: true,
          nearbyRadiusKm: BUSINESS_RULES.notifications.defaultNearbyRadiusKm,
          quizReminders: true,
          language: 'fr',
        });
        return created;
      });
      return openSession(user);
    },

    async login(phoneInput, password) {
      await wait();
      const phone = normalizeCameroonPhone(phoneInput);
      const data = await db.read();
      const user = phone ? data.users.find((u) => u.phone === phone) : undefined;
      const credential = user && data.credentials.find((c) => c.userId === user.id);
      if (!user || credential?.passwordHash !== demoPasswordHash(password, user.id)) {
        throw new DomainError('INVALID_CREDENTIALS', 'Invalid phone number or password');
      }
      return openSession(user);
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

    async requestPasswordReset(phoneInput) {
      await wait();
      const { phone } = validateInput(PasswordResetRequestInputSchema, { phone: phoneInput });
      const expiresAt = new Date(
        clock.now().getTime() + resetCodeValidityMinutes * 60_000,
      ).toISOString();
      const demoCode = await db.update((state) => {
        const user = state.users.find((u) => u.phone === phone);
        if (!user) return null;
        const code = randomDigits(resetCodeLength);
        removeReset(state, user.id);
        state.passwordResets.push({
          userId: user.id,
          codeHash: demoPasswordHash(code, user.id),
          expiresAt,
          failedAttempts: 0,
        });
        return code;
      });
      // The answer does not say whether the number has an account; only the demo code differs.
      return { expiresAt, demoCode };
    },

    async resetPassword(input) {
      await wait();
      const { phone, code, newPassword } = validateInput(ResetPasswordInputSchema, input);
      const outcome = await db.update((state) => {
        const user = state.users.find((u) => u.phone === phone);
        const reset = user && state.passwordResets.find((r) => r.userId === user.id);
        if (!user || !reset) return { status: 'missing' } as const;
        if (new Date(reset.expiresAt).getTime() <= clock.now().getTime()) {
          removeReset(state, user.id);
          return { status: 'expired' } as const;
        }
        if (reset.codeHash !== demoPasswordHash(code, user.id)) {
          reset.failedAttempts += 1;
          if (reset.failedAttempts >= resetCodeMaxAttempts) removeReset(state, user.id);
          return { status: 'wrong' } as const;
        }
        const passwordHash = demoPasswordHash(newPassword, user.id);
        state.credentials = [
          ...state.credentials.filter((c) => c.userId !== user.id),
          { userId: user.id, passwordHash },
        ];
        removeReset(state, user.id);
        return { status: 'done', userId: user.id } as const;
      });
      if (outcome.status !== 'done') {
        throw new DomainError('INVALID_RESET_CODE', 'Invalid or expired reset code', {
          outcome: outcome.status,
        });
      }
      // A new password closes the session of this account.
      const session = await readSession();
      if (session?.userId === outcome.userId) await store.remove(SESSION_STORAGE_KEY);
    },
  };
}
