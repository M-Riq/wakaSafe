# Décisions d'architecture (ADR)

Chaque décision structurante est consignée dans un ADR (_Architecture Decision Record_) numéroté. Un ADR accepté ne se modifie pas : s'il est remplacé, on crée un nouvel ADR et on passe l'ancien au statut « Remplacé par ADR-XXXX ».

Statuts : **Proposé** (en attente de validation du responsable), **Accepté**, **Remplacé**, **Abandonné**.

| N°                                                     | Titre                                                                              | Statut  |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------- |
| [0001](0001-two-web-applications.md)                   | Deux applications web : client Expo et back-office Next.js                         | Accepté |
| [0002](0002-monorepo-npm-workspaces.md)                | Monorepo avec npm workspaces                                                       | Accepté |
| [0003](0003-client-app-stack.md)                       | Stack de l'application client (Expo)                                               | Accepté |
| [0004](0004-admin-app-stack.md)                        | Stack du back-office (Next.js)                                                     | Accepté |
| [0005](0005-data-access-abstraction.md)                | Abstraction de l'accès aux données et implémentations mock                         | Accepté |
| [0006](0006-maps-openstreetmap.md)                     | Cartographie OpenStreetMap derrière un composant `AppMap`                          | Accepté |
| [0007](0007-notifications-in-app-first.md)             | Notifications : centre in-app d'abord, FCM plus tard                               | Accepté |
| [0008](0008-demo-hosting-vercel.md)                    | Hébergement de la démo sur Vercel (deux projets)                                   | Accepté |
| [0009](0009-profile-requests-and-authority-access.md)  | Demandes de profil distinctes du statut de compte et accès Autorité au back-office | Accepté |
| [0010](0010-confidential-source-documents.md)          | Documents sources confidentiels hors du dépôt                                      | Accepté |
| [0011](0011-provisional-theme-and-brand-guidelines.md) | Thème graphique provisoire et passage à la charte GOSAFE                           | Accepté |

## Modèle

```markdown
# ADR-XXXX : Titre

- Statut : Proposé | Accepté | Remplacé par ADR-YYYY | Abandonné
- Date : AAAA-MM-JJ
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

## Décision

## Conséquences

## Alternatives étudiées
```
