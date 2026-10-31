import { router } from 'expo-router';

import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { categoriesForMode } from '@/features/content/catalog';
import { useNewGameDraft } from '@/features/game';
import { routes } from '@/features/navigation/routes';

/** Placeholder until HU-03. Picks the first category of the chosen mode. */
export default function CategoryScreen() {
  const { mode = 'friends', setCategoryId } = useNewGameDraft();
  const [firstCategory] = categoriesForMode(mode);
  return (
    <PlaceholderScreen
      title="Categoría"
      story="HU-03"
      nextLabel={firstCategory.name}
      onNext={() => {
        setCategoryId(firstCategory.id);
        router.push(routes.newGame.setup);
      }}
    />
  );
}
