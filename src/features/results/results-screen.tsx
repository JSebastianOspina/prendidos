import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Spacing } from '@/constants/theme';
import { categoriesForMode } from '@/features/content/catalog';
import { useGame, useNewGameDraft, type GameSettings } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { Podium } from './podium';
import { RankingHeader } from './ranking-header';
import { layoutRanking } from './ranking-layout';
import { RankingRows } from './ranking-rows';
import { rankingEyebrow, resultsCopy } from './results-copy';
import { roundsPlayed } from './rounds-played';
import { ResultsUpsellSlot } from './upsell-slot';

function categoryNameOf({ mode, categoryId }: GameSettings): string | undefined {
  return categoriesForMode(mode).find((category) => category.id === categoryId)?.name;
}

/** Final ranking: crowned header, podium, remaining rows, and the replay / home actions. */
export function ResultsScreen() {
  const { session, ranking, clearFinishedGame } = useGame();
  const draft = useNewGameDraft();
  // Set together with `clearFinishedGame()` so the empty render does not redirect home.
  const [isLeaving, setIsLeaving] = useState(false);

  if (isLeaving) return null;
  if (session?.status !== 'finished') return <Redirect href={routes.home} />;

  const { winners, podium, rows } = layoutRanking(ranking);
  const eyebrow = rankingEyebrow({
    categoryName: categoryNameOf(session.settings),
    endCondition: session.settings.endCondition,
    roundsPlayed: roundsPlayed(session),
  });

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
      <RankingHeader
        eyebrow={eyebrow}
        winnerNames={winners.map((winner) => winner.player.name)}
      />
      <Podium entries={podium} isTieForFirst={winners.length > 1} />
      <RankingRows entries={rows} />
      <ResultsUpsellSlot />
      <View style={styles.actions}>
        <Button
          label={resultsCopy.backHome}
          accessibilityLabel={resultsCopy.backHomeAccessibilityLabel}
          variant="secondary"
          onPress={goHome}
          style={styles.homeAction}
        />
        <Button
          label={resultsCopy.playAgain}
          accessibilityLabel={resultsCopy.playAgainAccessibilityLabel}
          onPress={playAgain}
          style={styles.playAgainAction}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  // 2 : 3 instead of the proposal's 1 : 2 so "Inicio" fits the button padding at 375 pt.
  homeAction: {
    flexGrow: 2,
    flexShrink: 1,
    flexBasis: 0,
  },
  playAgainAction: {
    flexGrow: 3,
    flexShrink: 1,
    flexBasis: 0,
  },
});
