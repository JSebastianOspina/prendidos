import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { mascotForLevel } from '@/components/ui/brand-art';
import { Button } from '@/components/ui/button';
import { levelLabels } from '@/components/ui/level-badge';
import { Mascot } from '@/components/ui/mascot';
import {
  BorderWidth,
  Colors,
  Fonts,
  LevelColors,
  MaxContentWidth,
  Radius,
  ShadowOffset,
  Spacing,
} from '@/constants/theme';
import type { Difficulty } from '@/features/content/card-types';
import { allDifficulties } from '@/features/game';

import { levelUpLine, playCopy } from './copy';

const mascotSize = 150;

type LevelUpOverlayProps = {
  level: Difficulty;
  roundText: string;
  onContinue: () => void;
};

/**
 * Full-screen celebration when the game reaches a higher level. It has no motion, so it
 * already honors the system "Reduce Motion" setting.
 */
export function LevelUpOverlay({ level, roundText, onContinue }: LevelUpOverlayProps) {
  return (
    <View style={styles.backdrop} accessibilityViewIsModal>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.roundPill}>
            <AppText variant="label">{roundText}</AppText>
          </View>

          <View style={styles.mascotTile}>
            <View style={styles.mascotShadow} />
            <View style={styles.mascotFace}>
              <Mascot art={mascotForLevel[level]} size={mascotSize} />
            </View>
          </View>

          <AppText
            variant="display"
            color={Colors.white}
            accessibilityRole="header"
            style={styles.centered}
          >
            {playCopy.levelUpTitles[level]}
          </AppText>
          <AppText color={Colors.white} style={[styles.strong, styles.centered]}>
            {levelUpLine(level)}
          </AppText>

          <View style={styles.scale} accessible accessibilityLabel={playCopy.currentLevel(level)}>
            {allDifficulties.map((step, index) => {
              const isNewLevel = step === level;
              return (
                <View
                  key={step}
                  style={[
                    styles.scaleStep,
                    index > 0 && styles.scaleDivider,
                    {
                      backgroundColor: isNewLevel ? Colors.surface : LevelColors[step].fill,
                    },
                  ]}
                >
                  <AppText
                    variant="button"
                    color={isNewLevel ? Colors.ink : LevelColors[step].text}
                    style={isNewLevel && styles.newLevel}
                  >
                    {levelLabels[step]}
                  </AppText>
                </View>
              );
            })}
          </View>

          <View style={styles.spacer} />
          <View style={styles.moderation}>
            <AppText style={[styles.strong, styles.centered]}>{playCopy.moderation}</AppText>
          </View>
          <Button label={playCopy.keepPartying} variant="onBrand" onPress={onContinue} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.brandRed,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  roundPill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  mascotTile: {
    paddingBottom: ShadowOffset.card,
  },
  mascotShadow: {
    ...StyleSheet.absoluteFill,
    top: ShadowOffset.card,
    borderRadius: Radius.card,
    backgroundColor: Colors.ink,
  },
  mascotFace: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    padding: Spacing.lg,
  },
  centered: {
    textAlign: 'center',
  },
  strong: {
    fontFamily: Fonts.nunitoExtraBold,
  },
  scale: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    overflow: 'hidden',
  },
  scaleStep: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  scaleDivider: {
    borderLeftWidth: BorderWidth.regular,
    borderLeftColor: Colors.ink,
  },
  newLevel: {
    fontFamily: Fonts.fredokaBold,
  },
  spacer: {
    flexGrow: 1,
  },
  moderation: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
