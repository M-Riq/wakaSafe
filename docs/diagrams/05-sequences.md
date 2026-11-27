# 5. Diagrammes de séquence

> Source de vérité de ces diagrammes. Toute modification doit être reportée dans le [README](../../README.md).

Convention : l'UI appelle une **feature**, qui appelle une **interface** de `@wakasafe/data-contracts`. Les règles métier de `@wakasafe/domain` sont appliquées **par l'implémentation du dépôt** : le mock aujourd'hui, l'API demain. Le client les exécute aussi pour donner un retour immédiat à l'utilisateur, mais c'est l'implémentation du dépôt qui fait foi.

## 5.1 Inscription et demande de profil Conducteur (F1.1, F1.3, F1.4)

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

## 5.2 Création d'un signalement en ligne (F2.1, F2.2, F2.6, F7.1)

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

## 5.3 Signalement hors ligne puis synchronisation avec confirmation (F3.1, F3.2)

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

## 5.4 Validation communautaire et passage en modération (F2.4, F2.5, F5.3, F9.3)

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

## 5.5 Passage d'un quiz et attribution de points (F5.1, F5.2, F5.3, F5.5)

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

## 5.6 Évaluation d'un conducteur avec contrôle anti-abus (F6.1, F6.2, F6.3)

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

## 5.7 L'administrateur valide un profil Conducteur et l'utilisateur est notifié (F9.1, F9.2, F1.3)

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
