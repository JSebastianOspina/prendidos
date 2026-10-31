import { router } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { useGame } from '@/features/game';
import { routes } from '@/features/navigation/routes';

/** Placeholder until HU-06. */
export default function ResultsScreen() {
  const { ranking, clearFinishedGame } = useGame();
  return (
    <PlaceholderScreen
      title="Ranking"
      story="HU-06"
      nextLabel="Volver al inicio"
      onNext={() => {
        clearFinishedGame();
        router.dismissTo(routes.home);
      }}>
      {ranking.map((entry) => (
        <AppText key={entry.player.id}>{`${entry.position}. ${entry.player.name} — ${entry.score} pts`}</AppText>
      ))}
    </PlaceholderScreen>
  );
}
