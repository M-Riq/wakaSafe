# ADR-0003 : Stack de l'application client (`apps/mobile`)

- Statut : **Proposé**
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

L'app client doit tourner sur **web** (démo par URL) et **Android 8+** avec un seul code, rester légère pour des téléphones d'entrée de gamme et tolérer un réseau faible ou absent (M3).

## Décision

| Besoin               | Choix                                                                                                | Fallback / remarque                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Framework            | **Expo** (SDK stable le plus récent au démarrage de la phase 1), React Native, **TypeScript strict** | —                                                                                                        |
| Navigation           | **Expo Router** (routes fichiers, liens web propres)                                                 | —                                                                                                        |
| Données serveur      | **TanStack Query** (cache, nouvelles tentatives, état hors ligne)                                    | —                                                                                                        |
| État local           | **Zustand** (session, préférences, file hors ligne)                                                  | —                                                                                                        |
| Validation           | **Zod**, via les schémas de `@wakasafe/domain`                                                       | —                                                                                                        |
| Stockage local       | `StorageService` sur **AsyncStorage**                                                                | Sur le web, AsyncStorage s'appuie sur `localStorage`                                                     |
| Géolocalisation      | `LocationService` sur **expo-location**                                                              | Sur le web, expo-location utilise `navigator.geolocation`. Placement manuel sur la carte en cas de refus |
| Photo                | `MediaService` sur **expo-image-picker** + **expo-image-manipulator** (compression)                  | Sur le web, sélecteur de fichier `<input type="file" accept="image/*" capture>`                          |
| Réseau               | `NetworkService` sur **@react-native-community/netinfo**                                             | Sur le web, événements `online`/`offline`                                                                |
| Carte                | `AppMap` ([ADR-0006](0006-maps-openstreetmap.md))                                                    | `.web.tsx` / `.native.tsx`                                                                               |
| Notifications        | `NotificationService` in-app + toasts ([ADR-0007](0007-notifications-in-app-first.md))               | FCM plus tard                                                                                            |
| Internationalisation | Dictionnaire typé `fr` (sans bibliothèque lourde au départ)                                          | Ajout d'autres langues possible                                                                          |
| Qualité              | ESLint, Prettier, `tsc --noEmit`, **Jest** (preset `jest-expo`) + **React Native Testing Library**   | —                                                                                                        |

Organisation des routes Expo Router (en place depuis la phase 1 ; les lignes marquées d'une phase arrivent plus tard) :

```text
apps/mobile/app/
  _layout.tsx              # providers (données, requêtes) + restauration de la session
  index.tsx                # redirection selon la session (/map ou /welcome)
  +not-found.tsx
  (auth)/                  # garde Stack.Protected : visiteur non connecté
    welcome.tsx            # accueil
    demo-access.tsx        # choix d'un compte de démo (temporaire, phase 1)
    login, register, reset-password   # phase 2
  (app)/                   # garde Stack.Protected : session requise
                           # (compte suspendu : lecture seule, voir business-rules.md)
    (tabs)/                # map, report, quiz, leaderboard, profile
    driver.tsx             # garde : capacité canAccessDriverArea (Conducteur validé)
    reports/[id].tsx       # phase 3
    history.tsx            # phase 4 : mes signalements (dont ceux hors ligne)
    notifications.tsx      # phase 7
    ratings/               # phase 6 : évaluer, classements conducteurs et agences
    profile/               # phase 2 : édition, contacts de sécurité, justificatifs
```

Les gardes s'appuient sur `Stack.Protected` d'Expo Router : une route dont la garde est fausse est inaccessible, même par lien direct. Sur grand écran web, les onglets passent en barre latérale.

Le prompt initial évoquait des groupes `(citizen)`, `(driver)`, `(authority)`. Or le Conducteur et l'Autorité ont **tous les droits du Citoyen**. Un groupe `(app)` commun avec des **sous-routes gardées par rôle** évite de dupliquer les écrans. La vue Autorité se trouve dans `apps/admin` ([ADR-0009](0009-profile-requests-and-authority-access.md)).

## Conséquences

- ✅ Un seul code pour le web et Android. Chaque fonction native passe par un service qui prévoit une variante web.
- ⚠️ La carte native (MapLibre) exige un **build de développement** (pas Expo Go). Cela ne concerne que la phase 11. La démo web n'est pas affectée.
- ⚠️ L'export web statique ne fait aucun rendu côté serveur, ce qui suffit pour la démo.

## Alternatives étudiées

- **Redux Toolkit** : plus lourd que Zustand pour un besoin modeste.
- **i18next** : utile pour le multilingue, mais trop lourd pour le français seul. Il reste possible de l'adopter plus tard.
