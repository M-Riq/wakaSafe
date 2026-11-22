import type { AuthResult } from '@wakasafe/data-contracts';
import { create } from 'zustand';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

interface SessionState {
  status: SessionStatus;
  auth: AuthResult | null;
  setSignedIn(auth: AuthResult): void;
  setSignedOut(): void;
}

/** Client-side session state; the persisted session itself belongs to the AuthRepository. */
export const useSessionStore = create<SessionState>()((set) => ({
  status: 'loading',
  auth: null,
  setSignedIn: (auth) => set({ status: 'signedIn', auth }),
  setSignedOut: () => set({ status: 'signedOut', auth: null }),
}));
