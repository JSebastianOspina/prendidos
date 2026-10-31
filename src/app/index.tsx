import { router } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { routes } from '@/features/navigation/routes';

/** Placeholder until HU-02. */
export default function HomeScreen() {
  return (
    <PlaceholderScreen
      title="Inicio"
      story="HU-02"
      nextLabel="Nueva partida"
      onNext={() => router.push(routes.newGame.mode)}
    />
  );
}
