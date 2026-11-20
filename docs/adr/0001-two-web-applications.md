# ADR-0001 : Deux applications web, un client Expo et un back-office Next.js

- Statut : **Accepté**
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

Le cahier des charges (§5) prévoit une application mobile React Native/Expo pour Android et un back-office web en **Next.js**. La démo client doit être accessible par une URL. Les profils Citoyen, Conducteur et Autorité utilisent l'application mobile, l'Administrateur le back-office (M9).

## Décision

Le dépôt contient deux applications distinctes :

1. **`apps/mobile`** : Expo + React Native + TypeScript strict + Expo Router. Un seul code pour le **web** (démo par URL) et **Android 8+**. Elle sert les profils Citoyen, Conducteur et Autorité.
2. **`apps/admin`** : Next.js (App Router) + TypeScript strict, **web uniquement**, pensée desktop d'abord. Elle couvre M9 (F9.1 à F9.7), y compris la vue Autorité simplifiée (F9.7).

Il n'y a **pas** de routes `/admin` dans l'app Expo. Seuls des packages sans UI sont partagés : `domain`, `data-contracts`, `mock-data`, `design-tokens`. Les composants d'interface ne sont **pas** partagés entre React Native et Next.js.

## Conséquences

- ✅ Conforme au cahier des charges. Chaque app utilise la technologie la plus adaptée à son usage (mobile tactile ou back-office desktop).
- ✅ La logique métier est écrite une seule fois (`packages/domain`), ce qui garantit des règles identiques dans les deux apps.
- ⚠️ Il faut deux projets d'hébergement, donc deux URL ([ADR-0008](0008-demo-hosting-vercel.md)).
- ⚠️ En démo, les données mock sont locales à chaque app : une action faite dans l'admin n'est pas visible en direct dans le client. Ce point est documenté dans le README. La synchronisation réelle viendra avec le backend (phase 12). **Aucun mécanisme de synchronisation temporaire** ne sera inventé sans validation.
- ⚠️ Les composants visuels sont écrits deux fois (React Native et Tailwind). La cohérence est assurée par `design-tokens`.

## Alternatives étudiées

- **Back-office dans l'app Expo (routes `/admin`)** : une seule app à déployer et une synchronisation de démo plus simple. Mais c'est contraire au cahier des charges, et React Native Web convient mal aux tableaux et graphiques denses. Option écartée par le responsable.
