import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/ui/mascot';
import { ScreenContainer } from '@/components/ui/screen-container';
import { BorderWidth, Colors, Fonts, Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useDeviceState } from '@/features/device/device-state-provider';

import { ageGateCopy } from './age-gate-copy';
import { mascotHeightFor } from './age-gate-layout';
import { ModerationCard } from './moderation-card';

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
  const { height: windowHeight } = useWindowDimensions();
  const [hasDeclined, setHasDeclined] = useState(false);

  return (
    <ScreenContainer>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Mascot art="pointing" size={mascotHeightFor(windowHeight)} style={styles.mascot} />
        <AppText variant="title" accessibilityRole="header" style={styles.centered}>
          {ageGateCopy.question}
        </AppText>
        <AppText color={Colors.textSecondary} style={[styles.centered, styles.subtitle]}>
          {ageGateCopy.subtitle}
        </AppText>
        <ModerationCard message={ageGateCopy.moderationNotice} />
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ageGateCopy.declineAction}
          onPress={() => setHasDeclined(true)}
          style={({ pressed }) => [styles.declineLink, pressed && styles.declineLinkPressed]}
        >
          <AppText color={Colors.textSecondary} style={styles.declineLinkText}>
            {ageGateCopy.declineAction}
          </AppText>
        </Pressable>
        <AppText color={Colors.textMuted} style={[styles.centered, styles.footnote]}>
          {ageGateCopy.askedOnceNote}
        </AppText>
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
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  mascot: {
    alignSelf: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 25,
  },
  declined: {
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    padding: Spacing.lg,
  },
  actions: {
    gap: Spacing.sm,
  },
  declineLink: {
    minHeight: TouchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  declineLinkPressed: {
    opacity: 0.6,
  },
  declineLinkText: {
    fontFamily: Fonts.nunitoExtraBold,
    textAlign: 'center',
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
  },
});
