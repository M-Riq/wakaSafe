# 6. Diagrammes d'états

> Source de vérité de ces diagrammes. Toute modification doit être reportée dans le [README](../../README.md).

## 6.1 Cycle de vie d'un compte et d'une demande de profil

Conformément à [ADR-0009](../adr/0009-profile-requests-and-authority-access.md), l'état « en attente » ne bloque pas le compte. Il porte sur la **demande de profil** Conducteur ou Autorité. Le compte lui-même est soit actif, soit suspendu.

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Actif : inscription (droits Citoyen immédiats)

    state Actif {
        direction LR
        state "Demande en attente de validation" as DemandeEnAttente
        state "Profil validé" as ProfilValidé
        [*] --> Citoyen
        Citoyen --> DemandeEnAttente : demande Conducteur ou Autorité + justificatifs
        DemandeEnAttente --> ProfilValidé : validation par un administrateur
        DemandeEnAttente --> Citoyen : refus (motif notifié)
        ProfilValidé --> [*]
        DemandeEnAttente : droits Citoyen, fonctions spécifiques verrouillées
        ProfilValidé : Conducteur ou Autorité actif
    }

    state "Suspendu" as Suspendu
    Actif --> Suspendu : abus répétés (suspension temporaire automatique, F2.6)
    Actif --> Suspendu : décision de modération (F9.3)
    Suspendu --> Actif : fin de la suspension temporaire
    Suspendu --> Actif : réactivation par un administrateur (F9.3)
    Suspendu : connexion possible en lecture seule
    Suspendu : aucune action (signaler, voter, évaluer, quiz)
```

Les comptes Administrateur sont créés directement à l'état `Actif` par le prestataire, sans inscription publique.

## 6.2 Cycle de vie d'un signalement

```mermaid
stateDiagram-v2
    direction TB
    state "En attente de synchronisation" as EnAttenteDeSynchro
    state "Suspect" as Suspect
    state "Infirmé" as Infirmé
    state "Pris en charge" as PrisEnCharge
    [*] --> EnAttenteDeSynchro : créé hors ligne (F3.1)
    EnAttenteDeSynchro --> Créé : synchronisation confirmée (F3.2)
    [*] --> Créé : créé en ligne

    Créé --> Validé : confirmations ≥ seuil de validation (F2.4)
    Créé --> Infirmé : infirmations ≥ seuil d'infirmation (F2.4)
    Créé --> Suspect : fréquence anormale de l'auteur (F2.5)
    Validé --> Suspect : fortement contesté après validation (F2.5)

    Suspect --> Validé : maintenu par un administrateur (F9.3)
    Suspect --> Infirmé : infirmé par un administrateur (F9.3)

    Créé --> PrisEnCharge : marqué par une Autorité (F9.7)
    Validé --> PrisEnCharge : marqué par une Autorité (F9.7)
    PrisEnCharge --> Clos : danger résolu
    Validé --> Clos : expiration ou clôture par un administrateur
    Infirmé --> [*]
    Clos --> [*]

    EnAttenteDeSynchro : stockage local uniquement, icône « hors ligne »
    Suspect : masqué de la carte publique, dans la file de modération
    Infirmé : masqué de la carte publique
    PrisEnCharge : visible sur la carte avec ce statut
```

| État                          | Code (`ReportStatus`)      | Visible sur la carte publique                 |
| ----------------------------- | -------------------------- | --------------------------------------------- |
| En attente de synchronisation | _(local, `PendingReport`)_ | Non (seulement dans l'historique de l'auteur) |
| Créé                          | `CREATED`                  | Oui, avec la mention « non vérifié »          |
| Validé                        | `VALIDATED`                | Oui                                           |
| Infirmé                       | `INVALIDATED`              | Non                                           |
| Suspect                       | `SUSPICIOUS`               | Non                                           |
| Pris en charge                | `HANDLED`                  | Oui                                           |
| Clos                          | `CLOSED`                   | Non (historique et statistiques uniquement)   |

Les seuils et la durée d'expiration sont provisoires et configurables ([règles métier](../architecture/business-rules.md)).
