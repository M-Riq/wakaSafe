# ADR-0002 : Monorepo avec npm workspaces

- Statut : **Accepté** (recommandation validée le 2026-11-18)
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

Deux applications ([ADR-0001](0001-two-web-applications.md)) partagent quatre packages TypeScript. Il faut un gestionnaire de workspaces compatible avec **Metro** (le bundler d'Expo), **Next.js**, GitHub Actions et Vercel, et simple à reprendre par d'autres développeurs (le code sera transmis à GOSAFE).

## Décision

- **npm workspaces**, déclarés dans le `package.json` racine : `"workspaces": ["apps/*", "packages/*"]`.
- Un seul `package-lock.json` à la racine. Version de Node fixée dans `.nvmrc` et dans `engines`.
- Les packages sont nommés `@wakasafe/domain`, `@wakasafe/data-contracts`, `@wakasafe/mock-data` et `@wakasafe/design-tokens`.
- Ils sont consommés **en source TypeScript**, sans étape de build : Metro les transpile nativement, Next.js via `transpilePackages`.
- La configuration TypeScript partagée (`tsconfig.base.json`, `strict: true`) se trouve à la racine. Chaque package l'étend.
- Les scripts racine (`lint`, `typecheck`, `test`, `build`) s'exécutent dans tous les workspaces (`npm run <script> --workspaces --if-present`).
- Pas d'orchestrateur (Turborepo, Nx) pour le MVP. On pourra en ajouter un plus tard sans changer la structure.

## Conséquences

- ✅ Rien à installer en plus de Node/npm. La résolution « hoistée » (un `node_modules` racine) est celle que Metro gère le mieux et que la documentation Expo sur les monorepos décrit.
- ✅ Vercel détecte nativement les npm workspaces (un « Root Directory » par projet).
- ⚠️ npm est moins strict que pnpm : un package peut importer une dépendance non déclarée sans erreur. Une règle ESLint (`import/no-extraneous-dependencies`) compense ce défaut.
- ⚠️ Installations plus lentes que pnpm. Acceptable vu la taille du projet.
- ⚠️ Les versions de `react` utilisées par Expo et par Next.js doivent rester compatibles. Si elles divergent, chaque app déclarera sa propre version et la résolution sera vérifiée en phase 1 et en phase 8.

## Alternatives étudiées

- **pnpm workspaces** : plus rapide et strict. Mais les liens symboliques ont longtemps posé problème avec Metro et React Native (on contourne souvent avec `node-linker=hoisted`, ce qui annule l'avantage), et c'est un outil de plus à installer pour les repreneurs.
- **Yarn (Berry)** : le mode Plug'n'Play est incompatible avec Metro sans configuration supplémentaire.
- **Deux dépôts séparés** : le partage du domaine passerait par des packages publiés, ce qui est trop lourd pour le MVP.
