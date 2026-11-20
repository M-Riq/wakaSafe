# 9. Diagramme de déploiement

> Source de vérité de ces diagrammes. Toute modification doit être reportée dans le [README](../../README.md).
> Décision associée : [ADR-0008](../adr/0008-demo-hosting-vercel.md).

## 9.1 Démo actuelle (phases 1 à 11) : deux front-ends statiques, données mock locales

```mermaid
flowchart LR
    DEV["💻 Développeur"] -->|"push de la branche de phase"| GH["GitHub<br/>M-Riq/wakaSafe"]
    GH -->|"pull request"| CI["GitHub Actions<br/>lint, typecheck, tests, build des 2 apps"]
    GH -->|"intégration Git"| V1
    GH -->|"intégration Git"| V2

    subgraph VERCEL["Vercel — 2 projets, prévisualisation par PR"]
        V1["Projet « wakasafe-client »<br/>apps/mobile<br/>expo export --platform web (site statique)"]
        V2["Projet « wakasafe-admin »<br/>apps/admin<br/>build Next.js"]
    end

    subgraph BROWSER_C["Navigateur (mobile ou desktop)"]
        C_APP["App client web"]
        C_STO[("Stockage local du navigateur<br/>données mock")]
        C_APP --- C_STO
    end
    subgraph BROWSER_A["Navigateur desktop ou tablette"]
        A_APP["Back-office"]
        A_STO[("Stockage local du navigateur<br/>données mock")]
        A_APP --- A_STO
    end
    subgraph PHONE["Téléphone Android 8+ (phase 11)"]
        P_APP["APK de test<br/>(build de développement Expo)"]
        P_STO[("AsyncStorage<br/>données mock")]
        P_APP --- P_STO
    end

    V1 -->|"URL client"| C_APP
    V2 -->|"URL admin"| A_APP
    OSM["Tuiles OpenStreetMap"] --> C_APP
    OSM --> A_APP
    OSM --> P_APP

    C_STO -.-|"aucune synchronisation en démo"| A_STO
```

## 9.2 Cible finale (phase 12 et suivantes)

```mermaid
flowchart LR
    subgraph USERS["Utilisateurs"]
        AND["📱 App Android<br/>(Google Play)"]
        WEBC["🌐 App client web"]
        WEBA["🖥️ Back-office Next.js"]
        TRK["🌐 Page de suivi de trajet<br/>(M4, optionnel)"]
    end

    subgraph HOSTING["Hébergement front-end"]
        H1["Hébergement statique<br/>app client web"]
        H2["Hébergement Next.js<br/>back-office"]
    end

    subgraph VPS["Serveur cloud (VPS) — compte GOSAFE"]
        RP["Reverse proxy HTTPS"]
        API["API REST Node.js + TypeScript<br/>auth, rôles, règles métier, anti-abus"]
        JOBS["Tâches planifiées<br/>classements, expirations, rappels de quiz"]
        RP --> API
        JOBS --> DB
    end

    DB[("Base de données<br/>PostgreSQL + PostGIS ou MySQL<br/>sauvegardes automatiques")]
    S3[("Stockage objet S3<br/>photos, justificatifs (privé)")]
    FCM["Firebase Cloud Messaging"]
    CRASH["Firebase Crashlytics et Analytics"]
    TILES["Fournisseur de tuiles OSM"]

    WEBC --> H1
    WEBA --> H2
    AND -->|"HTTPS"| RP
    H1 -->|"HTTPS"| RP
    H2 -->|"HTTPS"| RP
    TRK -->|"HTTPS"| RP
    API --> DB
    API --> S3
    API --> FCM
    FCM -->|"push"| AND
    AND --> CRASH
    AND --> TILES
    WEBC --> TILES
    WEBA --> TILES
```

Points ouverts pour la cible : l'hébergeur du VPS, le fournisseur de tuiles (la politique d'usage de `tile.openstreetmap.org` interdit un usage intensif en production) et l'option Supabase, qui remplacerait l'API, la base et le stockage. Tous les comptes sont créés au nom de GOSAFE.
