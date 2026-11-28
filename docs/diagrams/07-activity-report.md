# 7. Diagramme d'activité : « Signaler un danger » (en ligne et hors ligne)

> Source de vérité de ce diagramme. Toute modification doit être reportée dans le [README](../../README.md).
> Exigences : F2.1, F2.2, F2.6, F3.1, F3.2, F7.1.

```mermaid
flowchart TD
    START((Début)) --> A["Appuyer sur « Signaler »"]
    A --> B{"Compte suspendu<br/>ou quota atteint ? (F2.6)"}
    B -- Oui --> B1["Afficher la raison<br/>et la date de fin"] --> END1((Fin))
    B -- Non --> C["Récupérer la position GPS<br/>automatiquement"]
    C --> C1{"Position obtenue ?"}
    C1 -- Non --> C2["Expliquer la permission,<br/>proposer de choisir la ville<br/>ou de placer le point sur la carte (web)"]
    C2 --> D
    C1 -- Oui --> D["Choisir la catégorie (F2.1)"]
    D --> E["Choisir la gravité<br/>et les personnes concernées"]
    E --> F{"Ajouter une photo ?"}
    F -- Oui --> F1["Caméra ou galerie<br/>(sélecteur de fichier sur le web)<br/>puis compression"] --> G
    F -- Non --> G["Récapitulatif<br/>(date et heure automatiques)"]
    G --> H["Envoyer"]
    H --> I{"Réseau disponible ?"}

    I -- Oui --> J["Envoyer au ReportRepository"]
    J --> J1{"Envoi réussi ?"}
    J1 -- Oui --> K["Afficher la confirmation<br/>et le point sur la carte"]
    K --> K1["Alerter les utilisateurs proches<br/>(notification simulée, F7.1)"] --> END2((Fin))
    J1 -- "Non (erreur réseau)" --> L

    I -- Non --> L["Enregistrer dans la file locale<br/>(StorageService)"]
    L --> L1["Afficher dans l'historique<br/>avec l'icône « hors ligne » (F3.1)"]
    L1 --> M[/"Attendre le retour du réseau"/]
    M --> N["Demander confirmation :<br/>« N signalements en attente. Envoyer ? » (F3.2)"]
    N --> O{"Confirmé ?"}
    O -- Non --> O1["Conserver la file<br/>(bouton « Synchroniser » dans l'historique)"] --> M
    O -- Oui --> P["Envoyer chaque signalement<br/>(identifiant client idempotent)"]
    P --> Q{"Tous envoyés ?"}
    Q -- Oui --> R["Vider la file<br/>et afficher le bilan"] --> END3((Fin))
    Q -- Non --> S["Marquer les échecs<br/>et proposer « Réessayer »"] --> M
```
