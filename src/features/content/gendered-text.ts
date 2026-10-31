import { placeholderRenderLength, type GenderedText, type PlayerGender } from './card-types';

export type GenderVariantOptions = [masculine: string, feminine: string, neutral: string];

export type TextSegment =
  | { kind: 'text'; value: string }
  | { kind: 'placeholder'; name: string }
  | { kind: 'variant'; options: GenderVariantOptions };

export type TextIssue = {
  kind: 'malformedVariant' | 'unknownToken' | 'unbalancedBrace';
  token: string;
};

export type ParsedText = {
  segments: TextSegment[];
  issues: TextIssue[];
};

const tokenPattern = /\{([^{}]*)\}/g;
const placeholderNamePattern = /^[A-Za-z]+$/;
const strayBracePattern = /[{}]/g;
const variantSeparator = '|';

const variantIndexByGender: Record<PlayerGender, number> = {
  male: 0,
  female: 1,
  undisclosed: 2,
};

const allGenders = Object.keys(variantIndexByGender) as PlayerGender[];

export function parseGenderedText(text: GenderedText): ParsedText {
  const segments: TextSegment[] = [];
  const issues: TextIssue[] = [];

  const pushText = (value: string) => {
    if (value === '') return;
    for (const [brace] of value.matchAll(strayBracePattern)) {
      issues.push({ kind: 'unbalancedBrace', token: brace });
    }
    segments.push({ kind: 'text', value });
  };

  let cursor = 0;
  for (const match of text.matchAll(tokenPattern)) {
    const [token, inner] = match;
    pushText(text.slice(cursor, match.index));
    cursor = match.index + token.length;

    if (inner.includes(variantSeparator)) {
      const options = inner.split(variantSeparator).map((option) => option.trim());
      if (options.length === 3 && options.every((option) => option !== '')) {
        segments.push({ kind: 'variant', options: options as GenderVariantOptions });
      } else {
        issues.push({ kind: 'malformedVariant', token });
        segments.push({ kind: 'text', value: token });
      }
    } else if (placeholderNamePattern.test(inner)) {
      segments.push({ kind: 'placeholder', name: inner });
    } else {
      issues.push({ kind: 'unknownToken', token });
      segments.push({ kind: 'text', value: token });
    }
  }
  pushText(text.slice(cursor));

  return { segments, issues };
}

function renderSegments(
  segments: TextSegment[],
  gender: PlayerGender,
  resolvePlaceholder: (name: string) => string,
): string {
  return segments
    .map((segment) => {
      switch (segment.kind) {
        case 'text':
          return segment.value;
        case 'placeholder':
          return resolvePlaceholder(segment.name);
        case 'variant':
          return segment.options[variantIndexByGender[gender]];
      }
    })
    .join('');
}

/** Renders copy for a player; placeholders without a value stay as their token. */
export function renderGenderedText(
  text: GenderedText,
  gender: PlayerGender,
  placeholderValues: Record<string, string>,
): string {
  const { segments } = parseGenderedText(text);
  return renderSegments(segments, gender, (name) => placeholderValues[name] ?? `{${name}}`);
}

/** Longest rendering across genders, with each placeholder at its assumed length. */
export function longestRenderedLength(text: GenderedText): number {
  const { segments } = parseGenderedText(text);
  const placeholderStandIn = 'x'.repeat(placeholderRenderLength);
  return Math.max(
    ...allGenders.map(
      (gender) => renderSegments(segments, gender, () => placeholderStandIn).length,
    ),
  );
}
