import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Colors, Spacing } from '@/constants/theme';
import { useGame, useNewGameDraft } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { resultsCopy } from './results-copy';
import { groupRankingByPosition } from './ranking-groups';
import { RankingList } from './ranking-list';
import { ResultsUpsellSlot } from './upsell-slot';
import { WinnerCard } from './winner-card';

/** Final ranking: winner moment, full ranking, and the replay / home actions. */
export function ResultsScreen() {
  const { session, ranking, clearFinishedGame } = useGame();
  const draft = useNewGameDraft();
  // Set together with `clearFinishedGame()` so the empty render does not redirect home.
  const [isLeaving, setIsLeaving] = useState(false);

  if (isLeaving) return null;
  if (session?.status !== 'finished') return <Redirect href={routes.home} />;

  const groups = groupRankingByPosition(ranking);
  const [winnerGroup] = groups;

  const playAgain = () => {
    const { mode, categoryId, players, selectedDifficulties, endCondition, spicyEnabled } =
      session.settings;
    draft.setMode(mode);
    draft.setCategoryId(categoryId);
    draft.setPlayers(players);
    draft.setSelectedDifficulties(selectedDifficulties);
    draft.setEndCondition(endCondition);
    draft.setSpicyEnabled(spicyEnabled);
    setIsLeaving(true);
    clearFinishedGame();
    router.dismissTo(routes.newGame.setup);
  };

  const goHome = () => {
    setIsLeaving(true);
    clearFinishedGame();
    router.dismissTo(routes.home);
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.heading}>
        <AppText variant="label" color={Colors.textSecondary}>
          {resultsCopy.eyebrow}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {resultsCopy.title}
        </AppText>
      </View>
      {winnerGroup ? <WinnerCard group={winnerGroup} /> : null}
      <RankingList groups={groups} />
      <ResultsUpsellSlot />
      <View style={styles.actions}>
        <Button label={resultsCopy.playAgain} size="turn" onPress={playAgain} />
        <Button label={resultsCopy.backHome} variant="secondary" onPress={goHome} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: Spacing.xs,
  },
  actions: {
    marginTop: 'auto',
    gap: Spacing.md,
  },
});
