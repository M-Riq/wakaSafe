# Changelog

Toutes les modifications notables du projet sont consignées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Le projet suivra le [versionnage sémantique](https://semver.org/lang/fr/) à partir de la première version publiée.

## [Non publié]

### Phase 3 : signalements et carte (M2)

#### Ajouté

- `@wakasafe/domain` :
  - règles des signalements (`report-rules.ts`) : statuts visibles sur la carte publique et ouverts aux avis, statut après un avis (validation, infirmation, contestation après validation), fréquence anormale, quotas sur 24 h glissantes, suspension automatique ;
  - ville pilote la plus proche d'une position (`geo.ts`) ;
  - date de validation d'un signalement (`validatedAt`) et erreurs `REPORT_QUOTA_REACHED`, `VOTE_QUOTA_REACHED`, `OWN_REPORT`, `REPORT_CLOSED_TO_VOTES`.
- `@wakasafe/mock-data` : dépôt des signalements complet (création, liste filtrée, détail, avis, quotas). Un signalement envoyé en fréquence anormale passe « Suspect » et rejoint la file de modération ; 3 alertes d'abus en 7 jours suspendent le compte 72 h ; un signalement validé rapporte 10 points à son auteur. Jeux de démonstration complétés (dates de validation, points). Schéma de stockage local en version 3.
- `apps/mobile` :
  - carte publique : carte Leaflet avec les tuiles OpenStreetMap sur le web, marqueurs colorés selon la gravité, liste des signalements, filtres par type, gravité et zone ;
  - formulaire « Signaler » : catégorie, gravité, personnes concernées, photo facultative compressée, position GPS automatique ; en cas de refus, choix de la ville ou point placé sur la carte (web) ; quota restant, compte suspendu en lecture seule, écran de confirmation ;
  - « Mes signalements » et détail d'un signalement avec « Je confirme » / « C'est faux » ;
  - composant `AppMap` (Leaflet sur le web, repli « Bientôt disponible » sur Android en attendant MapLibre), `LocationService` (`expo-location`), composant `Chip` ;
  - tests des parcours : carte et filtres, formulaire (position, photo, refus de localisation), mes signalements, avis, signalement non public, compte suspendu.
- Dépendances : `leaflet`, `react-leaflet`, `@types/leaflet`, `expo-location`.
- Variable `EXPO_PUBLIC_MAP_ATTRIBUTION` (crédit affiché sur la carte).

#### Modifié

- `ActionQuota` : `reportsAvailableAt` et `votesAvailableAt` remplacent `nextResetAt`.
- Les onglets « Carte » et « Signaler » ne sont plus « Bientôt disponible ». Textes des permissions (photos, appareil photo, localisation).
- Règles métier : dépassement de quota, alerte d'abus, avis, visibilité, zone, position sans GPS, points d'un signalement validé.
- Diagrammes : `validated_at` dans le modèle de données, `validatedAt` dans les classes du domaine, choix de la ville dans l'activité « Signaler un danger ».
- ADR-0006 : mise en œuvre de la carte web et du repli Android.

### Phase 2 : comptes et profils (M1)

#### Ajouté

- `@wakasafe/domain` : schémas de saisie des comptes (inscription, connexion, réinitialisation, profil, préférences, contact de sécurité, demande de profil, justificatif), règle du mot de passe, code de réinitialisation, plafond de 5 contacts de sécurité (`BUSINESS_RULES.accounts`), capacité `canRequestProfile`, erreur `INVALID_RESET_CODE` et erreurs par champ.
- `@wakasafe/mock-data` : inscription, réinitialisation du mot de passe par code (affiché à l'écran en démo), modification du profil et des préférences, ajout, modification et suppression des contacts de sécurité, dépôt d'une demande Conducteur ou Autorité et de ses justificatifs. Schéma de stockage local en version 2.
- `apps/mobile` :
  - écrans de connexion (téléphone et mot de passe), d'inscription en étapes (identité et photo facultative, profil souhaité, justificatifs facultatifs), de mot de passe oublié et de conditions d'utilisation (texte provisoire) ;
  - écrans du profil : modification (le téléphone n'est pas modifiable), préférences, contacts de sécurité, demande de profil Conducteur ou Autorité (y compris après un refus) et justificatifs ;
  - `MediaService` : choix d'une photo (appareil photo ou galerie sur Android, sélecteur de fichier sur le web) puis compression, avec `expo-image-picker` et `expo-image-manipulator` ;
  - composants de formulaire (champ texte, choix, case à cocher, interrupteur, avatar) ;
  - tests des parcours : connexion, inscription Citoyen et Conducteur, réinitialisation, profil, contacts, préférences, demande et justificatifs.
- Préparation de la future charte graphique GOSAFE ([ADR-0011](docs/adr/0011-provisional-theme-and-brand-guidelines.md)) : procédure de changement de charte, composant `BrandLogo` (logo remplaçable à un seul endroit), règle ESLint qui refuse les couleurs en dur dans les applications, test qui garde les couleurs de `app.json` alignées sur les tokens, token `sizes.borderWidthStrong`.

#### Modifié

- Accueil : boutons « Se connecter » et « Créer un compte » ; le choix d'un profil de démo devient un lien secondaire.
- Profil : avatar, bandeau en cas de refus, état de la demande et des justificatifs, accès aux écrans de gestion. Le message « Bientôt disponible » de la modification du profil disparaît.
- Web : le bouton retour de l'en-tête a un libellé accessible en français ; l'état des cases à cocher, des choix et des boutons en cours de chargement est annoncé aux lecteurs d'écran (attributs `aria-*`, que `react-native-web` lit à la place de `accessibilityState`).
- Textes : espace insécable avant `:`, `;`, `?` et `!` dans l'interface (vérifié par un test) et dans les données de démonstration des comptes.
- ADR 0003 à 0006 passés au statut « Accepté » ; ADR-0003 : routes réelles des comptes.
- Diagramme de séquence « Inscription et demande de profil » aligné sur l'implémentation.
- Règles métier : mot de passe, code de réinitialisation, contacts de sécurité, suspension sans demande de profil.

### Phase 1 : fondations de l'app client

#### Ajouté

- Monorepo **npm workspaces** : configuration TypeScript strict commune, ESLint, Prettier, EditorConfig, `.gitattributes` (fins de ligne LF, y compris sous Windows), `.nvmrc` (Node 24), `.env.example`.
- `@wakasafe/design-tokens` : couleurs (thème neutre, contrastes WCAG AA vérifiés par des tests), typographie, espacements, rayons, tailles tactiles.
- `@wakasafe/domain` : entités et schémas Zod de tout le domaine, paramètres métier provisoires centralisés (`BUSINESS_RULES`), capacités par rôle, erreurs métier, numéros camerounais, clés de période (jour, mois, année, période d'évaluation) au fuseau Africa/Douala.
- `@wakasafe/data-contracts` : interfaces de tous les dépôts, plus `KeyValueStore` et `Clock`.
- `@wakasafe/mock-data` : implémentations mock persistées localement, jeux de démonstration réalistes (Yaoundé, Douala, Bafoussam ; quiz marqués « contenu provisoire »), comptes de démonstration. Les opérations des phases suivantes répondent `NOT_IMPLEMENTED` en indiquant leur phase.
- `apps/mobile` (Expo SDK 58, Expo Router, web et Android) :
  - design system React Native (textes, boutons, cartes, badges, bandeaux, barres de progression, états de chargement et d'erreur) alimenté par les tokens ;
  - dictionnaire français typé ;
  - `StorageService` (AsyncStorage) et composition root `src/data` (seul point d'import des mocks) ;
  - session (Zustand) restaurée au démarrage, TanStack Query ;
  - écrans : accueil, « Choisir un profil de démo », 5 onglets (carte, signaler, quiz, classement : « Bientôt disponible »), profil, espace Conducteur ;
  - aucune information interne au projet (phases, avancement, références du cahier des charges) n'est affichée : les fonctionnalités pas encore livrées sont seulement indiquées « Bientôt disponible » ;
  - gardes de routes par rôle : visiteur, session requise, espace Conducteur réservé au Conducteur validé, compte suspendu en lecture seule ;
  - mise en page adaptée au grand écran (onglets en barre latérale sur le web desktop).
- CI GitHub Actions : lint, typecheck, tests, export web, export du bundle Android, synchronisation des diagrammes du README, rendu de chaque diagramme Mermaid.
- Configuration Vercel de la démo client (`apps/mobile/vercel.json`) et projet Vercel `wakasafe-client` connecté : URL de démonstration <https://wakasafe-client.vercel.app> et prévisualisation par PR (réglages documentés dans le README et l'ADR-0008).
- Scripts `check:diagrams` et `sync:diagrams`, et `start:mobile` (QR code pour Expo Go).
- README : procédure de test sur un téléphone Android physique avec Expo Go (Wi-Fi, câble USB ou tunnel).

#### Modifié

- README : statut, structure, commandes réelles, comptes de démonstration (dont le compte suspendu), tests et CI, déploiement.
- ADR-0003 : organisation réelle des routes et des gardes.
- Diagrammes : `AgencyRepository` et `Clock` dans la table des interfaces, `PointSourceType` dans le diagramme de classes.
- Architecture : structure, variables d'environnement, emplacement de `BUSINESS_RULES`, couverture de la phase 1 dans la matrice de traçabilité.

### Phase 0 : cadrage et architecture

#### Ajouté

- README de référence : présentation, périmètre MVP et hors MVP, profils, stack, architecture, modèle de données, roadmap, workflow Git, démo, hypothèses.
- Diagrammes Mermaid dans `docs/diagrams/` : cas d'utilisation (+ PlantUML), architecture globale, composants, classes du domaine, 7 séquences, états (compte, demande de profil, signalement), activité « Signaler un danger », MCD/MLD, déploiement.
- ADR 0001 à 0010 dans `docs/adr/`.
- Documents d'architecture : structure du monorepo, règles métier provisoires, matrice de traçabilité, analyse des écarts avec le cahier des charges.
- `ROADMAP.md`, `CONTRIBUTING.md`, `.github/copilot-instructions.md`, modèles d'issues et de pull request.
- `.gitignore` excluant les documents sources confidentiels (`docs/source/`).
