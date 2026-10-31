import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { levelLabels } from '@/components/ui/level-badge';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Colors, LevelColors, Spacing } from '@/constants/theme';
import { allDifficulties } from '@/features/content/card-types';
import {
  createLocalId,
  playerLimitsByMode,
  useGame,
  useNewGameDraft,
  type Player,
} from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { endConditionLabel, setupCopy } from './copy';
import { OptionChip } from './option-chip';
import { PlayerRow } from './player-row';
import {
  createEmptyPlayer,
  endConditionOptions,
  hasMissingName,
  isSameEndCondition,
  preparePlayersForMode,
  shufflePlayers,
  toggleDifficulty,
  trimPlayerNames,
} from './setup-rules';
import { SpicySwitchSlot } from './spicy-switch-slot';

export type SetupScreenProps = {
  /** Randomness for "Barajar"; injectable for tests. */
  random?: () => number;
};

/** "Setup de partida": players, turn order, levels, and end condition, then "Empezar". */
export function SetupScreen({ random = Math.random }: SetupScreenProps) {
  const draft = useNewGameDraft();
  const { startGame } = useGame();
  const [attemptedStart, setAttemptedStart] = useState(false);
  const [startFailed, setStartFailed] = useState(false);
  const { mode, players, setPlayers, isReadyForSetup } = draft;
  const [wasReadyAtMount] = useState(isReadyForSetup);

  // Redirect only when opened without mode or category; a later draft reset (while this screen
  // sits under another one) must not replace the screen the user is looking at.
  useEffect(() => {
    if (!wasReadyAtMount) router.replace(routes.newGame.mode);
  }, [wasReadyAtMount]);

  useEffect(() => {
    if (!mode) return;
    const prepared = preparePlayersForMode(players, mode, createLocalId);
    if (prepared !== players) setPlayers(prepared);
  }, [mode, players, setPlayers]);

  if (!mode || !isReadyForSetup) return null;

  const limits = playerLimitsByMode[mode];
  const canAddPlayer = players.length < limits.max;
  const canRemovePlayer = players.length > limits.min;
  const missingNames = attemptedStart && players.some(hasMissingName);

  const updatePlayer = (index: number, changed: Player) =>
    setPlayers(players.map((player, position) => (position === index ? changed : player)));
  const removePlayer = (index: number) =>
    setPlayers(players.filter((_, position) => position !== index));

  const start = () => {
    setAttemptedStart(true);
    setStartFailed(false);
    if (players.some(hasMissingName)) return;
    const trimmedPlayers = trimPlayerNames(players);
    setPlayers(trimmedPlayers);
    const errors = startGame({ ...draft.toSettings(), players: trimmedPlayers });
    if (errors.length === 0) router.push(routes.play);
    else setStartFailed(true);
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="title" accessibilityRole="header">
          {setupCopy.title}
        </AppText>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitle}>
            <AppText variant="label">{setupCopy.playersHeading}</AppText>
            <AppText variant="body" color={Colors.textMuted}>
              {setupCopy.playersHint}
            </AppText>
          </View>
          <Button
            variant="secondary"
            label={setupCopy.shuffle}
            onPress={() => setPlayers(shufflePlayers(players, random))}
            style={styles.shuffleButton}
          />
        </View>

        {players.map((player, index) => (
          <PlayerRow
            key={player.id}
            player={player}
            position={index + 1}
            showMissingName={attemptedStart && hasMissingName(player)}
            canRemove={canRemovePlayer}
            onChange={(changed) => updatePlayer(index, changed)}
            onRemove={() => removePlayer(index)}
          />
        ))}

        {canAddPlayer ? (
          <Button
            variant="secondary"
            label={setupCopy.addPlayer}
            onPress={() => setPlayers([...players, createEmptyPlayer(createLocalId)])}
          />
        ) : null}

        <View style={styles.section}>
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
                selected={draft.selectedDifficulties.includes(difficulty)}
                selectedColors={LevelColors[difficulty]}
                onPress={() =>
                  draft.setSelectedDifficulties(
                    toggleDifficulty(draft.selectedDifficulties, difficulty),
                  )
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="label">{setupCopy.endHeading}</AppText>
          <View style={styles.chips}>
            {endConditionOptions.map((endCondition) => (
              <OptionChip
                key={endConditionLabel(endCondition)}
                role="radio"
                label={endConditionLabel(endCondition)}
                selected={isSameEndCondition(draft.endCondition, endCondition)}
                onPress={() => draft.setEndCondition(endCondition)}
              />
            ))}
          </View>
        </View>

        {mode === 'friends' ? <SpicySwitchSlot /> : null}
      </ScrollView>

      <View style={styles.footer}>
        {missingNames ? (
          <AppText variant="body" color={Colors.negative}>
            {setupCopy.missingNamesSummary}
          </AppText>
        ) : null}
        {startFailed ? (
          <AppText variant="body" color={Colors.negative}>
            {setupCopy.startFailed}
          </AppText>
        ) : null}
        <Button size="turn" label={setupCopy.start} onPress={start} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
  },
  formContent: {
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  sectionTitle: {
    flex: 1,
    gap: Spacing.xs,
  },
  shuffleButton: {
    alignSelf: 'center',
  },
  section: {
    gap: Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  footer: {
    gap: Spacing.sm,
  },
});
