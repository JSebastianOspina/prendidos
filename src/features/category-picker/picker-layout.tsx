import type { Href } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Colors, Spacing } from '@/constants/theme';

import { BackLink } from './back-link';

export type PickerLayoutProps = {
  title: string;
  subtitle: string;
  backFallbackHref: Href;
  children: ReactNode;
};

/** Back link and title on top; the choices sit low, within thumb reach. */
export function PickerLayout({ title, subtitle, backFallbackHref, children }: PickerLayoutProps) {
  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <BackLink fallbackHref={backFallbackHref} />
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        <AppText color={Colors.textSecondary}>{subtitle}</AppText>
      </View>
      <View style={styles.choices}>{children}</View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.sm,
  },
  choices: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: Spacing.lg,
  },
});
