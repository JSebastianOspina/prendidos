import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Mascot } from '@/components/ui/mascot';
import { ScreenContainer } from '@/components/ui/screen-container';
import { BorderWidth, Colors, Radius, Spacing } from '@/constants/theme';
import type { GameMode } from '@/features/content/card-types';
import { useNewGameDraft } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { homeCopy } from './copy';
import { ModeCard } from './mode-card';
import { CoupleIllustration, FriendsIllustration } from './mode-illustrations';

const logoTileSize = 64;
const logoArtSize = 50;
/** Proposal heights: Amigos is the bigger, first choice. */
const friendsCardHeight = 210;
const coupleCardHeight = 180;
const logoShadowOffset = 4;

/** Brand red tile with the mascot icon; decorative, the wordmark names the app. */
function LogoTile() {
  return (
    <View
      style={styles.logoWrapper}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.logoShadow} />
      <View style={styles.logoFace}>
        <Mascot art="icon" size={logoArtSize} />
      </View>
    </View>
  );
}

/** Inicio: the brand, then the two modes; tapping one starts a fresh game draft. */
export function HomeScreen() {
  const { reset, setMode } = useNewGameDraft();

  const chooseMode = (mode: GameMode) => {
    reset();
    setMode(mode);
    router.push(routes.newGame.category);
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        {/* Out of scope: the settings button waits for a settings screen. */}
        <LogoTile />
        <AppText
          variant="title"
          color={Colors.brandRed}
          accessibilityRole="header"
          style={styles.wordmark}
        >
          {homeCopy.wordmark}
        </AppText>
      </View>

      {/* HU-12 slot: the dark "Continuar partida" card goes here. */}

      <AppText variant="card" accessibilityRole="header" style={styles.question}>
        {homeCopy.modeQuestion}
      </AppText>

      <ModeCard
        title={homeCopy.modes.friends.title}
        subtitle={homeCopy.modes.friends.subtitle}
        backgroundColor={Colors.primary}
        minHeight={friendsCardHeight}
        illustration={<FriendsIllustration style={styles.friendsArt} />}
        onPress={() => chooseMode('friends')}
      />
      <ModeCard
        title={homeCopy.modes.couple.title}
        subtitle={homeCopy.modes.couple.subtitle}
        backgroundColor={Colors.couple}
        minHeight={coupleCardHeight}
        illustration={<CoupleIllustration style={styles.coupleArt} />}
        onPress={() => chooseMode('couple')}
      />

      <View style={styles.spacer} />
      <AppText variant="label" color={Colors.textMuted} style={styles.footer}>
        {homeCopy.moderation}
      </AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  wordmark: {
    flexShrink: 1,
  },
  logoWrapper: {
    width: logoTileSize,
    height: logoTileSize + logoShadowOffset,
  },
  logoShadow: {
    position: 'absolute',
    top: logoShadowOffset,
    width: logoTileSize,
    height: logoTileSize,
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
  },
  logoFace: {
    width: logoTileSize,
    height: logoTileSize,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.brandRed,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  question: {
    marginTop: Spacing.sm,
  },
  friendsArt: {
    position: 'absolute',
    top: 14,
    right: 10,
  },
  coupleArt: {
    position: 'absolute',
    top: 14,
    right: 16,
  },
  spacer: {
    flexGrow: 1,
  },
  footer: {
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
  },
});
