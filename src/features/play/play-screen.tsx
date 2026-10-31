import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { LevelBadge } from '@/components/ui/level-badge';
import { ScreenContainer } from '@/components/ui/screen-container';
import { BorderWidth, Colors, Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useGame } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { CardFace } from './card-face';
import { penaltyLine, playCopy, pointsLabel, roundLabel, signedPointsLabel } from './copy';
import { PlayOverlay } from './play-overlay';

/** Turn screen: whose turn, the card, and the actions that move the game on. */
export function PlayScreen() {
  const game = useGame();
  const { session, currentPlayer, currentCard, currentCardCopy, lastOutcome } = game;
  /** Player whose refusal penalty is waiting to be acknowledged. */
  const [refusingPlayerId, setRefusingPlayerId] = useState<string>();
  const [isEndConfirmVisible, setEndConfirmVisible] = useState(false);

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

  const isOverlayVisible = isPenaltyPending || isEndConfirmVisible;
  const players = session.settings.players;
  const scoreOf = (playerId: string) => session.scores[playerId] ?? 0;
  const refusingPlayerName = players.find((player) => player.id === penaltyOutcome?.playerId)?.name;

  const refuse = () => {
    if (!currentPlayer) return;
    setRefusingPlayerId(currentPlayer.id);
    game.refuseCard();
  };

  const confirmEnd = () => {
    setEndConfirmVisible(false);
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
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <AppText variant="label" color={Colors.textSecondary}>
                {roundLabel(session.currentRound, session.settings.endCondition)}
              </AppText>
              {game.currentDifficulty ? <LevelBadge difficulty={game.currentDifficulty} /> : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={playCopy.endGame}
              onPress={() => setEndConfirmVisible(true)}
              style={styles.endLink}
            >
              <AppText variant="label" color={Colors.textMuted}>
                {playCopy.endGame}
              </AppText>
            </Pressable>
          </View>

          {!game.isGroupInterlude && currentPlayer ? (
            <View>
              <AppText variant="label" color={Colors.textSecondary}>
                {playCopy.turnOf}
              </AppText>
              <View style={styles.nameRow}>
                <AppText
                  variant="display"
                  accessibilityRole="header"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.name}
                >
                  {currentPlayer.name}
                </AppText>
                <AppText variant="button" color={Colors.textSecondary}>
                  {pointsLabel(scoreOf(currentPlayer.id))}
                </AppText>
              </View>
            </View>
          ) : null}

          <View style={styles.scoreboard} accessibilityLabel={playCopy.scoreboard}>
            {players.map((player) => (
              <AppText key={player.id} variant="label" color={Colors.textMuted}>
                {`${player.name} · ${scoreOf(player.id)}`}
              </AppText>
            ))}
          </View>

          <ScrollView style={styles.cardArea} contentContainerStyle={styles.cardContent}>
            {currentCard && currentCardCopy ? (
              <CardFace card={currentCard} copy={currentCardCopy} />
            ) : null}
            {currentCard && !game.isGroupInterlude ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={game.canSwap ? playCopy.swap : playCopy.swapUsed}
                accessibilityState={{ disabled: !game.canSwap }}
                disabled={!game.canSwap}
                onPress={game.swapCard}
                style={[styles.swap, !game.canSwap && styles.swapUsed]}
              >
                <AppText variant="label">{game.canSwap ? playCopy.swap : playCopy.swapUsed}</AppText>
              </Pressable>
            ) : null}
          </ScrollView>

          {currentCard && !isOverlayVisible ? (
            game.isGroupInterlude ? (
              <Button label={playCopy.next} size="turn" onPress={game.nextAfterGroupCard} />
            ) : (
              <View style={styles.actions}>
                <Button
                  label={playCopy.refused}
                  variant="secondary"
                  size="turn"
                  onPress={refuse}
                  style={styles.action}
                />
                <Button
                  label={playCopy.completed}
                  size="turn"
                  onPress={game.completeCard}
                  style={styles.action}
                />
              </View>
            )
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

      {isEndConfirmVisible ? (
        <PlayOverlay>
          <AppText variant="title" accessibilityRole="header">
            {playCopy.endConfirmTitle}
          </AppText>
          <AppText>{playCopy.endConfirmBody}</AppText>
          <Button label={playCopy.endConfirm} variant="dark" onPress={confirmEnd} />
          <Button
            label={playCopy.endCancel}
            variant="secondary"
            onPress={() => setEndConfirmVisible(false)}
          />
        </PlayOverlay>
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
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  endLink: {
    minHeight: TouchTarget.minimum,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
  name: {
    flexShrink: 1,
  },
  scoreboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.md,
    rowGap: Spacing.xs,
  },
  cardArea: {
    flex: 1,
  },
  cardContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  swap: {
    alignSelf: 'center',
    minHeight: TouchTarget.minimum,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  swapUsed: {
    opacity: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  action: {
    flex: 1,
  },
});
