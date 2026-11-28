import 'leaflet/dist/leaflet.css';

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AttributionControl,
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import { getAppConfig } from '@/lib/config';

import { colors, radii, sizes } from '../theme';
import type { AppMapProps, MapPoint } from './types';

/** Leaflet map with OpenStreetMap tiles (ADR-0006). Markers are vector circles: no image assets. */
export const canShowInteractiveMap: boolean = true;

const MARKER_RADIUS = 9;
/** Plain credit: Leaflet's default prefix also shows a national flag. */
const LEAFLET_PREFIX = '<a href="https://leafletjs.com">Leaflet</a>';

function ViewController({ center, zoom }: { center: MapPoint; zoom: number }) {
  const map = useMap();
  const { latitude, longitude } = center;
  useEffect(() => {
    map.setView([latitude, longitude], zoom);
  }, [map, latitude, longitude, zoom]);
  return null;
}

function PickHandler({ onPick }: { onPick: (point: MapPoint) => void }) {
  useMapEvents({
    click: (event) => onPick({ latitude: event.latlng.lat, longitude: event.latlng.lng }),
  });
  return null;
}

export function AppMap({
  markers,
  center,
  zoom,
  height,
  accessibilityLabel,
  onMarkerPress,
  onPickLocation,
  testID,
}: AppMapProps) {
  const { mapTileUrl, mapAttribution } = getAppConfig();
  return (
    <View
      testID={testID}
      role="region"
      aria-label={accessibilityLabel}
      style={[styles.frame, { height }]}
    >
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={zoom}
        scrollWheelZoom={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <AttributionControl prefix={LEAFLET_PREFIX} />
        <TileLayer url={mapTileUrl} attribution={mapAttribution} />
        {markers.map((marker) => (
          <CircleMarker
            key={marker.id}
            center={[marker.latitude, marker.longitude]}
            radius={MARKER_RADIUS}
            pathOptions={{
              color: colors.surface,
              weight: sizes.borderWidthStrong,
              fillColor: marker.color,
              fillOpacity: 0.9,
            }}
            eventHandlers={onMarkerPress ? { click: () => onMarkerPress(marker.id) } : undefined}
          >
            <Tooltip>{marker.label}</Tooltip>
          </CircleMarker>
        ))}
        <ViewController center={center} zoom={zoom} />
        {onPickLocation && <PickHandler onPick={onPickLocation} />}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  // zIndex 0 keeps Leaflet's panes (z-index 400+) below the app's overlays.
  frame: {
    width: '100%',
    zIndex: 0,
    overflow: 'hidden',
    borderRadius: radii.lg,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
  },
});
