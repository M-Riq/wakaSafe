# Diagrammes WakaSafe

Tous les diagrammes sont écrits en **Mermaid**, que GitHub affiche nativement. Les fichiers de ce dossier sont la **source de vérité**. Le [README](../../README.md) en reprend une copie, à mettre à jour dans le même commit.

| #   | Diagramme                                      | Fichier                                                                    |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Cas d'utilisation (+ version PlantUML)         | [01-use-cases.md](01-use-cases.md), [01-use-cases.puml](01-use-cases.puml) |
| 2   | Architecture globale                           | [02-architecture.md](02-architecture.md)                                   |
| 3   | Composants et modules                          | [03-components.md](03-components.md)                                       |
| 4   | Classes du domaine                             | [04-domain-classes.md](04-domain-classes.md)                               |
| 5   | Séquences (7 scénarios)                        | [05-sequences.md](05-sequences.md)                                         |
| 6   | États : compte, demande de profil, signalement | [06-states.md](06-states.md)                                               |
| 7   | Activité : « Signaler un danger »              | [07-activity-report.md](07-activity-report.md)                             |
| 8   | Modèle de données MCD / MLD                    | [08-data-model.md](08-data-model.md)                                       |
| 9   | Déploiement (démo et cible)                    | [09-deployment.md](09-deployment.md)                                       |

## Vérifier un diagramme localement

Les diagrammes de ce dossier ont tous été compilés avec `@mermaid-js/mermaid-cli`. Pour en vérifier un :

```bash
npx -y @mermaid-js/mermaid-cli -i diagramme.mmd -o diagramme.svg
```

Vous pouvez aussi coller le bloc dans <https://mermaid.live>. La CI vérifie automatiquement la syntaxe Mermaid (rendu avec `mermaid-cli`) et la synchronisation avec le README (`npm run check:diagrams`). Voir [CONTRIBUTING](../../CONTRIBUTING.md).

## Règle de synchronisation

Toute phase qui modifie l'architecture, le domaine ou les flux met à jour, dans la même PR :

1. le ou les fichiers de ce dossier ;
2. la copie dans le README ;
3. l'entrée correspondante du CHANGELOG.
