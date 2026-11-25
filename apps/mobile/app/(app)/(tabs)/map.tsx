import { fr } from '@/lib/i18n';
import { ComingSoonView } from '@/ui';

export default function MapTab() {
  return <ComingSoonView testID="coming-soon-map" icon="map-outline" {...fr.comingSoon.map} />;
}
