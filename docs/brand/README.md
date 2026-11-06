---
description: Prendidos brand references — mascot ("Prendido" the cat), player avatars, app icon drafts, and their review status. Read before generating or editing illustrations.
alwaysApply: false
---

# Brand References

Reference material for the Prendidos visual identity. These files are **AI-generated drafts** used to lock the mascot's look.

**Interim app art (decision of 2026-10-31):** at the product owner's request, the app ships crops of these drafts until the vector redraw exists. `scripts/crop-brand-art.py` cuts them from the 2000 px sheets into transparent PNGs in `assets/images/brand/` (mascot faces, the pointing pose, the icon cat, and the 12 avatars) and writes the app icon, Android adaptive layers, splash, and favicon to `assets/images/`. Screens show them only through `Mascot` and `PlayerAvatar` (`src/components/ui/`). Re-run the script after revising a draft, and replace the art with vectors before launch marketing (see Known Issues).

Visual direction comes from `docs/prd.md` §9: colorful and cartoonish, light background, large readable cards. UI tokens and the rules for using the mascot in screens live in [`design-tokens.md`](./design-tokens.md).

## Mascot

A white cartoon cat with a flame on its head ("prendido" = lit up). It evolves the hand-drawn logo from the previous Flutter app.

| Trait       | Rule                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------ |
| Head        | Round, tall pointed ears with solid black inner ears, 3 bold whiskers per side             |
| Face        | Solid black oval eyes, raised eyebrow lines, small black triangular nose, cheeky smirk     |
| Flame       | Flat layered red / orange / yellow shapes with a thick ink outline — never emoji-style     |
| Body        | About 3 heads tall, slim, mitten paws, long S-curved tail, confident hand-on-hip stance    |
| Line        | Thick, uniform ink outline (`#2A1608`, the UI outline color, not pure black)               |
| Rendering   | Flat 2D vector: no gradients, no blur, no textures, no 3D                                  |
| Attitude    | Confident and cheeky adult party cat — never cute or babyish, never shown drunk or sick    |

## Files

| File                                             | Content                                   | Status                       |
| ------------------------------------------------ | ----------------------------------------- | ---------------------------- |
| `references/app-icon-ai-draft.jpg`               | App icon: winking cat on red (1024 px)    | Approved direction           |
| `references/mascot-turnaround-ai-draft.jpg`      | Body turnaround + 3 action poses (2000 px) | Approved direction           |
| `references/mascot-expressions-ai-draft.jpg`     | Facial expression sheet (2000 px)         | Needs revision               |
| `references/player-avatars-ai-draft.jpg`         | 12 player avatars, 4 × 3 grid (2000 px)   | Approved direction           |
| `references/card-illustrations-ai-draft.jpg`     | 18 card illustrations, 6 × 3 grid (2752 × 1536, 2K upscale, saved at JPEG quality 85 to stay under the 500 KB repo limit) | Approved 2026-11-05 (HU-15); cropped and bundled |

## Player Avatars

Each player gets a cartoon cat avatar instead of an initial. The set evolves the cat avatars from the previous Flutter app; its roosters and dog were dropped.

| Rule          | Detail                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------- |
| Hierarchy     | Players are the mascot's crew: colored heads, **no flame and no wink** (both belong to the mascot) |
| Identity      | One big accessory or expression per cat, readable at 48 px; the player's name is always shown beside it |
| Neutrality    | Gender-neutral: no makeup, lipstick, or beards. Never drunk, dizzy, sleepy, or holding a drink |
| Count         | 12, the maximum number of players in `Amigos` mode                                          |
| Assignment    | Random without repeats; the player can tap the avatar to change it. Illustrations only, never photos |
| Framing       | Accessories (hats, headphones) extend past the head: render every avatar in the same square frame with padding, never cropped to a circle |

Avatars have their own palette, separate from the UI tokens, in grid order (left to right, top to bottom):

