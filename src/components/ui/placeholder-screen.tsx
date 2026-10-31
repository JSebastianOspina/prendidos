import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

import { AppText } from './app-text';
import { Button } from './button';
import { ScreenContainer } from './screen-container';

export type PlaceholderScreenProps = {
  title: string;
  /** Story that replaces this placeholder, e.g. "HU-02". */
  story: string;
  nextLabel?: string;
  onNext?: () => void;
  children?: ReactNode;
};

/** Temporary screen that shows its name until its story replaces it. */
export function PlaceholderScreen({
  title,
  story,
  nextLabel = 'Siguiente',
  onNext,
  children,
}: PlaceholderScreenProps) {
  return (
    <ScreenContainer>
      <View style={styles.body}>
        <AppText variant="label" color={Colors.textMuted}>
          {`Pantalla en construcción · ${story}`}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {children}
      </View>
      {onNext ? <Button label={nextLabel} onPress={onNext} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
  },
});
