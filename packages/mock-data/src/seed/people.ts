import {
  BUSINESS_RULES,
  REQUIRED_DOCUMENTS,
  type AccountSanction,
  type Agency,
  type AuthorityProfile,
  type Driver,
  type Preferences,
  type ProfileRequest,
  type RequestableRole,
  type Role,
  type SafetyContact,
  type SupportingDocument,
  type User,
} from '@wakasafe/domain';

import { DEMO_PASSWORD, DEMO_USER_IDS } from '../demo-accounts';
import { demoPasswordHash } from '../password';
import type { Credential } from '../schema';
import type { Timeline } from './timeline';

// Fictitious people and agencies. Phone numbers use the unassigned +237 600 prefix.

export const AGENCY_IDS = {
  sanaga: 'agency-sanaga',
  wouri: 'agency-wouri',
  mifi: 'agency-mifi',
} as const;

const AGENCIES: Agency[] = [
  { id: AGENCY_IDS.sanaga, name: 'Sanaga Démo Voyages', city: 'Yaoundé' },
  { id: AGENCY_IDS.wouri, name: 'Wouri Démo Express', city: 'Douala' },
  { id: AGENCY_IDS.mifi, name: 'Mifi Démo Transports', city: 'Bafoussam' },
];

interface PersonSpec {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  createdDaysAgo: number;
}

const PEOPLE: PersonSpec[] = [
  {
    id: DEMO_USER_IDS.admin,
    firstName: 'Admin',
    lastName: 'GOSAFE',
    phone: '+237600000000',
    role: 'ADMIN',
    createdDaysAgo: 120,
  },
  {
    id: DEMO_USER_IDS.citizen,
    firstName: 'Nadège',
    lastName: 'Atangana',
    phone: '+237600000001',
    role: 'CITIZEN',
    createdDaysAgo: 75,
  },
  {
    id: DEMO_USER_IDS.driver,
    firstName: 'Paul',
    lastName: 'Ekwalla',
    phone: '+237600000002',
    role: 'DRIVER',
    createdDaysAgo: 70,
  },
  {
    id: DEMO_USER_IDS.pendingDriver,
    firstName: 'Samuel',
    lastName: 'Fotso',
    phone: '+237600000003',
    role: 'CITIZEN',
    createdDaysAgo: 30,
  },
  {
    id: DEMO_USER_IDS.authority,
    firstName: 'Brigitte',
    lastName: 'Ngo Mbock',
    phone: '+237600000004',
    role: 'AUTHORITY',
    createdDaysAgo: 50,
  },
  {
    id: 'user-101',
    firstName: 'Jean',
    lastName: 'Mballa',
    phone: '+237600000101',
    role: 'CITIZEN',
    createdDaysAgo: 65,
  },
  {
    id: 'user-102',
    firstName: 'Clarisse',
    lastName: 'Ndongo',
    phone: '+237600000102',
    role: 'CITIZEN',
    createdDaysAgo: 60,
  },
  {
    id: 'user-103',
    firstName: 'Ibrahim',
    lastName: 'Bello',
    phone: '+237600000103',
    role: 'CITIZEN',
    createdDaysAgo: 58,
  },
  {
    id: 'user-104',
    firstName: 'Estelle',
    lastName: 'Tchoupo',
    phone: '+237600000104',
    role: 'CITIZEN',
    createdDaysAgo: 55,
  },
  {
    id: DEMO_USER_IDS.suspended,
    firstName: 'Hervé',
    lastName: 'Nkoulou',
    phone: '+237600000105',
    role: 'CITIZEN',
    createdDaysAgo: 40,
  },
  {
    id: 'user-106',
    firstName: 'Martin',
    lastName: 'Kamga',
    phone: '+237600000106',
    role: 'CITIZEN',
    createdDaysAgo: 35,
  },
  {
    id: 'user-107',
    firstName: 'Sandrine',
    lastName: 'Eyenga',
    phone: '+237600000107',
    role: 'CITIZEN',
    createdDaysAgo: 20,
  },
  {
    id: 'user-108',
    firstName: 'Joseph',
    lastName: 'Abena',
    phone: '+237600000108',
    role: 'DRIVER',
    createdDaysAgo: 90,
  },
  {
    id: 'user-109',
    firstName: 'Rose',
    lastName: 'Djoumessi',
    phone: '+237600000109',
    role: 'DRIVER',
    createdDaysAgo: 85,
  },
  {
    id: 'user-110',
    firstName: 'Didier',
    lastName: 'Essomba',
    phone: '+237600000110',
    role: 'DRIVER',
    createdDaysAgo: 80,
  },
  {
    id: 'user-111',
    firstName: 'Mireille',
    lastName: 'Fouda',
    phone: '+237600000111',
    role: 'CITIZEN',
    createdDaysAgo: 100,
  },
  {
    id: 'user-112',
    firstName: 'Patrick',
    lastName: 'Tchinda',
    phone: '+237600000112',
    role: 'CITIZEN',
    createdDaysAgo: 45,
  },
];

