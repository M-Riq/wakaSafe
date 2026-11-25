import type { Preferences } from '@wakasafe/domain';
import { useState } from 'react';

import { format, fr } from '@/lib/i18n';
import {
  Banner,
  Button,
  Card,
  ChoiceGroup,
  ErrorView,
  InfoRow,
  LoadingView,
  Screen,
  SwitchRow,
  type Choice,
} from '@/ui';

import { FormError } from '../components/FormError';
import { useUpdatePreferences } from '../hooks/useAccountMutations';
import { usePreferences } from '../hooks/useProfileData';
import { useCurrentUser } from '../hooks/useSession';

const RADIUS_OPTIONS_KM = [1, 2, 5, 10];

/** F1.5 / F7: notification preferences. French is the only language of the MVP. */
export function PreferencesScreen() {
  const user = useCurrentUser();
  const preferences = usePreferences(user.id);
  if (preferences.isPending) return <LoadingView />;
  if (preferences.isError) {
    return (
      <Screen>
        <ErrorView error={preferences.error} onRetry={() => void preferences.refetch()} />
      </Screen>
    );
  }
  return <PreferencesForm initial={preferences.data} />;
}

function PreferencesForm({ initial }: { initial: Preferences }) {
  const updatePreferences = useUpdatePreferences();
  const [draft, setDraft] = useState(initial);

  function change(update: Partial<Preferences>) {
    updatePreferences.reset();
    setDraft((prev) => ({ ...prev, ...update }));
  }

  const radiusOptions: Choice<string>[] = [...new Set([...RADIUS_OPTIONS_KM, draft.nearbyRadiusKm])]
    .sort((a, b) => a - b)
    .map((km) => ({ value: String(km), label: format(fr.preferences.radiusValue, { km }) }));

  return (
    <Screen testID="preferences">
      <Card>
        <SwitchRow
          label={fr.profile.nearbyAlerts}
          hint={fr.preferences.nearbyAlertsHint}
          value={draft.nearbyDangerAlerts}
          onValueChange={(nearbyDangerAlerts) => change({ nearbyDangerAlerts })}
          testID="preferences-nearby-alerts"
        />
        {draft.nearbyDangerAlerts && (
          <ChoiceGroup
            label={fr.preferences.radius}
            options={radiusOptions}
            value={String(draft.nearbyRadiusKm)}
            onChange={(value) => change({ nearbyRadiusKm: Number(value) })}
            inline
            testID="preferences-radius"
          />
        )}
        <SwitchRow
          label={fr.profile.quizReminders}
          hint={fr.preferences.quizRemindersHint}
          value={draft.quizReminders}
          onValueChange={(quizReminders) => change({ quizReminders })}
          testID="preferences-quiz-reminders"
        />
        <InfoRow
          icon="language-outline"
          label={fr.preferences.language}
          value={fr.preferences.languageValue}
        />
      </Card>
      <FormError error={updatePreferences.error} />
      {updatePreferences.isSuccess && (
        <Banner tone="success" title={fr.common.saved} testID="preferences-saved" />
      )}
      <Button
        label={fr.common.save}
        icon="checkmark-outline"
        loading={updatePreferences.isPending}
        onPress={() =>
          updatePreferences.mutate({
            nearbyDangerAlerts: draft.nearbyDangerAlerts,
            nearbyRadiusKm: draft.nearbyRadiusKm,
            quizReminders: draft.quizReminders,
          })
        }
        testID="preferences-save"
      />
    </Screen>
  );
}
