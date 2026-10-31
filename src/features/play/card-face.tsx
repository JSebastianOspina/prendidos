import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { CardFrame } from '@/components/ui/card-frame';
import { levelLabels } from '@/components/ui/level-badge';
import { BorderWidth, Colors, LevelColors, Radius, Spacing } from '@/constants/theme';
import type { Card, GroupCard, IndividualCard } from '@/features/content/card-types';
import type { RenderedCard } from '@/features/game';

import { penaltyLine, playCopy, pointsLabel } from './copy';

type CardFaceProps = {
  card: Card;
  /** Copy already rendered for the current player by the game. */
  copy: RenderedCard;
};

/** The card in the middle of the turn screen: individual (Reto / Verdad) or group interlude. */
export function CardFace({ card, copy }: CardFaceProps) {
  switch (card.type) {
    case 'challenge':
    case 'truth':
      return <IndividualCardFace card={card} copy={copy} />;
    case 'everyoneWho':
    case 'neverHaveIEver':
      return <GroupCardFace card={card} copy={copy} />;
  }
}

function CardNotes({ card }: { card: Card }) {
  return (
    <>
      {card.requiresConsent ? (
        <AppText color={Colors.textSecondary}>{playCopy.consentNote}</AppText>
      ) : null}
      {card.reachesOutside ? (
        <AppText color={Colors.textSecondary}>{playCopy.outsideNote}</AppText>
      ) : null}
    </>
  );
}

export function IndividualCardFace({ card, copy }: { card: IndividualCard; copy: RenderedCard }) {
  const level = LevelColors[card.difficulty];
  const isChallenge = card.type === 'challenge';

  return (
    <CardFrame>
      <View style={[styles.strip, { backgroundColor: level.fill }]}>
        <View style={[styles.typeTag, isChallenge ? styles.challengeTag : styles.truthTag]}>
          <AppText variant="label" color={isChallenge ? Colors.white : Colors.ink}>
            {isChallenge ? playCopy.challengeTag : playCopy.truthTag}
          </AppText>
        </View>
        <AppText
          variant="label"
          color={level.text}
          accessibilityLabel={`Nivel ${levelLabels[card.difficulty]}`}
          style={styles.levelName}
        >
          {levelLabels[card.difficulty]}
        </AppText>
        <View style={styles.pointsBadge}>
          <AppText variant="label" color={Colors.ink}>
            {pointsLabel(card.points)}
          </AppText>
        </View>
      </View>
      <AppText variant="label" color={Colors.textSecondary}>
        {isChallenge ? playCopy.challengeHint : playCopy.truthHint}
      </AppText>
      {copy.headline ? (
        <AppText variant="title" accessibilityRole="header">
          {copy.headline}
        </AppText>
      ) : null}
      <AppText variant="card">{copy.body}</AppText>
      <CardNotes card={card} />
      <View style={styles.penaltyRow}>
        <AppText variant="label" color={Colors.textMuted}>
          {playCopy.ifRefused}
        </AppText>
        <AppText variant="button">{penaltyLine(card.penalty.drinks, copy.penaltyQuip)}</AppText>
      </View>
    </CardFrame>
  );
}

export function GroupCardFace({ card, copy }: { card: GroupCard; copy: RenderedCard }) {
  return (
    <CardFrame tone="group">
      <AppText variant="label">{playCopy.forTheGroup}</AppText>
      <AppText variant="title" accessibilityRole="header">
        {copy.headline ?? playCopy.groupHeadlines[card.type]}
      </AppText>
      <AppText variant="card">{copy.body}</AppText>
      <CardNotes card={card} />
      <AppText>{playCopy.groupHint}</AppText>
    </CardFrame>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    padding: Spacing.sm,
  },
  typeTag: {
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  challengeTag: {
    backgroundColor: Colors.ink,
  },
  truthTag: {
    backgroundColor: Colors.surface,
  },
  levelName: {
    flex: 1,
  },
  pointsBadge: {
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.points,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  penaltyRow: {
    borderTopWidth: BorderWidth.small,
    borderTopColor: Colors.ink,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
});
