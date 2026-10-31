import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import {
  BorderWidth,
  Colors,
  Radius,
  ShadowOffset,
  Spacing,
  type TypographyVariant,
} from '@/constants/theme';
import type { RankingEntry } from '@/features/game';

import { Crown } from './crown';
import { rankingEntryAccessibilityLabel } from './results-copy';
import { ScoreText } from './score-text';

type StepLook = { height: number; fill: string; numberVariant: TypographyVariant };

/** Height, fill, and number size per position (positions 1–3 only reach the podium). */
const stepLookByPosition: Record<number, StepLook> = {
  1: { height: 140, fill: Colors.primary, numberVariant: 'title' },
  2: { height: 96, fill: Colors.surfaceSoft, numberVariant: 'card' },
  3: { height: 72, fill: Colors.surface, numberVariant: 'card' },
};

const avatarSize = { soleWinner: 64, coWinner: 60, other: 52 } as const;
const crownWidth = 44;
/** Steps are rounded on top and nearly square at the base (prototype: 18 / 6). */
const stepBaseRadius = 6;

type PodiumProps = {
  /** Steps left to right, from `layoutRanking`. */
  entries: RankingEntry[];
  /** More than one player in first place. */
  isTieForFirst: boolean;
};

/** The top of the ranking: avatars standing on clay steps; tied players share a step look. */
export function Podium({ entries, isTieForFirst }: PodiumProps) {
  return (
    <View style={styles.podium}>
      {entries.map((entry) => (
        <PodiumColumn key={entry.player.id} entry={entry} isTieForFirst={isTieForFirst} />
      ))}
    </View>
  );
}

function PodiumColumn({ entry, isTieForFirst }: { entry: RankingEntry; isTieForFirst: boolean }) {
  const { player, position, score } = entry;
  const look = stepLookByPosition[position] ?? stepLookByPosition[3];
  const isFirst = position === 1;
  const isSoleWinner = isFirst && !isTieForFirst;
  const size = isSoleWinner
    ? avatarSize.soleWinner
    : isFirst
      ? avatarSize.coWinner
      : avatarSize.other;

  return (
    <View
      accessible
      accessibilityLabel={rankingEntryAccessibilityLabel(position, player.name, score)}
      style={styles.column}
    >
      {isSoleWinner ? <Crown width={crownWidth} testID="winner-crown" /> : null}
      <PlayerAvatar avatarId={player.avatarId} size={size} />
      <AppText numberOfLines={1} ellipsizeMode="tail" style={styles.name}>
        {player.name}
      </AppText>
      <View style={[styles.step, { height: look.height + ShadowOffset.button }]}>
        <View style={[styles.stepShadow, { height: look.height }]} />
        <View
          testID={`podium-step-${player.id}`}
          style={[styles.stepFace, { height: look.height, backgroundColor: look.fill }]}
        >
          <AppText variant={look.numberVariant}>{position}</AppText>
          <ScoreText score={score} onPrimary={isFirst} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  column: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  name: {
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  step: {
    alignSelf: 'stretch',
  },
  stepShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ShadowOffset.button,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    borderBottomLeftRadius: stepBaseRadius,
    borderBottomRightRadius: stepBaseRadius,
    backgroundColor: Colors.ink,
  },
  stepFace: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    borderBottomLeftRadius: stepBaseRadius,
    borderBottomRightRadius: stepBaseRadius,
  },
});
