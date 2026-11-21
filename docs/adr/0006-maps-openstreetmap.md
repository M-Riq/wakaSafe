# ADR-0006 : Cartographie OpenStreetMap derrière un composant `AppMap`

- Statut : **Proposé**
- Date : 2026-11-18
- Décideur : Mbassi Rick Bryan (responsable du projet)

## Contexte

La carte est centrale : carte publique (F2.3), vue Autorité et heatmap (F9.5, F9.7). Le cahier des charges retient **OpenStreetMap** (gratuit). L'app client doit fonctionner sur le web et sur Android.

## Décision

- Un composant **`AppMap`** unique dans `apps/mobile/src/ui/map/`, avec une API commune (`center`, `zoom`, `markers`, `onMarkerPress`, `onLongPress` pour placer un point à la main, `userLocation`) :
  - `AppMap.web.tsx` : **Leaflet** + **react-leaflet**, tuiles OSM raster ;
  - `AppMap.native.tsx` : **MapLibre React Native** (`@maplibre/maplibre-react-native`), compatible OSM, **sans clé ni compte Google**.
- Le regroupement des marqueurs (_clustering_) côté client limite la charge sur les téléphones d'entrée de gamme.
- `apps/admin` utilise directement Leaflet + `leaflet.heat` ([ADR-0004](0004-admin-app-stack.md)).
- L'URL des tuiles et l'attribution OSM sont **configurables** (`EXPO_PUBLIC_MAP_TILE_URL`), pour pouvoir changer de fournisseur en production.
- Pendant les phases 1 à 10, la version native peut afficher un écran de repli (liste des signalements). Elle est finalisée en phase 11.

## Conséquences

- ✅ Aucun coût, aucune clé API dans le dépôt.
- ⚠️ MapLibre exige un **build de développement Expo** (module natif) et ne fonctionne pas dans Expo Go. Cela ne concerne que la phase 11.
- ⚠️ La politique d'usage de `tile.openstreetmap.org` tolère la démo mais **pas une production à fort trafic**. Avant la mise en production, il faudra choisir un fournisseur de tuiles ou un hébergement de tuiles (point ouvert).

## Alternatives étudiées

- **react-native-maps** : sur Android, il utilise Google Maps SDK, ce qui demande une clé API et un compte Google Cloud. Les tuiles OSM y sont possibles via `UrlTile`, mais sur un fond Google.
- **WebView + Leaflet sur Android** : un seul code, mais moins fluide et plus gourmand sur les téléphones d'entrée de gamme.
