import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { levelLabels } from '@/components/ui/level-badge';
import { BorderWidth, Colors, LevelColors, Radius, Spacing } from '@/constants/theme';
import { allDifficulties, type Difficulty } from '@/features/content/card-types';
import type { EndCondition } from '@/features/game';

import {
  endChipLabel,
  endConditionLabel,
  levelsChipLabel,
  levelsSummary,
  setupCopy,
} from './copy';
import { OptionChip } from './option-chip';
import { endConditionOptions, isSameEndCondition, toggleDifficulty } from './setup-rules';
import { SummaryChip } from './summary-chip';

type OpenOptions = 'end' | 'levels' | undefined;

export type GameOptionsProps = {
  endCondition: EndCondition;
  selectedDifficulties: Difficulty[];
  onEndConditionChange: (endCondition: EndCondition) => void;
  onDifficultiesChange: (difficulties: Difficulty[]) => void;
  onShuffle: () => void;
};

/** FIN / NIVELES / ORDEN chips; FIN and NIVELES open their full list inline, one at a time. */
export function GameOptions({
  endCondition,
  selectedDifficulties,
  onEndConditionChange,
  onDifficultiesChange,
  onShuffle,
}: GameOptionsProps) {
  const [openOptions, setOpenOptions] = useState<OpenOptions>(undefined);
  const toggleOpen = (options: Exclude<OpenOptions, undefined>) =>
    setOpenOptions((current) => (current === options ? undefined : options));
  const endValue = endConditionLabel(endCondition);
  const levelsValue = levelsSummary(selectedDifficulties);

  return (
    <View style={styles.options}>
      <View style={styles.chipRow}>
        <SummaryChip
          caption={setupCopy.endChip}
          value={endValue}
          accessibilityLabel={endChipLabel(endValue)}
          expanded={openOptions === 'end'}
          onPress={() => toggleOpen('end')}
        />
        <SummaryChip
          caption={setupCopy.levelsChip}
          value={levelsValue}
          accessibilityLabel={levelsChipLabel(levelsValue)}
          expanded={openOptions === 'levels'}
          onPress={() => toggleOpen('levels')}
        />
        <SummaryChip
          caption={setupCopy.orderChip}
          value={setupCopy.shuffle}
          accessibilityLabel={setupCopy.shuffleLabel}
          onPress={onShuffle}
        />
      </View>

      {openOptions === 'end' ? (
        <View style={styles.panel}>
          <AppText variant="label">{setupCopy.endHeading}</AppText>
          <View style={styles.chips}>
            {endConditionOptions.map((option) => (
              <OptionChip
                key={endConditionLabel(option)}
                role="radio"
                label={endConditionLabel(option)}
                selected={isSameEndCondition(endCondition, option)}
                onPress={() => onEndConditionChange(option)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {openOptions === 'levels' ? (
        <View style={styles.panel}>
          <AppText variant="label">{setupCopy.levelsHeading}</AppText>
          <AppText variant="body" color={Colors.textMuted}>
            {setupCopy.levelsHint}
          </AppText>
          <View style={styles.chips}>
            {allDifficulties.map((difficulty) => (
              <OptionChip
                key={difficulty}
                role="checkbox"
                label={levelLabels[difficulty]}
                selected={selectedDifficulties.includes(difficulty)}
                selectedColors={LevelColors[difficulty]}
                onPress={() =>
                  onDifficultiesChange(toggleDifficulty(selectedDifficulties, difficulty))
                }
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  panel: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
