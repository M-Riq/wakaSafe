# 1. Diagramme de cas d'utilisation

> Source de vérité de ce diagramme. Toute modification doit être reportée dans le [README](../../README.md).
> Une version PlantUML en notation UML stricte est disponible dans [`01-use-cases.puml`](01-use-cases.puml).

Mermaid ne propose pas de type « cas d'utilisation » natif. La notation est reproduite avec un flowchart :

- **acteurs** : rectangles avec l'icône 👤, à gauche ;
- **cas d'utilisation** : ellipses (formes arrondies), regroupées par module ;
- **frontières du système** : un cadre par application (client Expo, back-office Next.js) ;
- **généralisation** : flèche pointillée « est un » (le Conducteur et l'Autorité héritent de tous les cas du Citoyen) ;
- **optionnel (M4, M8)** : cas grisés, à arbitrer (phase 10).

```mermaid
flowchart LR
    CIT["👤 Citoyen"]
    DRV["👤 Conducteur d'agence"]
    AUT["👤 Autorité"]
    ADM["👤 Administrateur"]
    SC["👤 Contact de sécurité"]

    DRV -. "est un" .-> CIT
    AUT -. "est un" .-> CIT

    subgraph CLIENT["Application client — apps/mobile (Expo : web + Android)"]
        direction TB
        subgraph M1["M1 Comptes et profils"]
            UC1(["S'inscrire et choisir son profil"])
            UC2(["Se connecter / réinitialiser le mot de passe"])
            UC3(["Téléverser ses justificatifs"])
            UC4(["Gérer profil, préférences et contacts de sécurité"])
        end
        subgraph M2["M2 Signalements"]
            UC5(["Signaler un danger"])
            UC6(["Consulter la carte publique et filtrer"])
            UC7(["Valider / infirmer un signalement"])
        end
        subgraph M3["M3 Hors ligne"]
            UC8(["Confirmer la synchronisation des signalements hors ligne"])
        end
        subgraph M5["M5 Quiz, points, classements"]
            UC9(["Répondre au quiz du jour (5 questions max)"])
            UC10(["Consulter score, progression et classements"])
        end
        subgraph M6["M6 Évaluations"]
            UC11(["Évaluer un conducteur"])
            UC12(["Consulter les classements conducteurs et agences"])
            UC13(["Consulter ses statistiques de conducteur"])
        end
        subgraph M7["M7 Notifications"]
            UC14(["Recevoir et consulter ses notifications"])
        end
        subgraph OPT["M4 / M8 — optionnels, à arbitrer"]
            UC15(["Partager un trajet"])
            UC17(["Utiliser le mode conduite simplifié"])
        end
    end

    subgraph TRACK["Page web publique de suivi — emplacement à définir (ADR phase 10)"]
        UC16(["Suivre un trajet partagé sans installer l'app"])
    end

    subgraph ADMIN["Back-office — apps/admin (Next.js, web)"]
        direction TB
        UC20(["Se connecter au back-office"])
        UC21(["Valider / refuser un profil (justificatifs)"])
        UC22(["Modérer signalements suspects et comptes"])
        UC23(["Créer, modifier, activer les quiz"])
        UC24(["Consulter le tableau de bord KPI et la heatmap"])
        UC25(["Exporter les statistiques en CSV"])
        UC26(["Vue Autorité : carte, filtres, « pris en charge »"])
    end

    CIT --- UC1 & UC2 & UC3 & UC4
    CIT --- UC5 & UC6 & UC7 & UC8
    CIT --- UC9 & UC10 & UC11 & UC12 & UC14
    CIT -.- UC15 & UC17
    DRV --- UC13
    AUT --- UC20 & UC26
    ADM --- UC20 & UC21 & UC22 & UC23 & UC24 & UC25 & UC26
    SC -.- UC16

    classDef actor fill:#ffffff,stroke:#1f2937,stroke-width:2px,color:#111827
    classDef usecase fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
    classDef optional fill:#f3f4f6,stroke:#9ca3af,stroke-dasharray:5 5,color:#4b5563
    class CIT,DRV,AUT,ADM,SC actor
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14 usecase
    class UC20,UC21,UC22,UC23,UC24,UC25,UC26 usecase
    class UC15,UC16,UC17 optional
```

## Lecture

| Acteur              | Application       | Cas d'utilisation                                                                                                                                                |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Citoyen             | Client            | UC1 à UC12, UC14 (et UC15, UC17 si M4/M8 activés)                                                                                                                |
| Conducteur d'agence | Client            | Tous ceux du Citoyen + UC13. UC3 obligatoire (identité, permis, agence affiliée).                                                                                |
| Autorité            | Client + Admin    | Tous ceux du Citoyen dans l'app client ; dans l'admin, uniquement UC20 et UC26 (vue Autorité, [ADR-0009](../adr/0009-profile-requests-and-authority-access.md)). |
| Administrateur      | Admin             | UC20 à UC26. Compte créé par le prestataire, pas d'inscription publique.                                                                                         |
| Contact de sécurité | Page web publique | UC16 (M4, optionnel).                                                                                                                                            |

Règle validée ([ADR-0009](../adr/0009-profile-requests-and-authority-access.md)) : tant que la demande de profil Conducteur ou Autorité est en attente, l'utilisateur dispose des droits Citoyen. Les cas UC13 et UC26 sont verrouillés jusqu'à la validation.
