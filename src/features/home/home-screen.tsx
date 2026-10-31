import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { BorderWidth, Colors, Radius, ShadowOffset, Spacing } from '@/constants/theme';
import { useNewGameDraft } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { homeCopy } from './copy';

const logoTileSize = 64;

/** Brand red tile with an ink outline and hard shadow; decorative, the wordmark names the app. */
function LogoTile() {
  return (
    <View
      style={styles.logoWrapper}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.logoShadow} />
      <View style={styles.logoFace}>
        <AppText variant="title" color={Colors.white}>
          {homeCopy.logoInitial}
        </AppText>
      </View>
    </View>
  );
}

/** Inicio: the brand up top and the way into a new game within thumb reach. */
export function HomeScreen() {
  const { reset } = useNewGameDraft();

  const startNewGame = () => {
    reset();
    router.push(routes.newGame.mode);
  };

  return (
    <ScreenContainer>
      <View style={styles.brand}>
        <LogoTile />
        <AppText variant="display" color={Colors.brandRed} accessibilityRole="header">
          {homeCopy.wordmark}
        </AppText>
        <AppText color={Colors.textSecondary} style={styles.tagline}>
          {homeCopy.tagline}
        </AppText>
      </View>

      <View style={styles.actions}>
        {/* HU-12 slot: dark "Continuar partida" button (Button variant="dark") goes here. */}
        <Button label={homeCopy.newGame} onPress={startNewGame} />
        {/* HU-08 slot: small "Restaurar compras" text link (textSecondary) goes here. */}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  logoWrapper: {
    width: logoTileSize,
    height: logoTileSize + ShadowOffset.card,
    marginBottom: Spacing.sm,
  },
  logoShadow: {
    position: 'absolute',
    top: ShadowOffset.card,
    width: logoTileSize,
    height: logoTileSize,
    borderRadius: Radius.md,
    backgroundColor: Colors.ink,
  },
  logoFace: {
    width: logoTileSize,
    height: logoTileSize,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.brandRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});
