import { router } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { useNewGameDraft } from '@/features/game';
import { routes } from '@/features/navigation/routes';

/** Placeholder until HU-03. Picks Amigos. */
export default function ModeScreen() {
  const { setMode } = useNewGameDraft();
  return (
    <PlaceholderScreen
      title="Modo"
      story="HU-03"
      nextLabel="Amigos"
      onNext={() => {
        setMode('friends');
        router.push(routes.newGame.category);
      }}
    />
  );
}
