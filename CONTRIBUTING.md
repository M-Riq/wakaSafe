# Contribuer à WakaSafe

Merci de lire ce guide avant toute contribution. Il s'applique aux deux applications (`apps/mobile` et `apps/admin`) et aux packages partagés.

## 1. Langues

- **Français** : interface, README, documentation, issues, descriptions de PR.
- **Anglais** : code, noms de variables, fichiers de code, messages de commit.

## 2. Workflow Git

- `main` est stable et protégée : **aucun push direct**, aucun force-push, aucune réécriture d'historique.
- Une branche par phase, créée depuis `main` à jour : `phase/NN-nom-court` (voir [ROADMAP.md](ROADMAP.md)).
- Une seule phase à la fois. La branche de la phase suivante n'est créée qu'après le **merge** de la précédente.
- Une PR par phase vers `main`, rédigée avec le [modèle de PR](.github/PULL_REQUEST_TEMPLATE.md). **Seul le responsable du projet merge.**

## 3. Commits

Format [Conventional Commits](https://www.conventionalcommits.org/fr/) en anglais :

```text
<type>(<scope optionnel>): <description à l'impératif>

feat(reports): add severity filter to public map
fix(offline): keep failed reports in queue after sync error
docs(adr): add ADR-0011 on tile provider
```

Types : `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `style`, `perf`, `ci`, `build`.
Les commits sont **atomiques** : un changement logique par commit.

## 4. Définition de terminé

Une phase n'est terminée que si :

1. lint, typecheck et tests passent (`npm run lint`, `npm run typecheck`, `npm test` à la racine) ;
2. l'export web (client) et le build Next.js (admin) réussissent ;
3. chaque écran fonctionne sur le web et reste compatible Android (pas d'API web-only ou native-only sans variante `.web.tsx` / `.native.tsx` ou `Platform.select`) ;
4. README, diagrammes, ROADMAP, CHANGELOG et [matrice de traçabilité](docs/architecture/traceability.md) sont à jour ;
5. aucun élément **hors MVP** n'a été ajouté ;
6. un rapport de fin de phase est fourni.

## 5. Architecture : règles à respecter

- Les features et l'UI dépendent **uniquement des interfaces** de `@wakasafe/data-contracts`, jamais de `@wakasafe/mock-data` ni d'une future implémentation API ([ADR-0005](docs/adr/0005-data-access-abstraction.md)).
- Les règles métier vivent dans `@wakasafe/domain`, sans dépendance à React ou à une plateforme.
- Aucun composant UI n'est partagé entre React Native et Next.js. Seuls `domain`, `data-contracts`, `mock-data` et `design-tokens` le sont.
- Aucune valeur de couleur, taille ou espacement en dur : utiliser `@wakasafe/design-tokens`.
- Aucun texte d'interface en dur : utiliser le dictionnaire `fr`.
- Détails : [docs/architecture/overview.md](docs/architecture/overview.md).

## 6. Documentation et diagrammes

- Les diagrammes Mermaid de `docs/diagrams/` sont la **source de vérité**. Le README en contient une copie entre des balises `<!-- diagram:... -->` et `<!-- /diagram -->`. Modifier d'abord `docs/diagrams/`, puis lancer `npm run sync:diagrams` pour recopier les blocs dans le README, dans le même commit. La CI vérifie la synchronisation (`npm run check:diagrams`) et la syntaxe (rendu `mermaid-cli`).
- `ROADMAP.md` et `roadmap.json` (page « Avancement du projet ») sont mis à jour ensemble ; `npm run check:roadmap` vérifie qu'ils concordent.
- Toute décision structurante fait l'objet d'un **ADR** dans `docs/adr/`.
- Toute modification notable est ajoutée au [CHANGELOG](CHANGELOG.md).

## 7. Sécurité et confidentialité

- **Aucun secret** (clé API, mot de passe réel, jeton) dans le dépôt. Utiliser `.env` (ignoré) et documenter les variables dans `.env.example`.
- Le dépôt est **public** : aucun montant, devis, condition de paiement ou coordonnée personnelle. Le cahier des charges reste local dans `docs/source/` ([ADR-0010](docs/adr/0010-confidential-source-documents.md)).
- Aucun service payant ni compte externe créé sans l'accord du responsable du projet.
- Les comptes de démonstration utilisent des numéros fictifs.

## 8. Signaler un problème ou proposer une évolution

Utiliser les [modèles d'issues](.github/ISSUE_TEMPLATE). Toute évolution doit citer l'exigence concernée (F1.1, F2.3…) ou être identifiée comme **hors MVP**.
