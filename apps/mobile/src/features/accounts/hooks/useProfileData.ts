import { getClientCapabilities } from '@wakasafe/domain';
import { useQuery } from '@tanstack/react-query';

import { useRepositories } from '@/data';

import { useCurrentUser } from './useSession';

export const accountKeys = {
  latestRequest: (userId: string) => ['accounts', userId, 'latest-request'] as const,
  documents: (requestId: string) => ['accounts', 'documents', requestId] as const,
  safetyContacts: (userId: string) => ['accounts', userId, 'safety-contacts'] as const,
  preferences: (userId: string) => ['accounts', userId, 'preferences'] as const,
  agency: (agencyId: string) => ['agencies', agencyId] as const,
};

export function useLatestProfileRequest(userId: string) {
  const { profileRequests } = useRepositories();
  return useQuery({
    queryKey: accountKeys.latestRequest(userId),
    queryFn: () => profileRequests.getForUser(userId),
  });
}

export function useProfileDocuments(requestId: string | undefined) {
  const { profileRequests } = useRepositories();
  return useQuery({
    queryKey: accountKeys.documents(requestId ?? ''),
    queryFn: () => profileRequests.listDocuments(requestId!),
    enabled: Boolean(requestId),
  });
}

export function useSafetyContacts(userId: string) {
  const { users } = useRepositories();
  return useQuery({
    queryKey: accountKeys.safetyContacts(userId),
    queryFn: () => users.listSafetyContacts(userId),
  });
}

export function usePreferences(userId: string) {
  const { users } = useRepositories();
  return useQuery({
    queryKey: accountKeys.preferences(userId),
    queryFn: () => users.getPreferences(userId),
  });
}

export function useAgency(agencyId: string | null | undefined) {
  const { agencies } = useRepositories();
  return useQuery({
    queryKey: accountKeys.agency(agencyId ?? ''),
    queryFn: () => agencies.getById(agencyId!),
    enabled: Boolean(agencyId),
  });
}

/** Rights of the signed-in user (domain rules), refined once the latest request is loaded. */
export function useCapabilities() {
  const user = useCurrentUser();
  const request = useLatestProfileRequest(user.id);
  return getClientCapabilities({ user, latestRequest: request.data ?? null, now: new Date() });
}
