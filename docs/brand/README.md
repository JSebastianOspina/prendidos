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

## Known Issues

- **Flame**: every draft renders an emoji-like gradient flame. Replace it with one flat, outlined flame during vectorization and reuse it everywhere.
- **Color**: resolved. The official brand red is `#C01E1B` (the icon background), replacing the legacy `#D62528`. See `design-tokens.md`.
- **Android adaptive icon**: resolved for the interim art. The foreground layer is the cat at ~59 % of the canvas, inside the safe zone, on a `brandRed` background color.
- **Turnaround**: in the back view the tail starts near the neck instead of the lower back; the three-quarter view is nearly frontal.
- **Expressions**: two portraits are labeled `7`; the embarrassed face (`5`) fills the whole head with coral instead of two flat blush ovals.
- **Avatars**: the bandana paisley and the sombrero weave are too detailed for 48 px; simplify them when vectorizing. The source has a white background that must become transparent.
- **Format**: all files are raster, and the interim app art inherits the drafts' emoji-like flame and a faint white edge on `brandRed`. The final logo and mascot must be redrawn or traced as SVG.
- **Ownership**: purely AI-generated images may have weak copyright protection; human redrawing of the final assets strengthens it.
