# ADR-0004 : Stack du back-office (`apps/admin`)

- Statut : **Accepté**
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

Le back-office (M9) est une application web séparée en Next.js ([ADR-0001](0001-two-web-applications.md)). Elle sert l'Administrateur (F9.1 à F9.6) et l'Autorité, limitée à la vue simplifiée (F9.7). Elle est pensée **desktop d'abord** et doit rester lisible sur tablette.

## Décision

| Besoin                  | Choix                                                                                                                                        | Justification                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Framework               | **Next.js (App Router)**, TypeScript strict                                                                                                  | Imposé par le cahier des charges                                                                           |
| Rendu                   | Pages majoritairement **client** (`"use client"`), données mock injectées par la composition root                                            | Pas de serveur métier tant que le backend n'existe pas. Le passage à l'API (phase 12) se fait sans refonte |
| Styles                  | **Tailwind CSS**, configuré à partir de `@wakasafe/design-tokens`                                                                            | Rapide, cohérent avec les tokens, sans CSS mort                                                            |
| Composants              | Composants maison accessibles (boutons, champs, dialogues, onglets) sur **Radix UI** pour les primitives complexes (dialogue, menu, onglets) | Accessibilité clavier et ARIA sans réinventer. Facile à aligner sur la charte GOSAFE                       |
| Tableaux                | **TanStack Table**                                                                                                                           | Tri, filtres et pagination côté client, sans imposer de style                                              |
| Graphiques              | **Recharts**                                                                                                                                 | Simple, suffisant pour les KPI (barres, courbes, secteurs)                                                 |
| Carte et heatmap        | **Leaflet** + **react-leaflet** + **leaflet.heat** (tuiles OSM), chargés en `dynamic(..., { ssr: false })`                                   | Gratuit et cohérent avec [ADR-0006](0006-maps-openstreetmap.md)                                            |
| Formulaires             | **React Hook Form** + résolveur **Zod** (schémas de `@wakasafe/domain`)                                                                      | Mêmes règles de validation que l'app client                                                                |
| Données                 | **TanStack Query** + interfaces de `@wakasafe/data-contracts`                                                                                | Même modèle que l'app client                                                                               |
| Export CSV              | Génération **côté client** (`Blob`, échappement RFC 4180, BOM UTF-8 pour Excel)                                                              | Pas de dépendance serveur. Les accents s'affichent correctement dans Excel                                 |
| Authentification (démo) | `AuthRepository` mock, session en `sessionStorage`, garde par rôle dans le layout                                                            | Simulée. La vraie authentification sécurisée (cookies HttpOnly, hachage côté API) arrive en phase 12       |
| Qualité                 | ESLint (`eslint-config-next`), Prettier, `tsc --noEmit`, **Jest** + **React Testing Library**                                                | Même outillage que l'app client                                                                            |

Routes (proposition) :

```text
apps/admin/src/app/
  login/                      # F9.1
  (protected)/layout.tsx      # garde : ADMIN, ou AUTHORITY limité à /authority
    page.tsx                  # tableau de bord KPI + heatmap (F9.5)
    profiles/ [id]/           # validation des profils et justificatifs (F9.2)
    moderation/               # signalements suspects (F9.3)
    accounts/                 # suspension et réactivation (F9.3)
    quizzes/ [id]/            # gestion des quiz (F9.4)
    exports/                  # export CSV (F9.6)
    authority/                # vue Autorité simplifiée (F9.7)
```

## Conséquences

- ✅ Stack standard et largement documentée, sans service payant.
- ⚠️ Leaflet n'a pas de rendu côté serveur : chargement dynamique obligatoire.
- ⚠️ Tant que l'authentification est simulée, la démo ne protège rien réellement. Cette limite est indiquée dans le README.

## Alternatives étudiées

- **shadcn/ui** : il s'appuie lui aussi sur Radix et Tailwind. On pourra l'adopter en phase 8 s'il accélère le travail, car il est compatible avec ce choix.
- **AG Grid** : trop lourd, et ses fonctions avancées sont sous licence payante.
- **Chart.js** : utilisable, mais Recharts s'intègre mieux à React.
- **Mapbox GL** : nécessite une clé et devient payant au-delà d'un certain volume.
