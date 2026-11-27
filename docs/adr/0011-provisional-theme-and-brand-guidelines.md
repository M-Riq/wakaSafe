# ADR-0011 : Thème graphique provisoire et passage à la charte GOSAFE

- Statut : **Accepté**
- Date : 2026-11-27
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

La charte graphique de WakaSafe (couleurs, police, logo, icônes) n'existe pas encore. Elle sera établie dans les prochains mois. En attendant, l'interface utilise un thème **neutre et provisoire**.

L'arrivée de la charte ne doit pas obliger à reprendre les écrans un par un.

## Décision

1. **Source unique.** `packages/design-tokens` contient toutes les valeurs visuelles :
   - la palette ;
   - les couleurs par rôle (`primary`, `danger`, `surface`…) ;
   - la typographie, les espacements, les rayons, les tailles et les ombres.

   Les composants utilisent les couleurs par rôle, jamais la palette brute.

2. **Couche d'interface.**
   - Dans l'app client, seul `apps/mobile/src/ui/theme.ts` importe les tokens. Les écrans passent par `@/ui` (composants et tokens).
   - Le back-office (phase 8) générera sa configuration Tailwind à partir des mêmes tokens ([ADR-0004](0004-admin-app-stack.md)).
3. **Aucune couleur en dur dans les applications.** Une règle ESLint (`no-restricted-syntax`, dans `eslint.config.js`) refuse :
   - les couleurs hexadécimales ;
   - `rgb()`, `rgba()`, `hsl()` et `hsla()` ;
   - les noms de couleurs (`'white'`, `'red'`…) dans les propriétés de couleur. `transparent` reste permis.
4. **Logo.** Un seul composant, `BrandLogo` (`apps/mobile/src/ui/BrandLogo.tsx`), affiche la marque provisoire.
5. **`app.json`.** Il ne peut pas importer les tokens. Un test (`apps/mobile/src/ui/__tests__/app-config.test.ts`) vérifie que ses couleurs (icône Android, thème web) restent celles des tokens.
6. **Contraste.** Les tests de `design-tokens` vérifient le contraste WCAG AA des couples texte et fond. Une nouvelle palette doit les passer.

## Procédure à l'arrivée de la charte

| Élément                                                                       | Où le changer                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Couleurs                                                                      | `packages/design-tokens/src/colors.ts` : la palette, puis les rôles. `npm test` signale les contrastes insuffisants.                                                                                                                                                                                                                               |
| Couleurs système (icône Android, barre du navigateur)                         | `apps/mobile/app.json`. Le test indique les valeurs attendues.                                                                                                                                                                                                                                                                                     |
| Police                                                                        | Fichiers dans `apps/mobile/assets/fonts/`, déclarés avec le plugin `expo-font` (sur Android, une famille avec un fichier par graisse), puis `typography.fontFamily`. Ajouter la famille aux quatre endroits qui stylent le texte : `AppText`, `TextField`, l'en-tête (`ui/navigation.tsx`) et la barre d'onglets (`app/(app)/(tabs)/_layout.tsx`). |
| Tailles de texte, espacements, rayons                                         | `packages/design-tokens/src/typography.ts` et `layout.ts`.                                                                                                                                                                                                                                                                                         |
| Logo                                                                          | `apps/mobile/src/ui/BrandLogo.tsx`.                                                                                                                                                                                                                                                                                                                |
| Icône de l'application, icône adaptative Android, favicon, écran de démarrage | `apps/mobile/assets/*.png`, aux mêmes noms et dimensions.                                                                                                                                                                                                                                                                                          |
| Nom affiché                                                                   | `fr.common.appName` (`apps/mobile/src/lib/i18n/fr.ts`) et `app.json` (`name`, `web.name`, `web.shortName`).                                                                                                                                                                                                                                        |
| Back-office                                                                   | Rien de plus si sa configuration Tailwind est générée depuis les tokens.                                                                                                                                                                                                                                                                           |

Ensuite :

- lancer les vérifications habituelles (lint, typecheck, tests, export web et Android) ;
- comparer des captures avant et après ;
- noter le changement dans le CHANGELOG.

## Conséquences

- ✅ Changer de charte touche quelques fichiers, pas les écrans.
- ✅ Une couleur en dur ajoutée par erreur bloque le lint et donc la CI.
- ⚠️ Les images (icônes, écran de démarrage) se remplacent à la main, aux mêmes dimensions.
- ⚠️ Un mode sombre n'est pas prévu dans le MVP (`userInterfaceStyle: light`). Si la charte en impose un, il faudra un second jeu de couleurs par rôle et un fournisseur de thème (voir les alternatives).
- ⚠️ Une police personnalisée alourdit l'application. Mieux vaut se limiter à 2 ou 3 graisses pour les téléphones d'entrée de gamme.

## Alternatives étudiées

- **Thème dynamique par contexte React (`ThemeProvider`).** Utile pour un mode sombre ou plusieurs marques. Inutile tant qu'il n'y a qu'un thème clair : les tokens statiques sont plus simples et plus légers. Il reste possible de l'ajouter plus tard sans toucher aux écrans, puisqu'ils passent déjà par `@/ui`.
- **Bibliothèque de composants avec son propre thème (React Native Paper, Tamagui, NativeWind).** Écartée pour garder des composants légers et sous notre contrôle. La charte s'applique de la même façon aux tokens.
- **`app.config.ts` qui importe les tokens.** Cela supprimerait la duplication dans `app.json`. En revanche, Expo ne peut plus modifier automatiquement une configuration dynamique (par exemple lors de l'ajout d'un plugin), et charger un paquet TypeScript du monorepo depuis la configuration est fragile. Un test suffit.
