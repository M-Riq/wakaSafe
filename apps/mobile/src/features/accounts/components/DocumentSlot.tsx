import type { DocumentType } from '@wakasafe/domain';
import { Image, StyleSheet, View } from 'react-native';

import { format, fr } from '@/lib/i18n';
import { AppText, Badge, Card, colors, radii, spacing } from '@/ui';

import { ImageInput } from './ImageInput';

interface DocumentSlotProps {
  type: DocumentType;
  fileUrl: string | null;
  /** Status shown when a file is present (e.g. the upload date). */
  providedLabel: string;
  onPicked?: (dataUri: string) => void;
  /** No picker: the request is closed or the account is read-only. */
  readOnly?: boolean;
  busy?: boolean;
}

/** One supporting document (F1.4): status, preview and photo picker. */
export function DocumentSlot({
  type,
  fileUrl,
  providedLabel,
  onPicked,
  readOnly = false,
  busy = false,
}: DocumentSlotProps) {
  const label = fr.enums.documentType[type];
  return (
    <Card testID={`document-${type}`}>
      <View style={styles.header}>
        <AppText variant="heading" style={styles.title}>
          {label}
        </AppText>
        <Badge
          label={fileUrl ? providedLabel : fr.documents.missing}
          tone={fileUrl ? 'success' : 'warning'}
          icon={fileUrl ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        />
      </View>
      {fileUrl && (
        <Image
          source={{ uri: fileUrl }}
          style={styles.preview}
          resizeMode="contain"
          accessibilityLabel={format(fr.documents.preview, { type: label })}
        />
      )}
      {!readOnly && onPicked && (
        <ImageInput
          purpose="document"
          subject={label}
          onPicked={onPicked}
          disabled={busy}
          testID={`document-${type}-picker`}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: { flexShrink: 1 },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
});
