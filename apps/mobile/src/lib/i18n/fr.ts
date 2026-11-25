import type {
  AccountStatus,
  DocumentType,
  DomainErrorCode,
  ProfileRequestStatus,
  Role,
} from '@wakasafe/domain';

/**
 * French dictionary: every UI label lives here (no hard-coded text in components).
 * `Record<Enum, string>` types make the compiler flag any missing translation.
 */
export const fr = {
  common: {
    appName: 'WakaSafe',
    tagline: 'Ensemble pour des routes plus sûres',
    loading: 'Chargement…',
    retry: 'Réessayer',
    back: 'Retour',
    home: 'Accueil',
    errorTitle: 'Une erreur est survenue',
    demoBadge: 'Démo',
    placeholderContent: 'Données de démonstration',
    comingSoon: 'Bientôt disponible',
  },
  errors: {
    UNAUTHENTICATED: 'Votre session a expiré. Reconnectez-vous.',
    INVALID_CREDENTIALS: 'Numéro de téléphone ou mot de passe incorrect.',
    ACCOUNT_SUSPENDED: 'Votre compte est suspendu : action impossible pour le moment.',
    FORBIDDEN: 'Vous n’avez pas accès à cette fonctionnalité.',
    NOT_FOUND: 'Élément introuvable.',
    VALIDATION_FAILED: 'Certaines informations sont invalides.',
    CONFLICT: 'Cette action entre en conflit avec des données existantes.',
    QUOTA_EXCEEDED: 'Limite d’actions atteinte pour cette période.',
    DAILY_QUIZ_LIMIT_REACHED: 'Vous avez déjà répondu aux 5 questions du jour.',
    ALREADY_VOTED: 'Vous avez déjà donné votre avis sur ce signalement.',
    ALREADY_RATED: 'Vous avez déjà évalué ce conducteur pour cette période.',
    NOT_IMPLEMENTED: 'Cette fonctionnalité sera bientôt disponible.',
    ADMIN_NOT_ALLOWED: 'Les administrateurs utilisent l’interface d’administration.',
    unknown: 'Une erreur inattendue est survenue. Réessayez.',
  } satisfies Record<DomainErrorCode | 'ADMIN_NOT_ALLOWED' | 'unknown', string>,
  enums: {
    role: {
      CITIZEN: 'Citoyen',
      DRIVER: 'Conducteur d’agence',
      AUTHORITY: 'Autorité',
      ADMIN: 'Administrateur',
    } satisfies Record<Role, string>,
    accountStatus: {
      ACTIVE: 'Actif',
      SUSPENDED: 'Suspendu',
    } satisfies Record<AccountStatus, string>,
    profileRequestStatus: {
      PENDING: 'En attente de validation',
      APPROVED: 'Validée',
      REJECTED: 'Refusée',
    } satisfies Record<ProfileRequestStatus, string>,
    documentType: {
      ID_CARD: 'Pièce d’identité',
      DRIVING_LICENSE: 'Permis de conduire',
      FUNCTION_PROOF: 'Justificatif de fonction',
    } satisfies Record<DocumentType, string>,
  },
  welcome: {
    title: 'Signalez. Apprenez. Roulez plus sûr.',
    subtitle:
      'L’application citoyenne de prévention routière de GOSAFE, pour Yaoundé, Douala et Bafoussam.',
    features: [
      {
        icon: 'warning-outline',
        text: 'Signalez un danger en quelques secondes, même sans réseau.',
      },
      { icon: 'school-outline', text: 'Apprenez les bons réflexes avec 5 questions par jour.' },
      { icon: 'star-outline', text: 'Évaluez les conducteurs et les agences de voyage.' },
    ],
    tryDemo: 'Découvrir la démo',
    demoNotice: 'Version de démonstration : les données sont fictives et restent sur cet appareil.',
  },
  demoAccess: {
    title: 'Choisir un profil de démo',
    intro:
      'Chaque profil montre les droits d’un type d’utilisateur. La connexion par numéro de téléphone et mot de passe sera bientôt disponible.',
    credentials: 'Identifiants : {phone} · mot de passe «\u00A0{password}\u00A0»',
    signIn: 'Se connecter : {label}',
    signingIn: 'Connexion…',
  },
  tabs: {
    map: 'Carte',
    report: 'Signaler',
    quiz: 'Quiz',
    leaderboard: 'Classement',
    profile: 'Profil',
  },
  comingSoon: {
    map: {
      title: 'Carte des dangers',
      description:
        'Carte publique des signalements à Yaoundé, Douala et Bafoussam, avec filtres par type, gravité et zone.',
    },
    report: {
      title: 'Signaler un danger',
      description:
        'Catégorie, gravité, personnes concernées, photo facultative et position GPS automatique. Fonctionne aussi sans réseau.',
    },
    quiz: {
      title: 'Quiz du jour',
      description:
        '5 questions par jour sur le code de la route, les bons réflexes, les premiers secours et les dangers spécifiques, avec correction.',
    },
    leaderboard: {
      title: 'Classements',
      description:
        'Points gagnés, classements mensuel et annuel, et classement des conducteurs et des agences.',
    },
  },
  profile: {
    title: 'Mon profil',
    phone: 'Téléphone',
    role: 'Profil',
    status: 'Statut du compte',
    memberSince: 'Membre depuis',
    pendingTitle: 'Demande de profil {role} en attente',
    pendingBody:
      'Un administrateur doit vérifier vos justificatifs. En attendant, vous gardez tous les droits du profil Citoyen.',
    rejectedTitle: 'Demande de profil {role} refusée',
    rejectedBody: 'Motif : {reason}',
    suspendedTitle: 'Compte suspendu',
    suspendedBody:
      'Votre compte est en lecture seule jusqu’au {date} : vous ne pouvez ni signaler, ni voter, ni évaluer, ni répondre au quiz.',
    suspendedIndefinitely:
      'Votre compte est en lecture seule jusqu’à sa réactivation par un administrateur.',
    authorityTitle: 'Profil Autorité',
    authorityBody:
      'Dans cette application, vous avez les droits du Citoyen. La vue Autorité (carte des signalements et statut «\u00A0pris en charge\u00A0») se trouve dans l’interface d’administration.',
    driverArea: 'Espace conducteur',
    documents: 'Justificatifs transmis',
    safetyContacts: 'Contacts de sécurité',
    noSafetyContact: 'Aucun contact de sécurité. L’ajout sera bientôt disponible.',
    preferences: 'Préférences',
    nearbyAlerts: 'Alertes de danger à proximité',
    nearbyRadius: 'Rayon : {km} km',
    quizReminders: 'Rappels du quiz',
    alertsEnabled: 'Activées',
    alertsDisabled: 'Désactivées',
    remindersEnabled: 'Activés',
    remindersDisabled: 'Désactivés',
    editingSoon: 'La modification du profil sera bientôt disponible.',
    demoSection: 'Démonstration',
    resetDemo: 'Réinitialiser les données de démo',
    resetDemoHint: 'Restaure les données de départ et vous déconnecte.',
    signOut: 'Se déconnecter',
  },
  driver: {
    title: 'Espace conducteur',
    agency: 'Agence',
    intro: 'Cet espace est réservé aux conducteurs d’agence validés.',
    statsSoon:
      'Vous pourrez consulter ici vos statistiques : moyenne par critère, nombre d’évaluations et classement.',
  },
  notFound: {
    title: 'Page introuvable',
    body: 'Cette page n’existe pas ou plus.',
  },
} as const;

export type Dictionary = typeof fr;
