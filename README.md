# WakaSafe

**Application citoyenne de prévention et de sécurité routière au Cameroun**, portée par l'**Association GOSAFE**.

> Statut : **phase 3 — signalements et carte** (formulaire de signalement avec position GPS et photo, carte publique filtrable, validation et infirmation par la communauté, signalements suspects, limites d'actions). Les phases 0 (cadrage et architecture), 1 (fondations de l'app client) et 2 (comptes et profils) sont terminées.
> Avancement détaillé : [ROADMAP.md](ROADMAP.md).

## Sommaire

1. [Présentation et objectifs](#1-présentation-et-objectifs)
2. [Périmètre du MVP](#2-périmètre-du-mvp)
3. [Profils et droits](#3-profils-et-droits)
4. [Stack technique et justification](#4-stack-technique-et-justification)
5. [Architecture et diagrammes](#5-architecture-et-diagrammes)
6. [Structure des dossiers](#6-structure-des-dossiers)
7. [Modèle de données](#7-modèle-de-données)
8. [Roadmap](#8-roadmap)
9. [Workflow Git](#9-workflow-git)
10. [Application client (apps/mobile)](#10-application-client-appsmobile)
11. [Back-office (apps/admin)](#11-back-office-appsadmin)
12. [Tests et qualité](#12-tests-et-qualité)
13. [Déploiement de la démo](#13-déploiement-de-la-démo)
14. [Décisions d'architecture (ADR)](#14-décisions-darchitecture-adr)
15. [Hypothèses et points ouverts](#15-hypothèses-et-points-ouverts)
16. [Contribuer](#16-contribuer)
17. [Propriété et licence](#17-propriété-et-licence)

---

## 1. Présentation et objectifs

WakaSafe vise à réduire les accidents de la route et à sauver des vies au Cameroun. Le MVP doit permettre de :

- **signaler un danger routier en quelques secondes, même sans réseau** ;
- **partager son trajet** avec un proche alerté en cas d'anomalie _(module optionnel, à arbitrer)_ ;
- **s'éduquer** par des quiz, avec des points et des classements ;
- **évaluer** les conducteurs et les agences de voyage ;
- donner à **GOSAFE et aux autorités** une vue d'ensemble : carte, statistiques, modération.

**Phase pilote** : Android d'abord, à Yaoundé, Douala et Bafoussam.

**Priorité actuelle** : une architecture claire et documentée, puis une interface qui donne au client un aperçu fidèle du produit. Les données sont **simulées (mock)** jusqu'au branchement du backend réel (phase 12).

Le produit est composé de **deux applications web** :

| Application                    | Technologie                       | Cibles                                        | Utilisateurs                              |
| ------------------------------ | --------------------------------- | --------------------------------------------- | ----------------------------------------- |
| **Client** (`apps/mobile`)     | React Native + Expo + Expo Router | **Web (URL)** et **Android 8+**, un seul code | Citoyen, Conducteur d'agence, Autorité    |
| **Back-office** (`apps/admin`) | Next.js (App Router)              | Web (desktop d'abord, tablette)               | Administrateur, Autorité (vue simplifiée) |

## 2. Périmètre du MVP

Référence : cahier des charges **DEV-WS-MVP-2026-001** (document confidentiel, non versionné, voir [docs/source](docs/source/README.md)).

| Module                            | Contenu                                                                                                                                                              | Application            | Statut                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------- |
| **M1** Comptes et profils         | Inscription, connexion, réinitialisation, profils Citoyen / Conducteur / Autorité, justificatifs, contacts de sécurité (F1.1–F1.5)                                   | Client                 | Inclus                          |
| **M2** Signalements               | 10 catégories, gravité, personnes concernées, photo, GPS, carte publique filtrable, validation communautaire, modération des suspects, limites d'actions (F2.1–F2.6) | Client                 | Inclus                          |
| **M3** Mode hors ligne            | Enregistrement local, icône « hors ligne », synchronisation avec confirmation (F3.1–F3.2)                                                                            | Client                 | Inclus                          |
| **M5** Quiz, points, classements  | QCM avec correction, 5 questions par jour, points traçables, classements mensuel et annuel (F5.1–F5.5)                                                               | Client                 | Inclus                          |
| **M6** Évaluation des conducteurs | 4 critères, moyennes, classements conducteurs et agences, anti-abus, statistiques (F6.1–F6.4)                                                                        | Client                 | Inclus                          |
| **M7** Notifications              | Danger à proximité, rappels de quiz, infos des autorités, mode visuel (F7.1–F7.3). Centre in-app et toasts, FCM plus tard                                            | Client                 | Inclus                          |
| **M9** Back-office                | Connexion, validation des profils, modération, quiz, KPI et heatmap, export CSV, vue Autorité (F9.1–F9.7)                                                            | Admin (Next.js)        | Inclus                          |
| **M4** Partage de trajet          | Contact de sécurité, lien de suivi web, alertes, bouton danger, expiration (F4.1–F4.5)                                                                               | Client + page publique | **Optionnel, sur confirmation** |
| **M8** Mode conduite simplifié    | Grandes icônes, signalement en un appui, annonces vocales (F8.1–F8.3)                                                                                                | Client                 | **Optionnel, sur confirmation** |

**Hors MVP (ne sera pas développé dans cette version)** : défis et challenges, SafeFlash, paiement Mobile Money et récompenses monétaires, sponsors, commandes vocales et gestuelles, iOS, interface Autorité avancée, modération par IA, trophées et événements, API publique.

Les écarts entre le cahier des charges et ce cadrage sont analysés dans [docs/architecture/spec-gap-analysis.md](docs/architecture/spec-gap-analysis.md).

## 3. Profils et droits

| Profil                  | Droits                                                                                                                                                              | Validation du compte                                               | Application                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| **Citoyen**             | Signaler, valider ou infirmer, consulter la carte, répondre aux quiz, évaluer un conducteur, consulter son score et les classements, gérer ses contacts de sécurité | Automatique à l'inscription                                        | Client                                   |
| **Conducteur d'agence** | Droits du Citoyen + être évalué et consulter ses statistiques                                                                                                       | Manuelle par un administrateur (identité, permis, agence affiliée) | Client                                   |
| **Autorité**            | Droits du Citoyen + carte, heatmap, alertes critiques, marquer « pris en charge »                                                                                   | Manuelle par un administrateur (justificatif de fonction)          | Client + Admin (vue Autorité uniquement) |
| **Administrateur**      | Validation des profils, modération, gestion des quiz, tableau de bord, export                                                                                       | Compte créé par le prestataire                                     | Admin                                    |

Pendant la validation, un Conducteur ou une Autorité **garde les droits Citoyen**. En cas de refus, il reste Citoyen ([ADR-0009](docs/adr/0009-profile-requests-and-authority-access.md)).

## 4. Stack technique et justification

| Couche                   | Choix                                                                                                  | Pourquoi                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Monorepo                 | **npm workspaces**                                                                                     | Aucun outil en plus, compatible Metro, Next.js et Vercel ([ADR-0002](docs/adr/0002-monorepo-npm-workspaces.md))                |
| App client               | **Expo (SDK 58) + React Native + TypeScript strict + Expo Router**                                     | Un seul code pour le web (démo) et Android, prévu par le cahier des charges ([ADR-0003](docs/adr/0003-client-app-stack.md))    |
| Back-office              | **Next.js App Router + TypeScript strict + Tailwind CSS**, TanStack Table, Recharts, Leaflet + heatmap | Imposé par le cahier des charges. Adapté aux tableaux et graphiques sur desktop ([ADR-0004](docs/adr/0004-admin-app-stack.md)) |
| Domaine partagé          | **TypeScript + Zod**                                                                                   | Mêmes types et mêmes règles métier dans les deux apps et dans le futur backend                                                 |
| Données                  | **Interfaces de dépôts + implémentations mock**                                                        | Brancher l'API ou Supabase ne touche qu'une couche ([ADR-0005](docs/adr/0005-data-access-abstraction.md))                      |
| État                     | **TanStack Query + Zustand**                                                                           | Cache, nouvelles tentatives, tolérance au réseau faible, état local léger                                                      |
| Cartographie             | **OpenStreetMap** : Leaflet (web), MapLibre (Android), derrière `AppMap`                               | Gratuit, sans clé API ([ADR-0006](docs/adr/0006-maps-openstreetmap.md))                                                        |
| Notifications            | **Centre in-app + toasts**, interface `NotificationService` prête pour FCM                             | Démo complète sans compte Firebase ([ADR-0007](docs/adr/0007-notifications-in-app-first.md))                                   |
| Qualité                  | ESLint, Prettier, `tsc --noEmit`, Jest + Testing Library, GitHub Actions                               | Contrôles automatiques sur chaque PR                                                                                           |
| Démo                     | **Vercel**, deux projets, prévisualisation par PR                                                      | ([ADR-0008](docs/adr/0008-demo-hosting-vercel.md))                                                                             |
| Cible backend (phase 12) | API REST Node.js + TypeScript, PostgreSQL/PostGIS **ou** MySQL **ou** Supabase, stockage S3, FCM       | Choix de la base **non tranché**                                                                                               |

## 5. Architecture et diagrammes

Les diagrammes sont en Mermaid. Leur source de vérité est [docs/diagrams/](docs/diagrams/README.md). Les copies ci-dessous sont maintenues identiques.

### 5.1 Architecture globale

<!-- diagram:docs/diagrams/02-architecture.md#1 -->

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

<!-- /diagram -->

**Règle d'or** : les écrans et les features ne connaissent que les **interfaces** de `@wakasafe/data-contracts`. Seule la _composition root_ (`src/data/`) de chaque app choisit l'implémentation : mock aujourd'hui, API demain.

### 5.2 Cas d'utilisation

<!-- diagram:docs/diagrams/01-use-cases.md#1 -->

```mermaid
flowchart LR
    CIT["👤 Citoyen"]
    DRV["👤 Conducteur d'agence"]
    AUT["👤 Autorité"]
    ADM["👤 Administrateur"]
    SC["👤 Contact de sécurité"]

    DRV -. "est un" .-> CIT
    AUT -. "est un" .-> CIT

    subgraph CLIENT["Application client — apps/mobile (Expo : web + Android)"]
        direction TB
        subgraph M1["M1 Comptes et profils"]
            UC1(["S'inscrire et choisir son profil"])
            UC2(["Se connecter / réinitialiser le mot de passe"])
            UC3(["Téléverser ses justificatifs"])
            UC4(["Gérer profil, préférences et contacts de sécurité"])
        end
        subgraph M2["M2 Signalements"]
            UC5(["Signaler un danger"])
            UC6(["Consulter la carte publique et filtrer"])
            UC7(["Valider / infirmer un signalement"])
        end
        subgraph M3["M3 Hors ligne"]
            UC8(["Confirmer la synchronisation des signalements hors ligne"])
        end
        subgraph M5["M5 Quiz, points, classements"]
            UC9(["Répondre au quiz du jour (5 questions max)"])
            UC10(["Consulter score, progression et classements"])
        end
        subgraph M6["M6 Évaluations"]
            UC11(["Évaluer un conducteur"])
            UC12(["Consulter les classements conducteurs et agences"])
            UC13(["Consulter ses statistiques de conducteur"])
        end
        subgraph M7["M7 Notifications"]
            UC14(["Recevoir et consulter ses notifications"])
        end
        subgraph OPT["M4 / M8 — optionnels, à arbitrer"]
            UC15(["Partager un trajet"])
            UC17(["Utiliser le mode conduite simplifié"])
        end
    end

    subgraph TRACK["Page web publique de suivi — emplacement à définir (ADR phase 10)"]
        UC16(["Suivre un trajet partagé sans installer l'app"])
    end

    subgraph ADMIN["Back-office — apps/admin (Next.js, web)"]
        direction TB
        UC20(["Se connecter au back-office"])
        UC21(["Valider / refuser un profil (justificatifs)"])
        UC22(["Modérer signalements suspects et comptes"])
        UC23(["Créer, modifier, activer les quiz"])
        UC24(["Consulter le tableau de bord KPI et la heatmap"])
        UC25(["Exporter les statistiques en CSV"])
        UC26(["Vue Autorité : carte, filtres, « pris en charge »"])
    end

    CIT --- UC1 & UC2 & UC3 & UC4
    CIT --- UC5 & UC6 & UC7 & UC8
    CIT --- UC9 & UC10 & UC11 & UC12 & UC14
    CIT -.- UC15 & UC17
    DRV --- UC13
    AUT --- UC20 & UC26
    ADM --- UC20 & UC21 & UC22 & UC23 & UC24 & UC25 & UC26
    SC -.- UC16

    classDef actor fill:#ffffff,stroke:#1f2937,stroke-width:2px,color:#111827
    classDef usecase fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
    classDef optional fill:#f3f4f6,stroke:#9ca3af,stroke-dasharray:5 5,color:#4b5563
    class CIT,DRV,AUT,ADM,SC actor
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14 usecase
    class UC20,UC21,UC22,UC23,UC24,UC25,UC26 usecase
    class UC15,UC16,UC17 optional
```

<!-- /diagram -->

Version UML stricte (PlantUML) : [01-use-cases.puml](docs/diagrams/01-use-cases.puml).

### 5.3 Modules et composants

<!-- diagram:docs/diagrams/03-components.md#1 -->

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

<!-- /diagram -->

<details>
<summary><strong>Composants logiciels par application</strong></summary>

<!-- diagram:docs/diagrams/03-components.md#2 -->

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

<!-- /diagram -->

</details>

### 5.4 Classes du domaine

<details>
<summary><strong>Diagramme de classes</strong></summary>

<!-- diagram:docs/diagrams/04-domain-classes.md#1 -->

```mermaid
classDiagram
    direction LR

    class User {
        +string id
        +string firstName
        +string lastName
        +string phone
        +string photoUrl [0..1]
        +Role role
        +AccountStatus status
        +DateTime suspendedUntil [0..1]
        +DateTime createdAt
    }
    class Preferences {
        +boolean nearbyDangerAlerts
        +number nearbyRadiusKm
        +boolean quizReminders
        +string language = "fr"
    }
    class SafetyContact {
        +string id
        +string name
        +string phone
        +string relation [0..1]
    }
    class ProfileRequest {
        +string id
        +Role requestedRole
        +ProfileRequestStatus status
        +DateTime submittedAt
        +DateTime reviewedAt [0..1]
        +string reviewedBy [0..1]
        +string rejectionReason [0..1]
    }
    class SupportingDocument {
        +string id
        +DocumentType type
        +string fileUrl
        +DateTime uploadedAt
    }
    class Agency {
        +string id
        +string name
        +string city
    }
    class Driver {
        +string userId
        +string agencyId
    }
    class AuthorityProfile {
        +string userId
        +string organization
        +string position
    }
    class AccountSanction {
        +string id
        +string reason
        +DateTime startsAt
        +DateTime endsAt [0..1]
        +string createdBy
    }

    class GeoPoint {
        <<value object>>
        +number latitude
        +number longitude
        +number accuracyMeters [0..1]
    }
    class Report {
        +string id
        +ReportCategory category
        +Severity severity
        +AffectedGroup affectedGroup
        +GeoPoint location
        +string city
        +string photoUrl [0..1]
        +DateTime occurredAt
        +DateTime createdAt
        +ReportStatus status
        +ReportOrigin origin
        +number confirmations
        +number refutations
        +DateTime validatedAt [0..1]
        +string handledBy [0..1]
    }
    class ReportValidation {
        +string id
        +Verdict verdict
        +DateTime createdAt
    }
    class PendingReport {
        <<stockage local, M3>>
        +string localId
        +ReportDraft draft
        +DateTime createdAt
        +SyncState syncState
        +string lastError [0..1]
    }
    class ModerationItem {
        +string id
        +ModerationTarget targetType
        +string targetId
        +ModerationReason reason
        +ModerationStatus status
        +DateTime createdAt
        +string resolvedBy [0..1]
        +string decision [0..1]
    }

    class Quiz {
        +string id
        +string title
        +QuizTheme theme
        +boolean isActive
        +boolean isPlaceholderContent
    }
    class Question {
        +string id
        +string statement
        +string correctChoiceId
        +string explanation
    }
    class Choice {
        +string id
        +string label
    }
    class Attempt {
        +string id
        +string choiceId
        +boolean isCorrect
        +DateTime answeredAt
    }
    class PointEntry {
        +string id
        +PointReason reason
        +number points
        +PointSourceType sourceType
        +string sourceId
        +DateTime createdAt
    }
    class LeaderboardEntry {
        <<value object>>
        +string userId
        +number rank
        +number points
        +LeaderboardPeriod period
        +string periodKey
    }

    class Rating {
        +string id
        +number courtesy
        +number punctuality
        +number safeDriving
        +number vehicleCleanliness
        +string periodKey
        +DateTime createdAt
        +average() number
    }

    class Notification {
        +string id
        +NotificationType type
        +string title
        +string body
        +DateTime createdAt
        +DateTime readAt [0..1]
    }

    class Trip {
        <<M4 optionnel>>
        +string id
        +TripStatus status
        +string shareToken
        +DateTime startedAt
        +DateTime expiresAt
    }

    User "1" *-- "1" Preferences
    User "1" *-- "0..*" SafetyContact : contacts de sécurité
    User "1" --> "0..*" ProfileRequest : demande
    ProfileRequest "1" *-- "1..*" SupportingDocument : justificatifs
    ProfileRequest "0..*" --> "0..1" Agency : agence affiliée
    User "1" -- "0..1" Driver
    User "1" -- "0..1" AuthorityProfile
    Driver "0..*" --> "1" Agency : affilié à
    User "1" --> "0..*" AccountSanction : suspensions

    User "1" --> "0..*" Report : auteur
    Report "1" *-- "1" GeoPoint
    Report "1" *-- "0..*" ReportValidation
    User "1" --> "0..*" ReportValidation : vote
    PendingReport ..> Report : devient après synchronisation
    ModerationItem "0..*" --> "0..1" Report : cible
    ModerationItem "0..*" --> "0..1" User : cible

    Quiz "1" *-- "1..*" Question
    Question "1" *-- "2..*" Choice
    User "1" --> "0..*" Attempt
    Attempt "0..*" --> "1" Question
    User "1" --> "0..*" PointEntry : historique daté
    LeaderboardEntry ..> PointEntry : agrégé depuis

    User "1" --> "0..*" Rating : passager
    Rating "0..*" --> "1" Driver : évalue

    User "1" --> "0..*" Notification : destinataire
    User "1" --> "0..*" Trip : M4
    Trip "0..*" --> "1" SafetyContact
```

<!-- /diagram -->

</details>

Les énumérations (rôles, statuts, catégories, gravités, motifs de points, types de notifications…) sont listées dans un [tableau dédié](docs/diagrams/04-domain-classes.md#énumérations).

### 5.5 Diagrammes de séquence

<details>
<summary><strong>5.5.1 Inscription et demande de profil Conducteur</strong></summary>

<!-- diagram:docs/diagrams/05-sequences.md#1 -->

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur (futur Conducteur)
    participant APP as App client (UI)
    participant MED as MediaService
    participant ACC as features/accounts
    participant DOM as domain (schémas Zod)
    participant AUTH as AuthRepository
    participant PR as ProfileRequestRepository

    U->>APP: Étape 1 : nom, prénom, téléphone, mot de passe, photo facultative, CGU
    APP->>DOM: RegisterInputSchema (validation locale)
    U->>APP: Étape 2 : profil « Conducteur d'agence » et agence affiliée
    APP->>DOM: ProfileRequestSubmissionSchema (validation locale)
    alt Données invalides
        DOM-->>APP: codes de validation par champ
        APP-->>U: messages d'erreur sous les champs
    else Données valides
        U->>APP: Étape 3 (facultative) : photos de la pièce d'identité et du permis
        APP->>MED: pickImage(document)
        MED-->>APP: image compressée
        APP->>ACC: register(compte, demande, justificatifs)
        ACC->>AUTH: register(identité, mot de passe)
        alt Numéro déjà utilisé
            AUTH-->>ACC: CONFLICT (PHONE_TAKEN)
            ACC-->>APP: retour à l'étape 1, erreur sur le téléphone
        else Compte créé
            AUTH-->>ACC: session + User(role=CITIZEN, status=ACTIVE)
            ACC->>PR: submit(requestedRole=DRIVER, agencyId)
            PR-->>ACC: ProfileRequest(status=PENDING)
            ACC->>PR: uploadDocument(ID_CARD), uploadDocument(DRIVING_LICENSE)
            PR-->>ACC: justificatifs enregistrés
            ACC-->>APP: profil avec « Demande en attente de validation »
            Note over U,APP: Droits Citoyen en attendant (ADR-0009). Les justificatifs manquants se complètent depuis le profil.
        end
    end
    Note over ACC,PR: La suite (décision de l'administrateur et notification) est détaillée en 5.7
```

<!-- /diagram -->

</details>

<details>
<summary><strong>5.5.2 Création d'un signalement en ligne</strong></summary>

<!-- diagram:docs/diagrams/05-sequences.md#2 -->

```mermaid
sequenceDiagram
    autonumber
    actor U as Citoyen
    participant APP as App client (UI)
    participant REP as features/reports
    participant LOC as LocationService
    participant MED as MediaService
    participant NET as NetworkService
    participant RR as ReportRepository
    participant NOT as NotificationRepository

    U->>APP: Appuie sur « Signaler »
    APP->>REP: startReport()
    REP->>RR: getActionQuota(userId)
    alt Quota périodique atteint (F2.6)
        RR-->>REP: quota dépassé
        REP-->>APP: message « Limite atteinte, réessayez plus tard »
    else Quota disponible
        REP->>LOC: getCurrentPosition()
        LOC-->>REP: GeoPoint (ou refus de permission)
        U->>APP: Catégorie, gravité, personnes concernées
        opt Photo
            U->>APP: Prend ou choisit une photo
            APP->>MED: pickImage()
            MED-->>APP: image compressée
        end
        APP->>REP: submit(draft)
        REP->>REP: ReportDraftSchema.parse(draft) et horodatage
        REP->>NET: isOnline()
        NET-->>REP: true
        REP->>RR: create(draft, clientId)
        RR->>RR: ActionLimitPolicy et SuspicionPolicy
        RR-->>REP: Report(status=CREATED ou SUSPICIOUS)
        RR->>NOT: push(NEARBY_DANGER) aux utilisateurs proches (simulé)
        REP-->>APP: confirmation, le signalement apparaît sur la carte
    end
    Note over REP,NET: Si le réseau est absent ou si l'envoi échoue, le flux 5.3 prend le relais
```

<!-- /diagram -->

</details>

<details>
<summary><strong>5.5.3 Signalement hors ligne puis synchronisation avec confirmation</strong></summary>

<!-- diagram:docs/diagrams/05-sequences.md#3 -->

```mermaid
sequenceDiagram
    autonumber
    actor U as Citoyen
    participant APP as App client (UI)
    participant REP as features/reports
    participant NET as NetworkService
    participant OFL as features/offline
    participant STO as StorageService
    participant SYNC as SyncService
    participant RR as ReportRepository

    U->>APP: Envoie un signalement
    APP->>REP: submit(draft)
    REP->>NET: isOnline()
    NET-->>REP: false
    REP->>OFL: enqueue(draft)
    OFL->>STO: set("pendingReports", file + nouveau PendingReport)
    OFL-->>APP: enregistré localement
    APP-->>U: Historique : signalement avec icône « hors ligne »

    Note over NET,SYNC: Plus tard, le réseau revient
    NET-->>SYNC: événement « en ligne »
    SYNC->>STO: get("pendingReports")
    STO-->>SYNC: N signalements en attente
    SYNC-->>APP: demande de confirmation
    APP-->>U: « N signalements en attente. Les envoyer maintenant ? »
    alt L'utilisateur confirme
        loop Pour chaque signalement en attente
            SYNC->>RR: create(draft, clientId=localId, origin=OFFLINE_SYNCED)
            alt Succès
                RR-->>SYNC: Report créé (ou déjà créé : clientId idempotent)
                SYNC->>STO: retirer de la file
            else Échec (réseau, quota, validation)
                RR-->>SYNC: erreur
                SYNC->>STO: syncState=FAILED, lastError
            end
        end
        SYNC-->>APP: bilan (envoyés / en échec)
        APP-->>U: Résumé et bouton « Réessayer » pour les échecs
    else L'utilisateur refuse
        SYNC-->>APP: file conservée
        APP-->>U: Bouton « Synchroniser » disponible dans l'historique
    end
```

<!-- /diagram -->

</details>

<details>
<summary><strong>5.5.4 Validation communautaire et passage en modération</strong></summary>

<!-- diagram:docs/diagrams/05-sequences.md#4 -->

```mermaid
sequenceDiagram
    autonumber
    actor V as Autre utilisateur
    participant APP as App client (UI)
    participant REP as features/reports
    participant RR as ReportRepository
    participant DOM as domain (règles)
    participant PTS as PointsRepository
    participant MOD as ModerationRepository
    participant NOT as NotificationRepository
    actor ADM as Administrateur

    V->>APP: Ouvre un signalement et choisit « Je confirme » ou « C'est faux »
    APP->>REP: vote(reportId, verdict)
    REP->>RR: vote(reportId, userId, verdict)
    RR->>DOM: contrôles (pas son propre signalement, un vote par signalement, quota)
    RR->>DOM: ConsensusPolicy.apply(report, votes)
    alt Seuil de confirmations atteint
        DOM-->>RR: VALIDATED
        RR->>PTS: add(author, REPORT_VALIDATED)
        RR->>NOT: push(author, « Votre signalement a été validé »)
    else Seuil d'infirmations atteint
        DOM-->>RR: INVALIDATED (masqué de la carte publique)
    else Pas encore de consensus
        DOM-->>RR: statut inchangé
    end
    RR->>DOM: SuspicionPolicy.evaluate(report, auteur)
    opt Fréquence anormale ou signalement validé fortement contesté
        DOM-->>RR: SUSPICIOUS
        RR->>MOD: create(ModerationItem REPORT, raison)
    end
    RR-->>REP: signalement mis à jour
    REP-->>APP: compteurs et statut actualisés

    Note over MOD,ADM: Back-office (apps/admin)
    ADM->>MOD: listOpen()
    MOD-->>ADM: file de modération
    alt Maintenir le signalement
        ADM->>MOD: resolve(item, KEEP) puis statut VALIDATED
    else Infirmer
        ADM->>MOD: resolve(item, INVALIDATE) puis statut INVALIDATED
    else Sanctionner l'auteur
        ADM->>MOD: resolve(item, SUSPEND_AUTHOR) et suspension temporaire
    end
```

<!-- /diagram -->

</details>

<details>
<summary><strong>5.5.5 Passage d'un quiz et attribution de points</strong></summary>

<!-- diagram:docs/diagrams/05-sequences.md#5 -->

```mermaid
sequenceDiagram
    autonumber
    actor U as Citoyen
    participant APP as App client (UI)
    participant QZ as features/quiz
    participant QR as QuizRepository
    participant DOM as domain (DailyQuizLimit, PointsPolicy)
    participant PTS as PointsRepository

    U->>APP: Ouvre « Quiz du jour »
    APP->>QZ: loadDailyQuiz()
    QZ->>QR: getDailyQuestions(userId, date)
    QR->>DOM: DailyQuizLimit.remaining(réponses du jour)
    alt Aucune question restante (5 déjà répondues)
        QR-->>QZ: []
        QZ-->>APP: « Revenez demain »
    else Questions restantes (maximum 5)
        QR-->>QZ: questions actives
        loop Pour chaque question
            U->>APP: Choisit une réponse
            APP->>QZ: answer(questionId, choiceId)
            QZ->>QR: answer(userId, questionId, choiceId)
            QR->>QR: enregistre l'Attempt (horodaté)
            opt Bonne réponse
                QR->>DOM: PointsPolicy.pointsFor(QUIZ_CORRECT_ANSWER)
                QR->>PTS: add(userId, QUIZ_CORRECT_ANSWER, sourceId=attemptId)
            end
            QR-->>QZ: correction (bonne réponse + explication pédagogique)
            QZ-->>APP: affiche la correction
        end
        QZ->>PTS: getScore(userId) et getLeaderboard(MONTHLY, ANNUAL)
        PTS-->>QZ: score, progression, rang
        QZ-->>APP: récapitulatif du jour
    end
```

<!-- /diagram -->

</details>

<details>
<summary><strong>5.5.6 Évaluation d'un conducteur avec contrôle anti-abus</strong></summary>

<!-- diagram:docs/diagrams/05-sequences.md#6 -->

```mermaid
sequenceDiagram
    autonumber
    actor P as Passager (Citoyen)
    participant APP as App client (UI)
    participant RAT as features/ratings
    participant RTR as RatingRepository
    participant DOM as domain (RatingAntiAbusePolicy, RatingAggregator)
    participant PTS as PointsRepository

    P->>APP: Recherche le conducteur (agence, nom ou code conducteur)
    APP->>RAT: selectDriver(driverId)
    P->>APP: Note les 4 critères (courtoisie, ponctualité, conduite prudente, propreté)
    APP->>RAT: submit(driverId, scores)
    RAT->>RAT: RatingSchema.parse(scores) (notes de 1 à 5)
    RAT->>RTR: submit(passengerId, driverId, scores)
    RTR->>DOM: RatingAntiAbusePolicy.canRate(passager, conducteur, période)
    alt Déjà évalué pendant la période, ou auto-évaluation
        DOM-->>RTR: refusé
        RTR-->>RAT: erreur ALREADY_RATED_FOR_PERIOD
        RAT-->>APP: « Vous avez déjà évalué ce conducteur. Prochaine évaluation possible le … »
    else Autorisé
        RTR->>RTR: enregistre le Rating (periodKey)
        RTR->>DOM: RatingAggregator.recompute(conducteur, agence)
        RTR->>PTS: add(passengerId, RATING_SUBMITTED)
        RTR-->>RAT: évaluation enregistrée
        RAT-->>APP: remerciement et nouvelle moyenne publique
    end
```

<!-- /diagram -->

</details>

<details>
<summary><strong>5.5.7 L'administrateur valide un profil Conducteur et l'utilisateur est notifié</strong></summary>

<!-- diagram:docs/diagrams/05-sequences.md#7 -->

```mermaid
sequenceDiagram
    autonumber
    actor ADM as Administrateur
    participant ADMIN as App admin (Next.js)
    participant AUTH as AuthRepository
    participant PR as ProfileRequestRepository
    participant USR as UserRepository
    participant NOT as NotificationRepository
    participant APP as App client (UI)
    actor U as Utilisateur

    ADM->>ADMIN: Se connecte (F9.1)
    ADMIN->>AUTH: login(identifiant, mot de passe)
    AUTH-->>ADMIN: session(role=ADMIN)
    ADM->>ADMIN: Ouvre « Profils en attente »
    ADMIN->>PR: listPending()
    PR-->>ADMIN: demandes (Conducteur, Autorité)
    ADM->>ADMIN: Ouvre une demande et consulte les justificatifs
    alt Validation
        ADMIN->>PR: approve(requestId, adminId)
        PR->>USR: role=DRIVER et création du Driver (agence affiliée)
        PR->>NOT: push(userId, PROFILE_DECISION, « Profil Conducteur validé »)
    else Refus (motif obligatoire)
        ADMIN->>PR: reject(requestId, adminId, motif)
        PR->>NOT: push(userId, PROFILE_DECISION, « Profil refusé : motif »)
        Note over PR,USR: L'utilisateur reste Citoyen et peut soumettre une nouvelle demande
    end
    PR-->>ADMIN: liste actualisée

    U->>APP: Ouvre l'application
    APP->>NOT: list(userId)
    NOT-->>APP: notification PROFILE_DECISION
    APP-->>U: Toast et centre de notifications. Les fonctions Conducteur sont débloquées en cas de validation
    Note over ADMIN,APP: Démo : les deux apps n'échangent pas de données (stockage local séparé). Cette séquence ne se déroulera de bout en bout qu'avec le backend (phase 12)
```

<!-- /diagram -->

</details>

### 5.6 Diagrammes d'états

<details>
<summary><strong>Compte et demande de profil</strong></summary>

<!-- diagram:docs/diagrams/06-states.md#1 -->

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Actif : inscription (droits Citoyen immédiats)

    state Actif {
        direction LR
        state "Demande en attente de validation" as DemandeEnAttente
        state "Profil validé" as ProfilValidé
        [*] --> Citoyen
        Citoyen --> DemandeEnAttente : demande Conducteur ou Autorité + justificatifs
        DemandeEnAttente --> ProfilValidé : validation par un administrateur
        DemandeEnAttente --> Citoyen : refus (motif notifié)
        ProfilValidé --> [*]
        DemandeEnAttente : droits Citoyen, fonctions spécifiques verrouillées
        ProfilValidé : Conducteur ou Autorité actif
    }

    state "Suspendu" as Suspendu
    Actif --> Suspendu : abus répétés (suspension temporaire automatique, F2.6)
    Actif --> Suspendu : décision de modération (F9.3)
    Suspendu --> Actif : fin de la suspension temporaire
    Suspendu --> Actif : réactivation par un administrateur (F9.3)
    Suspendu : connexion possible en lecture seule
    Suspendu : aucune action (signaler, voter, évaluer, quiz)
```

<!-- /diagram -->

</details>

<details>
<summary><strong>Signalement</strong></summary>

<!-- diagram:docs/diagrams/06-states.md#2 -->

```mermaid
stateDiagram-v2
    direction TB
    state "En attente de synchronisation" as EnAttenteDeSynchro
    state "Suspect" as Suspect
    state "Infirmé" as Infirmé
    state "Pris en charge" as PrisEnCharge
    [*] --> EnAttenteDeSynchro : créé hors ligne (F3.1)
    EnAttenteDeSynchro --> Créé : synchronisation confirmée (F3.2)
    [*] --> Créé : créé en ligne

    Créé --> Validé : confirmations ≥ seuil de validation (F2.4)
    Créé --> Infirmé : infirmations ≥ seuil d'infirmation (F2.4)
    Créé --> Suspect : fréquence anormale de l'auteur (F2.5)
    Validé --> Suspect : fortement contesté après validation (F2.5)

    Suspect --> Validé : maintenu par un administrateur (F9.3)
    Suspect --> Infirmé : infirmé par un administrateur (F9.3)

    Créé --> PrisEnCharge : marqué par une Autorité (F9.7)
    Validé --> PrisEnCharge : marqué par une Autorité (F9.7)
    PrisEnCharge --> Clos : danger résolu
    Validé --> Clos : expiration ou clôture par un administrateur
    Infirmé --> [*]
    Clos --> [*]

    EnAttenteDeSynchro : stockage local uniquement, icône « hors ligne »
    Suspect : masqué de la carte publique, dans la file de modération
    Infirmé : masqué de la carte publique
    PrisEnCharge : visible sur la carte avec ce statut
```

<!-- /diagram -->

</details>

### 5.7 Diagramme d'activité : « Signaler un danger »

<details>
<summary><strong>Flux en ligne et hors ligne</strong></summary>

<!-- diagram:docs/diagrams/07-activity-report.md#1 -->

```mermaid
flowchart TD
    START((Début)) --> A["Appuyer sur « Signaler »"]
    A --> B{"Compte suspendu<br/>ou quota atteint ? (F2.6)"}
    B -- Oui --> B1["Afficher la raison<br/>et la date de fin"] --> END1((Fin))
    B -- Non --> C["Récupérer la position GPS<br/>automatiquement"]
    C --> C1{"Position obtenue ?"}
    C1 -- Non --> C2["Expliquer la permission,<br/>proposer de choisir la ville<br/>ou de placer le point sur la carte (web)"]
    C2 --> D
    C1 -- Oui --> D["Choisir la catégorie (F2.1)"]
    D --> E["Choisir la gravité<br/>et les personnes concernées"]
    E --> F{"Ajouter une photo ?"}
    F -- Oui --> F1["Caméra ou galerie<br/>(sélecteur de fichier sur le web)<br/>puis compression"] --> G
    F -- Non --> G["Récapitulatif<br/>(date et heure automatiques)"]
    G --> H["Envoyer"]
    H --> I{"Réseau disponible ?"}

    I -- Oui --> J["Envoyer au ReportRepository"]
    J --> J1{"Envoi réussi ?"}
    J1 -- Oui --> K["Afficher la confirmation<br/>et le point sur la carte"]
    K --> K1["Alerter les utilisateurs proches<br/>(notification simulée, F7.1)"] --> END2((Fin))
    J1 -- "Non (erreur réseau)" --> L

    I -- Non --> L["Enregistrer dans la file locale<br/>(StorageService)"]
    L --> L1["Afficher dans l'historique<br/>avec l'icône « hors ligne » (F3.1)"]
    L1 --> M[/"Attendre le retour du réseau"/]
    M --> N["Demander confirmation :<br/>« N signalements en attente. Envoyer ? » (F3.2)"]
    N --> O{"Confirmé ?"}
    O -- Non --> O1["Conserver la file<br/>(bouton « Synchroniser » dans l'historique)"] --> M
    O -- Oui --> P["Envoyer chaque signalement<br/>(identifiant client idempotent)"]
    P --> Q{"Tous envoyés ?"}
    Q -- Oui --> R["Vider la file<br/>et afficher le bilan"] --> END3((Fin))
    Q -- Non --> S["Marquer les échecs<br/>et proposer « Réessayer »"] --> M
```

<!-- /diagram -->

</details>

### 5.8 Déploiement

<!-- diagram:docs/diagrams/09-deployment.md#1 -->

```mermaid
flowchart LR
    DEV["💻 Développeur"] -->|"push de la branche de phase"| GH["GitHub<br/>M-Riq/wakaSafe"]
    GH -->|"pull request"| CI["GitHub Actions<br/>lint, typecheck, tests, build des 2 apps"]
    GH -->|"intégration Git"| V1
    GH -->|"intégration Git"| V2

    subgraph VERCEL["Vercel — 2 projets, prévisualisation par PR"]
        V1["Projet « wakasafe-client »<br/>apps/mobile<br/>expo export --platform web (site statique)"]
        V2["Projet « wakasafe-admin »<br/>apps/admin<br/>build Next.js"]
    end

    subgraph BROWSER_C["Navigateur (mobile ou desktop)"]
        C_APP["App client web"]
        C_STO[("Stockage local du navigateur<br/>données mock")]
        C_APP --- C_STO
    end
    subgraph BROWSER_A["Navigateur desktop ou tablette"]
        A_APP["Back-office"]
        A_STO[("Stockage local du navigateur<br/>données mock")]
        A_APP --- A_STO
    end
    subgraph PHONE["Téléphone Android 8+ (phase 11)"]
        P_APP["APK de test<br/>(build de développement Expo)"]
        P_STO[("AsyncStorage<br/>données mock")]
        P_APP --- P_STO
    end

    V1 -->|"URL client"| C_APP
    V2 -->|"URL admin"| A_APP
    OSM["Tuiles OpenStreetMap"] --> C_APP
    OSM --> A_APP
    OSM --> P_APP

    C_STO -.-|"aucune synchronisation en démo"| A_STO
```

<!-- /diagram -->

<details>
<summary><strong>Cible finale (phase 12 et suivantes)</strong></summary>

<!-- diagram:docs/diagrams/09-deployment.md#2 -->

```mermaid
flowchart LR
    subgraph USERS["Utilisateurs"]
        AND["📱 App Android<br/>(Google Play)"]
        WEBC["🌐 App client web"]
        WEBA["🖥️ Back-office Next.js"]
        TRK["🌐 Page de suivi de trajet<br/>(M4, optionnel)"]
    end

    subgraph HOSTING["Hébergement front-end"]
        H1["Hébergement statique<br/>app client web"]
        H2["Hébergement Next.js<br/>back-office"]
    end

    subgraph VPS["Serveur cloud (VPS) — compte GOSAFE"]
        RP["Reverse proxy HTTPS"]
        API["API REST Node.js + TypeScript<br/>auth, rôles, règles métier, anti-abus"]
        JOBS["Tâches planifiées<br/>classements, expirations, rappels de quiz"]
        RP --> API
        JOBS --> DB
    end

    DB[("Base de données<br/>PostgreSQL + PostGIS ou MySQL<br/>sauvegardes automatiques")]
    S3[("Stockage objet S3<br/>photos, justificatifs (privé)")]
    FCM["Firebase Cloud Messaging"]
    CRASH["Firebase Crashlytics et Analytics"]
    TILES["Fournisseur de tuiles OSM"]

    WEBC --> H1
    WEBA --> H2
    AND -->|"HTTPS"| RP
    H1 -->|"HTTPS"| RP
    H2 -->|"HTTPS"| RP
    TRK -->|"HTTPS"| RP
    API --> DB
    API --> S3
    API --> FCM
    FCM -->|"push"| AND
    AND --> CRASH
    AND --> TILES
    WEBC --> TILES
    WEBA --> TILES
```

<!-- /diagram -->

</details>

## 6. Structure des dossiers

```text
wakasafe/
├── .github/            # CI, instructions Copilot, modèles d'issues et de PR
├── docs/
│   ├── adr/            # décisions d'architecture
│   ├── architecture/   # structure, règles métier, traçabilité, écarts
│   ├── diagrams/       # diagrammes Mermaid (source de vérité)
│   └── source/         # cahier des charges — local uniquement, ignoré par Git
├── apps/
│   ├── mobile/         # Expo : web + Android
│   │   ├── app/        # routes Expo Router (minces)
│   │   └── src/        # data (composition root), features, services, ui, lib
│   └── admin/          # Next.js : back-office (phase 8)
├── packages/
│   ├── domain/         # entités, schémas Zod, règles métier
│   ├── data-contracts/ # interfaces des dépôts
│   ├── mock-data/      # implémentations mock + jeux de démonstration
│   └── design-tokens/  # couleurs, typographie, espacements
├── scripts/            # contrôle CI : diagrammes du README
├── README.md  ROADMAP.md  CHANGELOG.md  CONTRIBUTING.md
└── .env.example        # variables publiques (aucun secret)
```

Arborescence détaillée et conventions : [docs/architecture/overview.md](docs/architecture/overview.md).

## 7. Modèle de données

Le modèle est **indépendant du SGBD** : MySQL ou Supabase/PostgreSQL, décision avant la phase 12. Il est simulé par `@wakasafe/mock-data` d'ici là.

<!-- diagram:docs/diagrams/08-data-model.md#1 -->

```mermaid
erDiagram
    USER ||--|| PREFERENCES : "possède"
    USER ||--o{ SAFETY_CONTACT : "déclare"
    USER ||--o{ PROFILE_REQUEST : "soumet"
    PROFILE_REQUEST ||--|{ SUPPORTING_DOCUMENT : "contient"
    PROFILE_REQUEST }o--o| AGENCY : "mentionne"
    USER ||--o| DRIVER : "est"
    USER ||--o| AUTHORITY_PROFILE : "est"
    AGENCY ||--o{ DRIVER : "emploie"
    USER ||--o{ ACCOUNT_SANCTION : "reçoit"
    USER ||--o{ REPORT : "crée"
    REPORT ||--o{ REPORT_VALIDATION : "reçoit"
    USER ||--o{ REPORT_VALIDATION : "vote"
    REPORT ||--o{ MODERATION_ITEM : "fait l'objet de"
    USER ||--o{ MODERATION_ITEM : "fait l'objet de"
    QUIZ ||--|{ QUESTION : "regroupe"
    QUESTION ||--|{ QUESTION_CHOICE : "propose"
    USER ||--o{ QUIZ_ATTEMPT : "répond"
    QUESTION ||--o{ QUIZ_ATTEMPT : "concerne"
    USER ||--o{ POINT_ENTRY : "gagne"
    USER ||--o{ RATING : "évalue (passager)"
    DRIVER ||--o{ RATING : "est évalué"
    USER ||--o{ NOTIFICATION : "reçoit"
    USER ||--o{ TRIP : "partage (M4, optionnel)"
    SAFETY_CONTACT ||--o{ TRIP : "suit (M4, optionnel)"
```

<!-- /diagram -->

<details>
<summary><strong>MLD : tables, clés et attributs</strong></summary>

<!-- diagram:docs/diagrams/08-data-model.md#2 -->

```mermaid
erDiagram
    USERS {
        uuid id PK
        string first_name
        string last_name
        string phone UK "format E.164 (+237...)"
        string password_hash "géré par le service d'authentification"
        string photo_url "nullable"
        enum role "CITIZEN, DRIVER, AUTHORITY, ADMIN"
        enum status "ACTIVE, SUSPENDED"
        datetime suspended_until "nullable"
        datetime created_at
        datetime updated_at
    }
    USER_PREFERENCES {
        uuid user_id PK, FK
        boolean nearby_danger_alerts
        int nearby_radius_km
        boolean quiz_reminders
        string language
    }
    SAFETY_CONTACTS {
        uuid id PK
        uuid user_id FK
        string name
        string phone
        string relation "nullable"
    }
    AGENCIES {
        uuid id PK
        string name
        string city
    }
    PROFILE_REQUESTS {
        uuid id PK
        uuid user_id FK
        enum requested_role "DRIVER, AUTHORITY"
        enum status "PENDING, APPROVED, REJECTED"
        uuid agency_id FK "nullable, Conducteur"
        string organization "nullable, Autorité"
        string position "nullable, Autorité"
        datetime submitted_at
        datetime reviewed_at "nullable"
        uuid reviewed_by FK "nullable, USERS"
        text rejection_reason "nullable"
    }
    SUPPORTING_DOCUMENTS {
        uuid id PK
        uuid profile_request_id FK
        enum type "ID_CARD, DRIVING_LICENSE, FUNCTION_PROOF"
        string file_key "clé dans le stockage objet privé"
        datetime uploaded_at
    }
    DRIVERS {
        uuid user_id PK, FK
        uuid agency_id FK
        datetime validated_at
    }
    AUTHORITY_PROFILES {
        uuid user_id PK, FK
        string organization
        string position
        datetime validated_at
    }
    ACCOUNT_SANCTIONS {
        uuid id PK
        uuid user_id FK
        string reason
        datetime starts_at
        datetime ends_at "nullable = jusqu'à réactivation"
        uuid created_by FK "nullable = automatique"
    }
    REPORTS {
        uuid id PK
        uuid author_id FK
        string client_id UK "idempotence de la synchro hors ligne"
        enum category
        enum severity
        enum affected_group
        decimal latitude "voir note géolocalisation"
        decimal longitude
        decimal accuracy_m "nullable"
        string city
        string photo_key "nullable"
        enum status
        enum origin "ONLINE, OFFLINE_SYNCED"
        int confirmations "dénormalisé"
        int refutations "dénormalisé"
        datetime occurred_at
        datetime created_at
        datetime validated_at "nullable, seuil de validation atteint"
        uuid handled_by FK "nullable, Autorité"
        datetime handled_at "nullable"
        datetime closed_at "nullable"
    }
    REPORT_VALIDATIONS {
        uuid id PK
        uuid report_id FK
        uuid user_id FK
        enum verdict "CONFIRM, REFUTE"
        datetime created_at
    }
    MODERATION_ITEMS {
        uuid id PK
        enum target_type "REPORT, ACCOUNT"
        uuid report_id FK "nullable"
        uuid user_id FK "nullable"
        enum reason
        enum status "OPEN, RESOLVED"
        string decision "nullable"
        uuid resolved_by FK "nullable"
        datetime created_at
        datetime resolved_at "nullable"
    }
    QUIZZES {
        uuid id PK
        string title
        enum theme
        boolean is_active
        boolean is_placeholder_content
        datetime created_at
    }
    QUESTIONS {
        uuid id PK
        uuid quiz_id FK
        text statement
        uuid correct_choice_id FK
        text explanation
        int position
    }
    QUESTION_CHOICES {
        uuid id PK
        uuid question_id FK
        string label
        int position
    }
    QUIZ_ATTEMPTS {
        uuid id PK
        uuid user_id FK
        uuid question_id FK
        uuid choice_id FK
        boolean is_correct
        string local_day "AAAA-MM-JJ, fuseau Africa/Douala"
        datetime answered_at
    }
    POINT_ENTRIES {
        uuid id PK
        uuid user_id FK
        enum reason
        int points
        string source_type
        uuid source_id
        datetime created_at
    }
    RATINGS {
        uuid id PK
        uuid passenger_id FK
        uuid driver_id FK
        uuid agency_id FK "agence au moment de l'évaluation"
        int courtesy "1 à 5"
        int punctuality "1 à 5"
        int safe_driving "1 à 5"
        int vehicle_cleanliness "1 à 5"
        string period_key "UK avec passenger_id et driver_id"
        datetime created_at
    }
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        enum type
        string title
        text body
        json data "nullable"
        datetime created_at
        datetime read_at "nullable"
    }
    TRIPS {
        uuid id PK
        uuid user_id FK
        uuid safety_contact_id FK
        enum status
        string share_token UK
        datetime started_at
        datetime expires_at
    }

    USERS ||--|| USER_PREFERENCES : ""
    USERS ||--o{ SAFETY_CONTACTS : ""
    USERS ||--o{ PROFILE_REQUESTS : ""
    PROFILE_REQUESTS ||--|{ SUPPORTING_DOCUMENTS : ""
    AGENCIES ||--o{ PROFILE_REQUESTS : ""
    USERS ||--o| DRIVERS : ""
    AGENCIES ||--o{ DRIVERS : ""
    USERS ||--o| AUTHORITY_PROFILES : ""
    USERS ||--o{ ACCOUNT_SANCTIONS : ""
    USERS ||--o{ REPORTS : ""
    REPORTS ||--o{ REPORT_VALIDATIONS : ""
    USERS ||--o{ REPORT_VALIDATIONS : ""
    REPORTS ||--o{ MODERATION_ITEMS : ""
    USERS ||--o{ MODERATION_ITEMS : ""
    QUIZZES ||--|{ QUESTIONS : ""
    QUESTIONS ||--|{ QUESTION_CHOICES : ""
    USERS ||--o{ QUIZ_ATTEMPTS : ""
    QUESTIONS ||--o{ QUIZ_ATTEMPTS : ""
    USERS ||--o{ POINT_ENTRIES : ""
    USERS ||--o{ RATINGS : ""
    DRIVERS ||--o{ RATINGS : ""
    AGENCIES ||--o{ RATINGS : ""
    USERS ||--o{ NOTIFICATIONS : ""
    USERS ||--o{ TRIPS : ""
    SAFETY_CONTACTS ||--o{ TRIPS : ""
```

<!-- /diagram -->

</details>

Contraintes d'intégrité et points à adapter selon le SGBD (géolocalisation PostGIS ou MySQL spatial, UUID, énumérations, authentification, RLS) : [docs/diagrams/08-data-model.md](docs/diagrams/08-data-model.md#84-points-à-adapter-selon-le-sgbd-retenu).

## 8. Roadmap

| Phase | Contenu                                                                        | Statut         |
| ----- | ------------------------------------------------------------------------------ | -------------- |
| 0     | Cadrage, architecture, documentation                                           | ✅ Terminée    |
| 1     | Fondations : monorepo, packages partagés, app client (Expo), design system, CI | ✅ Terminée    |
| 2     | M1 Comptes et profils                                                          | ✅ Terminée    |
| 3     | M2 Signalements et carte                                                       | 🔵 En revue    |
| 4     | M3 Mode hors ligne                                                             | ⬜             |
| 5     | M5 Quiz, points, classements                                                   | ⬜             |
| 6     | M6 Évaluation des conducteurs                                                  | ⬜             |
| 7     | M7 Notifications                                                               | ⬜             |
| 8     | Back-office : fondations, validation des profils, modération                   | ⬜             |
| 9     | Back-office : quiz, KPI et heatmap, export CSV, vue Autorité                   | ⬜             |
| 10    | M4 Partage de trajet + M8 Mode conduite                                        | ⏸️ Optionnelle |
| 11    | Build Android (APK de test)                                                    | ⬜             |
| 12    | Backend et base de données réels                                               | ⬜             |
| 13    | Sécurité, qualité, préparation de la publication                               | ⬜             |

Détail, branches et définition de terminé : [ROADMAP.md](ROADMAP.md). Rattachement des exigences : [matrice de traçabilité](docs/architecture/traceability.md).

## 9. Workflow Git

- `main` est stable : **jamais de push direct**, ni de force-push.
- **Une branche par phase** (`phase/NN-nom-court`), créée depuis `main` à jour.
- Commits **Conventional Commits** en anglais (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`).
- **Une PR par phase** vers `main`, avec le [modèle de PR](.github/PULL_REQUEST_TEMPLATE.md). Le responsable du projet relit et **merge lui-même**.
- La phase suivante démarre seulement après le merge.

Détails : [CONTRIBUTING.md](CONTRIBUTING.md).

## 10. Application client (`apps/mobile`)

> Disponible : accueil, connexion, inscription (Citoyen, Conducteur ou Autorité), mot de passe oublié, profil (modification, photo, préférences, contacts de sécurité, demande de profil, justificatifs), carte publique des signalements et filtres, formulaire « Signaler », « Mes signalements », détail d'un signalement avec « Je confirme » / « C'est faux », onglets et espace Conducteur. Les autres écrans métier arrivent phase par phase ([ROADMAP.md](ROADMAP.md)). L'app n'affiche aucune information sur les phases ni sur l'avancement du projet : une fonctionnalité pas encore livrée est seulement indiquée « Bientôt disponible ».

**Prérequis** : Node.js 24 LTS (fixé dans `.nvmrc` ; Node 26 fonctionne aussi), npm 10 ou plus. Pour Android : un téléphone Android 8+ avec Expo Go, ou un émulateur (Android Studio).

```bash
npm ci                       # à la racine du dépôt (npm workspaces, versions du lockfile)
npm run dev:mobile           # serveur de développement, ouvre l'app dans le navigateur
npm run start:mobile         # serveur de développement + QR code à scanner avec Expo Go
npm run android              # serveur de développement + ouverture sur Android (téléphone USB ou émulateur)
npm run build:mobile         # export web statique dans apps/mobile/dist
npm run export:android -w @wakasafe/mobile   # vérifie que le bundle Android se construit
```

**Tester sur un téléphone Android physique (Expo Go)**. Il n'est pas nécessaire d'installer Android Studio : l'app tourne dans **Expo Go**, qui doit être compatible avec le **SDK 58** (version du Play Store ou [expo.dev/go](https://expo.dev/go)).

1. Mettre le PC et le téléphone sur le **même réseau Wi-Fi**. Le partage de connexion du téléphone convient aussi.
2. Lancer `npm run start:mobile`, puis scanner le QR code affiché dans le terminal depuis Expo Go. Le premier chargement prend une à deux minutes. Ensuite, chaque modification enregistrée se recharge sur le téléphone.
3. Si le téléphone ne trouve pas le PC, il y a deux solutions :
   - **Câble USB** : activer le débogage USB sur le téléphone et installer les [Android platform-tools](https://developer.android.com/tools/releases/platform-tools) (`adb`). Lancer `adb reverse tcp:8081 tcp:8081`, puis saisir `exp://127.0.0.1:8081` dans Expo Go.
   - **Tunnel** : lancer `npx expo start --tunnel` dans `apps/mobile`.

Sous Windows, autoriser Node.js dans le pare-feu (réseau **privé**) quand Windows le demande au premier lancement.

Variables d'environnement (facultatives) : copier [`.env.example`](.env.example) dans `apps/mobile/.env.local`. Détail : [docs/architecture/overview.md](docs/architecture/overview.md#variables-denvironnement).

**URL de démonstration** : **<https://wakasafe-client.vercel.app>** (version de `main`, active dès la fusion de la phase 1). Chaque PR reçoit en plus sa propre URL de prévisualisation (voir [section 13](#13-déploiement-de-la-démo)).

**Comptes de démonstration** (fictifs, données mock). On s'y connecte avec l'écran **« Se connecter »** (téléphone et mot de passe), ou en un geste depuis le lien **« Essayer un profil de démonstration »** de l'accueil. On peut aussi créer son propre compte : il reste sur l'appareil.

| Profil                | Téléphone         | Mot de passe    | Particularité                                                             |
| --------------------- | ----------------- | --------------- | ------------------------------------------------------------------------- |
| Citoyenne             | +237 600 00 00 01 | `demo-wakasafe` | Nadège Atangana, Yaoundé : historique de signalements et de points        |
| Conducteur validé     | +237 600 00 00 02 | `demo-wakasafe` | Paul Ekwalla, agence fictive (Douala) : accès à l'espace Conducteur       |
| Conducteur en attente | +237 600 00 00 03 | `demo-wakasafe` | Samuel Fotso, Bafoussam : demande en attente, droits Citoyen              |
| Autorité              | +237 600 00 00 04 | `demo-wakasafe` | Brigitte Ngo Mbock : droits Citoyen dans l'app, vue Autorité dans l'admin |
| Compte suspendu       | +237 600 00 01 05 | `demo-wakasafe` | Hervé Nkoulou : suspension temporaire, lecture seule                      |

Les numéros, noms et agences de démonstration sont **fictifs**. Aucune agence réelle n'est évaluée avec des données inventées. Le mot de passe de démonstration est public et ne protège aucune donnée réelle.

**Particularités de la démo pour les comptes** :

- Mot de passe oublié : aucun SMS n'est envoyé, le code à 6 chiffres s'affiche à l'écran. Il est valable 10 minutes, avec 5 essais au plus.
- Les photos (profil et justificatifs) sont compressées puis enregistrées sur l'appareil, avec les autres données de démo.
- Les conditions d'utilisation affichées sont un texte provisoire, en attendant le texte de GOSAFE.
- Une demande Conducteur ou Autorité reste « en attente » dans l'app : sa validation se fait dans le back-office (phase 8), qui ne partage pas ses données avec l'app en démo (voir [section 13](#13-déploiement-de-la-démo)).

**Particularités de la démo pour les signalements** :

- La carte interactive (Leaflet, tuiles OpenStreetMap) s'affiche sur le web. Sur Android (Expo Go), la carte affiche « Bientôt disponible » et l'écran montre la liste des signalements : la carte native arrive avec le build Android (phase 11).
- Le navigateur ou le téléphone demande l'autorisation de localisation. En cas de refus, on choisit la ville (Yaoundé, Douala ou Bafoussam) ou, sur le web, on place le point sur la carte.
- La zone d'un signalement est la ville pilote la plus proche. Seuls les signalements actifs (en attente, validés, pris en charge) apparaissent sur la carte publique.
- Pour voir un signalement passer « Validé », se connecter avec la Citoyenne et confirmer le signalement « Éclairage public défectueux » de Bonapriso (Douala), qui a déjà 2 confirmations (seuil : 3). Son auteur gagne 10 points.
- Les alertes aux usagers proches et la notification de l'auteur arrivent avec le centre de notifications (phase 7) ; la file de modération des suspects, avec le back-office (phase 8).

## 11. Back-office (`apps/admin`)

> ⏳ Disponible à partir de la **phase 8**. Commandes prévues :

```bash
npm install                  # à la racine du dépôt
npm run dev:admin            # lance le back-office (Next.js) en local
npm run build:admin          # build de production Next.js
```

**URL de démonstration** : _à venir (projet Vercel « wakasafe-admin », phase 8)_.

**Comptes de démonstration** (fictifs, disponibles à partir de la phase 8) :

| Profil         | Téléphone         | Mot de passe    | Accès                          |
| -------------- | ----------------- | --------------- | ------------------------------ |
| Administrateur | +237 600 00 00 00 | `demo-wakasafe` | Tout le back-office            |
| Autorité       | +237 600 00 00 04 | `demo-wakasafe` | Vue Autorité uniquement (F9.7) |

> ⚠️ En démo, l'authentification du back-office est **simulée** : elle ne protège aucune donnée réelle. La connexion sécurisée réelle arrive avec le backend (phase 12).

## 12. Tests et qualité

Commandes à lancer à la racine ; elles couvrent tous les workspaces :

```bash
npm run lint             # ESLint (0 avertissement toléré) + Prettier --check
npm run format           # applique Prettier
npm run typecheck        # tsc --noEmit dans chaque workspace (TypeScript strict)
npm test                 # Jest dans chaque workspace (Testing Library pour les écrans)
npm run build            # builds de tous les workspaces (aujourd'hui : export web du client)
npm run check:diagrams   # les diagrammes du README sont identiques à docs/diagrams/
npm run sync:diagrams    # recopie les diagrammes de docs/diagrams/ dans le README
```

La **CI GitHub Actions** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) s'exécute sur chaque PR et sur `main` :

- **Qualité** : installation propre (`npm ci`), lint, typecheck, tests, export web du client et export du bundle Android ;
- **Documentation** : `check:diagrams`, puis rendu de chaque diagramme Mermaid avec `mermaid-cli` (un diagramme invalide fait échouer la CI).

Le build Next.js du back-office rejoindra la CI en phase 8.

Priorités de test : règles métier de `packages/domain` (seuils, quotas, anti-abus, 5 questions par jour, classements), implémentations mock, parcours principaux des écrans (gardes de routes par rôle, session).

## 13. Déploiement de la démo

Deux projets **Vercel** distincts, reliés à ce dépôt, chacun avec une **URL de prévisualisation par PR** ([ADR-0008](docs/adr/0008-demo-hosting-vercel.md)) :

| Projet            | Dossier racine | Installation         | Build                                          | Sortie                  |
| ----------------- | -------------- | -------------------- | ---------------------------------------------- | ----------------------- |
| `wakasafe-client` | `apps/mobile`  | `cd ../.. && npm ci` | `npm run build` (`expo export --platform web`) | `dist/` (site statique) |
| `wakasafe-admin`  | `apps/admin`   | à définir en phase 8 | `next build`                                   | préréglage Next.js      |

La configuration du client est versionnée dans [`apps/mobile/vercel.json`](apps/mobile/vercel.json) : installation depuis la racine du monorepo, réécriture de toutes les URL vers `index.html` (liens directs et rafraîchissement), cache long des fichiers statiques.

**Projet `wakasafe-client`** (connecté le 2026-11-24) : URL de production **<https://wakasafe-client.vercel.app>**, qui suit `main`. Réglages indispensables dans Vercel (Settings → Build and Deployment) :

- **Root Directory** : `apps/mobile`. Sans ce réglage, Vercel ignore `apps/mobile/vercel.json` et le build échoue (« No Output Directory named "public" found »).
- **Include files outside the root directory** : activé (accès à `packages/`).
- **Framework Preset** : « Other » ; commandes laissées vides (lues dans `vercel.json`).
- **Node.js Version** : 24.x, comme la CI et `.nvmrc`.

Les URL de prévisualisation des PR sont protégées par Vercel Authentication : seuls les membres du compte Vercel les ouvrent. Le client utilise l'URL de production.

Le responsable du projet crée les comptes et connecte le dépôt. Aucun secret n'est versionné.

### ⚠️ Limite connue du mode démo

Les deux apps sont servies sur **deux URL différentes**, et chacune stocke ses données mock **localement** (navigateur ou téléphone). Elles démarrent avec **les mêmes jeux de données**, mais une action faite dans le back-office (par exemple valider un profil Conducteur) **ne se répercute pas en direct** dans l'app client, et inversement. La synchronisation réelle arrivera avec le backend (phase 12).

## 14. Décisions d'architecture (ADR)

| N°                                                              | Décision                                                   | Statut  |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ------- |
| [0001](docs/adr/0001-two-web-applications.md)                   | Deux applications web : client Expo et back-office Next.js | Accepté |
| [0002](docs/adr/0002-monorepo-npm-workspaces.md)                | Monorepo avec npm workspaces                               | Accepté |
| [0003](docs/adr/0003-client-app-stack.md)                       | Stack de l'application client                              | Accepté |
| [0004](docs/adr/0004-admin-app-stack.md)                        | Stack du back-office                                       | Accepté |
| [0005](docs/adr/0005-data-access-abstraction.md)                | Abstraction des données et mocks                           | Accepté |
| [0006](docs/adr/0006-maps-openstreetmap.md)                     | Cartographie OSM et composant `AppMap`                     | Accepté |
| [0007](docs/adr/0007-notifications-in-app-first.md)             | Notifications in-app d'abord, FCM plus tard                | Accepté |
| [0008](docs/adr/0008-demo-hosting-vercel.md)                    | Hébergement de la démo sur Vercel                          | Accepté |
| [0009](docs/adr/0009-profile-requests-and-authority-access.md)  | Demandes de profil et accès Autorité au back-office        | Accepté |
| [0010](docs/adr/0010-confidential-source-documents.md)          | Documents sources confidentiels hors du dépôt              | Accepté |
| [0011](docs/adr/0011-provisional-theme-and-brand-guidelines.md) | Thème provisoire et passage à la charte GOSAFE             | Accepté |

## 15. Hypothèses et points ouverts

**Hypothèses retenues** (modifiables) :

- Les paramètres métier (seuils de validation, quotas, barème de points, période anti-abus, rayon d'alerte…) sont **provisoires et configurables** : [business-rules.md](docs/architecture/business-rules.md).
- Les questions de quiz de démonstration sont marquées **« Contenu provisoire, à remplacer par le contenu GOSAFE »**.
- Le thème graphique est **neutre et provisoire**, modifiable à un seul endroit (`packages/design-tokens`), en attendant la charte GOSAFE. La procédure de changement de charte est décrite dans l'[ADR-0011](docs/adr/0011-provisional-theme-and-brand-guidelines.md).
- Nom affiché : **WakaSafe**.

**Points ouverts** :

| Point                                                                                                           | Échéance          |
| --------------------------------------------------------------------------------------------------------------- | ----------------- |
| Choix de la base de données : MySQL ou Supabase/PostgreSQL (le cahier des charges propose PostgreSQL + PostGIS) | Avant la phase 12 |
| Activation de M4 (partage de trajet) et M8 (mode conduite)                                                      | Avant la phase 10 |
| Validation des paramètres métier et des listes (gravité, personnes concernées) par GOSAFE                       | Phases 3 à 6      |
| Contenus GOSAFE : questions de quiz, charte graphique, logo, CGU, politique de confidentialité                  | Au plus tôt       |
| Fournisseur de tuiles cartographiques pour la production                                                        | Avant la phase 13 |
| Comptes d'hébergement, Firebase et Google Play au nom de GOSAFE                                                 | Avant la phase 12 |
| Périmètre contractuel de la phase 13 (sécurité, mise en production)                                             | Avant la phase 13 |

## 16. Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md) : langues, workflow Git, Conventional Commits, définition de terminé, règles d'architecture, confidentialité.

## 17. Propriété et licence

Le code source, la documentation et les données de WakaSafe appartiennent à l'**Association GOSAFE** à la fin du paiement du projet. Tous droits réservés : aucune licence open source n'est accordée à ce jour, même si le dépôt est consultable publiquement.
