import { Pressable, StyleSheet, TextInput, View, type TextStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import {
  BorderWidth,
  Colors,
  Fonts,
  Radius,
  ShadowOffset,
  Spacing,
  TouchTarget,
  Typography,
} from '@/constants/theme';
import { playerGenders } from '@/features/content/card-types';
import type { Player } from '@/features/game';

import {
  avatarButtonLabel,
  genderGroupLabel,
  genderLabels,
  nameFieldLabel,
  playerPositionLabel,
  setupCopy,
} from './copy';
import { RemovePlayerButton } from './remove-player-button';

export const maxNameLength = 20;

const rowAvatarSize = 56;
const swapBadgeSize = 24;

export type PlayerRowProps = {
  player: Player;
  /** 1-based turn position. */
  position: number;
  showMissingName: boolean;
  canRemove: boolean;
  onChange: (player: Player) => void;
  onChangeAvatar: () => void;
  onRemove: () => void;
};

/** Expanded player card: avatar (tap to change), name, "No toma", and a one-line gender choice. */
export function PlayerRow({
  player,
  position,
  showMissingName,
  canRemove,
  onChange,
  onChangeAvatar,
  onRemove,
}: PlayerRowProps) {
  const positionLabel = playerPositionLabel(position);

  return (
    <View style={styles.wrapper}>
      <View style={styles.shadow} />
      <View style={styles.card}>
        <View style={styles.nameLine}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={avatarButtonLabel(player.name, position)}
            onPress={onChangeAvatar}
            style={styles.avatarButton}
          >
            <PlayerAvatar avatarId={player.avatarId} size={rowAvatarSize} />
            <View style={styles.swapBadge} importantForAccessibility="no-hide-descendants">
              <AppText style={styles.swapSymbol}>{setupCopy.swapSymbol}</AppText>
            </View>
          </Pressable>
          <TextInput
            accessibilityLabel={nameFieldLabel(position)}
            value={player.name}
            onChangeText={(name) => onChange({ ...player, name })}
            placeholder={setupCopy.namePlaceholder}
            placeholderTextColor={Colors.textMuted}
            maxLength={maxNameLength}
            autoCapitalize="words"
            autoCorrect={false}
            style={[styles.nameInput, showMissingName && styles.nameInputMissing]}
          />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={`${setupCopy.noDrinks}, ${positionLabel}`}
            accessibilityState={{ checked: !player.drinks }}
            onPress={() => onChange({ ...player, drinks: !player.drinks })}
            style={[styles.toggle, !player.drinks && styles.selected]}
          >
            <AppText
              style={styles.compactText}
              color={player.drinks ? Colors.ink : Colors.white}
            >
              {setupCopy.noDrinks}
            </AppText>
          </Pressable>
        </View>
        {showMissingName ? (
          <AppText variant="body" color={Colors.negative}>
            {setupCopy.missingName}
          </AppText>
        ) : null}
        <View style={styles.genderLine}>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={genderGroupLabel(position)}
            style={styles.genderGroup}
          >
            {playerGenders.map((gender) => {
              const selected = player.gender === gender;
              return (
                <Pressable
                  key={gender}
                  accessibilityRole="radio"
                  accessibilityLabel={`${genderLabels[gender]}, ${positionLabel}`}
                  accessibilityState={{ checked: selected }}
                  onPress={() => onChange({ ...player, gender })}
                  style={[styles.genderCell, selected && styles.selected]}
                >
                  <AppText
                    style={[styles.compactText, styles.centered]}
                    color={selected ? Colors.white : Colors.ink}
                  >
                    {genderLabels[gender]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {canRemove ? <RemovePlayerButton position={position} onPress={onRemove} /> : null}
        </View>
      </View>
    </View>
  );
}

const compactTextStyle: TextStyle = {
  fontFamily: Fonts.nunitoExtraBold,
  fontSize: 13,
  lineHeight: 15,
};

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: ShadowOffset.button,
  },
  shadow: {
    ...StyleSheet.absoluteFill,
    top: ShadowOffset.button,
    borderRadius: Radius.xl,
    backgroundColor: Colors.ink,
  },
  card: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarButton: {
    width: rowAvatarSize,
    height: rowAvatarSize,
  },
  swapBadge: {
    position: 'absolute',
    right: -Spacing.sm,
    bottom: -Spacing.sm,
    width: swapBadgeSize,
    height: swapBadgeSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.primary,
  },
  swapSymbol: {
    fontSize: 13,
    lineHeight: 15,
  },
  nameInput: {
    ...Typography.body,
    fontFamily: Fonts.nunitoExtraBold,
    flex: 1,
    minWidth: 0,
    height: TouchTarget.minimum,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.small,
    borderColor: Colors.surfaceSoft,
    backgroundColor: Colors.background,
    color: Colors.ink,
  },
  nameInputMissing: {
    borderColor: Colors.negative,
  },
  toggle: {
    minHeight: TouchTarget.minimum,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  selected: {
    backgroundColor: Colors.ink,
  },
  compactText: compactTextStyle,
  centered: {
    textAlign: 'center',
  },
  genderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  genderGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  genderCell: {
    flex: 1,
    minHeight: TouchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
});
