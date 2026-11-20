# Structure du monorepo et conventions

> Structure **cible**. Les dossiers `apps/` et `packages/` sont créés à partir de la phase 1. En phase 0, seuls la documentation et les fichiers GitHub existent.

## Arborescence

```text
wakasafe/
├── .github/
│   ├── workflows/                 # CI : lint, typecheck, tests, build (phase 1)
│   ├── ISSUE_TEMPLATE/            # modèles d'issues
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── copilot-instructions.md    # règles pour l'agent de développement
├── docs/
│   ├── adr/                       # décisions d'architecture numérotées
│   ├── architecture/              # ce document, règles métier, traçabilité, écarts
│   ├── diagrams/                  # diagrammes Mermaid (source de vérité)
│   └── source/                    # cahier des charges (LOCAL UNIQUEMENT, ignoré par Git)
├── apps/
│   ├── mobile/                    # Expo + Expo Router — web + Android
│   │   ├── app/                   # routes (voir ADR-0003)
│   │   ├── assets/                # icônes, images de démo légères
│   │   └── src/
│   │       ├── data/              # composition root (seul import de mock-data)
│   │       ├── features/          # accounts, reports, offline, quiz, points, ratings,
│   │       │                      # notifications, project-progress
│   │       ├── services/          # storage, location, media, network, notification, sync
│   │       ├── ui/                # design system RN, AppMap (.web / .native)
│   │       └── lib/               # i18n fr, config, utilitaires
│   └── admin/                     # Next.js App Router — web
│       └── src/
│           ├── app/               # routes (voir ADR-0004)
│           ├── data/              # composition root
│           ├── features/          # auth, profile-review, moderation, quiz-admin,
│           │                      # dashboard, export, authority-view
│           ├── components/        # composants Tailwind
│           └── lib/
├── packages/
│   ├── domain/                    # entités, schémas Zod, règles métier pures
│   ├── data-contracts/            # interfaces des dépôts et services
│   ├── mock-data/                 # implémentations mock + jeux de démonstration
│   └── design-tokens/             # couleurs, typographie, espacements, rayons
├── roadmap.json                   # données de la page « Avancement du projet » (phase 1)
├── README.md  ROADMAP.md  CHANGELOG.md  CONTRIBUTING.md
├── .env.example                   # variables publiques uniquement (phase 1)
└── package.json                   # npm workspaces (phase 1)
```

## Organisation d'une feature

```text
features/reports/
├── components/      # composants propres à la feature
├── hooks/           # useReports, useCreateReport (TanStack Query + useRepositories)
├── screens/         # écrans montés par les routes de app/
├── store.ts         # état local Zustand si nécessaire
├── index.ts         # API publique de la feature
└── __tests__/
```

Les routes de `app/` restent **minces** : elles importent un écran depuis `features/*/screens`.

## Conventions

| Sujet         | Règle                                                                                                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Langue        | Code, noms, commits : **anglais**. UI, docs, messages au responsable : **français**.                                                                                                                 |
| TypeScript    | `strict: true`, `noUncheckedIndexedAccess: true`, pas de `any` implicite.                                                                                                                            |
| Imports       | Les features n'importent que `@wakasafe/domain`, `@wakasafe/data-contracts`, `services/` et `ui/`. Seul `src/data/` importe une implémentation ([ADR-0005](../adr/0005-data-access-abstraction.md)). |
| Plateformes   | Pas d'API web-only ou native-only sans variante : fichiers `.web.tsx` / `.native.tsx` ou `Platform.select`.                                                                                          |
| Thème         | Toute couleur, taille ou espacement vient de `@wakasafe/design-tokens`. Aucune valeur en dur dans les composants.                                                                                    |
| Accessibilité | Zones tactiles d'au moins 48 × 48 dp, contraste WCAG AA, `accessibilityLabel` sur les icônes, police réglable par le système.                                                                        |
| Performance   | Images compressées, listes virtualisées, chargement paresseux de la carte, pas de bibliothèque lourde sans justification.                                                                            |
| Textes        | Tous les libellés de l'UI sont dans le dictionnaire `fr`, jamais en dur.                                                                                                                             |
| Tests         | Règles du domaine : tests unitaires obligatoires. Écrans : tests RNTL ou RTL des parcours principaux.                                                                                                |

## Variables d'environnement prévues (phase 1)

| Variable                   | App    | Valeur par défaut | Rôle                                 |
| -------------------------- | ------ | ----------------- | ------------------------------------ |
| `EXPO_PUBLIC_DATA_SOURCE`  | mobile | `mock`            | Choix de l'implémentation des dépôts |
| `EXPO_PUBLIC_MAP_TILE_URL` | mobile | tuiles OSM        | Fournisseur de tuiles                |
| `NEXT_PUBLIC_DATA_SOURCE`  | admin  | `mock`            | Choix de l'implémentation des dépôts |
| `NEXT_PUBLIC_MAP_TILE_URL` | admin  | tuiles OSM        | Fournisseur de tuiles                |

Aucune variable secrète n'est nécessaire tant que les données sont mock.
