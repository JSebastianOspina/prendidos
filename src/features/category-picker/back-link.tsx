import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, TouchTarget } from '@/constants/theme';

import { categoryPickerCopy } from './copy';

export type BackLinkProps = {
  /** Where to go when the stack has no history (deep link or web reload). */
  fallbackHref: Href;
};

/** Top-left "Volver": pops the stack, or replaces with the fallback when nothing is behind. */
export function BackLink({ fallbackHref }: BackLinkProps) {
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={categoryPickerCopy.back}
      hitSlop={8}
      onPress={goBack}
      style={styles.link}
    >
      <AppText color={Colors.textSecondary}>
        {`${categoryPickerCopy.backSymbol} ${categoryPickerCopy.back}`}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'flex-start',
    minHeight: TouchTarget.minimum,
    minWidth: TouchTarget.minimum,
    justifyContent: 'center',
  },
});
