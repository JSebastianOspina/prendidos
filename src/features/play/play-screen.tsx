import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Entrance } from '@/components/ui/entrance';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Colors, Fonts, Motion, Spacing, TouchTarget } from '@/constants/theme';
import type { Difficulty } from '@/features/content/card-types';
import { allDifficulties, refusalPenaltyPoints, useGame, type Player } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { CardFace } from './card-face';
import {
  continueWithLabel,
  drinksLabel,
  interludeLabel,
  penaltyLine,
  playCopy,
  roundLabel,
  signedPoints,
  signedPointsLabel,
} from './copy';
import { LevelUpOverlay } from './level-up-overlay';
import { PlayOverlay } from './play-overlay';
import { ClayButton, PointsBadge } from './play-pieces';
import { InterludeTopBar, TurnTopBar } from './turn-top-bar';
import { turnProgress } from './turn-progress';

const continueAvatarSize = 36;
const continueButtonHeight = 64;

function isHigherLevel(next: Difficulty, previous: Difficulty): boolean {
  return allDifficulties.indexOf(next) > allDifficulties.indexOf(previous);
}

function ActionLabel({ title, detail }: { title: string; detail?: string }) {
  return (
    <>
      {/* One line each, so the detail line never overflows the 72 pt button (375 pt phones). */}
      <AppText variant="button" numberOfLines={1} adjustsFontSizeToFit>
        {title}
      </AppText>
      {detail ? (
        <AppText style={styles.strong} numberOfLines={1} adjustsFontSizeToFit>
          {detail}
        </AppText>
      ) : null}
    </>
  );
}

function ContinueButton({ player, onPress }: { player?: Player; onPress: () => void }) {
  const label = player ? continueWithLabel(player.name) : playCopy.continue;
  return (
    <ClayButton
      accessibilityLabel={label}
      onPress={onPress}
      testID="group-continue"
      fill={Colors.primary}
      height={continueButtonHeight}
      faceStyle={styles.continueFace}
    >
      {player ? <PlayerAvatar avatarId={player.avatarId} size={continueAvatarSize} /> : null}
      <AppText variant="button" numberOfLines={1} adjustsFontSizeToFit style={styles.shrink}>
        {label}
      </AppText>
      <AppText variant="button">›</AppText>
    </ClayButton>
  );
}

