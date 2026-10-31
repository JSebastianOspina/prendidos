import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { BorderWidth, Colors, Fonts, Radius, Spacing, TouchTarget } from '@/constants/theme';
import type { Player } from '@/features/game';

import { expandPlayerLabel, playerSummary, setupCopy } from './copy';
import { RemovePlayerButton } from './remove-player-button';

const summaryAvatarSize = 36;

export type PlayerSummaryRowProps = {
  player: Player;
  /** 1-based turn position. */
  position: number;
  showMissingName: boolean;
  canRemove: boolean;
  onExpand: () => void;
  onRemove: () => void;
};

/** Collapsed player row ("Caro · Mujer"); tapping it opens the full row. */
export function PlayerSummaryRow({
  player,
  position,
  showMissingName,
  canRemove,
  onExpand,
  onRemove,
}: PlayerSummaryRowProps) {
  const summary = playerSummary(player, position);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expandPlayerLabel(summary, position)}
        onPress={onExpand}
        style={styles.expandArea}
      >
        <PlayerAvatar avatarId={player.avatarId} size={summaryAvatarSize} />
        <View style={styles.texts}>
          <AppText style={styles.summary} numberOfLines={1}>
            {summary}
          </AppText>
          {showMissingName ? (
            <AppText variant="body" color={Colors.negative}>
              {setupCopy.missingName}
            </AppText>
          ) : null}
        </View>
      </Pressable>
      {canRemove ? <RemovePlayerButton position={position} onPress={onRemove} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  expandArea: {
    flex: 1,
    minHeight: TouchTarget.minimum,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  texts: {
    flex: 1,
  },
  summary: {
    fontFamily: Fonts.nunitoExtraBold,
  },
});
