import { Image, StyleSheet, View } from 'react-native';

import { ImageInput } from '@/features/accounts';
import { fr } from '@/lib/i18n';
import { AppText, Button, colors, radii, spacing } from '@/ui';

interface ReportPhotoFieldProps {
  photoUrl: string | null;
  onChange: (photoUrl: string | null) => void;
}

/** F2.2 optional photo, compressed before it is stored. */
export function ReportPhotoField({ photoUrl, onChange }: ReportPhotoFieldProps) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{fr.reportForm.photo}</AppText>
      <AppText variant="caption" tone="muted">
        {fr.reportForm.photoHint}
      </AppText>
      {photoUrl ? (
        <>
          <Image
            source={{ uri: photoUrl }}
            style={styles.preview}
            resizeMode="cover"
            accessibilityLabel={fr.reportForm.photoAlt}
            testID="report-photo-preview"
          />
          <Button
            label={fr.imagePicker.removePhoto}
            variant="ghost"
            icon="trash-outline"
            onPress={() => onChange(null)}
            testID="report-photo-remove"
          />
        </>
      ) : (
        <ImageInput
          purpose="report"
          subject={fr.reportForm.photo}
          onPicked={onChange}
          testID="report-photo"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
});
