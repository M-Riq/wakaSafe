# ADR-0005 : Abstraction de l'accès aux données et implémentations mock

- Statut : **Proposé**
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

La base de données (MySQL ou Supabase/PostgreSQL) et le backend ne sont pas encore choisis. La démo doit pourtant être réaliste. Brancher le vrai backend plus tard (phase 12) ne doit toucher qu'**une seule couche**, sans modifier l'UI.

## Décision

1. **`@wakasafe/domain`** : entités, énumérations, **schémas Zod** (source unique des types via `z.infer`) et **règles métier pures** (`ConsensusPolicy`, `SuspicionPolicy`, `ActionLimitPolicy`, `DailyQuizLimit`, `PointsPolicy`, `LeaderboardCalculator`, `RatingAntiAbusePolicy`, `RatingAggregator`). Ce package n'a aucune dépendance à React ou à une plateforme. Les paramètres (seuils, quotas) sont injectables ([business-rules.md](../architecture/business-rules.md)).
2. **`@wakasafe/data-contracts`** : uniquement des **interfaces** TypeScript (`AuthRepository`, `UserRepository`, `ProfileRequestRepository`, `ReportRepository`, `ModerationRepository`, `QuizRepository`, `PointsRepository`, `RatingRepository`, `NotificationRepository`, `StatsRepository`, `KeyValueStore`) et un agrégat `Repositories`. Toutes les méthodes sont **asynchrones** et renvoient des erreurs typées (`DomainError` avec un `code`), comme le fera une API.
3. **`@wakasafe/mock-data`** : `createMockRepositories({ store, clock, latencyMs })` renvoie un objet `Repositories`.
   - Données en mémoire, chargées depuis des **jeux de démonstration** (Yaoundé, Douala, Bafoussam, coordonnées plausibles, textes en français).
   - Persistance via un `KeyValueStore` **injecté** : AsyncStorage dans `apps/mobile`, `localStorage` dans `apps/admin`. Le package n'appelle donc aucune API de plateforme.
   - Applique les **règles du domaine**, comme le fera l'API, pour que la démo se comporte comme le produit final.
   - Latence simulée configurable, pour tester les états de chargement.
   - Questions de quiz marquées `isPlaceholderContent: true` et affichées « Contenu provisoire, à remplacer par le contenu GOSAFE ».
   - Graine déterministe : les deux apps partent **exactement** des mêmes données. Un bouton « Réinitialiser la démo » restaure l'état initial.
4. **Composition root** : `src/data/` dans chaque app. C'est le **seul** fichier qui importe `@wakasafe/mock-data`. Il expose `RepositoriesProvider` et `useRepositories()`, et choisit l'implémentation selon `EXPO_PUBLIC_DATA_SOURCE` / `NEXT_PUBLIC_DATA_SOURCE` (`mock` pour l'instant).
5. **Garde-fou** : la règle ESLint `no-restricted-imports` interdit d'importer `@wakasafe/mock-data` (et plus tard `api-client`) en dehors de `src/data/`.

## Conséquences

- ✅ Phase 12 = écrire `packages/api-client` (implémentation HTTP ou Supabase des mêmes interfaces) et changer la composition root.
- ✅ Les règles métier sont testables unitairement sans UI.
- ⚠️ Le mock applique des règles qui seront **réimplémentées côté serveur**. Le domaine partagé limite cette duplication si l'API est en Node.js/TypeScript, comme le prévoit le cahier des charges.
- ⚠️ Le stockage local du navigateur est limité (environ 5 Mo). Les photos de démo sont donc des images légères livrées dans `assets/`, et une photo prise par l'utilisateur est compressée avant d'être stockée.

## Alternatives étudiées

- **MSW (Mock Service Worker)**, qui simule une API HTTP : plus réaliste côté réseau, mais il faut figer un contrat d'API avant d'avoir choisi le backend, et il fonctionne mal sur React Native.
- **Supabase local dès maintenant** : la décision sur la base n'est pas prise, et cette option exige Docker et des comptes.
