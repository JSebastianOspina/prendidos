import { Redirect, router } from 'expo-router';

import { AppText } from '@/components/ui/app-text';
import { categoriesForMode } from '@/features/content/catalog';
import { useNewGameDraft } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { ChoiceCard } from './choice-card';
import { categoryPickerCopy } from './copy';
import { accentByMode } from './mode-accent';
import { PickerLayout } from './picker-layout';

/** "Elegir categoría": the categories of the draft's mode; names and descriptions come from content. */
export function CategoryPickerScreen() {
  const { mode, setCategoryId } = useNewGameDraft();
  if (!mode) return <Redirect href={routes.newGame.mode} />;

  const categories = categoriesForMode(mode);
  const chooseCategory = (categoryId: string) => {
    setCategoryId(categoryId);
    router.push(routes.newGame.setup);
  };

  return (
    <PickerLayout
      title={categoryPickerCopy.category.title}
      subtitle={categoryPickerCopy.category.subtitleForMode(mode)}
      backFallbackHref={routes.newGame.mode}
    >
      {categories.length === 0 ? (
        <AppText>{categoryPickerCopy.category.empty}</AppText>
      ) : (
        categories.map((category) => (
          <ChoiceCard
            key={category.id}
            title={category.name}
            description={category.description}
            accentColor={accentByMode[mode]}
            onPress={() => chooseCategory(category.id)}
          />
        ))
      )}
    </PickerLayout>
  );
}
