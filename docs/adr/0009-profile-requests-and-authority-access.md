# ADR-0009 : Demandes de profil distinctes du statut de compte et accès Autorité au back-office

- Statut : **Accepté** (recommandations validées le 2026-11-18)
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

- F1.3 : le Citoyen est activé immédiatement, le Conducteur et l'Autorité sont « en attente » jusqu'à validation.
- Le cahier des charges (§3) précise que le Conducteur et l'Autorité ont **tous les droits du Citoyen**, plus des droits spécifiques.
- L'Autorité doit consulter la carte, les heatmaps et les alertes critiques, et marquer un signalement « pris en charge ». Or la vue Autorité simplifiée (F9.7) se trouve dans `apps/admin`.

## Décision

1. **Deux cycles de vie distincts** :
   - le **compte** (`AccountStatus`) : `ACTIVE` ou `SUSPENDED` ;
   - la **demande de profil** (`ProfileRequest.status`) : `PENDING`, puis `APPROVED` ou `REJECTED`.
2. Pendant l'attente, l'utilisateur utilise l'app avec les **droits Citoyen**. Les fonctions Conducteur ou Autorité sont verrouillées, avec un bandeau « Demande en attente ».
3. En cas de **refus**, l'utilisateur reste Citoyen et reçoit le motif. Il peut soumettre une nouvelle demande (hypothèse à confirmer par GOSAFE).
4. L'**Autorité** utilise l'app client pour les fonctions Citoyen. Elle se connecte au back-office **avec les mêmes identifiants** et n'y voit que la **Vue Autorité** (F9.7) : carte, filtres, heatmap, alertes critiques, statut « pris en charge ». Toutes les autres pages de l'admin lui sont interdites.

## Conséquences

- ✅ Pas de blocage à l'inscription, ce qui favorise l'adoption pendant le pilote.
- ✅ Contrôle d'accès simple par rôle dans les deux apps.
- ⚠️ En démo, les données mock ne sont pas partagées entre les apps : le compte Autorité de démonstration existe dans les deux jeux de données de départ.
