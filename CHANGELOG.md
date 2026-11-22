# Changelog

Toutes les modifications notables du projet sont consignées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Le projet suivra le [versionnage sémantique](https://semver.org/lang/fr/) à partir de la première version publiée.

## [Non publié]

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
  - écrans : accueil, « Choisir un profil de démo », 5 onglets (carte, signaler, quiz, classement : « bientôt disponible »), profil, espace Conducteur, page publique « Avancement du projet » ;
  - gardes de routes par rôle : visiteur, session requise, espace Conducteur réservé au Conducteur validé, compte suspendu en lecture seule ;
  - mise en page adaptée au grand écran (onglets en barre latérale sur le web desktop).
- Page « Avancement du projet » alimentée par `roadmap.json`.
- CI GitHub Actions : lint, typecheck, tests, export web, export du bundle Android, synchronisation des diagrammes du README, cohérence de la roadmap, rendu de chaque diagramme Mermaid.
- Configuration Vercel de la démo client (`apps/mobile/vercel.json`).
- Scripts `check:diagrams`, `sync:diagrams` et `check:roadmap`, et `start:mobile` (QR code pour Expo Go).
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
