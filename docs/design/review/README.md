---
description: Screen-by-screen review of the first playable build against the Prendidos visual proposal (2026-10-31) — gaps, decisions, and what each alignment change must deliver. Read before changing any screen's layout.
alwaysApply: false
---

# Design Alignment Review (2026-10-31)

Review of `main` at `f6ea48e` (HU-00 … HU-07 merged) against the visual proposal in [`../prototype/`](../prototype/README.md). Renders of both sides are in this folder, taken on the web build at 390 × 844:

- `proposal/NN-*.jpg`: the proposal boards.
- `app-before/NN-*.jpg`: the app before alignment.

The first playable build followed the tokens (palette, fonts, clay outline and shadow) but not the screen layouts, and it shipped with no mascot and no avatars. Every screen needs work.

## Decisions

| Topic | Decision | Why |
| ----- | -------- | --- |
| Voice | Keep **usted** in all UI copy and adapt the proposal's wording to it ("¿Ya es mayor de edad?", "¿Con quién va a jugar hoy?"). | `ai-specs/skills/write-cards/references/voice.md` sets usted as the default; the proposal mixes tú. The docs win over the snapshot. |
| Images | Ship the AI-draft mascot and avatar art in the app as **interim assets** until the vector redraw. | Product owner request (2026-10-31). Crops come from the 2000 px drafts in `docs/brand/references/`, not the 192–520 px proposal crops, with transparent backgrounds. |
| "PLACEHOLDER IA" tags | Not shown in the app. | They are proposal annotations, not UI. |
| Monetization (locks, prices, "Pase total", "Restaurar compras", ranking upsell, Pareja paywall) | Out of scope here. | HU-08 / HU-09 own purchases; the screens keep the existing slots. |
| "Continuar partida" and "Salir al inicio" | Out of scope here. | HU-12 owns resuming a game. |
| Settings button on home | Out of scope here. | No settings screen exists yet. |
| Level-up screen | In scope, as an overlay on the turn screen. | It is the emotional peak of a game (design tokens § Motion) and uses only data the game already exposes (`currentDifficulty`). |

## Screen by Screen

### 1 · Age gate (`src/features/age-gate/`)

| Proposal | App before |
| -------- | ---------- |
| Mascot pose (winking, pointing) above the title | Red "Prendidos" wordmark tile |
| Title "¿Ya eres mayor de edad?", one-line subtitle | Eyebrow + title + long paragraph |
| Moderation card (shield icon, white surface, outlined) | No card; the message is in the paragraph |
| Primary button, then a **text link** "Soy menor de edad" | Two full buttons |
| Footnote "Te lo preguntamos una sola vez." | None |

### 2 · Home (`src/features/home/`) and mode (`src/features/category-picker/mode-picker-screen.tsx`)

| Proposal | App before |
| -------- | ---------- |
| Header row: 64 px logo tile (app icon cat on `brandRed`) + red "Prendidos" wordmark | Centered "P" tile, wordmark, tagline |
| "¿Con quién juegas hoy?" and the two **mode cards on home** (Amigos `primary`, Pareja `couple`, each with its illustration) | A "Nueva partida" button that opens a separate mode screen |
| Footer "Toma con moderación. Si tomaste, no manejes." | None |

Home and the mode screen merge: picking a mode on home goes straight to categories. The separate mode route goes away.

### 3 · Categories (`src/features/category-picker/category-picker-screen.tsx`)

| Proposal | App before |
| -------- | ---------- |
| Back button (square, outlined) next to the mode title | "‹ Volver" text link and "Elija la categoría" |
| Subtitle "Elige una categoría. La partida arranca suave…" | "Modo Amigos" |
| Category card on white: title, description with card count, three level bars (`levelEasy`, `levelMedium`, `levelHard`), "GRATIS" chip | Orange card pinned to the bottom of the screen |
| Pareja: one "Entre Dos" card with a row per level and a "Jugar Entre Dos" button | Same orange card |

### 4 · Setup (`src/features/setup/`)

| Proposal | App before |
| -------- | ---------- |
| Back button, category eyebrow ("LA PREVIA"), title "¿Quiénes juegan?" | "Arme la partida", no back button |
| Player row: 56 px avatar (tap to change, swap badge), name field, compact gender segmented control, "No toma" toggle (`ink` when on) | Number, name, gender chips on two lines, no avatar |
| Collapsed rows after the second player ("Caro · Mujer", "+ 2 más") | Every row expanded |
| Dashed "+ Agregar jugador" | Solid button |
| One row of three summary chips: FIN / NIVELES / ORDEN | Long chip lists for levels and end condition, separate "Barajar" button |
| Start button "¡A jugar! · 5 jugadores" | "Empezar" |

The summary chips open the full option lists (sheet or inline expansion); the options themselves do not change.

### 5 · Turn (`src/features/play/`)

| Proposal | App before |
| -------- | ---------- |
| Top bar: pause button, "RONDA 4 DE 10" with a segmented progress bar colored by level, "Cambiar (1)" swap button | "TERMINAR PARTIDA" link, level badge, inline score list |
| Card **filled with the level color**, slightly rotated; chips for type and level, a round points badge | White card with a colored band |
| 60 px avatar + "Le toca a" + player name inside the card | Name above the card |
| Penalty footer in a white strip at the bottom of the card ("SI NO CUMPLE · Toma 2 tragos") | Penalty inside the card body |
| Actions "No cumplió −8 pts" (white) and "¡Cumplió! +15 pts" (`levelEasy`) | "No cumplió" / "Cumplió" without points |

### 6 · Group interlude

| Proposal | App before |
| -------- | ---------- |
| "RONDA 4 DE 10 · INTERLUDIO" + level chip | Same header as a turn |
| Yellow card, "¡TODOS!" chip, big headline, white rule box ("Los que sí: 1 trago") | Yellow card, rule as a line of text |
| Button "Seguir: le toca a Juanpa ›" with the next player's 36 px avatar | "Siguiente" |

### 7 · Level up (new overlay)

`brandRed` full screen, round label, mascot face for the new level (relaxed / smirk / laugh), "¡Esto se prendió!", the level scale with the new level highlighted, the moderation reminder, and "Que siga la fiesta".

### 8 · Ranking and 12 · Ranking with a tie (`src/features/results/`)

| Proposal | App before |
| -------- | ---------- |
| Eyebrow "LA PREVIA · 10 RONDAS", 48 px crowned winking mascot, "¡Ganó Vale!" / "¡Empate arriba!" | "SE ACABÓ LA PARTIDA / Así quedó la noche" |
| Podium for the top three with avatars (winner largest, crown); tied players share a step | Single yellow winner card |
| Rows from 4th place with a 32 px avatar; negative scores in `negative` | Plain list |
| "Inicio" (white) and "Otra partida" (`primary`) side by side | Stacked buttons |

### 9 · Splash

Native splash: the app icon cat on `brandRed`. Set in `app.json` (`expo-splash-screen`), with the app icon and the Android adaptive icon.

### 13 · Pause

The pause button opens a dialog: "RONDA 4 DE 10", "Pausa", "Seguir jugando", "Terminar y ver ranking". It replaces the "TERMINAR PARTIDA" link and its confirmation. "Salir al inicio" waits for HU-12.
