/** All user-facing copy of the final ranking (Colombian Spanish, usted). */
import type { EndCondition } from '@/features/game';

/** An /i/ sound that does not start a diphthong ("Isabel", "Hilda"; not "Hiedra" or "Iara"). */
const startsWithIVowelSound = /^h?i(?![aeiou])/;

function withoutAccents(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/** Spanish list of names: "Ana", "Ana y Luis", "Ana, Beto y Luis", "Ana e Isabel". */
export function joinPlayerNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  const lastName = names[names.length - 1];
  const conjunction = startsWithIVowelSound.test(withoutAccents(lastName).toLowerCase())
    ? 'e'
    : 'y';
  return `${names.slice(0, -1).join(', ')} ${conjunction} ${lastName}`;
}

/** Visual score: "12 pts", "1 pt", "-3 pts". */
export function formatPoints(score: number): string {
  return `${score} ${Math.abs(score) === 1 ? 'pt' : 'pts'}`;
}

/** Score for screen readers: "12 puntos", "menos 3 puntos". */
export function spokenPoints(score: number): string {
  const amount = Math.abs(score);
  const unit = amount === 1 ? 'punto' : 'puntos';
  return `${score < 0 ? 'menos ' : ''}${amount} ${unit}`;
}

/** One podium step or row for screen readers, always with the full name. */
export function rankingEntryAccessibilityLabel(
  position: number,
  name: string,
  score: number,
): string {
  return `Puesto ${position}: ${name}, ${spokenPoints(score)}`;
}

export type RankingEyebrowInput = {
  /** Missing when the category is no longer in the catalog. */
  categoryName?: string;
  endCondition: EndCondition;
  /** Rounds in which at least one player took a turn. */
  roundsPlayed: number;
};

/** "La Previa · 10 rondas", "La Previa · 1 ronda", or "La Previa · Meta 100 pts". */
export function rankingEyebrow({
  categoryName,
  endCondition,
  roundsPlayed,
}: RankingEyebrowInput): string {
  const gameLength =
    endCondition.type === 'points'
      ? `Meta ${endCondition.target} pts`
      : `${roundsPlayed} ${roundsPlayed === 1 ? 'ronda' : 'rondas'}`;
  return categoryName ? `${categoryName} · ${gameLength}` : gameLength;
}

/** "¡Ganó Vale!", or "¡Empate arriba!" when several players share first place. */
export function winnerTitle(winnerNames: string[]): string {
  return winnerNames.length > 1 ? '¡Empate arriba!' : `¡Ganó ${joinPlayerNames(winnerNames)}!`;
}

/** "Vale y Juanpa comparten el primer puesto." */
export function sharedFirstPlaceLine(winnerNames: string[]): string {
  return `${joinPlayerNames(winnerNames)} comparten el primer puesto.`;
}

export const resultsCopy = {
  backHome: 'Inicio',
  backHomeAccessibilityLabel: 'Volver al inicio',
  playAgain: 'Otra partida',
  playAgainAccessibilityLabel: 'Jugar otra partida',
} as const;