/** Turn screen: whose turn, the card, and the actions that move the game on. */
export function PlayScreen() {
  const game = useGame();
  const { session, currentPlayer, currentCard, currentCardCopy, lastOutcome } = game;
  /** Player whose refusal penalty is waiting to be acknowledged. */
  const [refusingPlayerId, setRefusingPlayerId] = useState<string>();
  const [isPauseVisible, setPauseVisible] = useState(false);

  // Highest level of the individual cards shown; a higher one opens the level-up overlay, so
  // each level is celebrated once. The first card only seeds it, so a game never celebrates
  // the level it starts at, and group cards are ignored.
  const individualLevel =
    currentCard && !game.isGroupInterlude ? currentCard.difficulty : undefined;
  const [highestLevelShown, setHighestLevelShown] = useState(individualLevel);
  const [levelUpTo, setLevelUpTo] = useState<Difficulty>();
  if (individualLevel !== undefined && highestLevelShown === undefined) {
    setHighestLevelShown(individualLevel);
  } else if (
    individualLevel !== undefined &&
    highestLevelShown !== undefined &&
    isHigherLevel(individualLevel, highestLevelShown)
  ) {
    setHighestLevelShown(individualLevel);
    setLevelUpTo(individualLevel);
  }

  const penaltyOutcome =
    refusingPlayerId !== undefined &&
    lastOutcome?.kind === 'refused' &&
    lastOutcome.playerId === refusingPlayerId
      ? lastOutcome
      : undefined;
  const hasSession = session !== undefined;
  const isFinished = session?.status === 'finished';
  const isPenaltyPending = penaltyOutcome !== undefined;

  useEffect(() => {
    if (!hasSession) router.replace(routes.home);
    else if (isFinished && !isPenaltyPending) router.replace(routes.results);
  }, [hasSession, isFinished, isPenaltyPending]);

  if (!session) return <ScreenContainer>{null}</ScreenContainer>;

  const { settings } = session;
  const levelUpShown = isPenaltyPending ? undefined : levelUpTo;
  const isOverlayVisible = isPenaltyPending || isPauseVisible || levelUpShown !== undefined;
  const roundText = roundLabel(session.currentRound, settings.endCondition);
  const refusingPlayerName = settings.players.find(
    (player) => player.id === penaltyOutcome?.playerId,
  )?.name;
  const individualCard =
    currentCard && !game.isGroupInterlude && currentCard.points !== undefined
      ? currentCard
      : undefined;
  const refusalPoints = individualCard ? refusalPenaltyPoints(individualCard.points) : 0;

  const refuse = () => {
    if (!currentPlayer) return;
    setRefusingPlayerId(currentPlayer.id);
    game.refuseCard();
  };

  const endFromPause = () => {
    setPauseVisible(false);
    game.endGame();
  };

  return (
    <View style={styles.root}>
      <ScreenContainer>
        <View
          style={styles.screen}
          accessibilityElementsHidden={isOverlayVisible}
          importantForAccessibility={isOverlayVisible ? 'no-hide-descendants' : 'auto'}
        >
          {game.isGroupInterlude ? (
            <InterludeTopBar
              roundText={interludeLabel(session.currentRound, settings.endCondition)}
              difficulty={game.currentDifficulty}
              onPause={() => setPauseVisible(true)}
            />
          ) : (
            <TurnTopBar
              roundText={roundText}
              segments={turnProgress({
                selectedDifficulties: settings.selectedDifficulties,
                endCondition: settings.endCondition,
                currentRound: session.currentRound,
                scores: session.scores,
                currentDifficulty: game.currentDifficulty ?? 'easy',
              })}
              currentDifficulty={game.currentDifficulty ?? 'easy'}
              canSwap={game.canSwap}
              onPause={() => setPauseVisible(true)}
              onSwap={game.swapCard}
            />
          )}

          <ScrollView style={styles.cardArea} contentContainerStyle={styles.cardContent}>
            {currentCard && currentCardCopy && currentPlayer ? (
              // Keyed by card: every new, group, or swapped card plays its own entrance.
              <Entrance
                key={currentCard.id}
                from="below"
                spring={Motion.cardSpring}
                style={styles.cardEntrance}
                testID="card-entrance"
              >
                <CardFace card={currentCard} copy={currentCardCopy} player={currentPlayer} />
              </Entrance>
            ) : null}
          </ScrollView>

          {currentCard && !isOverlayVisible ? (
            game.isGroupInterlude ? (
              <ContinueButton player={currentPlayer} onPress={game.nextAfterGroupCard} />
            ) : individualCard ? (
              <View style={styles.actions}>
                {/* The penalty lives on the refuse action (no footer on the card); its quip shows in the refusal overlay. */}
                <ClayButton
                  accessibilityLabel={`${playCopy.refused} ${signedPointsLabel(-refusalPoints)}, ${drinksLabel(individualCard.penalty.drinks)}`}
                  onPress={refuse}
                  testID="turn-refuse"
                  height={TouchTarget.turnAction}
                  style={styles.refuseAction}
                  badge={<PointsBadge label={signedPoints(-refusalPoints)} tone="loss" />}
                >
                  <ActionLabel
                    title={playCopy.refused}
                    detail={drinksLabel(individualCard.penalty.drinks)}
                  />
                </ClayButton>
                <ClayButton
                  accessibilityLabel={`${playCopy.completed} ${signedPointsLabel(individualCard.points)}`}
                  onPress={game.completeCard}
                  testID="turn-complete"
                  fill={Colors.levelEasy}
                  height={TouchTarget.turnAction}
                  style={styles.completeAction}
                  badge={<PointsBadge label={signedPoints(individualCard.points)} tone="gain" />}
                >
                  <ActionLabel title={playCopy.completed} />
                </ClayButton>
              </View>
            ) : null
          ) : null}
        </View>
      </ScreenContainer>

      {penaltyOutcome ? (
        <PlayOverlay>
          <AppText variant="title" accessibilityRole="header">
            {playCopy.refusedBy(refusingPlayerName ?? '')}
          </AppText>
          {penaltyOutcome.penalty ? (
            <AppText variant="card">
              {penaltyLine(penaltyOutcome.penalty.drinks, penaltyOutcome.penaltyQuip)}
            </AppText>
          ) : null}
          <AppText variant="button" color={Colors.negative}>
            {signedPointsLabel(penaltyOutcome.pointsDelta)}
          </AppText>
          <Button
            label={playCopy.next}
            onPress={() => setRefusingPlayerId(undefined)}
            testID="refusal-next"
          />
        </PlayOverlay>
      ) : null}

      {isPauseVisible ? (
        <PlayOverlay>
          <View style={styles.pauseHeading}>
            <AppText variant="label" color={Colors.textSecondary}>
              {roundText}
            </AppText>
            <AppText variant="title" accessibilityRole="header">
              {playCopy.pause}
            </AppText>
          </View>
          <Button label={playCopy.keepPlaying} onPress={() => setPauseVisible(false)} />
          <Button
            label={playCopy.endAndRank}
            variant="secondary"
            onPress={endFromPause}
            testID="pause-end-game"
          />
        </PlayOverlay>
      ) : null}

      {levelUpShown ? (
        <LevelUpOverlay
          level={levelUpShown}
          roundText={roundText}
          onContinue={() => setLevelUpTo(undefined)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screen: {
    flex: 1,
    gap: Spacing.lg,
  },
  cardArea: {
    flex: 1,
  },
  cardContent: {
    flexGrow: 1,
    // Room for the tilted card's corners and its hard shadow inside the scroll bounds.
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  /** Keeps the card growing to fill the visible card area, as without the entrance. */
  cardEntrance: {
    flexGrow: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  // Equal widths: at 2:3 "No cumplió" wrapped on 375 pt phones (web ignores adjustsFontSizeToFit).
  refuseAction: {
    flex: 1,
  },
  completeAction: {
    flex: 1,
  },
  continueFace: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shrink: {
    flexShrink: 1,
  },
  strong: {
    fontFamily: Fonts.nunitoExtraBold,
  },
  pauseHeading: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
