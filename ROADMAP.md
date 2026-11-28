# Roadmap WakaSafe (MVP)

Une phase = une branche `phase/NN-nom-court` = une pull request vers `main`. Une phase ne démarre qu'après validation et merge de la précédente par le responsable du projet.

Légende : ⬜ À venir · 🟡 En cours · 🔵 En revue (PR ouverte) · ✅ Terminée · ⏸️ Optionnelle (sur confirmation)

| Phase | Branche                                 | Contenu                                                                                                                                                                                                                                                 | Exigences            | Statut      |
| ----- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| 0     | `phase/00-cadrage-architecture`         | Audit du dépôt, structure monorepo, diagrammes, README, ROADMAP, CONTRIBUTING, ADR, instructions Copilot, modèles GitHub. **Aucun code applicatif.**                                                                                                    | —                    | ✅ Terminée |
| 1     | `phase/01-fondations-client`            | npm workspaces, packages `domain`, `data-contracts`, `mock-data`, `design-tokens`. `apps/mobile` : Expo + TS strict + Expo Router (web et Android), design system, navigation par rôle, i18n `fr`, CI, configuration Vercel, vérification Mermaid en CI | socle                | ✅ Terminée |
| 2     | `phase/02-comptes-profils`              | M1 côté client : inscription, connexion, réinitialisation, profils, demandes en attente, justificatifs, contacts de sécurité, gardes de routes                                                                                                          | F1.1–F1.5            | ✅ Terminée |
| 3     | `phase/03-signalements-carte`           | M2 : formulaire, géolocalisation, photo, carte publique et filtres, validation et infirmation, suspects (données), limites d'actions                                                                                                                    | F2.1–F2.6            | 🔵 En revue |
| 4     | `phase/04-mode-hors-ligne`              | M3 : file locale, icône « hors ligne », synchronisation avec confirmation, échecs et nouvelles tentatives                                                                                                                                               | F3.1–F3.2            | ⬜          |
| 5     | `phase/05-quiz-points-classements`      | M5 : quiz, 5 questions par jour, correction, points traçables, classements mensuel et annuel                                                                                                                                                            | F5.1–F5.5            | ⬜          |
| 6     | `phase/06-evaluation-conducteurs`       | M6 : 4 critères, moyennes, classements conducteurs et agences, anti-abus, statistiques du conducteur                                                                                                                                                    | F6.1–F6.4            | ⬜          |
| 7     | `phase/07-notifications`                | M7 : centre de notifications, alertes simulées, `NotificationService` prêt pour FCM                                                                                                                                                                     | F7.1–F7.3            | ⬜          |
| 8     | `phase/08-admin-fondations-moderation`  | `apps/admin` (Next.js) : structure, authentification, layout, validation des profils, modération                                                                                                                                                        | F9.1–F9.3            | ⬜          |
| 9     | `phase/09-admin-quiz-kpi-autorite`      | `apps/admin` : gestion des quiz, KPI et heatmap, export CSV, vue Autorité                                                                                                                                                                               | F9.4–F9.7            | ⬜          |
| 10    | `phase/10-partage-trajet-mode-conduite` | M4 et M8, **uniquement sur confirmation**. ADR sur l'emplacement de la page publique de suivi                                                                                                                                                           | F4.1–F4.5, F8.1–F8.3 | ⏸️          |
| 11    | `phase/11-android-build`                | Adaptation Android de `apps/mobile` : build de développement, MapLibre, stockage, permissions, APK de test                                                                                                                                              | ENF                  | ⬜          |
| 12    | `phase/12-integration-backend-db`       | Backend et base réels (après décision MySQL ou Supabase), synchronisation client et admin, sans toucher à l'UI                                                                                                                                          | toutes               | ⬜          |
| 13    | `phase/13-securite-qualite-release`     | Sécurité, tests de bout en bout, optimisation pour l'entrée de gamme, préparation de la publication                                                                                                                                                     | ENF                  | ⬜          |

## Définition de terminé (chaque phase)

- [ ] Lint, typecheck et tests passent (à partir de la phase 1)
- [ ] L'export web du client et le build de l'admin réussissent (dès que l'app concernée existe)
- [ ] Les écrans fonctionnent sur le web **et** restent compatibles Android (pas d'API web-only sans repli)
- [ ] README, diagrammes, ROADMAP, CHANGELOG et matrice de traçabilité à jour
- [ ] Aucun élément hors MVP ajouté
- [ ] Rapport de fin de phase fourni (Fait / Non fait / Problèmes / Décisions / Prochaine action)

## Hors MVP (ne sera pas développé)

Défis et challenges, SafeFlash, paiement Mobile Money et récompenses monétaires, sponsors, commandes vocales et gestuelles, iOS, interface Autorité avancée, modération par IA, trophées et événements, API publique.

> Ce document sert au suivi interne du projet. L'application n'affiche aucune information sur les phases ni sur l'avancement : les fonctionnalités pas encore livrées apparaissent seulement comme « Bientôt disponible ».
