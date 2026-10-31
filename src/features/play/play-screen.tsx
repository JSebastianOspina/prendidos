import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Colors, Fonts, Spacing, TouchTarget } from '@/constants/theme';
import type { Difficulty } from '@/features/content/card-types';
import { allDifficulties, refusalPenaltyPoints, useGame, type Player } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { CardFace } from './card-face';
import {
  continueWithLabel,
  interludeLabel,
  penaltyLine,
  playCopy,
  roundLabel,
  signedPointsLabel,
} from './copy';
import { LevelUpOverlay } from './level-up-overlay';
import { PlayOverlay } from './play-overlay';
import { ClayButton } from './play-pieces';
import { InterludeTopBar, TurnTopBar } from './turn-top-bar';
import { turnProgress } from './turn-progress';

const continueAvatarSize = 36;
const continueButtonHeight = 64;

function isHigherLevel(next: Difficulty, previous: Difficulty): boolean {
  return allDifficulties.indexOf(next) > allDifficulties.indexOf(previous);
}

function ActionLabel({ title, points }: { title: string; points: string }) {
  return (
    <>
      <AppText variant="button">{title}</AppText>
      <AppText style={styles.strong}>{points}</AppText>
    </>
  );
}

function ContinueButton({ player, onPress }: { player?: Player; onPress: () => void }) {
  const label = player ? continueWithLabel(player.name) : playCopy.continue;
  return (
    <ClayButton
      accessibilityLabel={label}
      onPress={onPress}
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
              <CardFace card={currentCard} copy={currentCardCopy} player={currentPlayer} />
            ) : null}
          </ScrollView>

          {currentCard && !isOverlayVisible ? (
            game.isGroupInterlude ? (
              <ContinueButton player={currentPlayer} onPress={game.nextAfterGroupCard} />
            ) : individualCard ? (
              <View style={styles.actions}>
                <ClayButton
                  accessibilityLabel={`${playCopy.refused} ${signedPointsLabel(-refusalPenaltyPoints(individualCard.points))}`}
                  onPress={refuse}
                  height={TouchTarget.turnAction}
                  style={styles.refuseAction}
                >
                  <ActionLabel
                    title={playCopy.refused}
                    points={signedPointsLabel(-refusalPenaltyPoints(individualCard.points))}
                  />
                </ClayButton>
                <ClayButton
                  accessibilityLabel={`${playCopy.completed} ${signedPointsLabel(individualCard.points)}`}
                  onPress={game.completeCard}
                  fill={Colors.levelEasy}
                  height={TouchTarget.turnAction}
                  style={styles.completeAction}
                >
                  <ActionLabel
                    title={playCopy.completed}
                    points={signedPointsLabel(individualCard.points)}
                  />
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
          <Button label={playCopy.next} onPress={() => setRefusingPlayerId(undefined)} />
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
          <Button label={playCopy.endAndRank} variant="secondary" onPress={endFromPause} />
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  refuseAction: {
    flex: 2,
  },
  completeAction: {
    flex: 3,
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
