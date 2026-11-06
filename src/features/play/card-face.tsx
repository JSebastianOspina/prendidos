import { useState } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { CardIllustration } from '@/components/ui/card-illustration';
import { levelLabels } from '@/components/ui/level-badge';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import {
  BorderWidth,
  CardTextSteps,
  Colors,
  Fonts,
  LevelColors,
  Radius,
  Spacing,
} from '@/constants/theme';
import type {
  Card,
  GroupCard,
  IllustrationKey,
  IndividualCard,
} from '@/features/content/card-types';
import { shownIllustrationFor } from '@/features/content/shown-illustration';
import type { Player, RenderedCard } from '@/features/game';

import { initialCardFit, nextCardFit, type CardFitState } from './card-fit';
import { playCopy, pointsLabel } from './copy';
import { cardIllustrationGap, illustrationHeightFor } from './illustration-fit';
import { PlayCard, playCardBodyGap } from './play-pieces';

/** Small tilt from the proposal; individual cards lean left, group cards right. */
const individualCardTilt = -1.5;
const groupCardTilt = 1.5;
const turnAvatarSize = 48;

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
      // Keyed by card: every new card starts again at the largest body size, text-only.
      return <IndividualCardFace key={card.id} card={card} copy={copy} player={player} />;
    case 'everyoneWho':
    case 'neverHaveIEver':
      return <GroupCardFace key={card.id} card={card} copy={copy} />;
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

type CardFit = {
  /** Body size step that fits the visible card area (design tokens § Typography). */
  bodyStyle: (typeof CardTextSteps)[number];
  /** Illustration height for the space left under the text; `null` renders text-only. */
  illustrationHeight: number | null;
  onSlotLayout: (event: LayoutChangeEvent) => void;
};

/**
 * Fits the card to the visible area from the illustration slot's height, the free space left
 * under the text (0 when the card overflows): the body steps down 29 → 24 → 20 pt while the
 * card overflows, and an illustrated card may take one more step when that gives its
 * illustration at least 72 pt (`nextCardFit`, design D13). The caller keys the face by card id,
 * so every new card starts again at the largest size.
 */
function useCardFit(illustration: IllustrationKey | undefined): CardFit {
  const hasIllustration = illustration !== undefined;
  const [fit, setFit] = useState<{ state: CardFitState; slotHeight?: number }>({
    state: initialCardFit,
  });

  function onSlotLayout(event: LayoutChangeEvent) {
    const slotHeight = event.nativeEvent.layout.height;
    setFit((current) => ({
      state: nextCardFit(current.state, slotHeight, hasIllustration),
      slotHeight,
    }));
  }

  return {
    bodyStyle: CardTextSteps[fit.state.step],
    illustrationHeight: fit.slotHeight === undefined ? null : illustrationHeightFor(fit.slotHeight),
    onSlotLayout,
  };
}

/**
 * Free space below the card text, holding the card's illustration when there is room for it.
 * The slot grows into the space left in the visible card area. The illustration is drawn out
 * of the layout flow, so the slot always measures that free space and the art can never push
 * the text or the turn buttons; every slot layout (a window-size or font-scale change
 * included) checks the fit again.
 */
function IllustrationSlot({
  illustration,
  height,
  onLayout,
  style,
}: {
  illustration: IllustrationKey | undefined;
  height: number | null;
  onLayout: (event: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View testID="card-illustration-slot" style={[styles.illustrationSlot, style]} onLayout={onLayout}>
      {illustration !== undefined && height !== null ? (
        <View testID="card-illustration-frame" style={styles.illustrationFrame} pointerEvents="none">
          <CardIllustration illustration={illustration} height={height} />
        </View>
      ) : null}
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
  const { bodyStyle, illustrationHeight, onSlotLayout } = useCardFit(card.illustration);

  return (
    // No hint line (the type chip says it) and no penalty footer: the penalty is on the refuse action.
    <PlayCard fill={level.fill} rotation={individualCardTilt}>
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
            variant="title"
            color={level.text}
            accessibilityRole="header"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {player.name}
          </AppText>
        </View>
      </View>

      {copy.headline ? (
        <AppText variant="button" color={level.text}>
          {copy.headline}
        </AppText>
      ) : null}
      <AppText variant="card" color={level.text} style={bodyStyle}>
        {copy.body}
      </AppText>
      <CardNotes card={card} color={level.text} />
      <IllustrationSlot
        illustration={shownIllustrationFor(card)}
        height={illustrationHeight}
        onLayout={onSlotLayout}
        style={styles.individualSlot}
      />
    </PlayCard>
  );
}

export function GroupCardFace({ card, copy }: { card: GroupCard; copy: RenderedCard }) {
  const { bodyStyle, illustrationHeight, onSlotLayout } = useCardFit(card.illustration);
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
      <AppText variant="card" style={bodyStyle}>
        {copy.body}
      </AppText>
      <CardNotes card={card} color={Colors.ink} />
      <IllustrationSlot
        illustration={shownIllustrationFor(card)}
        height={illustrationHeight}
        onLayout={onSlotLayout}
      />
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
    minWidth: 48,
    minHeight: 48,
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
  illustrationSlot: {
    flexGrow: 1,
  },
  /** Cancels the card body gap, so an empty slot adds no height below overflowing text. */
  individualSlot: {
    marginTop: -playCardBodyGap,
  },
  /** Out of the layout flow: centered in the slot, below a gap that keeps it off the text. */
  illustrationFrame: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: cardIllustrationGap,
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
