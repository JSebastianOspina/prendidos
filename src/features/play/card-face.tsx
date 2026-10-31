import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { levelLabels } from '@/components/ui/level-badge';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { BorderWidth, Colors, Fonts, LevelColors, Radius, Spacing } from '@/constants/theme';
import type { Card, GroupCard, IndividualCard } from '@/features/content/card-types';
import type { Player, RenderedCard } from '@/features/game';

import { penaltyLine, playCopy, pointsLabel } from './copy';
import { PlayCard } from './play-pieces';

/** Small tilt from the proposal; individual cards lean left, group cards right. */
const individualCardTilt = -1.5;
const groupCardTilt = 1.5;
const turnAvatarSize = 60;

type CardFaceProps = {
  card: Card;
  /** Copy already rendered for the current player by the game. */
  copy: RenderedCard;
  /** Whose turn it is; shown inside individual cards. */
  player: Player;
};

/** The card in the middle of the turn screen: individual (Reto / Verdad) or group interlude. */
export function CardFace({ card, copy, player }: CardFaceProps) {
  switch (card.type) {
    case 'challenge':
    case 'truth':
      return <IndividualCardFace card={card} copy={copy} player={player} />;
    case 'everyoneWho':
    case 'neverHaveIEver':
      return <GroupCardFace card={card} copy={copy} />;
  }
}

function CardNotes({ card, color }: { card: Card; color: string }) {
  return (
    <>
      {card.requiresConsent ? <AppText color={color}>{playCopy.consentNote}</AppText> : null}
      {card.reachesOutside ? <AppText color={color}>{playCopy.outsideNote}</AppText> : null}
    </>
  );
}

function PenaltyFooter({ card, copy }: { card: IndividualCard; copy: RenderedCard }) {
  // Until HU-11 adds alternative penalties, players who do not drink also see the drinks.
  return (
    <View style={styles.penaltyFooter}>
      <AppText variant="label" color={Colors.textMuted}>
        {playCopy.ifRefused}
      </AppText>
      <AppText style={styles.strong}>{penaltyLine(card.penalty.drinks, copy.penaltyQuip)}</AppText>
    </View>
  );
}

export function IndividualCardFace({
  card,
  copy,
  player,
}: {
  card: IndividualCard;
  copy: RenderedCard;
  player: Player;
}) {
  const level = LevelColors[card.difficulty];
  const isChallenge = card.type === 'challenge';

  return (
    <PlayCard
      fill={level.fill}
      rotation={individualCardTilt}
      footer={<PenaltyFooter card={card} copy={copy} />}
    >
      <View style={styles.chipRow}>
        <View style={styles.chips}>
          <View style={[styles.chip, styles.typeChip]}>
            <AppText variant="label">
              {isChallenge ? playCopy.challengeTag : playCopy.truthTag}
            </AppText>
          </View>
          <View
            style={[styles.chip, styles.levelChip]}
            accessible
            accessibilityLabel={`Nivel ${levelLabels[card.difficulty]}`}
          >
            <AppText variant="label">{levelLabels[card.difficulty]}</AppText>
          </View>
        </View>
        <View style={styles.pointsBadge}>
          <AppText variant="button">{pointsLabel(card.points)}</AppText>
        </View>
      </View>

      <View style={styles.playerRow}>
        <PlayerAvatar avatarId={player.avatarId} size={turnAvatarSize} playerName={player.name} />
        <View style={styles.playerName}>
          <AppText color={level.text} style={styles.strong}>
            {playCopy.turnOf}
          </AppText>
          <AppText
            variant="display"
            color={level.text}
            accessibilityRole="header"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {player.name}
          </AppText>
        </View>
      </View>

      <AppText variant="label" color={level.text}>
        {isChallenge ? playCopy.challengeHint : playCopy.truthHint}
      </AppText>
      {copy.headline ? (
        <AppText variant="button" color={level.text}>
          {copy.headline}
        </AppText>
      ) : null}
      <AppText variant="card" color={level.text}>
        {copy.body}
      </AppText>
      <CardNotes card={card} color={level.text} />
    </PlayCard>
  );
}

export function GroupCardFace({ card, copy }: { card: GroupCard; copy: RenderedCard }) {
  return (
    <PlayCard fill={Colors.flameYellow} rotation={groupCardTilt}>
      <View
        style={[styles.chip, styles.everyoneChip]}
        accessible
        accessibilityLabel={playCopy.forTheGroup}
      >
        <AppText variant="button">{playCopy.everyoneChip}</AppText>
      </View>
      <AppText variant="display" accessibilityRole="header">
        {copy.headline ?? playCopy.groupHeadlines[card.type]}
      </AppText>
      <AppText variant="card">{copy.body}</AppText>
      <CardNotes card={card} color={Colors.ink} />
      <View style={styles.spacer} />
      <View style={styles.ruleBox}>
        <AppText style={styles.strong}>{playCopy.groupRule}</AppText>
        <AppText color={Colors.textMuted}>{playCopy.groupRuleNote}</AppText>
      </View>
    </PlayCard>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 1,
    gap: Spacing.sm,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  typeChip: {
    backgroundColor: Colors.surface,
  },
  levelChip: {
    backgroundColor: Colors.surfaceSoft,
  },
  everyoneChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
  },
  pointsBadge: {
    flexShrink: 0,
    minWidth: 56,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.points,
    paddingHorizontal: Spacing.md,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  playerName: {
    flex: 1,
  },
  strong: {
    fontFamily: Fonts.nunitoExtraBold,
  },
  penaltyFooter: {
    backgroundColor: Colors.surface,
    borderTopWidth: BorderWidth.regular,
    borderTopColor: Colors.ink,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.gutter,
    gap: Spacing.xs,
  },
  spacer: {
    flexGrow: 1,
  },
  ruleBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
});
