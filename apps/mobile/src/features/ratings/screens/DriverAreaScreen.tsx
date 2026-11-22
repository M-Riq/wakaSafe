import { StyleSheet, View } from 'react-native';

import { useAgency, useCurrentUser, useLatestProfileRequest } from '@/features/accounts';
import { format, fr } from '@/lib/i18n';
import { AppText, Badge, Banner, Card, InfoRow, Screen, spacing } from '@/ui';

/** Driver area (F6.4). Route guarded by role: validated drivers only. */
export function DriverAreaScreen() {
  const user = useCurrentUser();
  const request = useLatestProfileRequest(user.id);
  const agency = useAgency(request.data?.agencyId);

  return (
    <Screen testID="driver-area">
      <Card>
        <View style={styles.header}>
          <AppText variant="title" style={styles.title}>
            {`${user.firstName} ${user.lastName}`}
          </AppText>
          <Badge label={fr.enums.role.DRIVER} tone="primary" icon="bus-outline" />
        </View>
        <AppText tone="muted">{fr.driver.intro}</AppText>
        {agency.data && (
          <InfoRow
            icon="business-outline"
            label={fr.driver.agency}
            value={`${agency.data.name} · ${agency.data.city}`}
          />
        )}
      </Card>
      <Banner tone="info" title={format(fr.comingSoon.plannedIn, { phase: 6 })}>
        {fr.driver.statsSoon}
      </Banner>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  title: { flexShrink: 1 },
});
