# Changelog

Toutes les modifications notables du projet sont consignées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Le projet suivra le [versionnage sémantique](https://semver.org/lang/fr/) à partir de la première version publiée.

## [Non publié]

### Phase 0 : cadrage et architecture

#### Ajouté

- README de référence : présentation, périmètre MVP et hors MVP, profils, stack, architecture, modèle de données, roadmap, workflow Git, démo, hypothèses.
- Diagrammes Mermaid dans `docs/diagrams/` : cas d'utilisation (+ PlantUML), architecture globale, composants, classes du domaine, 7 séquences, états (compte, demande de profil, signalement), activité « Signaler un danger », MCD/MLD, déploiement.
- ADR 0001 à 0010 dans `docs/adr/`.
- Documents d'architecture : structure du monorepo, règles métier provisoires, matrice de traçabilité, analyse des écarts avec le cahier des charges.
- `ROADMAP.md`, `CONTRIBUTING.md`, `.github/copilot-instructions.md`, modèles d'issues et de pull request.
- `.gitignore` excluant les documents sources confidentiels (`docs/source/`).
