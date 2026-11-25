import type {
  AuthRepository,
  AuthResult,
  DocumentUpload,
  ProfileRequestSubmission,
  RegisterInput,
  ResetPasswordInput,
} from '@wakasafe/data-contracts';
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

/** Signs in, but never lets an administrator into the client app (ADR-0009). */
async function signInClient(auth: AuthRepository, phone: string, password: string) {
  const result: AuthResult = await auth.login(phone, password);
  if (result.user.role === 'ADMIN') {
    await auth.logout();
    throw new DomainError('FORBIDDEN', 'Administrators use the admin app', {
      reason: ADMIN_ACCOUNT_REASON,
    });
  }
  return result;
}

export function useSignIn() {
  const { auth } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      signInClient(auth, phone, password),
    onSuccess: (result) => {
      queryClient.clear();
      useSessionStore.getState().setSignedIn(result);
    },
  });
}

export interface RegistrationRequest {
  account: RegisterInput;
  /** Driver or Authority request sent right after the account is created (F1.3). */
  profileRequest: ProfileRequestSubmission | null;
  documents: DocumentUpload[];
}

/**
 * F1.1 / F1.3 / F1.4: creates the Citizen account, then the optional profile request and its
 * documents. The account exists as soon as the first call succeeds, so a later failure does
 * not cancel the sign-in: the user can finish the request from the profile.
 */
export function useRegister() {
  const { auth, profileRequests } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ account, profileRequest, documents }: RegistrationRequest) => {
      const result = await auth.register(account);
      if (!profileRequest) return result;
      try {
        const request = await profileRequests.submit(result.user.id, profileRequest);
        for (const document of documents) {
          await profileRequests.uploadDocument(request.id, document);
        }
      } catch {
        // The profile screen shows what is missing and offers to complete it.
      }
      return result;
    },
    onSuccess: (result, { profileRequest }) => {
      queryClient.clear();
      useSessionStore.getState().setSignedIn(result, profileRequest ? '/profile' : undefined);
    },
  });
}

export function useRequestPasswordReset() {
  const { auth } = useRepositories();
  return useMutation({ mutationFn: (phone: string) => auth.requestPasswordReset(phone) });
}

/** F1.2: sets the new password with the received code, then signs in with it. */
export function useResetPassword() {
  const { auth } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ResetPasswordInput) => {
      await auth.resetPassword(input);
      return signInClient(auth, input.phone, input.newPassword);
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
