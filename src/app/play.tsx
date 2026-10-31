import { router } from 'expo-router';
import { useEffect } from 'react';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { CardFrame } from '@/components/ui/card-frame';
import { LevelBadge } from '@/components/ui/level-badge';
import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { useGame } from '@/features/game';
import { routes } from '@/features/navigation/routes';

/** Placeholder until HU-05: shows whose turn it is and the card, and moves the game on. */
export default function PlayScreen() {
  const game = useGame();
  const isFinished = game.session?.status === 'finished';

  useEffect(() => {
    if (isFinished) router.replace(routes.results);
  }, [isFinished]);

  return (
    <PlaceholderScreen
      title="Turno"
      story="HU-05"
      nextLabel={game.isGroupInterlude ? 'Seguir' : 'Cumplió'}
      onNext={game.isGroupInterlude ? game.nextAfterGroupCard : game.completeCard}
    >
      {game.currentDifficulty ? <LevelBadge difficulty={game.currentDifficulty} /> : null}
      <AppText>{`Ronda ${game.session?.currentRound ?? '-'} · Le toca a ${game.currentPlayer?.name ?? '-'}`}</AppText>
      <CardFrame tone={game.isGroupInterlude ? 'group' : 'surface'}>
        {game.currentCardCopy?.headline ? (
          <AppText variant="button">{game.currentCardCopy.headline}</AppText>
        ) : null}
        <AppText variant="card">{game.currentCardCopy?.body ?? ''}</AppText>
      </CardFrame>
      <Button label="Terminar partida" variant="secondary" onPress={game.endGame} />
    </PlaceholderScreen>
  );
}
