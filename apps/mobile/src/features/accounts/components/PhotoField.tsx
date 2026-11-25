import { StyleSheet, View } from 'react-native';

import { fr } from '@/lib/i18n';
import { AppText, Avatar, Button, sizes, spacing } from '@/ui';

import { ImageInput } from './ImageInput';

interface PhotoFieldProps {
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  onChange: (photoUrl: string | null) => void;
  hint?: string;
}

/** Optional profile photo (F1.1, F1.5): preview, camera or gallery, removal. */
export function PhotoField({ firstName, lastName, photoUrl, onChange, hint }: PhotoFieldProps) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{fr.form.photo}</AppText>
      <View style={styles.row}>
        <Avatar
          firstName={firstName}
          lastName={lastName}
          photoUrl={photoUrl}
          size={sizes.touchTarget + spacing.lg}
        />
        {hint && (
          <AppText variant="caption" tone="muted" style={styles.hint}>
            {hint}
          </AppText>
        )}
      </View>
      <ImageInput
        purpose="avatar"
        subject={fr.form.photo}
        onPicked={(dataUri) => onChange(dataUri)}
        testID="photo-picker"
      />
      {photoUrl && (
        <Button
          label={fr.imagePicker.removePhoto}
          variant="ghost"
          icon="trash-outline"
          onPress={() => onChange(null)}
          testID="photo-remove"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hint: { flex: 1 },
});
