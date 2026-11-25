# 3. Diagramme de composants et de modules

> Source de vérité de ce diagramme. Toute modification doit être reportée dans le [README](../../README.md).

## 3.1 Modules fonctionnels (M1 à M9) et dépendances

Une flèche `A --> B` signifie « A utilise B ».

```mermaid
flowchart LR
    M1["M1 Comptes et profils"]
    M2["M2 Signalements"]
    M3["M3 Mode hors ligne"]
    M5["M5 Quiz, points, classements"]
    M6["M6 Évaluation conducteurs et agences"]
    M7["M7 Notifications"]
    M9["M9 Back-office"]
    M4["M4 Partage de trajet<br/>(optionnel)"]
    M8["M8 Mode conduite<br/>(optionnel)"]

    M2 -->|"auteur authentifié, limites d'actions"| M1
    M3 -->|"met en file puis rejoue"| M2
    M2 -->|"points : signalement validé"| M5
    M6 -->|"points : évaluation"| M5
    M6 -->|"conducteurs, agences"| M1
    M5 -->|"utilisateur, rang"| M1
    M2 -->|"danger à proximité"| M7
    M5 -->|"rappel du quiz quotidien"| M7
    M1 -->|"décision sur un profil"| M7
    M9 -->|"validation profils, suspensions"| M1
    M9 -->|"modération, « pris en charge »"| M2
    M9 -->|"gestion des quiz"| M5
    M9 -->|"KPI"| M6
    M4 -.->|"contacts de sécurité"| M1
    M4 -.->|"alertes de trajet"| M7
    M9 -.->|"KPI trajets partagés"| M4
    M8 -.->|"signalement en un appui"| M2
    M8 -.->|"annonces vocales"| M7

    classDef optional fill:#f3f4f6,stroke:#9ca3af,stroke-dasharray:5 5,color:#4b5563
    class M4,M8 optional
```

Tant que M4 n'est pas activé, les alertes de trajet (F7.2) et le KPI « trajets partagés » (F9.5) sont affichés comme « non disponible » ([ADR-0007](../adr/0007-notifications-in-app-first.md)).

## 3.2 Composants logiciels par application

```mermaid
flowchart TB
    subgraph MOBILE["apps/mobile — Expo (web + Android)"]
        M_UI["<b>src/ui</b><br/>Design system<br/>AppMap :<br/>.web.tsx → Leaflet<br/>.native.tsx → MapLibre"]
        M_FEAT["<b>src/features</b><br/>accounts (M1)<br/>reports (M2)<br/>offline (M3)<br/>quiz, points (M5)<br/>ratings (M6)<br/>notifications (M7)"]
        M_SVC["<b>src/services</b><br/>StorageService<br/>LocationService<br/>MediaService (photo)<br/>NetworkService<br/>NotificationService<br/>SyncService"]
        M_DATA["<b>src/data</b><br/>composition root"]
        M_UI --> M_FEAT
        M_FEAT --> M_SVC
    end

    subgraph ADMINAPP["apps/admin — Next.js (web)"]
        A_UI["<b>src/components</b><br/>Tailwind<br/>TanStack Table<br/>Recharts<br/>Leaflet + heatmap"]
        A_FEAT["<b>src/features</b><br/>auth (F9.1)<br/>profile-review (F9.2)<br/>moderation (F9.3)<br/>quiz-admin (F9.4)<br/>dashboard (F9.5)<br/>export (F9.6)<br/>authority-view (F9.7)"]
        A_DATA["<b>src/data</b><br/>composition root"]
        A_UI --> A_FEAT
    end

    subgraph PKG["packages/"]
        P_TOK["@wakasafe/design-tokens"]
        P_MOCK["@wakasafe/mock-data"]
        P_CON["@wakasafe/data-contracts"]
        P_DOM["@wakasafe/domain"]
        P_MOCK -- implémente --> P_CON
        P_CON --> P_DOM
    end

    M_UI --> P_TOK
    A_UI --> P_TOK
    M_FEAT -- interfaces --> P_CON
    A_FEAT -- interfaces --> P_CON
    M_DATA --> P_MOCK
    A_DATA --> P_MOCK
```

Dépendances détaillées entre features et services de `apps/mobile` :

| Feature (module)     | Services et composants utilisés                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `reports` (M2)       | `LocationService`, `MediaService` (photo), `AppMap`                                                   |
| `offline` (M3)       | `SyncService`, qui s'appuie sur `NetworkService` (détection réseau) et `StorageService` (file locale) |
| `notifications` (M7) | `NotificationService` (centre in-app + toasts, FCM plus tard)                                         |
| toutes               | interfaces de `@wakasafe/data-contracts` et types de `@wakasafe/domain`                               |

## 3.3 Interfaces exposées par `@wakasafe/data-contracts`

| Interface                  | Modules    | Principales opérations                                                                                                                                                          |
| -------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthRepository`           | M1, M9     | `register`, `login`, `logout`, `getSession`, `requestPasswordReset`, `resetPassword`                                                                                            |
| `UserRepository`           | M1, M9     | `getById`, `list(filters)`, `updateProfile`, `getPreferences`, `updatePreferences`, `listSafetyContacts`, `upsertSafetyContact`, `removeSafetyContact`, `suspend`, `reactivate` |
| `ProfileRequestRepository` | M1, M9     | `submit`, `uploadDocument`, `getForUser`, `listDocuments`, `listPending`, `approve`, `reject`                                                                                   |
| `AgencyRepository`         | M1, M6     | `list`, `getById` (agences de rattachement des conducteurs)                                                                                                                     |
| `ReportRepository`         | M2, M3, M9 | `getActionQuota`, `create`, `list(filters)`, `getById`, `getUserVote`, `vote(confirm/refute)`, `markHandled`, `close`                                                           |
| `ModerationRepository`     | M2, M9     | `listOpen`, `resolve`                                                                                                                                                           |
| `QuizRepository`           | M5, M9     | `getDailyQuestions`, `answer`, `listQuizzes`, `getQuestions`, `upsertQuiz`, `setActive`                                                                                         |
| `PointsRepository`         | M5         | `listEntries`, `getScore`, `getLeaderboard(monthly/annual)`                                                                                                                     |
| `RatingRepository`         | M6         | `getRatingEligibility`, `submit`, `listDrivers`, `listAgencies`, `getDriverStats`                                                                                               |
| `NotificationRepository`   | M7         | `list`, `countUnread`, `markAsRead`, `markAllAsRead`, `push` (simulation)                                                                                                       |
| `StatsRepository`          | M9         | `getKpis`, `getHeatmap`, `exportRows`                                                                                                                                           |
| `KeyValueStore`            | toutes     | `get`, `set`, `remove` (persistance locale injectée dans les mocks)                                                                                                             |
| `Clock`                    | toutes     | `now` (horloge injectable : quotas, classements, tests)                                                                                                                         |

Signatures détaillées : [`packages/data-contracts/src`](../../packages/data-contracts/src). Les dépôts reçoivent l'identifiant de l'utilisateur concerné en paramètre explicite. En phase 1, les opérations des phases suivantes existent dans les mocks mais rejettent une erreur `NOT_IMPLEMENTED` qui indique leur phase.
