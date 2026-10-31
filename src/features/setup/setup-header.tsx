import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import {
  BorderWidth,
  Colors,
  PressedTravel,
  Radius,
  Spacing,
  TouchTarget,
} from '@/constants/theme';
import { routes } from '@/features/navigation/routes';

import { setupCopy } from './copy';

export type SetupHeaderProps = {
  /** Category name shown as the eyebrow; omitted when unknown. */
  categoryName?: string;
};

const backShadowOffset = 4;
const chevronSize = 14;

/** Square back button, the category as eyebrow, and "¿Quiénes juegan?". */
export function SetupHeader({ categoryName }: SetupHeaderProps) {
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(routes.newGame.category);
  };

  return (
    <View style={styles.header}>
      <View style={styles.backWrapper}>
        <View style={styles.backShadow} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={setupCopy.back}
          onPress={goBack}
          style={({ pressed }) => [
            styles.backFace,
            pressed && { transform: [{ translateY: PressedTravel }] },
          ]}
        >
          <View style={styles.chevron} />
        </Pressable>
      </View>
      <View style={styles.titles}>
        {categoryName ? (
          <AppText variant="label" color={Colors.textSecondary}>
            {categoryName}
          </AppText>
        ) : null}
        <AppText variant="title" accessibilityRole="header" style={styles.title}>
          {setupCopy.title}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backWrapper: {
    width: TouchTarget.minimum,
    height: TouchTarget.minimum + backShadowOffset,
    alignSelf: 'flex-start',
  },
  backShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: backShadowOffset,
    height: TouchTarget.minimum,
    borderRadius: Radius.md,
    backgroundColor: Colors.ink,
  },
  backFace: {
    height: TouchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  /** Two borders of a rotated square draw the "‹" chevron without an icon font. */
  chevron: {
    width: chevronSize,
    height: chevronSize,
    marginLeft: chevronSize / 3,
    borderLeftWidth: BorderWidth.regular,
    borderBottomWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    transform: [{ rotate: '45deg' }],
  },
  titles: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    lineHeight: 35,
  },
});
