import type {
  DocumentUpload,
  PreferencesUpdate,
  ProfileRequestSubmission,
  ProfileUpdate,
  SafetyContactInput,
} from '@wakasafe/data-contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRepositories } from '@/data';

import { useSessionStore } from '../session-store';
import { accountKeys } from './useProfileData';
import { useCurrentUser } from './useSession';

// F1.4 / F1.5 mutations of the signed-in user.

export function useUpdateProfile() {
  const { users } = useRepositories();
  const user = useCurrentUser();
  return useMutation({
    mutationFn: (update: ProfileUpdate) => users.updateProfile(user.id, update),
    onSuccess: (updated) => useSessionStore.getState().updateUser(updated),
  });
}

export function useUpdatePreferences() {
  const { users } = useRepositories();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: PreferencesUpdate) => users.updatePreferences(user.id, update),
    onSuccess: (preferences) =>
      queryClient.setQueryData(accountKeys.preferences(user.id), preferences),
  });
}

export function useSaveSafetyContact() {
  const { users } = useRepositories();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SafetyContactInput) => users.upsertSafetyContact(user.id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountKeys.safetyContacts(user.id) }),
  });
}

export function useRemoveSafetyContact() {
  const { users } = useRepositories();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) => users.removeSafetyContact(user.id, contactId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: accountKeys.safetyContacts(user.id) }),
  });
}

export function useSubmitProfileRequest() {
  const { profileRequests } = useRepositories();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submission: ProfileRequestSubmission) =>
      profileRequests.submit(user.id, submission),
    onSuccess: (request) => queryClient.setQueryData(accountKeys.latestRequest(user.id), request),
  });
}

export function useUploadDocument(requestId: string) {
  const { profileRequests } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (upload: DocumentUpload) => profileRequests.uploadDocument(requestId, upload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.documents(requestId) }),
  });
}
