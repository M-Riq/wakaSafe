import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type ImageSource = 'camera' | 'library';
/** Profile photo (F1.1) or supporting document (F1.4). */
export type ImagePurpose = 'avatar' | 'document';

export type PickImageResult =
  { status: 'picked'; dataUri: string } | { status: 'cancelled' } | { status: 'denied' };

/**
 * Longest side kept after compression. Images are stored locally as data URIs until the
 * real backend arrives, so they must stay small (about 50 to 200 KB).
 */
const MAX_SIDE: Record<ImagePurpose, number> = { avatar: 512, document: 1280 };
const JPEG_QUALITY = 0.6;

/**
 * The web file picker already offers the camera on phones, so the web UI shows a single
 * "choose an image" action. Android offers both the camera and the gallery.
 */
export const canUseCamera = Platform.OS !== 'web';

async function compress(uri: string, purpose: ImagePurpose): Promise<string> {
  const maxSide = MAX_SIDE[purpose];
  const context = ImageManipulator.manipulate(uri, { maxWidth: maxSide, maxHeight: maxSide });
  const image = await context.renderAsync();
  try {
    const saved = await image.saveAsync({
      base64: true,
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
    });
    if (!saved.base64) throw new Error('Image compression returned no data');
    return `data:image/jpeg;base64,${saved.base64}`;
  } finally {
    image.release();
    context.release();
  }
}

/** Opens the camera or the gallery and returns a compressed JPEG data URI. */
export async function pickImage({
  source,
  purpose,
}: {
  source: ImageSource;
  purpose: ImagePurpose;
}): Promise<PickImageResult> {
  if (source === 'camera' && canUseCamera) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
  }
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: 'images',
    allowsEditing: purpose === 'avatar',
    aspect: [1, 1],
    quality: 1,
  };
  const result =
    source === 'camera' && canUseCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return { status: 'cancelled' };
  return { status: 'picked', dataUri: await compress(asset.uri, purpose) };
}
