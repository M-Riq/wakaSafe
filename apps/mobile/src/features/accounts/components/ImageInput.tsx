import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { fr } from '@/lib/i18n';
import { canUseCamera, pickImage, type ImagePurpose, type ImageSource } from '@/services/media';
import { AppText, Button, spacing } from '@/ui';

interface ImageInputProps {
  purpose: ImagePurpose;
  onPicked: (dataUri: string) => void;
  /** Spoken context, e.g. the document type, added to each button label. */
  subject?: string;
  disabled?: boolean;
  testID?: string;
}

/** Camera and gallery on Android; one file picker on the web (it offers the camera on phones). */
export function ImageInput({ purpose, onPicked, subject, disabled, testID }: ImageInputProps) {
  const [busy, setBusy] = useState<ImageSource | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(source: ImageSource) {
    setBusy(source);
    setError(null);
    try {
      const result = await pickImage({ source, purpose });
      if (result.status === 'picked') onPicked(result.dataUri);
      if (result.status === 'denied') setError(fr.imagePicker.cameraDenied);
    } catch {
      setError(fr.imagePicker.failed);
    } finally {
      setBusy(null);
    }
  }

  const spoken = (label: string) => (subject ? `${label}, ${subject}` : label);
  const libraryLabel = canUseCamera ? fr.imagePicker.chooseFromGallery : fr.imagePicker.chooseImage;

  return (
    <View style={styles.wrapper}>
      <View style={styles.buttons}>
        {canUseCamera && (
          <View style={styles.button}>
            <Button
              label={fr.imagePicker.takePhoto}
              accessibilityLabel={spoken(fr.imagePicker.takePhoto)}
              variant="secondary"
              icon="camera-outline"
              loading={busy === 'camera'}
              disabled={disabled || busy !== null}
              onPress={() => void pick('camera')}
              testID={testID ? `${testID}-camera` : undefined}
            />
          </View>
        )}
        <View style={styles.button}>
          <Button
            label={libraryLabel}
            accessibilityLabel={spoken(libraryLabel)}
            variant="secondary"
            icon="image-outline"
            loading={busy === 'library'}
            disabled={disabled || busy !== null}
            onPress={() => void pick('library')}
            testID={testID ? `${testID}-library` : undefined}
          />
        </View>
      </View>
      {error && (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  button: { flexGrow: 1, flexBasis: 140 },
});
