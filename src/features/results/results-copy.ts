/** All user-facing copy of the final ranking (Colombian Spanish, usted). */

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

export function rankingRowAccessibilityLabel(
  position: number,
  names: string[],
  score: number,
): string {
  return `Puesto ${position}: ${joinPlayerNames(names)}, ${spokenPoints(score)}`;
}

export function winnerAccessibilityLabel(names: string[], score: number): string {
  return names.length > 1
    ? `Empate en el primer puesto: ${joinPlayerNames(names)} con ${spokenPoints(score)}`
    : `Ganó ${joinPlayerNames(names)} con ${spokenPoints(score)}`;
}

export const resultsCopy = {
  eyebrow: 'Se acabó la partida',
  title: 'Así quedó la noche',
  winnerBadge: '¡Ganó la noche!',
  tieBadge: '¡Empate en la cima!',
  rankingHeading: 'Ranking final',
  playAgain: 'Jugar otra vez',
  backHome: 'Volver al inicio',
} as const;
