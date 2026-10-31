import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Colors, Spacing } from '@/constants/theme';
import { categoriesForMode } from '@/features/content/catalog';
import {
  createLocalId,
  playerLimitsByMode,
  useGame,
  useNewGameDraft,
  type Player,
} from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { AddPlayerButton } from './add-player-button';
import { setupCopy, startButtonLabel } from './copy';
import { GameOptions } from './game-options';
import { PlayerRow } from './player-row';
import { PlayerSummaryRow } from './player-summary-row';
import { SetupHeader } from './setup-header';
import {
  changeAvatar,
  createEmptyPlayer,
  hasMissingName,
  isRowExpanded,
  preparePlayersForMode,
  shufflePlayers,
  trimPlayerNames,
} from './setup-rules';
import { SpicySwitchSlot } from './spicy-switch-slot';

export type SetupScreenProps = {
  /** Randomness for "Barajar"; injectable for tests. */
  random?: () => number;
};

/** "Setup de partida": players, turn order, levels, and end condition, then "¡A jugar!". */
export function SetupScreen({ random = Math.random }: SetupScreenProps) {
  const draft = useNewGameDraft();
  const { startGame } = useGame();
  const [attemptedStart, setAttemptedStart] = useState(false);
  const [startFailed, setStartFailed] = useState(false);
  /** The one row from the third on that the user opened; the first two are always open. */
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | undefined>(undefined);
  const { mode, categoryId, players, setPlayers, isReadyForSetup } = draft;
  const [wasReadyAtMount] = useState(isReadyForSetup);

  // Redirect only when opened without mode or category; a later draft reset (while this screen
  // sits under another one) must not replace the screen the user is looking at.
  useEffect(() => {
    if (!wasReadyAtMount) router.replace(routes.home);
  }, [wasReadyAtMount]);

  useEffect(() => {
    if (!mode) return;
    const prepared = preparePlayersForMode(players, mode, createLocalId);
    if (prepared !== players) setPlayers(prepared);
  }, [mode, players, setPlayers]);

  if (!mode || !isReadyForSetup) return null;

  const categoryName = categoriesForMode(mode).find((category) => category.id === categoryId)?.name;
  const limits = playerLimitsByMode[mode];
  const canAddPlayer = players.length < limits.max;
  const canRemovePlayer = players.length > limits.min;
  const missingNames = attemptedStart && players.some(hasMissingName);

  const updatePlayer = (index: number, changed: Player) =>
    setPlayers(players.map((player, position) => (position === index ? changed : player)));
  const removePlayer = (index: number) =>
    setPlayers(players.filter((_, position) => position !== index));
  const addPlayer = () => {
    const newPlayer = createEmptyPlayer(createLocalId, players);
    setPlayers([...players, newPlayer]);
    setExpandedPlayerId(newPlayer.id);
  };

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
      <SetupHeader categoryName={categoryName} />

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        {players.map((player, index) => {
          const position = index + 1;
          const showMissingName = attemptedStart && hasMissingName(player);
          return isRowExpanded(index, player.id, expandedPlayerId) ? (
            <PlayerRow
              key={player.id}
              player={player}
              position={position}
              showMissingName={showMissingName}
              canRemove={canRemovePlayer}
              onChange={(changed) => updatePlayer(index, changed)}
              onChangeAvatar={() => setPlayers(changeAvatar(players, index))}
              onRemove={() => removePlayer(index)}
            />
          ) : (
            <PlayerSummaryRow
              key={player.id}
              player={player}
              position={position}
              showMissingName={showMissingName}
              canRemove={canRemovePlayer}
              onExpand={() => setExpandedPlayerId(player.id)}
              onRemove={() => removePlayer(index)}
            />
          );
        })}

        {canAddPlayer ? <AddPlayerButton onPress={addPlayer} /> : null}

        <GameOptions
          endCondition={draft.endCondition}
          selectedDifficulties={draft.selectedDifficulties}
          onEndConditionChange={draft.setEndCondition}
          onDifficultiesChange={draft.setSelectedDifficulties}
          onShuffle={() => setPlayers(shufflePlayers(players, random))}
        />

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
        <Button size="turn" label={startButtonLabel(players.length)} onPress={start} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
  },
  formContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  footer: {
    gap: Spacing.sm,
  },
});
