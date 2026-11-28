import type { ReportFilters } from '@wakasafe/data-contracts';
import type { ReportDraft, Verdict } from '@wakasafe/domain';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRepositories } from '@/data';
import { useCurrentUser, useSessionStore } from '@/features/accounts';

export const reportKeys = {
  all: ['reports'] as const,
  list: (filters: ReportFilters) => ['reports', 'list', filters] as const,
  detail: (reportId: string) => ['reports', 'detail', reportId] as const,
  vote: (reportId: string, userId: string) => ['reports', 'vote', reportId, userId] as const,
  quota: (userId: string) => ['reports', 'quota', userId] as const,
};

export function useReportList(filters: ReportFilters) {
  const { reports } = useRepositories();
  return useQuery({ queryKey: reportKeys.list(filters), queryFn: () => reports.list(filters) });
}

export function useReport(reportId: string) {
  const { reports } = useRepositories();
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: () => reports.getById(reportId),
  });
}

export function useUserVote(reportId: string) {
  const { reports } = useRepositories();
  const user = useCurrentUser();
  return useQuery({
    queryKey: reportKeys.vote(reportId, user.id),
    queryFn: () => reports.getUserVote(reportId, user.id),
  });
}

/** F2.6 remaining actions over the rolling 24 h window. */
export function useActionQuota() {
  const { reports } = useRepositories();
  const user = useCurrentUser();
  return useQuery({
    queryKey: reportKeys.quota(user.id),
    queryFn: () => reports.getActionQuota(user.id),
  });
}

/**
 * Reloads the signed-in user: an abuse alert may have suspended the account (F2.6), which
 * switches the whole app to read-only mode.
 */
function useRefreshCurrentUser() {
  const { users } = useRepositories();
  const user = useCurrentUser();
  return async () => {
    try {
      useSessionStore.getState().updateUser(await users.getById(user.id));
    } catch {
      // The next action reports the suspension anyway.
    }
  };
}

export function useCreateReport() {
  const { reports } = useRepositories();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const refreshUser = useRefreshCurrentUser();
  return useMutation({
    mutationFn: (draft: ReportDraft) =>
      reports.create({ authorId: user.id, draft, origin: 'ONLINE' }),
    onSettled: async () => {
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

export function useVote(reportId: string) {
  const { reports } = useRepositories();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (verdict: Verdict) => reports.vote({ reportId, userId: user.id, verdict }),
    onSuccess: (report, verdict) => {
      queryClient.setQueryData(reportKeys.detail(reportId), report);
      queryClient.setQueryData(reportKeys.vote(reportId, user.id), verdict);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: reportKeys.all }),
  });
}