| #  | Feature                     | Head color |
| -- | --------------------------- | ---------- |
| 1  | Triangular sunglasses       | `#F97316`  |
| 2  | Star-shaped glasses         | `#FACC15`  |
| 3  | Tongue out                  | `#6EE7B7`  |
| 4  | Blowing a kiss with a heart | `#EC4899`  |
| 5  | Shocked                     | `#FED7AA`  |
| 6  | Big toothy grin             | `#C4B5FD`  |
| 7  | Sombrero vueltiao           | `#A3E635`  |
| 8  | DJ headphones               | `#0D9488`  |
| 9  | Party hat, laughing         | `#93C5FD`  |
| 10 | Bandana, side smirk         | `#D6D3D1`  |
| 11 | Backwards cap               | `#FDA4AF`  |
| 12 | Round glasses               | `#B45309`  |

## Card Illustration Library

Cards can carry one decorative illustration, picked by key from this closed set (HU-15, decision of 2026-11-05). The library carries the legacy Flutter cast (`docs/content/legacy/cards/`) into the current brand. The keys live in `illustrationKeys` (`src/features/content/card-types.ts`); the content validator rejects any other key, and screens show the art only through `CardIllustration` (`src/components/ui/`).

`Source`: **bundled** = reuses existing mascot art in `assets/images/brand/`; **expressions #N** = cropped from `references/mascot-expressions-ai-draft.jpg`; **sheet #N** = cropped from `references/card-illustrations-ai-draft.jpg`. All 24 keys ship today: the bundled ones through `mascotArt`, the other 19 as `assets/images/brand/card-<key>.png` (384 px tall, 256-color palette PNGs, about 0.4 MB in total), written by `scripts/crop-brand-art.py --cards-only`.

| #  | Key                   | Art                                                        | Typical cards                                  | Source         |
| -- | --------------------- | ---------------------------------------------------------- | ---------------------------------------------- | -------------- |
| 1  | `mascot-wink`         | Winking face                                               | Teasing, flirty                                | bundled (`wink`) |
| 2  | `mascot-relaxed`      | Relaxed, eyes closed                                       | Easy-going Suave cards                         | bundled (`relaxed`) |
| 3  | `mascot-smirk`        | Raised eyebrow, side smirk                                 | Picante cards                                  | bundled (`smirk`) |
| 4  | `mascot-laugh`        | Laughing                                                   | Prendido cards, funny dares                    | bundled (`laugh`) |
| 5  | `mascot-pointing`     | Full body, winking and pointing                            | Dares aimed at someone                         | bundled (`pointing`) |
| 6  | `mascot-surprised`    | Wide-eyed, mouth open                                      | Gossip ("chisme"), reveals                     | expressions #3 |
| 7  | `mascot-monocle`      | Monocle, one raised eyebrow                                | "Cultura time"                                 | sheet #1       |
| 8  | `mascot-reading-book` | Reading glasses behind an open book                        | "Historytime", storytelling truths             | sheet #2       |
| 9  | `mascot-crying`       | Teary eyes, wobbly mouth                                   | Sad or embarrassing confessions                | sheet #3       |
| 10 | `mascot-sad-map-pin`  | Sad face, map pin and a dotted plane path                  | "Momento sad", travel questions                | sheet #4       |
| 11 | `mascot-blowing-kiss` | Blowing a kiss with a small heart                          | Romantic and flirty cards, `Pareja`            | sheet #5       |
| 12 | `mascot-sunglasses`   | Triangular sunglasses, wide grin                           | Bold dares                                     | sheet #6       |
| 13 | `mascot-dancing`      | Star-shaped glasses, wavy dancing arms                     | Dance challenges                               | sheet #7       |
| 14 | `mascot-tongue-out`   | Cheeky grin, tongue out                                    | Cheeky "muestre eso" dares                     | sheet #8       |
| 15 | `mascot-annoyed`      | Side-eye, flat mouth                                       | "Uy re pailas", the group picks                | sheet #9       |
| 16 | `mascot-selfie`       | Dollar-sign eyes, holding up a phone for a selfie          | Photo and selfie challenges                    | sheet #10      |
| 17 | `mascot-diva`         | Sunglasses pushed up, hand flip, sparkles (gender-neutral) | "Llegó la diva" formats                        | sheet #11      |
| 18 | `phone-ringing`       | Phone with exclamation marks, blank screen                 | Cards with `reachesOutside` (calls, messages)  | sheet #12      |
| 19 | `microphone`          | Retro microphone                                           | Singing challenges                             | sheet #13      |
| 20 | `animal-wheel`        | Color wheel with simple animal heads                       | "Todos escojan un animal"                      | sheet #14      |
| 21 | `shot-glass-on-fire`  | Shot glass with the flat three-layer flame                 | Opening card, group toasts                     | sheet #15      |
| 22 | `glasses-toasting`    | Two glasses clinking                                       | Friendship toasts                              | sheet #16      |
| 23 | `rooster`             | Cartoon rooster, mid-cluck                                 | Animal imitation dares                         | sheet #17      |
| 24 | `two-dogs`            | Two dogs, one in sunglasses                                | "Hablen ladrando", animal rounds               | sheet #18      |

