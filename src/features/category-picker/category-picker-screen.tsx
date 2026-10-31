import { Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Category, GameMode } from '@/features/content/card-types';
import { categoriesForMode } from '@/features/content/catalog';
import { playerLimitsByMode, useNewGameDraft } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { BackLink } from './back-link';
import { CategoryCard } from './category-card';
import { isFullyFree, standardCardCounts, totalCards } from './category-details';
import { categoryPickerCopy } from './copy';
import { CoupleCategoryCard } from './couple-category-card';
import { accentByMode } from './mode-accent';
import { PillChip } from './pill-chip';

type CategoryEntryProps = { mode: GameMode; category: Category; onChoose: () => void };

/** Amigos cards are one big button; Pareja cards list their levels and end in a play button. */
function CategoryEntry({ mode, category, onChoose }: CategoryEntryProps) {
  const cardCounts = standardCardCounts(category.id);
  if (mode === 'couple') {
    return (
      <CoupleCategoryCard
        name={category.name}
        cardCounts={cardCounts}
        freeDifficulties={category.freeDifficulties}
        onPlay={onChoose}
      />
    );
  }
  return (
    <CategoryCard
      name={category.name}
      description={category.description}
      cardCount={totalCards(cardCounts)}
      isFree={isFullyFree(category)}
      onPress={onChoose}
    />
  );
}

/** "Elegir categoría": the categories of the draft's mode, from the top, under the mode header. */
export function CategoryPickerScreen() {
  const { mode, setCategoryId } = useNewGameDraft();
  if (!mode) return <Redirect href={routes.home} />;

  const categories = categoriesForMode(mode);
  const { min: minPlayers, max: maxPlayers } = playerLimitsByMode[mode];
  const chooseCategory = (categoryId: string) => {
    setCategoryId(categoryId);
    router.push(routes.newGame.setup);
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <BackLink fallbackHref={routes.home} />
        <AppText variant="title" accessibilityRole="header" style={styles.title}>
          {categoryPickerCopy.modes[mode].name}
        </AppText>
        {minPlayers === maxPlayers ? (
          <PillChip
            label={categoryPickerCopy.playersChip(maxPlayers)}
            backgroundColor={accentByMode[mode]}
          />
        ) : null}
      </View>
      <AppText color={Colors.textSecondary} style={styles.subtitle}>
        {categoryPickerCopy.modes[mode].subtitle}
      </AppText>

      {categories.length === 0 ? (
        <AppText>{categoryPickerCopy.empty}</AppText>
      ) : (
        categories.map((category) => (
          <CategoryEntry
            key={category.id}
            mode={mode}
            category={category}
            onChoose={() => chooseCategory(category.id)}
          />
        ))
      )}
      {/* HU-08/09 slots: "Pase total" and "Restaurar compras" go below the list. */}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    flexShrink: 1,
    marginRight: 'auto',
  },
  subtitle: {
    fontFamily: Fonts.nunitoExtraBold,
  },
});
