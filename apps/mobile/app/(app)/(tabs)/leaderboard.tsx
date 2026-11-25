import { fr } from '@/lib/i18n';
import { ComingSoonView } from '@/ui';

export default function LeaderboardTab() {
  return (
    <ComingSoonView
      testID="coming-soon-leaderboard"
      icon="trophy-outline"
      {...fr.comingSoon.leaderboard}
    />
  );
}
