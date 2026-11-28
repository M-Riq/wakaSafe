import {
  nearestPilotCity,
  PILOT_CITIES,
  PILOT_CITY_CENTERS,
  type GeoPoint,
  type PilotCity,
} from '@wakasafe/domain';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { format, fr } from '@/lib/i18n';
import { locateDevice, type LocateResult } from '@/services/location';
import { AppText, Banner, Button, ChoiceGroup, colors, Icon, sizes, spacing } from '@/ui';
import { AppMap, canShowInteractiveMap, type MapPoint } from '@/ui/map';

import { mapViewFor } from '../filters';

export type LocationSource = 'gps' | 'map' | 'city';

export interface PlacedLocation {
  point: GeoPoint;
  source: LocationSource;
}

type LocateStatus = 'locating' | 'located' | 'denied' | 'unavailable';

interface LocationFieldProps {
  value: PlacedLocation | null;
  onChange: (location: PlacedLocation) => void;
  error?: string;
}

const PICK_MAP_HEIGHT = 240;
const PRECISE_ZOOM = 16;

/**
 * F2.2 automatic GPS position. If it is refused or unavailable, the user picks the city
 * (its centre) and, on the web, can tap the map to place the danger precisely.
 */
export function LocationField({ value, onChange, error }: LocationFieldProps) {
  const [status, setStatus] = useState<LocateStatus>('locating');
  // The latest callback, so that locating runs once on mount and on "retry" only.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const applyResult = useCallback((result: LocateResult) => {
    if (result.status === 'located') onChangeRef.current({ point: result.point, source: 'gps' });
    setStatus(result.status);
  }, []);

  useEffect(() => {
    let active = true;
    void locateDevice().then((result) => {
      if (active) applyResult(result);
    });
    return () => {
      active = false;
    };
  }, [applyResult]);

  function retry() {
    setStatus('locating');
    void locateDevice().then(applyResult);
  }

  const failed = status === 'denied' || status === 'unavailable';
  const selectedCity: PilotCity | null =
    value?.source === 'city' ? nearestPilotCity(value.point) : null;

  function pickCity(city: PilotCity) {
    onChange({ point: { ...PILOT_CITY_CENTERS[city], accuracyMeters: null }, source: 'city' });
  }

  function pickOnMap(point: MapPoint) {
    onChange({ point: { ...point, accuracyMeters: null }, source: 'map' });
  }

  const view = value
    ? {
        center: value.point,
        zoom: value.source === 'city' ? mapViewFor(selectedCity).zoom : PRECISE_ZOOM,
      }
    : mapViewFor(null);

  return (
    <View style={styles.wrapper} testID="report-location">
      <AppText variant="label">{fr.reportForm.location}</AppText>
      {status === 'locating' && (
        <View style={styles.row} aria-busy>
          <Icon name="locate-outline" size={sizes.iconSm} color={colors.textMuted} />
          <AppText variant="caption" tone="muted" accessibilityLiveRegion="polite">
            {fr.reportForm.locating}
          </AppText>
        </View>
      )}
      {failed && (
        <Banner
          tone="warning"
          icon="location-outline"
          title={
            status === 'denied' ? fr.reportForm.locationDenied : fr.reportForm.locationUnavailable
          }
          testID="report-location-failed"
        >
          {fr.reportForm.locationFallback}
        </Banner>
      )}
      {failed && (
        <ChoiceGroup
          label={fr.reportForm.city}
          options={PILOT_CITIES.map((city) => ({ value: city, label: city }))}
          value={selectedCity}
          onChange={pickCity}
          inline
          testID="report-city"
        />
      )}
      {value && <LocationSummary value={value} />}
      {canShowInteractiveMap && (status !== 'locating' || value) && (
        <>
          <AppText variant="caption" tone="muted">
            {value ? fr.reportForm.adjustOnMap : fr.reportForm.pickOnMap}
          </AppText>
          <AppMap
            markers={
              value
                ? [
                    {
                      id: 'draft',
                      latitude: value.point.latitude,
                      longitude: value.point.longitude,
                      color: colors.primary,
                      label: fr.reportForm.location,
                    },
                  ]
                : []
            }
            center={view.center}
            zoom={view.zoom}
            height={PICK_MAP_HEIGHT}
            accessibilityLabel={fr.reportForm.location}
            onPickLocation={pickOnMap}
            testID="report-location-map"
          />
        </>
      )}
      {failed && (
        <Button
          label={fr.reportForm.retryLocation}
          variant="ghost"
          icon="locate-outline"
          onPress={retry}
          testID="report-location-retry"
        />
      )}
      {error && (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}

function LocationSummary({ value }: { value: PlacedLocation }) {
  const city = nearestPilotCity(value.point);
  const { accuracyMeters } = value.point;
  const description =
    value.source === 'gps'
      ? accuracyMeters === null
        ? fr.reportForm.locatedNoAccuracy
        : format(fr.reportForm.located, { meters: accuracyMeters })
      : value.source === 'map'
        ? fr.reportForm.pickedOnMap
        : format(fr.reportForm.cityCenter, { city });
  return (
    <View style={styles.summary} testID={`report-location-${value.source}`}>
      <View style={styles.row}>
        <Icon name="location" size={sizes.iconSm} color={colors.success} />
        <AppText variant="caption">{description}</AppText>
      </View>
      <AppText variant="caption" tone="muted" testID="report-location-zone">
        {format(fr.reportForm.zone, { city })}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  summary: { gap: spacing.xxs },
});
