import type {
  AgencyRepository,
  ProfileRequestRepository,
  UserRepository,
} from '@wakasafe/data-contracts';

import { clone, notFound, notImplemented } from '../utils';
import type { MockContext } from './context';

export function createUserRepository({ db, wait }: MockContext): UserRepository {
  return {
    async getById(userId) {
      await wait();
      const user = (await db.read()).users.find((u) => u.id === userId);
      if (!user) throw notFound('User', userId);
      return clone(user);
    },

    async list(filters = {}) {
      await wait();
      const search = filters.search?.trim().toLowerCase();
      const users = (await db.read()).users.filter(
        (u) =>
          (!filters.role || u.role === filters.role) &&
          (!filters.status || u.status === filters.status) &&
          (!search || `${u.firstName} ${u.lastName} ${u.phone}`.toLowerCase().includes(search)),
      );
      return clone(users);
    },

    async getPreferences(userId) {
      await wait();
      const preferences = (await db.read()).preferences.find((p) => p.userId === userId);
      if (!preferences) throw notFound('Preferences', userId);
      return clone(preferences);
    },

    async listSafetyContacts(userId) {
      await wait();
      return clone((await db.read()).safetyContacts.filter((c) => c.userId === userId));
    },

    updateProfile: () => notImplemented('users.updateProfile', 2),
    updatePreferences: () => notImplemented('users.updatePreferences', 2),
    upsertSafetyContact: () => notImplemented('users.upsertSafetyContact', 2),
    removeSafetyContact: () => notImplemented('users.removeSafetyContact', 2),
    suspend: () => notImplemented('users.suspend', 8),
    reactivate: () => notImplemented('users.reactivate', 8),
  };
}

export function createProfileRequestRepository({
  db,
  wait,
}: MockContext): ProfileRequestRepository {
  return {
    async getForUser(userId) {
      await wait();
      const requests = (await db.read()).profileRequests
        .filter((r) => r.userId === userId)
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
      return requests[0] ? clone(requests[0]) : null;
    },

    async listDocuments(requestId) {
      await wait();
      return clone(
        (await db.read()).supportingDocuments.filter((d) => d.profileRequestId === requestId),
      );
    },

    submit: () => notImplemented('profileRequests.submit', 2),
    uploadDocument: () => notImplemented('profileRequests.uploadDocument', 2),
    listPending: () => notImplemented('profileRequests.listPending', 8),
    approve: () => notImplemented('profileRequests.approve', 8),
    reject: () => notImplemented('profileRequests.reject', 8),
  };
}

export function createAgencyRepository({ db, wait }: MockContext): AgencyRepository {
  return {
    async list() {
      await wait();
      return clone((await db.read()).agencies);
    },

    async getById(agencyId) {
      await wait();
      const agency = (await db.read()).agencies.find((a) => a.id === agencyId);
      if (!agency) throw notFound('Agency', agencyId);
      return clone(agency);
    },
  };
}
