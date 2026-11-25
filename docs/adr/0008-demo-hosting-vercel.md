# ADR-0008 : Hébergement de la démo sur Vercel (deux projets)

- Statut : **Accepté** (recommandation validée le 2026-11-18)
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

La démo est montrée au client par URL, avec une **prévisualisation par branche ou PR**. Il y a deux applications ([ADR-0001](0001-two-web-applications.md)).

## Décision

- Deux projets **Vercel** reliés au même dépôt GitHub, chacun avec son « Root Directory » :
  - `wakasafe-client` → `apps/mobile`, commande de build `npx expo export --platform web`, dossier de sortie `dist`, réécriture SPA vers `index.html` ;
  - `wakasafe-admin` → `apps/admin`, préréglage Next.js.
- Option « Ignored Build Step » : ne rebâtir un projet que si son app ou `packages/` a changé.
- La configuration (`vercel.json` par app) est versionnée : [`apps/mobile/vercel.json`](../../apps/mobile/vercel.json) depuis la phase 1 ; celle de l'admin arrivera en phase 8. **Le responsable crée les comptes et connecte le dépôt lui-même.** Aucun secret n'est versionné.

## Mise en œuvre

- 2026-11-24 : projet `wakasafe-client` connecté au dépôt. Production : <https://wakasafe-client.vercel.app> (branche `main`). Réglages : Root Directory `apps/mobile`, fichiers hors du dossier racine inclus, préréglage « Other », Node.js 24.x ([README, section 13](../../README.md#13-déploiement-de-la-démo)).
- Les prévisualisations de PR sont protégées par Vercel Authentication (accès réservé aux membres du compte Vercel) ; le client utilise l'URL de production.
- Le projet `wakasafe-admin` sera connecté en phase 8.

## Conséquences

- ✅ Next.js est pris en charge nativement. Les URL de prévisualisation sont commentées automatiquement sur chaque PR.
- ⚠️ Le plan gratuit (Hobby) est réservé à un usage non commercial. Pour un usage associatif ou commercial durable, il faudra un compte au nom de GOSAFE, éventuellement payant, ou une migration (point ouvert).

## Alternatives étudiées

- **Netlify** : équivalent pour le site statique Expo, mais Next.js y passe par un adaptateur. C'est une alternative viable.
- **GitHub Pages** : pas de prévisualisation par PR native et pas de Next.js dynamique.
