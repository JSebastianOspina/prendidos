import { AppText, type AppTextProps } from '@/components/ui/app-text';
import { Colors } from '@/constants/theme';

import { formatPoints } from './results-copy';

type ScoreTextProps = Omit<AppTextProps, 'children' | 'color'> & { score: number };

/** A final score ("12 pts"); negative scores take the `negative` color. */
export function ScoreText({ score, variant = 'button', ...rest }: ScoreTextProps) {
  return (
    <AppText variant={variant} color={score < 0 ? Colors.negative : Colors.ink} {...rest}>
      {formatPoints(score)}
    </AppText>
  );
}
