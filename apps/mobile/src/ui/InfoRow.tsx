import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, spacing } from './theme';

interface InfoRowProps {
  label: string;
  value: string;
  icon?: IconName;
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}\u00A0: ${value}`}>
      {icon && <Icon name={icon} color={colors.textMuted} />}
      <View style={styles.text}>
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>
        <AppText>{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: spacing.xxs },
});
