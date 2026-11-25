# Copilot instructions — WakaSafe

WakaSafe is a citizen road-safety app for Cameroon (GOSAFE association). Only the **MVP** is built. Project lead: Mbassi Rick Bryan.

## Governance (highest priority — never bypass)

1. **Never commit, push or open a PR without the lead's explicit approval.** Before each commit, show: summary, files created/modified/deleted, proposed commit message, lint/typecheck/test/build results, then write « **EN ATTENTE DE VALIDATION** » and stop. Before each PR, show title, description, phase checklist and screenshots/preview link, then wait.
2. **Never merge, never push to `main`, never force-push or rewrite history.**
3. **One phase at a time, on its own branch** `phase/NN-short-name`, created from an up-to-date `main`. Stop at the end of a phase. Start the next one only after the lead writes « PHASE N VALIDÉE, PASSE À LA SUIVANTE ».
4. If an architecture, scope or dependency decision is not settled by the docs/ADRs, **ask** (one grouped question with a recommendation) instead of guessing.
5. No paid services, no secrets or API keys in the repo, no external account creation. Use `.env.example`.
6. Do not modify files outside the current phase scope without flagging it first.
7. Be honest: report what was not done or not tested.
8. End-of-task report format (in French): **Fait / Non fait / Problèmes rencontrés / Décisions à valider / Prochaine action proposée**.

## Language

- UI, README, docs, messages to the lead: **French**.
- Code, identifiers, commit messages: **English**, Conventional Commits.

## Confidentiality

The repository is **public**. `docs/source/` (spec + quote) is git-ignored and must never be committed. Never write amounts, payment terms or personal contact details anywhere in the repo.

## Scope

- In MVP: M1 accounts, M2 reports, M3 offline, M5 quiz/points/leaderboards, M6 driver ratings, M7 notifications (in-app + toasts, FCM later), M9 back-office.
- **Optional, only on explicit confirmation**: M4 trip sharing, M8 driving mode (phase 10).
- **Out of MVP (forbidden)**: challenges, SafeFlash, Mobile Money/monetary rewards, sponsors, voice/gesture commands, iOS, advanced Authority UI, AI moderation, trophies/events, public API.

## Architecture (see `docs/adr/`)

- npm workspaces monorepo:
  - `apps/mobile`: Expo + React Native + TypeScript strict + Expo Router, **web and Android** from one codebase. Citizen, Driver, Authority.
  - `apps/admin`: Next.js App Router + TypeScript strict + Tailwind, **web only**, desktop-first. Admin, plus Authority restricted to the authority view (F9.7).
  - `packages/domain` (entities, Zod schemas, pure business rules), `packages/data-contracts` (repository interfaces), `packages/mock-data` (mock implementations + demo seed), `packages/design-tokens`.
- UI components are **not** shared between React Native and Next.js.
- Features depend **only on `data-contracts` interfaces**. Only `src/data/` (composition root) may import `mock-data`.
- Every platform-specific API needs a fallback (`.web.tsx` / `.native.tsx` or `Platform.select`).
- Maps: `AppMap` (Leaflet on web, MapLibre on Android), OSM tiles. Admin: Leaflet + leaflet.heat.
- State: TanStack Query + Zustand. Validation: Zod. Tests: Jest + (React Native) Testing Library.
- Account status (`ACTIVE`/`SUSPENDED`) is separate from profile requests (`PENDING`/`APPROVED`/`REJECTED`). Pending users keep Citizen rights.
- Demo limitation: client and admin use separate local mock data. **Do not invent a temporary sync mechanism.**
- Diagrams in `docs/diagrams/` are the source of truth. The README copies them between `<!-- diagram:... -->` markers. Update both in the same change.
- Provisional business parameters are documented in `docs/architecture/business-rules.md` and coded once in `BUSINESS_RULES` (`packages/domain/src/config/business-rules.ts`). Keep both in sync.
- Mock operations planned for a later phase reject with a `NOT_IMPLEMENTED` domain error naming that phase.
- The UI never shows project phases, progress or spec requirement codes (internal information). An unbuilt feature only shows « Bientôt disponible » (`ComingSoonView`, `fr.common.comingSoon`); phase numbers stay in internal error details and docs.

## Commands (run at the repository root)

- `npm ci` then `npm run lint` (ESLint with 0 warnings + `prettier --check`), `npm run typecheck`, `npm test`.
- `npm run build:mobile` (web export) and `npm run export:android -w @wakasafe/mobile` (Android bundle check).
- `npm run sync:diagrams` after editing `docs/diagrams/`, then `npm run check:diagrams`.
- React Native Testing Library 14: `render`, `fireEvent` and `renderRouter` are async and must be awaited.

## Definition of done (every phase)

Lint, typecheck and tests pass. Client web export and admin Next.js build succeed. Web works and stays Android-compatible. README, diagrams, ROADMAP, CHANGELOG and traceability matrix are updated. No out-of-MVP scope. End-of-phase report provided.
