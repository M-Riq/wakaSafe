# ADR-0010 : Documents sources confidentiels hors du dépôt

- Statut : **Accepté**
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

Le dépôt GitHub est **public**. Le cahier des charges contient des informations commerciales (devis, conditions de paiement) et des coordonnées personnelles.

## Décision

- Le cahier des charges est conservé **localement** dans `docs/source/`, qui est **exclu par `.gitignore`** (seul `docs/source/README.md` est versionné).
- Aucun montant, condition de paiement ou coordonnée personnelle ne doit apparaître dans le dépôt (README, docs, code, commits, PR).
- Les exigences fonctionnelles sont reprises sous forme de **références** (F1.1, F2.3, etc.) dans la documentation. Ce n'est pas une copie du document.

## Conséquences

- ⚠️ Un nouveau contributeur doit obtenir le cahier des charges auprès du responsable du projet.
- ⚠️ Si le dépôt devient privé, cette règle reste en vigueur par prudence. Le code sera transmis à GOSAFE.
