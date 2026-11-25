import type { Role } from '@wakasafe/domain';

/** Shared password of every demo account (public demo, not a secret). */
export const DEMO_PASSWORD = 'demo-wakasafe';

/** Stable ids of the demo accounts, referenced by the seed, the tests and the docs. */
export const DEMO_USER_IDS = {
  admin: 'user-admin',
  citizen: 'user-citizen',
  driver: 'user-driver',
  pendingDriver: 'user-driver-pending',
  authority: 'user-authority',
  suspended: 'user-105',
} as const;

export interface DemoAccount {
  userId: string;
  /** Fictitious number (unassigned 600 prefix). */
  phone: string;
  role: Role;
  /** Application in which this account is meant to be used. */
  app: 'client' | 'admin';
  label: string;
  description: string;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    userId: DEMO_USER_IDS.citizen,
    phone: '+237600000001',
    role: 'CITIZEN',
    app: 'client',
    label: 'Citoyenne',
    description: 'Nadège Atangana, Yaoundé. Profil Citoyen actif.',
  },
  {
    userId: DEMO_USER_IDS.driver,
    phone: '+237600000002',
    role: 'DRIVER',
    app: 'client',
    label: 'Conducteur validé',
    description: 'Paul Ekwalla, Wouri Démo Express (Douala). Accès à l’espace Conducteur.',
  },
  {
    userId: DEMO_USER_IDS.pendingDriver,
    phone: '+237600000003',
    role: 'CITIZEN',
    app: 'client',
    label: 'Conducteur en attente',
    description: 'Samuel Fotso, Bafoussam. Demande Conducteur en attente : droits Citoyen.',
  },
  {
    userId: DEMO_USER_IDS.authority,
    phone: '+237600000004',
    role: 'AUTHORITY',
    app: 'client',
    label: 'Autorité',
    description:
      'Brigitte Ngo Mbock, Yaoundé. Droits Citoyen dans l’app ; vue Autorité dans l’admin.',
  },
  {
    userId: DEMO_USER_IDS.suspended,
    phone: '+237600000105',
    role: 'CITIZEN',
    app: 'client',
    label: 'Compte suspendu',
    description: 'Hervé Nkoulou, Yaoundé. Suspension temporaire : lecture seule.',
  },
  {
    userId: DEMO_USER_IDS.admin,
    phone: '+237600000000',
    role: 'ADMIN',
    app: 'admin',
    label: 'Administrateur',
    description: 'Administrateur GOSAFE (interface d’administration uniquement).',
  },
];
