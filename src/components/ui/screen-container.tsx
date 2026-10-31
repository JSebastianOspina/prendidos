import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export type ScreenContainerProps = {
  children: ReactNode;
  /** Scroll long content; fixed bars belong outside the scroll area. */
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Cream background, safe areas, and the 20 pt gutter for every screen. */
export function ScreenContainer({ children, scroll = false, style }: ScreenContainerProps) {
  const content = <View style={[styles.content, style]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
});
