---
description: Snapshot of the Prendidos visual proposal canvas (Claude Design artifact) — source files, placeholder images, and how to restore or keep editing it.
alwaysApply: false
---

# Visual Proposal Snapshot

Backup copy of the Prendidos visual proposal: the design system board, the mascot board, and 13 phone screens (390 × 844).

- **Live version:** [Prendidos — propuesta visual](https://claude.ai/artifact/MvyXoMrzhHxkWfbQq2ptCG), a private Claude Design canvas. It is the source of truth and keeps its own version history. To keep working on the proposal from another chat, paste that link and ask to read and edit it.
- **This folder:** a snapshot taken on 2026-10-31 from canvas version `1793468961-1306`. It is for history, review in pull requests, and recovery. It does not render outside the canvas.
- **Tokens and rules:** the decisions behind the screens live in [`../../brand/design-tokens.md`](../../brand/design-tokens.md) and [`../../brand/README.md`](../../brand/README.md). When they disagree with this snapshot, the docs win.

## Contents

| Path                | Content                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `canvas.json`       | Canvas index: board positions, titles, order, and section titles                          |
| `Main.dc.html`      | Design system board (palette, typography, components, motion, interaction rules)          |
| `mascota.dc.html`   | Mascot board (flame by level, usage rules, icon at 48 px)                                 |
| `*.dc.html`         | One file per screen; board titles in `canvas.json` give the screen order and name         |
| `assets/`           | Placeholder images the screens use, cropped from `docs/brand/references/` (AI drafts)     |

`Main.dc.html` keeps its uppercase name because the canvas requires it as the entry board; the other names follow kebab-case.

## Why the files do not render here

- Each board loads `./support.js`, which the Claude Design canvas provides. It is not in this folder.
- Images point to `/_blob/<id>` URLs that only resolve inside the artifact. The table below maps each id to its local copy in `assets/`.
- All images are low-resolution AI crops for the canvas only. The app ships its own crops from the 2000 px drafts (`assets/images/brand/`, see `docs/brand/README.md`).

| Blob id                            | Local file                    | Use                                  |
| ---------------------------------- | ----------------------------- | ------------------------------------ |
| `85d7ba142c366dae83eeda9ab63f6034` | `assets/cat-icon.jpg`         | App icon: home logo, splash, mascot board |
| `24c91dc929982c4f84d68c249b0a26f9` | `assets/cat-pose-pointing.jpg`| Age gate (pose with ID card pending) |
| `d29045c3065a5d7c5aa4ba94e6fa88e2` | `assets/cat-face-relaxed.jpg` | Mascot at `Suave`                    |
| `cffa6568525d5cb2c2a069ce523c4bb2` | `assets/cat-face-smirk.jpg`   | Mascot at `Picante`, `Pareja` paywall |
| `5e8d9a6325293285c43246c9028cf781` | `assets/cat-face-laugh.jpg`   | Mascot at `Prendido`, level-up screen |
| `2a54884501e09ae92f72c18ec045a462` | `assets/cat-face-wink.jpg`    | Crowned mascot on the rankings       |
| `1b10aa2e35635ec3b889fbe04eca6879` | `assets/avatar-01.jpg`        | Player avatar 1 (not used on a screen yet) |
| `6011adb4d176e9217db7e0094da21157` | `assets/avatar-02.jpg`        | Player avatar 2 (Juanpa)             |
| `046302cbc3ebdb2c4293f12b4dc10abb` | `assets/avatar-03.jpg`        | Player avatar 3 (Vale)               |
| `f214760bff38eb43cba42d1f7d84aea9` | `assets/avatar-04.jpg`        | Player avatar 4 (Caro)               |
| `a0c9c1b5c50dfc3be3fa90e86392c63a` | `assets/avatar-05.jpg`        | Player avatar 5 (not used on a screen yet) |
| `598e91c3760ae7e6796e9dea58384ca2` | `assets/avatar-06.jpg`        | Player avatar 6 (not used on a screen yet) |
| `db235dc0ca00b928652ccaf200e7d1f9` | `assets/avatar-07.jpg`        | Player avatar 7 (not used on a screen yet) |
| `01a7887339069130d4ea0186acc167d9` | `assets/avatar-08.jpg`        | Player avatar 8 (Andrés)             |
| `09f719a4e19e353ed46f1ffb13274c4e` | `assets/avatar-09.jpg`        | Player avatar 9 (Mafe)               |
| `285f477278814b5c909fd6c9557f3a16` | `assets/avatar-10.jpg`        | Player avatar 10 (not used on a screen yet) |
| `b9c867729ca6dcc74b6e2d22c0c7ab54` | `assets/avatar-11.jpg`        | Player avatar 11 (not used on a screen yet) |
| `eaeff8cb63ff5efa3fd127869a3aa36c` | `assets/avatar-12.jpg`        | Player avatar 12 (not used on a screen yet) |

## Restoring the canvas

Only needed if the live artifact is lost.

1. Create a new canvas from the Claude Design type.
2. Upload every file in `assets/` to the new canvas as assets. Each upload returns a new `/_blob/<id>` URL.
3. In the `.dc.html` files, replace each old blob id with the new one, using the table above.
4. Publish `canvas.json` first, then the `.dc.html` files.
5. Update the canvas link here and in `docs/brand/design-tokens.md`.

## Updating this snapshot

After a meaningful change to the live canvas, download its `project/` files again, replace the files here, upload new images to `assets/` and the table, and update the version and date at the top.
