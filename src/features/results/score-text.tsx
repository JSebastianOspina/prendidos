import { AppText, type AppTextProps } from '@/components/ui/app-text';
import { Colors } from '@/constants/theme';

import { formatPoints } from './results-copy';

type ScoreTextProps = Omit<AppTextProps, 'children' | 'color'> & {
  score: number;
  /** On a `primary` fill `negative` fails contrast, so the score stays `ink` (the minus remains). */
  onPrimary?: boolean;
};

/** A final score ("12 pts"); negative scores take the `negative` color. */
export function ScoreText({ score, variant = 'body', onPrimary = false, ...rest }: ScoreTextProps) {
  const color = score < 0 && !onPrimary ? Colors.negative : Colors.ink;
  return (
    <AppText variant={variant} color={color} {...rest}>
      {formatPoints(score)}
    </AppText>
  );
}
