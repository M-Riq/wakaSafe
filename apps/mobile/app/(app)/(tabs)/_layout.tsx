import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fr } from '@/lib/i18n';
import {
  colors,
  headerOptions,
  Icon,
  sizes,
  spacing,
  typography,
  useResponsive,
  type IconName,
} from '@/ui';

type TabIconProps = { color: ColorValue; size: number };

function tabIcon(name: IconName) {
  function TabIcon({ color, size }: TabIconProps) {
    // Tint colours come from string tokens; other ColorValue shapes fall back to the default.
    return <Icon name={name} color={typeof color === 'string' ? color : undefined} size={size} />;
  }
  return TabIcon;
}

/** Taller than the navigation default so that 12 px labels are not clipped. */
const BOTTOM_TAB_BAR_HEIGHT = sizes.touchTarget + spacing.sm;

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'map', title: fr.tabs.map, icon: 'map-outline' },
  { name: 'report', title: fr.tabs.report, icon: 'warning-outline' },
  { name: 'quiz', title: fr.tabs.quiz, icon: 'school-outline' },
  { name: 'leaderboard', title: fr.tabs.leaderboard, icon: 'trophy-outline' },
  { name: 'profile', title: fr.tabs.profile, icon: 'person-circle-outline' },
];

/** Bottom tabs on phones, side navigation on large web screens. */
export default function TabsLayout() {
  const { isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();
  const screenOptions: ComponentProps<typeof Tabs>['screenOptions'] = {
    ...headerOptions,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: { fontSize: typography.fontSize.xs },
    tabBarPosition: isDesktop ? 'left' : 'bottom',
    tabBarVariant: isDesktop ? 'material' : 'uikit',
    // A custom height replaces the default one, so the bottom inset must be added back.
    tabBarStyle: isDesktop ? undefined : { height: BOTTOM_TAB_BAR_HEIGHT + insets.bottom },
    sceneStyle: { backgroundColor: colors.background },
  };
  return (
    <Tabs screenOptions={screenOptions}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title, tabBarIcon: tabIcon(tab.icon) }}
        />
      ))}
    </Tabs>
  );
}
