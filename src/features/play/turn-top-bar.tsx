import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { LevelBadge } from '@/components/ui/level-badge';
import {
  BorderWidth,
  Colors,
  Fonts,
  LevelColors,
  Radius,
  Spacing,
  TouchTarget,
} from '@/constants/theme';
import type { Difficulty } from '@/features/content/card-types';

import { playCopy, swapLabel } from './copy';
import { ClayButton } from './play-pieces';
import type { ProgressSegment } from './turn-progress';

function PauseButton({ onPress }: { onPress: () => void }) {
  return (
    <ClayButton
      accessibilityLabel={playCopy.pauseButton}
      onPress={onPress}
      height={TouchTarget.minimum}
      style={styles.square}
      faceStyle={styles.pauseFace}
    >
      <View style={styles.pauseBar} />
      <View style={styles.pauseBar} />
    </ClayButton>
  );
}

function LevelProgress({
  segments,
  currentDifficulty,
}: {
  segments: ProgressSegment[];
  currentDifficulty: Difficulty;
}) {
  return (
    <View
      style={styles.progress}
      accessible
      accessibilityLabel={playCopy.currentLevel(currentDifficulty)}
    >
      {segments.map((segment) => (
        <View key={segment.difficulty} style={styles.segment}>
          <View
            style={[
              styles.segmentFill,
              {
                width: `${Math.round(segment.fill * 100)}%`,
                backgroundColor: LevelColors[segment.difficulty].fill,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

type TurnTopBarProps = {
  roundText: string;
  segments: ProgressSegment[];
  currentDifficulty: Difficulty;
  canSwap: boolean;
  onPause: () => void;
  onSwap: () => void;
};

/** Pause, round and level progress, and the free swap. */
export function TurnTopBar({
  roundText,
  segments,
  currentDifficulty,
  canSwap,
  onPause,
  onSwap,
}: TurnTopBarProps) {
  return (
    <View style={styles.bar}>
      <PauseButton onPress={onPause} />
      <View style={styles.round}>
        <AppText variant="label" numberOfLines={1} adjustsFontSizeToFit>
          {roundText}
        </AppText>
        <LevelProgress segments={segments} currentDifficulty={currentDifficulty} />
      </View>
      <ClayButton
        accessibilityLabel={canSwap ? playCopy.swap : playCopy.swapUsed}
        onPress={onSwap}
        disabled={!canSwap}
        height={TouchTarget.minimum}
      >
        <AppText style={styles.strong}>{swapLabel(canSwap)}</AppText>
      </ClayButton>
    </View>
  );
}

/** The interlude has no swap: pause, the round marked as interlude, and the level chip. */
export function InterludeTopBar({
  roundText,
  difficulty,
  onPause,
}: {
  roundText: string;
  difficulty?: Difficulty;
  onPause: () => void;
}) {
  return (
    <View style={styles.bar}>
      <PauseButton onPress={onPause} />
      <AppText variant="label" style={styles.round}>
        {roundText}
      </AppText>
      {difficulty ? <LevelBadge difficulty={difficulty} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  square: {
    width: TouchTarget.minimum,
  },
  pauseFace: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    paddingHorizontal: 0,
  },
  pauseBar: {
    width: 4,
    height: 16,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
  },
  round: {
    flex: 1,
    gap: Spacing.xs + 2,
  },
  progress: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  segment: {
    flex: 1,
    height: 10,
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
  },
  strong: {
    fontFamily: Fonts.nunitoExtraBold,
  },
});
