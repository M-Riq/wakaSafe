import type {
  AgencyRepository,
  ProfileRequestRepository,
  UserRepository,
} from '@wakasafe/data-contracts';
import {
  BUSINESS_RULES,
  DocumentUploadSchema,
  DomainError,
  isAccountSuspended,
  PreferencesUpdateSchema,
  ProfileRequestSubmissionSchema,
  ProfileUpdateSchema,
  REQUIRED_DOCUMENTS,
  SafetyContactInputSchema,
  validateInput,
  type ProfileRequest,
  type SafetyContact,
  type SupportingDocument,
} from '@wakasafe/domain';

import type { MockDatabase } from '../schema';
import { clone, newId, notFound, notImplemented } from '../utils';
import type { MockContext } from './context';

/** Copies only the keys actually present in a partial update. */
function definedEntries<T extends object>(update: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(update).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function latestRequestOf(data: MockDatabase, userId: string): ProfileRequest | undefined {
  return data.profileRequests
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
}

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

    async updateProfile(userId, update) {
      await wait();
      const changes = definedEntries(validateInput(ProfileUpdateSchema, update));
      return db.update((state) => {
        const user = state.users.find((u) => u.id === userId);
        if (!user) throw notFound('User', userId);
        Object.assign(user, changes);
        return clone(user);
      });
    },

    async updatePreferences(userId, update) {
      await wait();
      const changes = definedEntries(validateInput(PreferencesUpdateSchema, update));
      return db.update((state) => {
        const preferences = state.preferences.find((p) => p.userId === userId);
        if (!preferences) throw notFound('Preferences', userId);
        Object.assign(preferences, changes);
        return clone(preferences);
      });
    },

    async upsertSafetyContact(userId, input) {
      await wait();
      const { id, name, phone, relation } = validateInput(SafetyContactInputSchema, input);
      return db.update((state) => {
        if (!state.users.some((u) => u.id === userId)) throw notFound('User', userId);
        const contacts = state.safetyContacts.filter((c) => c.userId === userId);
        if (contacts.some((c) => c.phone === phone && c.id !== id)) {
          throw new DomainError('CONFLICT', 'Safety contact already registered', {
            reason: 'SAFETY_CONTACT_DUPLICATE',
            fields: { phone: 'SAFETY_CONTACT_DUPLICATE' },
          });
        }
        if (id) {
          const existing = contacts.find((c) => c.id === id);
          if (!existing) throw notFound('SafetyContact', id);
          Object.assign(existing, { name, phone, relation });
          return clone(existing);
        }
        const { maxSafetyContacts } = BUSINESS_RULES.accounts;
        if (contacts.length >= maxSafetyContacts) {
          throw new DomainError('QUOTA_EXCEEDED', 'Too many safety contacts', {
            reason: 'SAFETY_CONTACTS_LIMIT',
            limit: maxSafetyContacts,
          });
        }
        const contact: SafetyContact = { id: newId('contact'), userId, name, phone, relation };
        state.safetyContacts.push(contact);
        return clone(contact);
      });
    },

    async removeSafetyContact(userId, contactId) {
      await wait();
      await db.update((state) => {
        const index = state.safetyContacts.findIndex(
          (c) => c.id === contactId && c.userId === userId,
        );
        if (index === -1) throw notFound('SafetyContact', contactId);
        state.safetyContacts.splice(index, 1);
      });
    },

    suspend: () => notImplemented('users.suspend', 8),
    reactivate: () => notImplemented('users.reactivate', 8),
  };
}

export function createProfileRequestRepository({
  db,
  clock,
  wait,
}: MockContext): ProfileRequestRepository {
  return {
    async getForUser(userId) {
      await wait();
      const request = latestRequestOf(await db.read(), userId);
      return request ? clone(request) : null;
    },

    async listDocuments(requestId) {
      await wait();
      return clone(
        (await db.read()).supportingDocuments.filter((d) => d.profileRequestId === requestId),
      );
    },

    async submit(userId, submission) {
      await wait();
      const data = validateInput(ProfileRequestSubmissionSchema, submission);
      return db.update((state) => {
        const now = clock.now();
        const user = state.users.find((u) => u.id === userId);
        if (!user) throw notFound('User', userId);
        if (isAccountSuspended(user, now)) {
          throw new DomainError('ACCOUNT_SUSPENDED', 'Suspended accounts cannot request a profile');
        }
        if (user.role !== 'CITIZEN') {
          throw new DomainError('FORBIDDEN', 'Only citizens can request a profile', {
            reason: 'PROFILE_ALREADY_GRANTED',
          });
        }
        const latest = latestRequestOf(state, userId);
        if (latest?.status === 'PENDING') {
          throw new DomainError('CONFLICT', 'A profile request is already pending', {
            reason: 'PROFILE_REQUEST_PENDING',
          });
        }
        if (
          latest?.status === 'REJECTED' &&
          !BUSINESS_RULES.profileRequests.allowNewRequestAfterRejection
        ) {
          throw new DomainError('FORBIDDEN', 'No new request after a rejection', {
            reason: 'NEW_REQUEST_NOT_ALLOWED',
          });
        }
        if (data.agencyId && !state.agencies.some((a) => a.id === data.agencyId)) {
          throw new DomainError('VALIDATION_FAILED', 'Unknown agency', {
            fields: { agencyId: 'INVALID' },
          });
        }
        const request: ProfileRequest = {
          id: newId('request'),
          userId,
          ...data,
          status: 'PENDING',
          submittedAt: now.toISOString(),
          reviewedAt: null,
          reviewedBy: null,
          rejectionReason: null,
        };
        state.profileRequests.push(request);
        return clone(request);
      });
    },

    async uploadDocument(requestId, upload) {
      await wait();
      const { type, fileUrl } = validateInput(DocumentUploadSchema, upload);
      return db.update((state) => {
        const now = clock.now();
        const request = state.profileRequests.find((r) => r.id === requestId);
        if (!request) throw notFound('ProfileRequest', requestId);
        if (request.status !== 'PENDING') {
          throw new DomainError('CONFLICT', 'The request has already been reviewed', {
            reason: 'PROFILE_REQUEST_CLOSED',
          });
        }
        const user = state.users.find((u) => u.id === request.userId);
        if (user && isAccountSuspended(user, now)) {
          throw new DomainError('ACCOUNT_SUSPENDED', 'Suspended accounts cannot upload documents');
        }
        if (!REQUIRED_DOCUMENTS[request.requestedRole].includes(type)) {
          throw new DomainError('VALIDATION_FAILED', 'Document not required for this role', {
            fields: { type: 'INVALID' },
          });
        }
        // Uploading a document type again replaces the previous file.
        const existing = state.supportingDocuments.find(
          (d) => d.profileRequestId === requestId && d.type === type,
        );
        if (existing) {
          Object.assign(existing, { fileUrl, uploadedAt: now.toISOString() });
          return clone(existing);
        }
        const document: SupportingDocument = {
          id: newId('document'),
          profileRequestId: requestId,
          type,
          fileUrl,
          uploadedAt: now.toISOString(),
        };
        state.supportingDocuments.push(document);
        return clone(document);
      });
    },

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
