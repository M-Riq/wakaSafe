import type { AuthResult } from '@wakasafe/data-contracts';
import type { User } from '@wakasafe/domain';
import type { Href } from 'expo-router';
import { create } from 'zustand';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

interface SessionState {
  status: SessionStatus;
  auth: AuthResult | null;
  /** First screen after sign-in (the home redirect reads it); the map by default. */
  landing: Href | null;
  setSignedIn(auth: AuthResult, landing?: Href): void;
  setSignedOut(): void;
  /** Keeps the signed-in user up to date after a profile change. */
  updateUser(user: User): void;
}

/** Client-side session state; the persisted session itself belongs to the AuthRepository. */
export const useSessionStore = create<SessionState>()((set) => ({
  status: 'loading',
  auth: null,
  landing: null,
  setSignedIn: (auth, landing) => set({ status: 'signedIn', auth, landing: landing ?? null }),
  setSignedOut: () => set({ status: 'signedOut', auth: null, landing: null }),
  updateUser: (user) =>
    set((state) => (state.auth?.user.id === user.id ? { auth: { ...state.auth, user } } : state)),
}));
