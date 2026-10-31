import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import {
  BorderWidth,
  Colors,
  PressedTravel,
  Radius,
  TouchTarget,
} from '@/constants/theme';

import { categoryPickerCopy } from './copy';

const backShadowOffset = 4;

export type BackLinkProps = {
  /** Where to go when the stack has no history (deep link or web reload). */
  fallbackHref: Href;
};

/** Square outlined "Volver" button: pops the stack, or replaces with the fallback when nothing is behind. */
export function BackLink({ fallbackHref }: BackLinkProps) {
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.shadow} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={categoryPickerCopy.back}
        onPress={goBack}
        style={({ pressed }) => [
          styles.face,
          pressed && { transform: [{ translateY: PressedTravel }] },
        ]}
      >
        <AppText variant="title" style={styles.chevron}>
          {categoryPickerCopy.backSymbol}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: TouchTarget.minimum,
    height: TouchTarget.minimum + backShadowOffset,
  },
  shadow: {
    position: 'absolute',
    top: backShadowOffset,
    width: TouchTarget.minimum,
    height: TouchTarget.minimum,
    borderRadius: Radius.md,
    backgroundColor: Colors.ink,
  },
  face: {
    width: TouchTarget.minimum,
    height: TouchTarget.minimum,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    marginTop: -BorderWidth.regular,
  },
});
