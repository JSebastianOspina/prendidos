import { router } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { createLocalId, createPlayer, useGame, useNewGameDraft } from '@/features/game';
import { routes } from '@/features/navigation/routes';

const demoPlayerNames = ['Jugador 1', 'Jugador 2', 'Jugador 3'];

/** Placeholder until HU-04. Starts a game with the last players, or three demo players. */
export default function SetupScreen() {
  const draft = useNewGameDraft();
  const { startGame } = useGame();

  const start = () => {
    const players =
      draft.players.length >= 2
        ? draft.players
        : demoPlayerNames.map((name) =>
            createPlayer({ name, gender: 'undisclosed' }, createLocalId),
          );
    const errors = startGame({ ...draft.toSettings(), players });
    if (errors.length === 0) router.push(routes.play);
  };

  return (
    <PlaceholderScreen
      title="Configurar partida"
      story="HU-04"
      nextLabel="¡A jugar!"
      onNext={start}
    />
  );
}
