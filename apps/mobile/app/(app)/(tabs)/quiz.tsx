import { fr } from '@/lib/i18n';
import { ComingSoonView } from '@/ui';

export default function QuizTab() {
  return <ComingSoonView testID="coming-soon-quiz" icon="school-outline" {...fr.comingSoon.quiz} />;
}
