# ADR-0007 : Notifications, centre in-app d'abord et FCM plus tard

- Statut : **Accepté** (recommandation validée le 2026-11-18)
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

Le cahier des charges classe M7 comme **obligatoire** (§2.1), mais le devis indique le poste « Notifications push (FCM) » comme « pas nécessaire ». De plus, une partie de F7.2 (alertes de trajet) et de F9.5 (KPI « trajets partagés ») dépend de M4, qui n'est pas dans le périmètre 2.1.

## Décision

1. M7 reste dans le MVP sous la forme d'un **centre de notifications dans l'app** et de **toasts** qui simulent les push (F7.1 danger à proximité, F7.2 rappel de quiz et infos des autorités, F7.3 mode visuel, plus les décisions de profil et les sanctions).
2. Une interface `NotificationService` (envoi local, abonnement, permissions) est prévue pour brancher **Firebase Cloud Messaging** plus tard, sans toucher aux features.
3. Les éléments qui dépendent de M4 (alertes de trajet, KPI « trajets partagés ») sont affichés **« Non disponible : partage de trajet non activé »** tant que la phase 10 n'est pas confirmée.

## Conséquences

- ✅ La démo montre l'expérience complète des notifications, sans compte Firebase.
- ⚠️ Les vraies notifications push (application fermée) ne fonctionneront qu'après l'intégration de FCM, à planifier avec le backend (phase 12).
