# Matrice de traçabilité des exigences

Chaque exigence du cahier des charges (référence DEV-WS-MVP-2026-001) est rattachée à une application, une phase et une interface de données. Le statut est mis à jour à la fin de chaque phase.

Légende des statuts : ⬜ à faire · 🟡 en cours · ✅ fait · ⏸️ optionnel, à arbitrer.

| Réf.      | Exigence (résumé)                                                                      | App                            | Phase  | Contrat de données                                   | Statut |
| --------- | -------------------------------------------------------------------------------------- | ------------------------------ | ------ | ---------------------------------------------------- | ------ |
| F1.1      | Inscription (nom, prénom, téléphone, mot de passe, photo facultative, profil souhaité) | client                         | 2      | `AuthRepository`, `ProfileRequestRepository`         | ⬜     |
| F1.2      | Connexion téléphone + mot de passe, réinitialisation                                   | client                         | 2      | `AuthRepository`                                     | ⬜     |
| F1.3      | Citoyen actif immédiatement, Conducteur/Autorité en attente + notification             | client                         | 2 (+7) | `ProfileRequestRepository`, `NotificationRepository` | 🟡     |
| F1.4      | Téléversement des justificatifs                                                        | client                         | 2      | `ProfileRequestRepository`                           | ⬜     |
| F1.5      | Profil, préférences, contacts de sécurité                                              | client                         | 2      | `UserRepository`                                     | ⬜     |
| F2.1      | 10 catégories de signalement                                                           | client                         | 3      | `domain` (`ReportCategory`)                          | ⬜     |
| F2.2      | Contenu d'un signalement (GPS auto, photo optionnelle…)                                | client                         | 3      | `ReportRepository`                                   | ⬜     |
| F2.3      | Carte publique, filtres type/gravité/zone                                              | client                         | 3      | `ReportRepository.list`                              | ⬜     |
| F2.4      | Validation / infirmation communautaire                                                 | client                         | 3      | `ReportRepository.vote`                              | ⬜     |
| F2.5      | Suspects → file de modération                                                          | client (données), admin (file) | 3, 8   | `ModerationRepository`                               | ⬜     |
| F2.6      | Limites d'actions, suspension temporaire                                               | client                         | 3      | `ReportRepository.getActionQuota`                    | ⬜     |
| F3.1      | Enregistrement local + icône « hors ligne »                                            | client                         | 4      | `StorageService`                                     | ⬜     |
| F3.2      | Confirmation avant synchronisation                                                     | client                         | 4      | `SyncService`, `ReportRepository.create`             | ⬜     |
| F4.1–F4.5 | Partage de trajet sécurisé                                                             | client + page publique         | 10     | à définir                                            | ⏸️     |
| F5.1      | QCM 4 thèmes + correction pédagogique                                                  | client                         | 5      | `QuizRepository`                                     | ⬜     |
| F5.2      | 5 questions par jour                                                                   | client                         | 5      | `QuizRepository`, `DailyQuizLimit`                   | ⬜     |
| F5.3      | Points traçables                                                                       | client                         | 5      | `PointsRepository`                                   | ⬜     |
| F5.4      | Classements mensuel et annuel                                                          | client                         | 5      | `PointsRepository.getLeaderboard`                    | ⬜     |
| F5.5      | Score, progression, rang                                                               | client                         | 5      | `PointsRepository`                                   | ⬜     |
| F6.1      | Notation sur 4 critères                                                                | client                         | 6      | `RatingRepository.submit`                            | ⬜     |
| F6.2      | Moyennes et classements conducteurs/agences                                            | client                         | 6      | `RatingRepository`                                   | ⬜     |
| F6.3      | Anti-abus (passager, conducteur, période)                                              | client                         | 6      | `RatingAntiAbusePolicy`                              | ⬜     |
| F6.4      | Statistiques du conducteur                                                             | client                         | 6      | `RatingRepository.getDriverStats`                    | ⬜     |
| F7.1      | Alerte de danger à proximité                                                           | client                         | 7      | `NotificationService`                                | ⬜     |
| F7.2      | Rappels de quiz, infos des autorités (alertes de trajet : dépend de M4)                | client                         | 7      | `NotificationService`                                | ⬜     |
| F7.3      | Mode visuel normal                                                                     | client                         | 7      | —                                                    | ⬜     |
| F8.1–F8.3 | Mode conduite simplifié                                                                | client                         | 10     | —                                                    | ⏸️     |
| F9.1      | Connexion sécurisée admin                                                              | admin                          | 8      | `AuthRepository`                                     | ⬜     |
| F9.2      | Validation des profils + justificatifs                                                 | admin                          | 8      | `ProfileRequestRepository`                           | ⬜     |
| F9.3      | Modération signalements et comptes                                                     | admin                          | 8      | `ModerationRepository`, `UserRepository`             | ⬜     |
| F9.4      | Gestion des quiz                                                                       | admin                          | 9      | `QuizRepository`                                     | ⬜     |
| F9.5      | Tableau de bord KPI + heatmap (trajets : dépend de M4)                                 | admin                          | 9      | `StatsRepository`                                    | ⬜     |
| F9.6      | Export CSV                                                                             | admin                          | 9      | `StatsRepository.exportRows`                         | ⬜     |
| F9.7      | Vue Autorité simplifiée                                                                | admin                          | 9      | `ReportRepository.markHandled`                       | ⬜     |
| ENF       | Sécurité, protection des données, performance (§5)                                     | les deux                       | 12, 13 | —                                                    | ⬜     |

## Couverture de la phase 1 (fondations)

La phase 1 ne livre aucune exigence fonctionnelle complète. Elle pose le socle dont les phases suivantes ont besoin :

| Élément livré                                                                                                                                                                                                      | Exigences préparées   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Entités et schémas Zod de tout le domaine, paramètres métier centralisés (`BUSINESS_RULES`)                                                                                                                        | toutes                |
| Interfaces de tous les dépôts (`@wakasafe/data-contracts`) et mocks persistés localement, avec jeux de démonstration                                                                                               | toutes                |
| Opérations de lecture implémentées en mock : connexion, session, déconnexion, utilisateurs, préférences, contacts de sécurité, demandes de profil, agences. Les autres répondent `NOT_IMPLEMENTED` avec leur phase | F1.1, F1.2, F1.5      |
| Capacités par rôle (`getClientCapabilities`) et gardes de routes : une demande en attente garde les droits Citoyen                                                                                                 | F1.3 (🟡), F2.6, F9.3 |
| Compte suspendu : connexion en lecture seule, bandeau d'information                                                                                                                                                | F2.6, F9.3            |
| Espace Conducteur réservé au Conducteur validé (contenu en phase 6)                                                                                                                                                | F6.4                  |
| Normalisation et affichage des numéros camerounais                                                                                                                                                                 | F1.1, F1.2            |

F1.3 est **en cours** : la règle « demande en attente = droits Citoyen » est appliquée et testée. Le dépôt de la demande (phase 2) et la notification (phase 7) restent à faire.
