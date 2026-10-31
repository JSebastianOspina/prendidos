import { StyleSheet, View } from 'react-native';

import { BorderWidth, Colors, LevelColors, Radius, Spacing } from '@/constants/theme';
import type { Difficulty } from '@/features/content/card-types';

import { AppText } from './app-text';

export const levelLabels: Record<Difficulty, string> = {
  easy: 'Suave',
  medium: 'Picante',
  hard: 'Prendido',
};

/** Pill with the level name; levels differ in lightness, not hue alone. */
export function LevelBadge({ difficulty }: { difficulty: Difficulty }) {
  const colors = LevelColors[difficulty];
  return (
    <View
      accessibilityLabel={`Nivel ${levelLabels[difficulty]}`}
      style={[styles.badge, { backgroundColor: colors.fill }]}>
      <AppText variant="label" color={colors.text}>
        {levelLabels[difficulty]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
