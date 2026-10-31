---
description: Trial of the write-cards skill on 10 legacy challenges that cannot ship (sexual, non-consensual, or bodily-fluid dares) — baseline vs skill output, a fun assessment, and the heat-toggle / App Review analysis.
alwaysApply: false
---

# Trial: Rewriting 10 Heavy Cards

**Question:** does complying with App Store / Google Play rules make the game boring?

**Method:**

1. Picked 10 legacy cards that fail outright (table below).
2. **Baseline:** a fresh agent rewrote them with only a short brief, no skill.
3. **Skill:** a fresh agent rewrote them with `ai-specs/skills/write-cards/`, two versions each: `standard` (free, La Previa) and `spicy` (paid, opt-in Sin Filtro).
4. Scored each rewrite for fun (1–5) against the original at the same level. Scores are one reviewer's judgment, not a playtest.

## Baseline vs Skill

| Failure                                   | Baseline (no skill)                                       | Skill        |
| ----------------------------------------- | --------------------------------------------------------- | ------------ |
| Dare requires drinking                    | 3 cards (sips, blind tasting, sharing a drink)            | 0            |
| Gendered wording or assumed gender        | 4 cards ("tímido", "vestidito", "solito", "ella decide", "mi perro") | 0 |
| `hard` card rewritten at `easy` intensity (standard) | 6 of 7 (bear hug, shout a goal, write your name with your hips, crossed-arm toast…) | 3 of 7 (marked below) |
| Exposes people outside the room           | 1 (read your crush's chat aloud)                          | 0            |
| Consent placed in the penalty text        | 3                                                         | 0            |
| Original hook kept                        | 1                                                          | 4 ("¡Abra la jeta!", "Se puso chimba esto", "Se calentó esta vuelta", "Uy, se puso rara esta vuelta") |

The skill output repeated the consent sentence in 11 bodies. That led to the `requiresConsent` flag (the app shows the rule), and the skill was updated after the run.

## Results

Fun: ★ = score out of 5. ⚠️ = borderline, confirm in human review.

### `A79D1EE1` — medium · "muéstrese una foto porn\*"

- **Standard** ★4 — *Uy pana, muestre ese celular*: show the group your most embarrassing photo of yourself; if the group says it isn't embarrassing enough, you lose.
- **Spicy** ★4 — *Muestre eso, pues*: show your flirtiest selfie (clothed) and confess who you sent it to, or meant to.

### `2CCDA666` — medium · simulate sex with your crush

- **Standard** ★3 — *Llegó {el enamorado|la enamorada|el alma enamorada}*: declare your love to a chair as if it were your crush, 30 seconds, no laughing.
- **Spicy** ★4 — *Se calentó esta vuelta*: dance sensually for a chair as if it were your crush, 30 seconds, song chosen by the group.

### `386F5CBA` — medium · reenact a sex scene "between animals"

- **Standard** ★4 — *Uy, se puso rara esta vuelta*: with a partner, act out a secret animal's courtship ritual without words; the group guesses the animal.
- **Spicy** ★5 — *Animal Planet time*: the courtship becomes a no-touch sensual dance while you narrate it like a nature documentary.

### `C93C3E36` — hard · remove a woman's bra with one hand and wear it

- **Standard** ★4 — *Se puso chimba esto*: hold hands, fingers interlaced, for two rounds and pay them a compliment on each of their turns.
- **Spicy** ★5 — *Una mano, cero pena*: eyes locked, take off one of their socks or accessories with one hand and wear it anywhere for two rounds.

### `15EBFFFE` — hard · take off 4 pieces of clothing for the whole game

- **Standard** ★4 — *Fashion week time*: wear four borrowed items all game and enter on a catwalk every turn.
- **Spicy** ★4 ⚠️ — *Se prendió esto*: dancing sensually, take off four items among shoes, socks, jacket, or accessories ("nada más") until the game ends. The striptease framing may read badly in review even with the closed list.

### `358F013F` — hard · show your butt and get spanked

- **Standard** ★3 — *Momento manitos calientes*: 30-second staring contest; each laugh earns a slap on the hand. Too tame for `hard`.
- **Spicy** ★5 — *Socio, muestre ese perreo*: 20 seconds of perreo for someone, without touching, song chosen by the group.

### `D160D811` — hard · grab the butt of the person in front

- **Standard** ★3 — *Uyy parce, venga ese abrazo*: 15-second hug plus a whispered compliment that they repeat out loud. Too tame for `hard`.
- **Spicy** ★5 — *Qué chimbaaa, quédese ahí*: sit on their lap and hold eye contact for 30 seconds without laughing.

### `7A31B316` — hard · pour a drink on your neck; the person on your right licks it

- **Standard** ★4 — *Perfume de comercial*: they smell your neck for five seconds and describe it like a perfume ad.
- **Spicy** ★5 ⚠️ — *El cuello no miente*: they kiss your neck; you hold still without laughing or making a sound. Inside the `spicy` rules, but the most sexual card in the set.

### `293EDF64` — hard · do your best moan

- **Standard** ★4 — *Uyyy, qué voz es esa*: read any label aloud in your most seductive voice, looking someone in the eye.
- **Spicy** ★5 — *Momento ASMR de la noche*: whisper a sancocho recipe into someone's ear, step by step, in your sexiest voice.

### `150F2E47` — hard · receive a drink straight from someone's mouth

- **Standard** ★4 — *¡Abra la jeta!*: eyes closed, someone the group picks feeds you a spoonful of food (no alcohol); guess who.
- **Spicy** ★4 ⚠️ — *¡Abra la jeta, sin manos!*: pass a card lip to lip, no hands. Lips may touch; it's the same dare as legacy card `BECE749C`.

## Verdict

- **Spicy keeps the heat.** Average ★4.6. Every card keeps the original's tension (closeness, eye contact, the group watching) without nudity, sex acts, or fluids. The rules took out the explicit part, not the fun.
- **Standard drops at `hard`.** Average ★3.7; three `hard` cards scored 3. Without contact the generator falls back to hugs. `hard` in the free tier should lean on **confession and social risk** (what you'd never say in front of this group) rather than touch. That's a skill change for the next iteration.
- **Not validated yet:** one run, one reviewer. The real test is a playtest with a group: same night, legacy-style vs rewritten deck, count the screams.

## Heat Toggle and App Review

### The toggle idea: yes

A `spicy` layer that is **off by default**, opt-in per game, and unlocked by a purchase follows the pattern Apple itself requires for mature content (Guideline 1.2: "hidden by default" and turned on by the user). Proposed shape:

- Each card has `heat: 'standard' | 'spicy'`.
- The setup screen gets a "Retos Sin Filtro" switch, off by default, available after buying the Sin Filtro pack or the Pase total.
- With it on, the game mixes spicy cards into the chosen category and level. This would replace "Sin Filtro" being a separate category (PRD §6.1, §7), so the pack upgrades every category, including future ones.

**Decided** in PRD 1.1 §6.4: Amigos only at launch, Sin Filtro becomes a layer instead of a category, and the switch is off on first use and then remembers the last choice.

### Hiding content from App Review: no

Not as a matter of taste — the guidelines make it the riskiest move available:

- **2.5.19**: hidden, dormant, or undocumented features are "grounds for removal… and termination of your developer account".
- **Introduction**: trying to trick the review process gets you "expelled from the Apple Developer Program".
- **2.3.1**: new features must be described in the review notes.
- **2.5.2**: an app can't download code that changes its features after review. Flipping hidden content on remotely (a flag, EAS Update) counts.

A single user report is enough to trigger it, and losing the developer account takes down **every app on it**, not just Prendidos. The full legacy arsenal (porn photos, simulated sex, groping) also can't ship in any tier: Guideline 1.1.4 and Google Play's sexual-content policy ban it regardless of the age rating.

### What gets the spicy tier through review

- Answer the age questionnaire honestly (18+) and keep store screenshots and metadata clean (2.3.8 requires 4+ metadata even for an 18+ app).
- Describe the toggle in the review notes and let the reviewer reach it (sandbox purchase, or a review note explaining how).
- Keep `spicy` inside `policy.md`: everything in this trial's spicy column is the kind of card that should pass.
