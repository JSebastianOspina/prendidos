import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { BorderWidth, Colors, Radius, ShadowOffset, Spacing } from '@/constants/theme';
import { useDeviceState } from '@/features/device/device-state-provider';

import { ageGateCopy } from './age-gate-copy';

/**
 * One-time 18+ gate shown before any other screen (PRD §8).
 *
 * SECURITY REVIEW NEEDED — auth/authz/security impact: this is the age gate. Confirming stores
 * `ageConfirmedAt` through `confirmAge()`; the `Stack.Protected` guard in the root layout then
 * unlocks every other route and leaves this screen by itself, so the screen never navigates.
 * Declining is local state only: nothing is stored and every other route stays guarded.
 */
export function AgeGateScreen() {
  const { confirmAge } = useDeviceState();
  const [hasDeclined, setHasDeclined] = useState(false);

  return (
    <ScreenContainer>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.logoTile}>
          <View style={styles.logoShadow} />
          <View style={styles.logoFace}>
            <AppText variant="title" color={Colors.white}>
              {ageGateCopy.wordmark}
            </AppText>
          </View>
        </View>
        <AppText variant="label" color={Colors.textSecondary} style={styles.centered}>
          {ageGateCopy.adultsOnlyLabel}
        </AppText>
        <AppText variant="title" accessibilityRole="header" style={styles.centered}>
          {ageGateCopy.question}
        </AppText>
        <AppText style={styles.centered}>{ageGateCopy.responsibleDrinkingNotice}</AppText>
      </ScrollView>
      <View style={styles.actions}>
        {/* In the fixed footer, so the message is never scrolled out of view on small phones. */}
        {hasDeclined ? (
          <View style={styles.declined}>
            <AppText
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={styles.centered}
            >
              {ageGateCopy.adultsOnlyMessage}
            </AppText>
          </View>
        ) : null}
        <Button label={ageGateCopy.confirmAction} onPress={confirmAge} />
        <Button
          label={ageGateCopy.declineAction}
          variant="secondary"
          onPress={() => setHasDeclined(true)}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  logoTile: {
    paddingBottom: ShadowOffset.card,
    marginBottom: Spacing.sm,
  },
  logoShadow: {
    ...StyleSheet.absoluteFill,
    top: ShadowOffset.card,
    borderRadius: Radius.xl,
    backgroundColor: Colors.ink,
  },
  logoFace: {
    backgroundColor: Colors.brandRed,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  centered: {
    textAlign: 'center',
  },
  declined: {
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    padding: Spacing.lg,
  },
  actions: {
    gap: Spacing.md,
  },
});
