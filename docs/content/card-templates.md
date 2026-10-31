---
description: Card face templates observed in the legacy designs and the proposed Card data model change (headline, body, structured penalty, illustration) that lets the app render them natively. Proposal — not yet in data-model.md.
alwaysApply: false
---

# Card Templates

**Status: proposal.** Nothing here is in [`../data-model.md`](../data-model.md) yet. It goes in through `/opsx:propose` (CLAUDE.md §5) once the open decisions below are settled.

## What the Legacy Cards Show

The 31 designed cards in `legacy/cards/` are square images with the text baked in. They use two layouts:

| Template          | Slots                                             | Count | Examples                          |
| ----------------- | ------------------------------------------------- | ----- | --------------------------------- |
| **Illustrated**   | Headline · body bubble · illustration             | 24    | `150F2E47`, `87AFEB01`, `FED27DA1` |
| **Text only**     | Big headline · body bubble                        | 7     | `3BB448AB`, `BECE749C`, `49A4CA08` |

- **Headline**: 2–7 words in the display font, white. Text-only cards use the free space for a longer headline (up to 4 lines).
- **Body bubble**: the instruction, often with the penalty inside, in caps on a lighter tint of the background.
- **Illustration**: mostly a mascot face with one expression or accessory (monocle, sunglasses, crying, blowing a kiss), sometimes a prop (shot glass on fire, two glasses toasting, phone, animal wheel) or another animal (rooster, dogs). Two cards add **speech bubbles** (`7E274954`, `78F3F0D7`).
- **Reuse**: 24 illustrated cards use 21 distinct illustrations. Recurring formats share one ("Cultura time" → monocle; "Llegó el / la…" → kiss or diva lips).
- **Background**: one color per level (blue Suave, orange Medio, red Hardcore; a second batch used indigo for Suave).

## Rendering Rules

1. **Never bake text into images.** The app renders all copy natively, because the copy needs gender variants and `{player}` placeholders (PRD §5.6), the alternative penalty for players who don't drink (§5.8), Dynamic Type and screen readers, and copy fixes through EAS Update without new art.
2. **The penalty is not part of the copy.** The turn screen already shows it in its own row ("Si no cumple · Toma 2 tragos"); the body only says what to do.
3. **The template is derived, not stored.** A card with an `illustration` renders the illustrated layout; without one, the text-only layout. A stored `template` field would allow invalid pairs (illustrated with no image).
4. **Text wins.** If the headline and body don't fit at the current font scale, the illustration is hidden and the card falls back to text-only.
5. **Colors come from the level tokens** (`levelEasy`, `levelMedium`, `levelHard`, and `flameYellow` for group interludes in [`../brand/design-tokens.md`](../brand/design-tokens.md)), not the legacy blue / orange / red.
6. **Illustrations are a bundled library** addressed by key, drawn in the brand style (flat vector, `ink` outline). A card picks one; it never ships its own image.

### Card face inside the turn screen

The legacy square becomes the middle of the existing turn screen (prototype `turno.dc.html`):

```text
┌───────────────────────────────┐
│ Ronda 4 de 10     Cambiar (1) │  screen chrome
│ RETO · PICANTE        15 pts  │
│ Le toca a  Vale               │
│ ┌───────────────────────────┐ │
│ │  ¡Cultura time!           │ │  headline   ← card face
│ │  Marcas de carros. El que │ │  body
│ │  repita o se equivoque…   │ │
│ │          (monocle)        │ │  illustration (optional)
│ └───────────────────────────┘ │
│ Si no cumple · Toma 1 trago   │  penalty row (or alternative)
│ [No cumplió −8] [¡Cumplió!]   │
└───────────────────────────────┘
```

## Proposed Data Model Change

Changes to `Card` in `data-model.md`:

```ts
type Card = {
  id: string;
  categoryId: string;
  type: CardType;
  difficulty: Difficulty;
  headline?: GenderedText;         // NEW — the hook; required for challenge and truth
  body: GenderedText;              // RENAMED from `text` — instruction only, never the penalty
  points?: number;                 // individual cards, within the level range
  penalty?: DrinkPenalty;          // CHANGED — structured instead of free text
  illustration?: IllustrationKey;  // NEW — optional key into the illustration library
  heat: 'standard' | 'spicy';      // NEW — spicy cards only appear with the opt-in "Sin Filtro" toggle
  requiresConsent: boolean;        // NEW — the app shows "Solo si la otra persona acepta" on the card
  targetGender?: PlayerGender;
  sourceLegacyId?: string;         // NEW — traceability to legacy/legacy-challenges.json
};

type DrinkPenalty = {
  drinks: 1 | 2 | 3;               // the type enforces PRD §5.8
  quip?: GenderedText;             // optional teasing tag: "por tibio / tibia"
};

type IllustrationKey = 'mascot-monocle' | 'mascot-crying' | 'shot-glass-on-fire' /* … */;
```

| Change                        | Why                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `headline` + `body`           | Matches the hook + instruction structure that carries the voice; lets the layout size each slot |
| `DrinkPenalty` instead of text | The 3-drink cap becomes a type error, and the app renders every penalty the same way. The quip keeps the humor without baking it into the sentence |
| `illustration` key            | Reuses a small art library across cards and keeps text out of images                        |
| `sourceLegacyId`              | Tracks which legacy card a rewrite came from                                                 |
| `heat`                        | Gates the Sin Filtro layer: opt-in, paid, Amigos only (PRD §6.4). Replaces the `sin-filtro` category, so `Category`, `Product`, and `GameSettings` (a `spicyEnabled` flag remembered in `DeviceState`) change too |
| `requiresConsent`             | One consistent consent rule rendered by the app, instead of a sentence repeated in every body |

Group cards (`everyoneWho`, `neverHaveIEver`) keep a fixed headline from their type ("¡Todos!", "Yo nunca…"), so `headline` stays optional for them.

## Open Decisions

| Decision                                   | Recommendation                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Mascot on the game card                    | `design-tokens.md` says never; the legacy cards rely on it. Allow it only in the illustration slot, below the text, hidden on overflow (rule 4) |
| Recurring formats as data                  | Add later: a `format` key that brings a default headline and illustration ("Cultura time"). Start with plain `headline` + `illustration` |
| Speech bubbles                             | Out of the MVP: they are more baked-in copy. Keep them in the illustration art only if they carry no game text |
| Illustration library size for launch       | ~12 keys (5 mascot expressions per level mood + 7 props), drawn after the copy for the first category settles |