interface RequestSpec {
  id: string;
  userId: string;
  role: RequestableRole;
  status: ProfileRequest['status'];
  agencyId?: string;
  organization?: string;
  position?: string;
  submittedDaysAgo: number;
  reviewedDaysAgo?: number;
  rejectionReason?: string;
}

const REQUESTS: RequestSpec[] = [
  {
    id: 'request-driver',
    userId: DEMO_USER_IDS.driver,
    role: 'DRIVER',
    status: 'APPROVED',
    agencyId: AGENCY_IDS.wouri,
    submittedDaysAgo: 69,
    reviewedDaysAgo: 68,
  },
  {
    id: 'request-108',
    userId: 'user-108',
    role: 'DRIVER',
    status: 'APPROVED',
    agencyId: AGENCY_IDS.sanaga,
    submittedDaysAgo: 89,
    reviewedDaysAgo: 88,
  },
  {
    id: 'request-109',
    userId: 'user-109',
    role: 'DRIVER',
    status: 'APPROVED',
    agencyId: AGENCY_IDS.mifi,
    submittedDaysAgo: 84,
    reviewedDaysAgo: 82,
  },
  {
    id: 'request-110',
    userId: 'user-110',
    role: 'DRIVER',
    status: 'APPROVED',
    agencyId: AGENCY_IDS.wouri,
    submittedDaysAgo: 79,
    reviewedDaysAgo: 78,
  },
  {
    id: 'request-authority',
    userId: DEMO_USER_IDS.authority,
    role: 'AUTHORITY',
    status: 'APPROVED',
    organization: 'Police municipale de Yaoundé (démo)',
    position: 'Officière de circulation (démo)',
    submittedDaysAgo: 49,
    reviewedDaysAgo: 47,
  },
  {
    id: 'request-driver-pending',
    userId: DEMO_USER_IDS.pendingDriver,
    role: 'DRIVER',
    status: 'PENDING',
    agencyId: AGENCY_IDS.mifi,
    submittedDaysAgo: 2,
  },
  {
    id: 'request-107',
    userId: 'user-107',
    role: 'AUTHORITY',
    status: 'PENDING',
    organization: 'Service technique de la voirie, Douala (démo)',
    position: 'Agente technique (démo)',
    submittedDaysAgo: 1,
  },
  {
    id: 'request-106',
    userId: 'user-106',
    role: 'DRIVER',
    status: 'REJECTED',
    agencyId: AGENCY_IDS.mifi,
    submittedDaysAgo: 6,
    reviewedDaysAgo: 4,
    rejectionReason: 'Permis de conduire illisible. Merci de soumettre une nouvelle photo.',
  },
];

export interface SeedPeople {
  users: User[];
  credentials: Credential[];
  preferences: Preferences[];
  safetyContacts: SafetyContact[];
  agencies: Agency[];
  profileRequests: ProfileRequest[];
  supportingDocuments: SupportingDocument[];
  drivers: Driver[];
  authorityProfiles: AuthorityProfile[];
  sanctions: AccountSanction[];
}

