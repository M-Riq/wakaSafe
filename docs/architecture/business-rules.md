# Règles métier et paramètres provisoires

Le cahier des charges fixe les **règles** mais pas toujours les **valeurs**. Les valeurs ci-dessous sont des **propositions provisoires**, centralisées dans l'objet `BUSINESS_RULES` de [`packages/domain/src/config/business-rules.ts`](../../packages/domain/src/config/business-rules.ts) et modifiables à un seul endroit. Elles doivent être **validées par GOSAFE**.

| Paramètre                                   | Exigence   | Valeur proposée                                                                                                            | Statut       |
| ------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Règle du mot de passe                       | F1.1, F1.2 | Au moins 8 caractères, dont au moins une lettre et un chiffre                                                              | À valider    |
| Code de réinitialisation du mot de passe    | F1.2       | 6 chiffres envoyés par SMS, valable 10 minutes, invalidé après 5 essais erronés (affiché à l'écran en démo)                | À valider    |
| Nombre maximal de contacts de sécurité      | F1.5       | 5                                                                                                                          | À valider    |
| Niveaux de gravité                          | F2.2       | Faible, Moyenne, Élevée, Critique                                                                                          | À valider    |
| Catégories de personnes concernées          | F2.2       | Piétons, Motocyclistes (moto-taxis), Automobilistes, Usagers des transports en commun, Enfants et élèves, Tous les usagers | À valider    |
| Seuil de validation d'un signalement        | F2.4       | 3 confirmations                                                                                                            | À valider    |
| Seuil d'infirmation                         | F2.4       | 3 infirmations, et plus d'infirmations que de confirmations                                                                | À valider    |
| Signalement validé « fortement contesté »   | F2.5       | au moins 3 infirmations après validation → Suspect                                                                         | À valider    |
| Fréquence anormale d'un auteur              | F2.5       | plus de 5 signalements en 10 minutes                                                                                       | À valider    |
| Quota de signalements                       | F2.6       | 10 par 24 h glissantes                                                                                                     | À valider    |
| Quota de votes (valider/infirmer)           | F2.6       | 30 par 24 h glissantes                                                                                                     | À valider    |
| Dépassement d'un quota                      | F2.6       | L'action est refusée (sans alerte d'abus) jusqu'à ce qu'une place se libère dans la fenêtre de 24 h                        | À valider    |
| Alerte d'abus                               | F2.5, F2.6 | Un signalement envoyé en fréquence anormale : il passe « Suspect » et rejoint la file de modération                        | À valider    |
| Suspension temporaire automatique           | F2.6       | 3 alertes d'abus en 7 jours → suspension 72 h                                                                              | À valider    |
| Avis sur un signalement                     | F2.4       | Un avis définitif par personne ; aucun avis sur son propre signalement ; avis possibles en attente ou validé seulement     | À valider    |
| Signalements visibles sur la carte publique | F2.3       | En attente de confirmation, Validé, Pris en charge. Les signalements infirmés, suspects ou clôturés sont masqués           | À valider    |
| Zone d'un signalement                       | F2.3       | Ville pilote la plus proche de la position (Yaoundé, Douala ou Bafoussam) ; le filtre « zone » choisit une de ces villes   | À valider    |
| Position sans GPS                           | F2.2       | Choix de la ville (centre-ville) ou point placé sur la carte (web) si la position est refusée ou introuvable               | À valider    |
| Effet d'une suspension                      | F2.6, F9.3 | Connexion en lecture seule : pas de signalement, vote, évaluation, quiz ni demande de profil                               | À valider    |
| Questions de quiz par jour                  | F5.2       | **5** (fixé par le cahier des charges)                                                                                     | Validé       |
| Jour de référence du quiz                   | F5.2       | Jour calendaire, fuseau **Africa/Douala** (UTC+1)                                                                          | À valider    |
| Points : signalement validé                 | F5.3       | +10, versés à l'auteur au passage à « Validé » ; conservés si le signalement est contesté ensuite (décision de modération) | À valider    |
| Points : bonne réponse au quiz              | F5.3       | +2                                                                                                                         | À valider    |
| Points : évaluation d'un conducteur         | F5.3       | +3                                                                                                                         | À valider    |
| Classement mensuel                          | F5.4       | Remis à zéro le 1er de chaque mois à 00:00 (Africa/Douala)                                                                 | Validé (CDC) |
| Classement annuel                           | F5.4       | Année civile                                                                                                               | À valider    |
| Échelle de notation conducteur              | F6.1       | 1 à 5 étoiles par critère                                                                                                  | À valider    |
| Période anti-abus d'évaluation              | F6.3       | Une évaluation par passager et par conducteur tous les **30 jours**                                                        | À valider    |
| Identification du conducteur à évaluer      | F6.1       | Recherche par agence et nom, ou code conducteur affiché dans le véhicule                                                   | À valider    |
| Rayon des alertes de danger à proximité     | F7.1       | 2 km (réglable par l'utilisateur dans ses préférences)                                                                     | À valider    |
| Gravité déclenchant une alerte de proximité | F7.1       | Élevée et Critique                                                                                                         | À valider    |
| Expiration d'un signalement validé          | —          | Clôture automatique après 7 jours sans « pris en charge » (sauf catégories durables : pont, éclairage, feux)               | À valider    |
| Nouvelle demande après refus                | F1.3       | Autorisée                                                                                                                  | À valider    |

Les règles d'avis, de visibilité, de quota et de suspension s'appuient sur ces valeurs dans [`report-rules.ts`](../../packages/domain/src/report-rules.ts) ; la zone et les centres des villes pilotes sont dans [`geo.ts`](../../packages/domain/src/geo.ts).

## Règles fixes (issues du cahier des charges)

- Le profil Citoyen est activé à l'inscription. Les profils Conducteur et Autorité exigent une validation manuelle par un administrateur et des justificatifs : identité, permis et agence affiliée pour le Conducteur, justificatif de fonction pour l'Autorité.
- Les comptes Administrateur sont créés par le prestataire.
- Un signalement contient : catégorie, gravité, catégorie de personnes concernées, date et heure, photo optionnelle, position GPS automatique.
- Hors ligne : enregistrement local, icône « hors ligne » et **confirmation de l'utilisateur** avant la synchronisation.
- Points : historique **daté et traçable**. Chaque `PointEntry` référence l'action qui l'a produit.
- Évaluation sur **4 critères** : présentation et courtoisie, ponctualité, conduite prudente, propreté du véhicule.
