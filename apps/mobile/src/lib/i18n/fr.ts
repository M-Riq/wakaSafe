import {
  BUSINESS_RULES,
  PASSWORD_MAX_LENGTH,
  type AccountStatus,
  type DocumentType,
  type DomainErrorCode,
  type DomainErrorReason,
  type ProfileRequestStatus,
  type Role,
  type ValidationCode,
} from '@wakasafe/domain';

const { maxSafetyContacts, passwordMinLength, resetCodeLength, resetCodeValidityMinutes } =
  BUSINESS_RULES.accounts;

/**
 * French dictionary: every UI label lives here (no hard-coded text in components).
 * `Record<Enum, string>` types make the compiler flag any missing translation.
 * French typography: a non-breaking space (\u00A0) precedes « : ; ? ! » (checked by a test).
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
    cancel: 'Annuler',
    save: 'Enregistrer',
    saved: 'Modifications enregistrées.',
    continue: 'Continuer',
    previous: 'Précédent',
    edit: 'Modifier',
    delete: 'Supprimer',
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    optional: '{label} (facultatif)',
    stepOf: 'Étape {current} sur {total}',
  },
  errors: {
    UNAUTHENTICATED: 'Votre session a expiré. Reconnectez-vous.',
    INVALID_CREDENTIALS: 'Numéro de téléphone ou mot de passe incorrect.',
    INVALID_RESET_CODE: 'Code incorrect ou expiré. Vérifiez-le ou demandez un nouveau code.',
    ACCOUNT_SUSPENDED: 'Votre compte est suspendu\u00A0: action impossible pour le moment.',
    FORBIDDEN: 'Vous n’avez pas accès à cette fonctionnalité.',
    NOT_FOUND: 'Élément introuvable.',
    VALIDATION_FAILED: 'Certaines informations sont invalides.',
    CONFLICT: 'Cette action entre en conflit avec des données existantes.',
    QUOTA_EXCEEDED: 'Limite d’actions atteinte pour cette période.',
    DAILY_QUIZ_LIMIT_REACHED: 'Vous avez déjà répondu aux 5 questions du jour.',
    ALREADY_VOTED: 'Vous avez déjà donné votre avis sur ce signalement.',
    ALREADY_RATED: 'Vous avez déjà évalué ce conducteur pour cette période.',
    NOT_IMPLEMENTED: 'Cette fonctionnalité sera bientôt disponible.',
    unknown: 'Une erreur inattendue est survenue. Réessayez.',
  } satisfies Record<DomainErrorCode | 'unknown', string>,
  /** More precise than the error code when the error carries a known reason. */
  errorReasons: {
    PHONE_TAKEN:
      'Ce numéro est déjà associé à un compte. Connectez-vous ou réinitialisez votre mot de passe.',
    SAFETY_CONTACTS_LIMIT: `Vous avez atteint le maximum de ${maxSafetyContacts} contacts de sécurité.`,
    SAFETY_CONTACT_DUPLICATE: 'Ce numéro figure déjà dans vos contacts de sécurité.',
    PROFILE_REQUEST_PENDING: 'Une demande de profil est déjà en cours d’examen.',
    PROFILE_REQUEST_CLOSED:
      'Cette demande a déjà été examinée\u00A0: ses justificatifs ne peuvent plus être modifiés.',
    PROFILE_ALREADY_GRANTED: 'Votre compte dispose déjà d’un profil validé.',
    NEW_REQUEST_NOT_ALLOWED: 'Une nouvelle demande n’est pas possible après un refus.',
    ADMIN_ACCOUNT: 'Les administrateurs utilisent l’interface d’administration.',
  } satisfies Record<DomainErrorReason | 'ADMIN_ACCOUNT', string>,
  /** Field errors: validation codes of the domain plus the checks done only in the forms. */
  validation: {
    REQUIRED: 'Ce champ est obligatoire.',
    INVALID: 'Valeur invalide.',
    TEXT_TOO_LONG: 'Ce texte est trop long.',
    PHONE_INVALID: 'Numéro camerounais invalide (9 chiffres, par exemple 6 70 00 00 00).',
    PHONE_TAKEN: 'Ce numéro est déjà associé à un compte.',
    PASSWORD_TOO_SHORT: `Le mot de passe doit contenir au moins ${passwordMinLength} caractères.`,
    PASSWORD_TOO_LONG: `Le mot de passe doit contenir au plus ${PASSWORD_MAX_LENGTH} caractères.`,
    PASSWORD_NEEDS_LETTER: 'Le mot de passe doit contenir au moins une lettre.',
    PASSWORD_NEEDS_DIGIT: 'Le mot de passe doit contenir au moins un chiffre.',
    RESET_CODE_FORMAT: `Le code contient ${resetCodeLength} chiffres.`,
    SAFETY_CONTACT_DUPLICATE: 'Ce numéro figure déjà dans vos contacts.',
    PASSWORDS_DO_NOT_MATCH: 'Les deux mots de passe ne correspondent pas.',
    TERMS_REQUIRED: 'Acceptez les conditions d’utilisation pour continuer.',
  } satisfies Record<ValidationCode | 'PASSWORDS_DO_NOT_MATCH' | 'TERMS_REQUIRED', string>,
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
    signIn: 'Se connecter',
    register: 'Créer un compte',
    tryDemo: 'Essayer un profil de démonstration',
    demoNotice:
      'Version de démonstration\u00A0: les données sont fictives et restent sur cet appareil.',
  },
  demoAccess: {
    title: 'Choisir un profil de démo',
    intro:
      'Connectez-vous en un geste avec un compte fictif pour découvrir les droits de chaque type d’utilisateur.',
    credentials: 'Identifiants\u00A0: {phone} · mot de passe «\u00A0{password}\u00A0»',
    signIn: 'Se connecter\u00A0: {label}',
    signingIn: 'Connexion…',
  },
  form: {
    phone: 'Numéro de téléphone',
    phoneHint: 'Numéro camerounais, par exemple 6 70 00 00 00.',
    password: 'Mot de passe',
    passwordHint: `Au moins ${passwordMinLength} caractères, dont une lettre et un chiffre.`,
    confirmPassword: 'Confirmer le mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    photo: 'Photo de profil',
    agency: 'Agence de voyage',
    organization: 'Organisation ou administration',
    organizationHint: 'Par exemple\u00A0: Police nationale, Mairie de Douala.',
    position: 'Fonction',
    positionHint: 'Par exemple\u00A0: agent de circulation.',
  },
  imagePicker: {
    takePhoto: 'Prendre une photo',
    chooseFromGallery: 'Galerie',
    chooseImage: 'Choisir une image',
    removePhoto: 'Retirer la photo',
    cameraDenied:
      'Accès à l’appareil photo refusé. Autorisez-le dans les paramètres du téléphone, ou choisissez une image.',
    failed: 'Impossible d’utiliser cette image. Essayez-en une autre.',
  },
  login: {
    title: 'Connexion',
    intro: 'Connectez-vous avec votre numéro de téléphone et votre mot de passe.',
    submit: 'Se connecter',
    forgotPassword: 'Mot de passe oublié\u00A0?',
    noAccount: 'Pas encore de compte\u00A0?',
    register: 'Créer un compte',
  },
  register: {
    title: 'Créer un compte',
    steps: {
      identity: 'Vos informations',
      profile: 'Type de profil',
      documents: 'Justificatifs',
    },
    photoHint: 'Elle aide les autres usagers à vous reconnaître.',
    acceptTerms: 'J’accepte les conditions d’utilisation de WakaSafe.',
    readTerms: 'Lire les conditions d’utilisation',
    profileIntro:
      'Le profil Citoyen est activé immédiatement. Les profils Conducteur et Autorité sont vérifiés par un administrateur\u00A0; en attendant, vous avez les droits du Citoyen.',
    roleDescriptions: {
      CITIZEN: 'Signaler les dangers, apprendre et évaluer les conducteurs. Activé immédiatement.',
      DRIVER: 'Vous conduisez pour une agence de voyage. Vérifié par un administrateur.',
      AUTHORITY:
        'Vous représentez une administration ou les forces de l’ordre. Vérifié par un administrateur.',
    },
    documentsIntro:
      'Ajoutez une photo lisible de chaque document. Vous pourrez aussi les ajouter plus tard depuis votre profil.',
    submit: 'Créer mon compte',
    phoneTakenHint: 'Déjà inscrit\u00A0? Connectez-vous.',
  },
  resetPassword: {
    title: 'Mot de passe oublié',
    intro:
      'Saisissez votre numéro\u00A0: vous recevrez un code pour choisir un nouveau mot de passe.',
    sendCode: 'Recevoir un code',
    codeSentTitle: 'Code envoyé',
    codeSent: `Si ce numéro correspond à un compte, un code à ${resetCodeLength} chiffres a été envoyé par SMS. Il est valable ${resetCodeValidityMinutes} minutes.`,
    demoCodeTitle: 'Code de démonstration\u00A0: {code}',
    demoCode: `Sans envoi de SMS dans la démo, le code s’affiche ici. Il est valable ${resetCodeValidityMinutes} minutes.`,
    code: 'Code reçu',
    newPassword: 'Nouveau mot de passe',
    submit: 'Changer le mot de passe',
    resendCode: 'Recevoir un nouveau code',
  },
  terms: {
    title: 'Conditions d’utilisation',
    provisionalTitle: 'Texte provisoire',
    provisional:
      'Le texte définitif des conditions d’utilisation et de la politique de confidentialité sera fourni par GOSAFE avant la mise en service.',
    sections: [
      {
        title: 'Objet',
        body: 'WakaSafe est l’application citoyenne de prévention et de sécurité routière de l’association GOSAFE.',
      },
      {
        title: 'Signalements et avis',
        body: 'Chaque utilisateur s’engage à publier des signalements et des évaluations sincères. Les abus peuvent entraîner une suspension du compte.',
      },
      {
        title: 'Données personnelles',
        body: 'Dans cette version de démonstration, les données saisies restent sur cet appareil et ne sont envoyées à aucun serveur.',
      },
    ],
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
    rejectedBody: 'Motif\u00A0: {reason}',
    suspendedTitle: 'Compte suspendu',
    suspendedBody:
      'Votre compte est en lecture seule jusqu’au {date}\u00A0: vous ne pouvez ni signaler, ni voter, ni évaluer, ni répondre au quiz.',
    suspendedIndefinitely:
      'Votre compte est en lecture seule jusqu’à sa réactivation par un administrateur.',
    authorityTitle: 'Profil Autorité',
    authorityBody:
      'Dans cette application, vous avez les droits du Citoyen. La vue Autorité (carte des signalements et statut «\u00A0pris en charge\u00A0») se trouve dans l’interface d’administration.',
    driverArea: 'Espace conducteur',
    editProfile: 'Modifier le profil',
    documents: 'Justificatifs',
    documentsMissing: 'Justificatifs manquants\u00A0: {list}.',
    documentsComplete: 'Tous les justificatifs ont été transmis.',
    completeDocuments: 'Compléter les justificatifs',
    viewDocuments: 'Voir les justificatifs',
    requestTitle: 'Devenir conducteur ou autorité',
    requestBody:
      'Vous conduisez pour une agence de voyage ou représentez une autorité\u00A0? Demandez le profil correspondant.',
    requestAgain: 'Faire une nouvelle demande',
    requestAction: 'Faire une demande',
    safetyContacts: 'Contacts de sécurité',
    noSafetyContact: 'Aucun contact de sécurité pour le moment.',
    manage: 'Gérer',
    preferences: 'Préférences',
    nearbyAlerts: 'Alertes de danger à proximité',
    nearbyRadius: 'Rayon\u00A0: {km} km',
    quizReminders: 'Rappels du quiz',
    alertsEnabled: 'Activées',
    alertsDisabled: 'Désactivées',
    remindersEnabled: 'Activés',
    remindersDisabled: 'Désactivés',
    demoSection: 'Démonstration',
    resetDemo: 'Réinitialiser les données de démo',
    resetDemoHint: 'Restaure les données de départ et vous déconnecte.',
    signOut: 'Se déconnecter',
  },
  editProfile: {
    title: 'Modifier le profil',
    phoneLocked: 'Le numéro de téléphone identifie votre compte et ne peut pas être modifié.',
  },
  preferences: {
    title: 'Préférences',
    nearbyAlertsHint: 'Être prévenu des dangers graves signalés près de vous.',
    radius: 'Rayon d’alerte',
    radiusValue: '{km} km',
    quizRemindersHint: 'Un rappel par jour pour vos questions du quiz.',
    language: 'Langue',
    languageValue: 'Français',
  },
  safetyContacts: {
    title: 'Contacts de sécurité',
    intro: `Les proches à prévenir en cas de problème sur la route. Jusqu’à ${maxSafetyContacts} contacts.`,
    count: '{count} sur {max}',
    name: 'Nom du contact',
    relation: 'Lien',
    relationHint: 'Par exemple\u00A0: sœur, collègue.',
    add: 'Ajouter un contact',
    newContact: 'Nouveau contact',
    editContact: 'Modifier le contact',
    limitReached: `Vous avez atteint le maximum de ${maxSafetyContacts} contacts.`,
    confirmDelete: 'Supprimer {name} de vos contacts\u00A0?',
    editLabel: 'Modifier {name}',
    deleteLabel: 'Supprimer {name}',
  },
  profileRequest: {
    title: 'Demande de profil',
    intro:
      'Un administrateur vérifie chaque demande avec vos justificatifs. En attendant, vous gardez les droits du Citoyen.',
    role: 'Profil demandé',
    submit: 'Envoyer la demande',
    unavailable: 'Vous ne pouvez pas faire de nouvelle demande pour le moment.',
  },
  documents: {
    title: 'Justificatifs',
    intro: 'Ajoutez une photo lisible de chaque document demandé.',
    forRequest: 'Demande de profil {role}',
    missing: 'À ajouter',
    added: 'Ajouté',
    provided: 'Ajouté le {date}',
    preview: 'Aperçu\u00A0: {type}',
    closed: 'Cette demande a été examinée\u00A0: ses justificatifs ne peuvent plus être modifiés.',
    noRequest: 'Aucune demande de profil en cours.',
    readOnly: 'Compte suspendu\u00A0: l’ajout de justificatifs est impossible pour le moment.',
  },
  driver: {
    title: 'Espace conducteur',
    agency: 'Agence',
    intro: 'Cet espace est réservé aux conducteurs d’agence validés.',
    statsSoon:
      'Vous pourrez consulter ici vos statistiques\u00A0: moyenne par critère, nombre d’évaluations et classement.',
  },
  notFound: {
    title: 'Page introuvable',
    body: 'Cette page n’existe pas ou plus.',
  },
} as const;

export type Dictionary = typeof fr;