export function seedPeople(t: Timeline): SeedPeople {
  const suspensionStart = t.hoursAgo(24);
  const suspensionEnd = t.hoursFromNow(BUSINESS_RULES.sanctions.automaticSuspensionHours - 24);

  const users: User[] = PEOPLE.map((p) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    phone: p.phone,
    photoUrl: null,
    role: p.role,
    status: p.id === DEMO_USER_IDS.suspended ? 'SUSPENDED' : 'ACTIVE',
    suspendedUntil: p.id === DEMO_USER_IDS.suspended ? suspensionEnd : null,
    createdAt: t.daysAgo(p.createdDaysAgo),
  }));

  const profileRequests: ProfileRequest[] = REQUESTS.map((r) => ({
    id: r.id,
    userId: r.userId,
    requestedRole: r.role,
    status: r.status,
    agencyId: r.agencyId ?? null,
    organization: r.organization ?? null,
    position: r.position ?? null,
    submittedAt: t.daysAgo(r.submittedDaysAgo),
    reviewedAt: r.reviewedDaysAgo === undefined ? null : t.daysAgo(r.reviewedDaysAgo),
    reviewedBy: r.reviewedDaysAgo === undefined ? null : DEMO_USER_IDS.admin,
    rejectionReason: r.rejectionReason ?? null,
  }));

  const supportingDocuments: SupportingDocument[] = profileRequests.flatMap((request) =>
    REQUIRED_DOCUMENTS[request.requestedRole].map((type) => ({
      id: `document-${request.id}-${type.toLowerCase()}`,
      profileRequestId: request.id,
      type,
      // Placeholder: the admin app (phase 8) shows a neutral preview for mock documents.
      fileUrl: `mock://supporting-documents/${request.id}/${type.toLowerCase()}`,
      uploadedAt: request.submittedAt,
    })),
  );

  const approved = profileRequests.filter((r) => r.status === 'APPROVED');
  const drivers: Driver[] = approved
    .filter((r) => r.requestedRole === 'DRIVER')
    .map((r) => ({ userId: r.userId, agencyId: r.agencyId!, validatedAt: r.reviewedAt! }));
  const authorityProfiles: AuthorityProfile[] = approved
    .filter((r) => r.requestedRole === 'AUTHORITY')
    .map((r) => ({
      userId: r.userId,
      organization: r.organization!,
      position: r.position!,
      validatedAt: r.reviewedAt!,
    }));

  return {
    users,
    credentials: users.map((u) => ({
      userId: u.id,
      passwordHash: demoPasswordHash(DEMO_PASSWORD, u.id),
    })),
    preferences: users.map((u) => ({
      userId: u.id,
      nearbyDangerAlerts: true,
      nearbyRadiusKm: BUSINESS_RULES.notifications.defaultNearbyRadiusKm,
      quizReminders: u.id !== 'user-112',
      language: 'fr',
    })),
    safetyContacts: [
      {
        id: 'contact-1',
        userId: DEMO_USER_IDS.citizen,
        name: 'Marc Atangana',
        phone: '+237600000901',
        relation: 'Frère',
      },
      {
        id: 'contact-2',
        userId: DEMO_USER_IDS.citizen,
        name: 'Hélène Owona',
        phone: '+237600000902',
        relation: 'Amie',
      },
      {
        id: 'contact-3',
        userId: DEMO_USER_IDS.driver,
        name: 'Carine Ekwalla',
        phone: '+237600000903',
        relation: 'Épouse',
      },
    ],
    agencies: AGENCIES,
    profileRequests,
    supportingDocuments,
    drivers,
    authorityProfiles,
    sanctions: [
      {
        id: 'sanction-1',
        userId: DEMO_USER_IDS.suspended,
        reason: 'Abus répétés des limites d’actions\u00A0: suspension automatique de 72 h.',
        startsAt: suspensionStart,
        endsAt: suspensionEnd,
        createdBy: null,
      },
    ],
  };
}
