---
description: Prendidos brand references — mascot ("Prendido" the cat), app icon drafts, and their review status. Read before generating or editing illustrations.
alwaysApply: false
---

# Brand References

Reference material for the Prendidos visual identity. These files are **AI-generated drafts** used to lock the mascot's look; they are not production assets and must not be bundled in the app. Production assets (vector icon, splash, illustrations) go in `assets/` once finalized.

Visual direction comes from `docs/prd.md` §9: colorful and cartoonish, light background, large readable cards.

## Mascot

A white cartoon cat with a flame on its head ("prendido" = lit up). It evolves the hand-drawn logo from the previous Flutter app.

| Trait       | Rule                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------ |
| Head        | Round, tall pointed ears with solid black inner ears, 3 bold whiskers per side             |
| Face        | Solid black oval eyes, raised eyebrow lines, small black triangular nose, cheeky smirk     |
| Flame       | Flat layered red / orange / yellow shapes with a thick black outline — never emoji-style   |
| Body        | About 3 heads tall, slim, mitten paws, long S-curved tail, confident hand-on-hip stance    |
| Line        | Thick, uniform black outline on head, body and tail                                        |
| Rendering   | Flat 2D vector: no gradients, no blur, no textures, no 3D                                  |
| Attitude    | Confident and cheeky adult party cat — never cute or babyish, never shown drunk or sick    |

## Files

| File                                             | Content                                   | Status                       |
| ------------------------------------------------ | ----------------------------------------- | ---------------------------- |
| `references/app-icon-ai-draft.jpg`               | App icon: winking cat on red (1024 px)    | Approved direction           |
| `references/mascot-turnaround-ai-draft.jpg`      | Body turnaround + 3 action poses (2000 px) | Approved direction           |
| `references/mascot-expressions-ai-draft.jpg`     | Facial expression sheet (2000 px)         | Needs revision               |

## Known Issues

- **Flame**: every draft renders an emoji-like gradient flame. Replace it with one flat, outlined flame during vectorization and reuse it everywhere.
- **Color**: the icon background is `#C01E1B`, not the legacy `#D62528`. Pick one as the official brand red.
- **Android adaptive icon**: the icon artwork fills ~80 % of the canvas; Android needs a foreground layer with the cat inside the central ~61 % safe zone.
- **Turnaround**: in the back view the tail starts near the neck instead of the lower back; the three-quarter view is nearly frontal.
- **Expressions**: two portraits are labeled `7`; the embarrassed face (`5`) fills the whole head with coral instead of two flat blush ovals.
- **Format**: all files are raster. The final logo and mascot must be redrawn or traced as SVG.
- **Ownership**: purely AI-generated images may have weak copyright protection; human redrawing of the final assets strengthens it.
