import { Text, type TextProps } from 'react-native';

import { Colors, Typography, type TypographyVariant } from '@/constants/theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: string;
};

/** Text in the brand typography; defaults to body copy in `ink`. */
export function AppText({ variant = 'body', color = Colors.ink, style, ...rest }: AppTextProps) {
  return <Text style={[Typography[variant], { color }, style]} {...rest} />;
}
