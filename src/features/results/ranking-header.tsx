import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Mascot } from '@/components/ui/mascot';
import { Colors, Spacing } from '@/constants/theme';

import { Crown } from './crown';
import { sharedFirstPlaceLine, winnerTitle } from './results-copy';

const mascotSize = 48;
const crownWidth = 30;
/** The crown sits on the mascot's head, overlapping its top. */
const crownOverlap = 12;

type RankingHeaderProps = {
  eyebrow: string;
  winnerNames: string[];
};

/** Crowned winking mascot, game summary, and "¡Ganó Vale!" / "¡Empate arriba!". */
export function RankingHeader({ eyebrow, winnerNames }: RankingHeaderProps) {
  const isTie = winnerNames.length > 1;
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.crownedMascot}>
          <Mascot art="wink" size={mascotSize} style={styles.mascot} />
          <Crown width={crownWidth} style={styles.crown} />
        </View>
        <View style={styles.titles}>
          <AppText variant="label" color={Colors.textSecondary}>
            {eyebrow}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {winnerTitle(winnerNames)}
          </AppText>
        </View>
      </View>
      {isTie ? (
        <AppText style={styles.tieLine}>{sharedFirstPlaceLine(winnerNames)}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  crownedMascot: {
    width: mascotSize,
    height: mascotSize + crownOverlap,
  },
  mascot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  crown: {
    position: 'absolute',
    top: 0,
    left: (mascotSize - crownWidth) / 2,
  },
  titles: {
    flexShrink: 1,
    gap: Spacing.xs,
  },
  tieLine: {
    textAlign: 'center',
  },
});
