# 2. Diagramme d'architecture globale

> Source de vérité de ce diagramme. Toute modification doit être reportée dans le [README](../../README.md).
> Décisions associées : [ADR-0001](../adr/0001-two-web-applications.md), [ADR-0002](../adr/0002-monorepo-npm-workspaces.md), [ADR-0005](../adr/0005-data-access-abstraction.md).

```mermaid
flowchart TB
    subgraph USERS["Utilisateurs"]
        U1["👤 Citoyen / Conducteur / Autorité"]
        U2["👤 Administrateur / Autorité (vue simplifiée)"]
    end

    subgraph MOBILE["apps/mobile — Expo + React Native + Expo Router"]
        direction TB
        M_UI["UI : écrans (app/), design system, AppMap"]
        M_FEAT["features/ : accounts, reports, offline,<br/>quiz, ratings, notifications"]
        M_SVC["services/ : storage, location, camera,<br/>network, notification, sync"]
        M_ROOT["Composition root (src/data/)<br/>choix de l'implémentation des dépôts"]
        M_UI --> M_FEAT
        M_FEAT --> M_SVC
        M_FEAT --> M_ROOT
    end

    subgraph ADMINAPP["apps/admin — Next.js App Router"]
        direction TB
        A_UI["UI : pages, composants Tailwind,<br/>tableaux, graphiques, carte Leaflet"]
        A_FEAT["features/ : auth, profile-review, moderation,<br/>quiz-admin, dashboard, export, authority-view"]
        A_ROOT["Composition root (src/data/)<br/>choix de l'implémentation des dépôts"]
        A_UI --> A_FEAT
        A_FEAT --> A_ROOT
    end

    subgraph PKG["packages/ — partagés par les deux apps (aucun composant UI)"]
        direction TB
        P_TOK["design-tokens<br/>couleurs, typographie, espacements"]
        P_MOCK["mock-data<br/>implémentations en mémoire + jeux de démo"]
        P_API["api-client (phase 12)<br/>implémentation HTTP des mêmes interfaces"]
        P_CON["data-contracts<br/>interfaces des dépôts et services"]
        P_DOM["domain<br/>entités, schémas Zod, règles métier pures"]
        P_MOCK -. "implémente" .-> P_CON
        P_API -. "implémente" .-> P_CON
        P_CON --> P_DOM
    end

    subgraph FUTURE["Backend cible (phase 12) — non implémenté"]
        direction LR
        F_API["API REST Node.js + TypeScript"]
        F_DB[("Base de données<br/>PostgreSQL/PostGIS ou MySQL")]
        F_S3[("Stockage objet S3<br/>photos, justificatifs")]
        F_FCM["Firebase Cloud Messaging"]
        F_API --> F_DB
        F_API --> F_S3
        F_API --> F_FCM
    end

    U1 -->|"web (URL) et Android"| M_UI
    U2 -->|"web desktop / tablette"| A_UI

    M_UI --> P_TOK
    A_UI --> P_TOK
    M_FEAT -->|"interfaces uniquement"| P_CON
    A_FEAT -->|"interfaces uniquement"| P_CON
    M_ROOT -->|"aujourd'hui"| P_MOCK
    A_ROOT -->|"aujourd'hui"| P_MOCK
    M_ROOT -. "phase 12" .-> P_API
    A_ROOT -. "phase 12" .-> P_API
    P_API -. "HTTPS" .-> F_API

    classDef future fill:#f3f4f6,stroke:#9ca3af,stroke-dasharray:5 5,color:#4b5563
    classDef shared fill:#ecfdf5,stroke:#047857,color:#064e3b
    class P_API,F_API,F_DB,F_S3,F_FCM future
    class P_TOK,P_DOM,P_CON,P_MOCK shared
```

Pour la lisibilité, le diagramme omet les flèches des features vers `domain` : les features importent aussi directement les entités et les règles métier (voir le tableau ci-dessous).

## Règles de dépendance (vérifiées par ESLint)

La CI fait échouer tout import qui viole ces règles : `no-restricted-imports` interdit `mock-data` hors de la composition root et les frameworks dans les packages ; `import/no-extraneous-dependencies` (types compris) interdit à un package d'importer ce que son `package.json` ne déclare pas. Configuration : [`eslint.config.js`](../../eslint.config.js).

| Couche                         | Peut importer                                    | Ne doit jamais importer                                   |
| ------------------------------ | ------------------------------------------------ | --------------------------------------------------------- |
| `packages/domain`              | rien d'autre que `zod`                           | React, React Native, Next.js, un autre package applicatif |
| `packages/data-contracts`      | `domain`                                         | une implémentation (`mock-data`, `api-client`)            |
| `packages/mock-data`           | `domain`, `data-contracts`                       | React, React Native, Next.js, API navigateur ou native    |
| `packages/design-tokens`       | rien                                             | tout le reste                                             |
| `features/` (dans chaque app)  | `domain`, `data-contracts`, `services/`, `ui/`   | `mock-data` ou `api-client` directement                   |
| Composition root (`src/data/`) | `mock-data` (aujourd'hui), `api-client` (demain) | — c'est le **seul** endroit autorisé                      |

Conséquence : brancher la vraie API (phase 12) consiste à écrire `api-client` et à modifier la composition root de chaque app. L'UI et les features ne changent pas.

## Limite connue du mode démo

Les deux apps sont servies sur deux URL distinctes et chacune stocke ses données mock localement (navigateur ou téléphone). Elles démarrent avec **les mêmes jeux de données**, mais une action faite dans l'admin (par exemple valider un profil Conducteur) **n'apparaît pas en direct** dans l'app client. La synchronisation réelle viendra avec le backend (phase 12).
