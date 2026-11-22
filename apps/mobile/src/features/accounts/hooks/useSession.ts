import type { AuthResult } from '@wakasafe/data-contracts';
import { DomainError } from '@wakasafe/domain';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useDemoTools, useRepositories } from '@/data';
import { ADMIN_ACCOUNT_REASON } from '@/lib/errors';

import { useSessionStore } from '../session-store';

/** Restores the persisted session once, when the app starts. */
export function useSessionBootstrap() {
  const { auth } = useRepositories();
  const status = useSessionStore((state) => state.status);

  useEffect(() => {
    if (useSessionStore.getState().status !== 'loading') return;
    let cancelled = false;
    auth
      .getSession()
      .then(async (result) => {
        if (cancelled) return;
        if (result && result.user.role !== 'ADMIN') {
          useSessionStore.getState().setSignedIn(result);
        } else {
          if (result) await auth.logout();
          useSessionStore.getState().setSignedOut();
        }
      })
      .catch(() => {
        if (!cancelled) useSessionStore.getState().setSignedOut();
      });
    return () => {
      cancelled = true;
    };
  }, [auth]);

  return status;
}

/** Signed-in user. Only call it inside the (app) group, which requires a session. */
export function useCurrentUser() {
  const auth = useSessionStore((state) => state.auth);
  if (!auth) throw new Error('useCurrentUser requires a signed-in user');
  return auth.user;
}

export function useSignIn() {
  const { auth } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ phone, password }: { phone: string; password: string }) => {
      const result: AuthResult = await auth.login(phone, password);
      if (result.user.role === 'ADMIN') {
        await auth.logout();
        throw new DomainError('FORBIDDEN', 'Administrators use the admin app', {
          reason: ADMIN_ACCOUNT_REASON,
        });
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.clear();
      useSessionStore.getState().setSignedIn(result);
    },
  });
}

export function useSignOut() {
  const { auth } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => auth.logout(),
    onSuccess: () => {
      queryClient.clear();
      useSessionStore.getState().setSignedOut();
    },
  });
}

export function useResetDemo() {
  const demo = useDemoTools();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await demo?.reset();
    },
    onSuccess: () => {
      queryClient.clear();
      useSessionStore.getState().setSignedOut();
    },
  });
}
