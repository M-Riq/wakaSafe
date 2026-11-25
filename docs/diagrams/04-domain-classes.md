# 4. Diagramme de classes du domaine

> Source de vérité de ce diagramme. Toute modification doit être reportée dans le [README](../../README.md).
> Implémenté dans [`packages/domain`](../../packages/domain/src) (types TypeScript + schémas Zod) depuis la phase 1.
> Les valeurs des énumérations marquées _provisoire_ doivent être validées par GOSAFE ([règles métier](../architecture/business-rules.md)).

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

## Énumérations

Présentées sous forme de tableau : un diagramme de 19 énumérations sans relations est illisible avec Mermaid (une seule colonne ou une seule ligne).

| Énumération            | Valeurs                                                                                                                                                                                                             | Module | Remarque                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------ |
| `Role`                 | `CITIZEN`, `DRIVER`, `AUTHORITY`, `ADMIN`                                                                                                                                                                           | M1     |                                            |
| `AccountStatus`        | `ACTIVE`, `SUSPENDED`                                                                                                                                                                                               | M1     |                                            |
| `ProfileRequestStatus` | `PENDING`, `APPROVED`, `REJECTED`                                                                                                                                                                                   | M1     |                                            |
| `DocumentType`         | `ID_CARD`, `DRIVING_LICENSE`, `FUNCTION_PROOF`                                                                                                                                                                      | M1     |                                            |
| `ReportCategory`       | `ACCIDENT_CRITICAL`, `OBSTACLE`, `DAMAGED_BRIDGE`, `DANGEROUS_POTHOLE`, `SLIPPERY_OR_FLOODED_ROAD`, `LANDSLIDE`, `FAULTY_STREET_LIGHTING`, `TRAFFIC_LIGHT_FAILURE`, `POORLY_MARKED_ROADWORKS`, `PERSON_IN_DISTRESS` | M2     | les 10 catégories F2.1                     |
| `Severity`             | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`                                                                                                                                                                                 | M2     | provisoire                                 |
| `AffectedGroup`        | `PEDESTRIANS`, `MOTORCYCLISTS`, `CAR_DRIVERS`, `PUBLIC_TRANSPORT`, `CHILDREN_STUDENTS`, `ALL_ROAD_USERS`                                                                                                            | M2     | provisoire                                 |
| `ReportStatus`         | `CREATED`, `VALIDATED`, `INVALIDATED`, `SUSPICIOUS`, `HANDLED`, `CLOSED`                                                                                                                                            | M2     | voir diagramme 6.2                         |
| `ReportOrigin`         | `ONLINE`, `OFFLINE_SYNCED`                                                                                                                                                                                          | M2, M3 |                                            |
| `Verdict`              | `CONFIRM`, `REFUTE`                                                                                                                                                                                                 | M2     |                                            |
| `SyncState`            | `PENDING_CONFIRMATION`, `SYNCING`, `FAILED`                                                                                                                                                                         | M3     |                                            |
| `QuizTheme`            | `TRAFFIC_CODE`, `GOOD_REFLEXES`, `FIRST_AID`, `SPECIFIC_DANGERS`                                                                                                                                                    | M5     |                                            |
| `PointReason`          | `REPORT_VALIDATED`, `QUIZ_CORRECT_ANSWER`, `RATING_SUBMITTED`                                                                                                                                                       | M5     |                                            |
| `PointSourceType`      | `REPORT`, `QUIZ_ATTEMPT`, `RATING`                                                                                                                                                                                  | M5     | déduit de `PointReason` (traçabilité F5.3) |
| `LeaderboardPeriod`    | `MONTHLY`, `ANNUAL`                                                                                                                                                                                                 | M5     |                                            |
| `NotificationType`     | `NEARBY_DANGER`, `QUIZ_REMINDER`, `PROFILE_DECISION`, `AUTHORITY_INFO`, `ACCOUNT_SANCTION`, `TRIP_ALERT`                                                                                                            | M7     | `TRIP_ALERT` : M4                          |
| `ModerationTarget`     | `REPORT`, `ACCOUNT`                                                                                                                                                                                                 | M9     |                                            |
| `ModerationReason`     | `ABNORMAL_FREQUENCY`, `MANY_REFUTATIONS`, `ACTION_LIMIT_ABUSE`                                                                                                                                                      | M9     |                                            |
| `ModerationStatus`     | `OPEN`, `RESOLVED`                                                                                                                                                                                                  | M9     |                                            |
| `TripStatus`           | `ACTIVE`, `ALERT`, `ENDED`, `EXPIRED`                                                                                                                                                                               | M4     | optionnel                                  |

## Règles métier pures (dans `packages/domain`)

| Règle                   | Exigence | Description                                                                                          |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `ConsensusPolicy`       | F2.4     | Fait passer un signalement de `CREATED` à `VALIDATED` ou `INVALIDATED` selon des seuils de votes.    |
| `SuspicionPolicy`       | F2.5     | Détecte une fréquence anormale ou un signalement fortement contesté, et produit un `ModerationItem`. |
| `ActionLimitPolicy`     | F2.6     | Quotas périodiques par utilisateur ; une suspension temporaire est créée après des abus répétés.     |
| `DailyQuizLimit`        | F5.2     | 5 questions maximum par jour et par utilisateur (jour calendaire, fuseau Africa/Douala).             |
| `PointsPolicy`          | F5.3     | Barème des points par `PointReason`.                                                                 |
| `LeaderboardCalculator` | F5.4     | Classement mensuel (remis à zéro chaque mois) et annuel.                                             |
| `RatingAntiAbusePolicy` | F6.3     | Une évaluation par (passager, conducteur, période).                                                  |
| `RatingAggregator`      | F6.2     | Moyennes par critère, par conducteur et par agence.                                                  |

Les paramètres numériques (seuils, quotas, barème, durée de période) sont **provisoires et configurables**. Voir [`business-rules.md`](../architecture/business-rules.md).
