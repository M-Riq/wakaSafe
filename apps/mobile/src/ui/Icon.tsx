import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors, sizes } from './theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: ComponentProps<typeof Ionicons>['color'];
  /** Without a label, the icon is decorative and hidden from screen readers. */
  accessibilityLabel?: string;
}

export function Icon({
  name,
  size = sizes.iconMd,
  color = colors.text,
  accessibilityLabel,
}: IconProps) {
  const decorative = !accessibilityLabel;
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      accessible={!decorative}
      accessibilityLabel={accessibilityLabel}
      // aria-hidden works on Android and on the web (react-native-web).
      aria-hidden={decorative}
    />
  );
}