Dropped legacy pieces: the police cap (stereotype), the Spain map pin with speech bubbles (baked-in text and an insult), diva lips and the "XXX" phone (redesigned above), and the full-body wink holding a shot (the mascot never holds a drink; `mascot-pointing` replaces it).

**Art rules:**

- **Mascot pieces:** white head with the flat three-layer flame (`brandRed` / `primary` / `flameYellow`) and an `ink` outline. The flame tells them apart from the player avatars, which reuse some legacy expressions with colored heads and no flame.
- **Guest animals and props:** same flat style and `ink` outline, **no flame** (the flame belongs to the mascot). Guest animals never become avatars.
- **No text** inside any piece: no speech bubbles, signs, or screen text (`docs/content/card-templates.md` rendering rule 1).
- **Drink props** (`shot-glass-on-fire`, `glasses-toasting`) only on group toasts or cards whose instruction is a shared drink. Never on cards about drinking fast or a lot, never with a character drinking (`ai-specs/skills/write-cards/references/policy.md`, App Store guideline 1.4.3).
- **Never** drunk, dizzy, sleepy, or sick. The expressions sheet faces `4` and both `7` stay banned.
- **Frame:** each piece is cropped to its content on a transparent background. Faces are square; full-body pieces, `mascot-dancing`, and props keep their own aspect ratio. Pieces render up to 120 pt tall on the card, so crops aim for about 360 px tall (3×) and are never upscaled.
- **Decorative:** the card text carries the card; screen readers skip the illustration.

## Known Issues

- **Flame**: every draft renders an emoji-like gradient flame. Replace it with one flat, outlined flame during vectorization and reuse it everywhere.
- **Color**: resolved. The official brand red is `#C01E1B` (the icon background), replacing the legacy `#D62528`. See `design-tokens.md`.
- **Android adaptive icon**: resolved for the interim art. The foreground layer is the cat at ~59 % of the canvas, inside the safe zone, on a `brandRed` background color.
- **Turnaround**: in the back view the tail starts near the neck instead of the lower back; the three-quarter view is nearly frontal.
- **Expressions**: two portraits are labeled `7`; the embarrassed face (`5`) fills the whole head with coral instead of two flat blush ovals.
- **Avatars**: the bandana paisley and the sombrero weave are too detailed for 48 px; simplify them when vectorizing. The source has a white background that must become transparent.
- **Card illustrations**: generated in Google Flow with Nano Banana Pro (candidate 3 of 4, product owner approved 2026-11-05, no pieces rejected). The sheet is an AI 2K upscale of a 1376 × 768 original, so pieces are about 300–340 px tall, slightly under the ~360 px ideal for 120 pt at 3×. The shot glass (`15`) has layered liquid and the two dogs (`18`) carry more shading than the flat style; simplify both when vectorizing. The ringing phone (`12`) is a retro handset.
- **Format**: all files are raster, and the interim app art inherits the drafts' emoji-like flame and a faint white edge on `brandRed`. The final logo and mascot must be redrawn or traced as SVG.
- **Ownership**: purely AI-generated images may have weak copyright protection; human redrawing of the final assets strengthens it.
