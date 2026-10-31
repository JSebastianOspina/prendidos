import { router } from 'expo-router';

import type { GameMode } from '@/features/content/card-types';
import { useNewGameDraft } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { ChoiceCard } from './choice-card';
import { categoryPickerCopy, playerRangeLabel } from './copy';
import { accentByMode } from './mode-accent';
import { PickerLayout } from './picker-layout';

const modeOrder: readonly GameMode[] = ['friends', 'couple'];

/** "Elegir modo": Amigos or Pareja, then the category list of that mode. */
export function ModePickerScreen() {
  const { setMode } = useNewGameDraft();

  const chooseMode = (mode: GameMode) => {
    setMode(mode);
    router.push(routes.newGame.category);
  };

  return (
    <PickerLayout
      title={categoryPickerCopy.mode.title}
      subtitle={categoryPickerCopy.mode.subtitle}
      backFallbackHref={routes.home}
    >
      {modeOrder.map((mode) => (
        <ChoiceCard
          key={mode}
          title={categoryPickerCopy.modes[mode].name}
          subtitle={playerRangeLabel(mode)}
          description={categoryPickerCopy.modes[mode].tone}
          accentColor={accentByMode[mode]}
          onPress={() => chooseMode(mode)}
        />
      ))}
    </PickerLayout>
  );
}
