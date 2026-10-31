import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BorderWidth, Colors, Radius, Spacing, TouchTarget, Typography } from '@/constants/theme';
import { playerGenders } from '@/features/content/card-types';
import type { Player } from '@/features/game';

import {
  genderLabels,
  nameFieldLabel,
  playerPositionLabel,
  removePlayerLabel,
  setupCopy,
} from './copy';
import { OptionChip } from './option-chip';

const maxNameLength = 20;

export type PlayerRowProps = {
  player: Player;
  /** 1-based turn position. */
  position: number;
  showMissingName: boolean;
  canRemove: boolean;
  onChange: (player: Player) => void;
  onRemove: () => void;
};

/** One player: name, gender, "No toma", and an optional remove control. */
export function PlayerRow({
  player,
  position,
  showMissingName,
  canRemove,
  onChange,
  onRemove,
}: PlayerRowProps) {
  const positionLabel = playerPositionLabel(position);

  return (
    <View style={styles.row}>
      <View style={styles.nameLine}>
        <AppText variant="button">{position}</AppText>
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
        {canRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={removePlayerLabel(position)}
            onPress={onRemove}
            style={styles.removeButton}
          >
            <AppText variant="button">{setupCopy.removeSymbol}</AppText>
          </Pressable>
        ) : null}
      </View>
      {showMissingName ? (
        <AppText variant="body" color={Colors.negative}>
          {setupCopy.missingName}
        </AppText>
      ) : null}
      <View style={styles.chips}>
        {playerGenders.map((gender) => (
          <OptionChip
            key={gender}
            role="radio"
            label={genderLabels[gender]}
            accessibilityLabel={`${genderLabels[gender]}, ${positionLabel}`}
            selected={player.gender === gender}
            onPress={() => onChange({ ...player, gender })}
          />
        ))}
        <OptionChip
          role="checkbox"
          label={setupCopy.noDrinks}
          accessibilityLabel={`${setupCopy.noDrinks}, ${positionLabel}`}
          selected={!player.drinks}
          onPress={() => onChange({ ...player, drinks: !player.drinks })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameInput: {
    ...Typography.body,
    flex: 1,
    minHeight: TouchTarget.minimum,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.small,
    borderColor: Colors.surfaceSoft,
    color: Colors.ink,
  },
  nameInputMissing: {
    borderColor: Colors.negative,
  },
  removeButton: {
    width: TouchTarget.minimum,
    height: TouchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
