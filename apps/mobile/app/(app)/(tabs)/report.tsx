import { fr } from '@/lib/i18n';
import { ComingSoonView } from '@/ui';

export default function ReportTab() {
  return (
    <ComingSoonView testID="coming-soon-report" icon="warning-outline" {...fr.comingSoon.report} />
  );
}
