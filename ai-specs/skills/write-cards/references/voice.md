# Card Voice

Colombian Spanish from a friend at the party, not a translation. Style source: `docs/content/legacy/legacy-challenges.json` (read the `face` transcriptions for headline + body splits).

## Structure

- **Headline** (2–7 words): the joke. Slang and attitude live here.
- **Body** (max ~35 words): what to do, plain enough to read at 2 a.m. One action, one fail condition.
- **Penalty quip** (optional, max 4 words): teasing, never an insult. Starts with "por".

## Hook Formulas

Rotate them: no headline repeats, and no formula covers more than a quarter of a batch. Invent new formulas in the same spirit when these run out.

| Formula                         | Examples                                                   |
| ------------------------------- | ---------------------------------------------------------- |
| Interjection + vocative         | "Uy pana…", "Uyy parce…", "Qué chimbaaa"                   |
| "Llegó el / la…" (arrival)      | "Llegó el enamorado" → use `{m\|f\|n}` variants             |
| "Se puso…" (escalation)         | "Se puso chimba esto", "Se calentó esta vuelta"            |
| Spanglish time                  | "Cultura time", "It's time to cry :(", "Historytime"       |
| Mood moment                     | "Momento sad de la noche"                                  |
| Direct imperative               | "¡Abra la jeta!", "Muestre eso", "Hazte pasar por otra persona" |

## Address and Slang

- Default to **usted** ("báilese", "tómese"); tú is fine for a whole card, never mixed in one card.
- Neutral vocatives: **pana, parce, socio** (accepted as neutral among friends), **cucho** only for "elder" jokes. Avoid **mi perro / mi perra / mka** aimed at the player.
- Keep harmless slang: chimba, qué chimba, pailas, de malas, chisme, parche, la vuelta, se arrugó, cultura chopística, crush.
- Drop slurs and insults: puss\*, loca/loco as an insult, puto, marica as an insult, gilipollas, pelotudo, puerco, morrongo.

## Gender

Players can be `male`, `female`, or `undisclosed`; the card must read right for all three.

1. Prefer invariable words: "le toca", "la persona de su derecha", "alguien", "aguafiestas", "gallina".
2. When a gendered word is the joke, write all three variants: `{masculine|feminine|neutral}`, e.g. `{el divo|la diva|la estrella}`. The neutral one must be a real word, not "-e" or "-x".
3. Never assume the other player's gender ("ella decide" → "esa persona decide").
4. Only set `targetGender` when the dare truly depends on it; prefer not to.

## Penalty Quips

Teasing the refusal, invariable when possible: "por aguafiestas", "por gallina", "por arrugarse", "por falta de calle", "por sapo". The drink count never goes in the quip.
