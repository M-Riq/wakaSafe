export interface MapPoint {
  latitude: number;
  longitude: number;
}

export interface MapMarker extends MapPoint {
  id: string;
  /** Fill colour, from the design tokens (e.g. the severity scale). */
  color: string;
  /** Shown on hover and announced by screen readers. */
  label: string;
}

export interface AppMapProps {
  markers: readonly MapMarker[];
  center: MapPoint;
  zoom: number;
  height: number;
  accessibilityLabel: string;
  onMarkerPress?: (id: string) => void;
  /** Lets the user place a point by tapping the map. */
  onPickLocation?: (point: MapPoint) => void;
  testID?: string;
}
