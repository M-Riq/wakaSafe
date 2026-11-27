import { Image, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { colors, radii, sizes, spacing } from './theme';

interface AvatarProps {
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  size?: number;
}

/** Profile photo, or the initials when there is none. Decorative: the name is shown next to it. */
export function Avatar({
  firstName,
  lastName,
  photoUrl,
  size = sizes.touchTarget + spacing.lg,
}: AvatarProps) {
  const frame = { width: size, height: size, borderRadius: radii.pill };
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={[styles.photo, frame]} aria-hidden />;
  }
  const initials = `${firstName.trim()[0] ?? ''}${lastName.trim()[0] ?? ''}`.toUpperCase();
  return (
    <View style={[styles.initials, frame]} aria-hidden>
      {initials ? (
        <AppText variant="heading" tone="inverse">
          {initials}
        </AppText>
      ) : (
        <Icon name="person" color={colors.onPrimary} size={size / 2} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { backgroundColor: colors.surfaceMuted },
  initials: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
});
