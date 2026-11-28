import { fr } from '@/lib/i18n';

import { Banner } from '../Banner';
import type { AppMapProps } from './types';

/**
 * Android fallback until the MapLibre map (ADR-0006): screens list the same reports below.
 * The web uses AppMap.web.tsx (Leaflet).
 */
export const canShowInteractiveMap: boolean = false;

export function AppMap({ testID }: AppMapProps) {
  return (
    <Banner
      tone="info"
      icon="map-outline"
      title={fr.reportMap.mapSoonTitle}
      testID={testID ? `${testID}-fallback` : undefined}
    >
      {fr.reportMap.mapSoonBody}
    </Banner>
  );
}
