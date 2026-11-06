# Step N+3 Report - E2E (web build + Expo Go)

- Date: 2026-11-06
- Change: hu-15-illustrations-and-motion
- Agent: Claude Code (Opus 5.5), `/opsx:apply`
- Status: **web part PASS; Expo Go device check pending (task 15.5)**

## Scope Decision

The dev machine has no Xcode (`xcrun simctl` unavailable, only Command Line Tools), no Android SDK (`adb` not found), and no Maestro (`maestro` not found). On 2026-11-06 the product owner chose to replace the simulator runs with the web build (agent) plus an Expo Go check on a real phone (product owner); `tasks.md` group 15 and task 9.2 were updated before running. `.maestro/play-turn.yaml` is written and ready for a simulator, emulator, or USB Android device once Maestro is installed.

## Environment

- Web: `expo-web` launch config (`npx expo start --web`, port 8082 because 8081 was taken by the product owner's own Metro), Claude browser pane, React Native Web
- Viewports: 375 × 667 (iPhone SE) and 430 × 932 (large iPhone)
- Isolation: local browser storage only (`localStorage` key `device.v1`, cleared before each run, the web equivalent of `launchApp: clearState: true`); no shared data, no grant needed

## Commands

- Flow file check: `.maestro/play-turn.yaml` parses as YAML (2 documents, 27 steps) and all 14 `id:` selectors exist in the app (`testID`s added to `Button`, `ClayButton`, the mode and category cards, the name fields, and the ranking title)
- Web run: the same steps scripted in the browser pane by `data-testid`

## Scenarios (play-turn, both viewports)

| Step                                                                   | 375 × 667 | 430 × 932 |
| ---------------------------------------------------------------------- | --------- | --------- |
| Age gate confirmed                                                     | PASS      | PASS      |
| Amigos → La Previa                                                     | PASS      | PASS      |
| Two players named, game started                                        | PASS      | PASS      |
| Card visible inside its entrance (a group interlude is continued first) | PASS     | PASS      |
| "¡Cumplió!" passes the turn to the other player                        | PASS      | PASS      |
| "No cumplió" pressed while the next card is still entering → refusal penalty | PASS (opacity 0 at tap) | PASS (opacity 0 at tap) |
| Turn passes back after "Seguir"                                        | PASS      | PASS      |
| Turn buttons never move between cards                                  | PASS (top 574 / 574) | PASS (top 839 / 839) |
| Swap shows a new card and "Cambiar (0)"                                | PASS      | PASS      |
| Pausa → end → ranking with "¡Ganó Ana!" and the crowned mascot         | PASS      | PASS      |

Passed 20, failed 0, skipped 0.

**Finding (not a defect of this change):** a first scripted run pressed "¡Cumplió!" again about 300 ms after the previous "¡Cumplió!" and the press was dropped. That is the HU-05 double-tap guard (`repeatedPressWindowMs`, 600 ms per button), not the entrance: the spec scenario uses "No cumplió", which has its own guard and responds during the entrance. Task 15.3 and the Maestro flow were corrected to the spec scenario.

## Visual Checks on the Web Build

With the browser pane visible (2026-11-05 to 2026-11-06 runs):

- Illustrated cards: shown centered between the text and "Si no cumple" when they fit (for example "Contacto guardado", `mascot-surprised`, 430 × 932); text-only at 375 × 667 where an individual card leaves about 7 pt under the text; after a window change the fit is checked again (155 pt → shown, 7 pt → hidden). A defect found here (art stuck hidden after a resize) led to the design D4 revision and was fixed before these runs.
- Motion: the card is caught mid-entrance (fading and rising) and settles; the level-up overlay grows its mascot tile; the ranking shows the crowned winking mascot at 48 pt.

With the pane hidden (the later runs), the page renders no frames: `requestAnimationFrame` and `ResizeObserver` never fire, so animations stay at their first frame and `onLayout` does not run. Flow logic is unaffected (all steps above pass), but illustration and motion checks from hidden runs are not evidence either way.

Not covered on web, by design or platform: haptics (none on web by spec), the system Reduce Motion setting, the system font size, and Android. These are the Expo Go checklist (task 15.5).

## Expo Go Device Check (task 15.5) — pending

Run 1 (product owner, iPhone, Expo Go, 2026-11-06, Metro on port 8082): haptics confirmed working. Six screenshots of Prendido-level cards showed every individual card overflowing and scrolling inside its area (body at 29 pt, median body about 104 characters), so no card had room for its illustration ("Karaoke del despecho", tagged `microphone`, rendered text-only). Result: design D13 (compact header, body steps 29 → 24 → 20 pt, illustration 72–120 pt in the space left), specified in the turn-screen delta and implemented in tasks 4.5–4.8 before run 2.

Run 2 (after D13): every card fit without scrolling, but only one very short card showed its illustration. Product owner decision: an illustrated card may take one more text step for its art (D13 "One text step for the illustration").

Run 3: still no scrolling; about 5 cards in a whole game showed art, and small (for example "Baile lento" `mascot-dancing`, "Stand-up de la vergüenza" `mascot-laugh`, "Cita de terror" `mascot-crying`), while untagged cards such as a Picante "Yo nunca" left empty space. Product owner decision: cards without a key show their level's mascot face, and illustrations grow up to 160 pt (D13 "Level face by default, up to 160 pt"), implemented in tasks 4.9–4.10 before run 4.

| Item                                                                 | Result |
| -------------------------------------------------------------------- | ------ |
| One light haptic per press on clay buttons ("¡Cumplió!", "No cumplió", shared buttons) | PASS (run 1) |
| Cards fit the screen without scrolling                               | PASS (runs 2 and 3) |
| Illustrations fill the free space (own key or level face, 72–160 pt) | pending (run 4) |
| Reduce Motion / Remove animations off: card springs in, level-up tile grows, winner pops | |
| Reduce Motion / Remove animations on: every entrance only fades; presses sink instantly | |
| Largest font size: illustrated cards fall back to text-only, nothing truncated, buttons fixed | |
| Same content and taps with each setting                              | |

## Restore

- Web: the game was ended through the app (Pausa → end); the preview server was stopped after the runs
- Phone: reset Reduce Motion and font size after the Expo Go check (task 15.6)

## Outcome

- Step N+3 status: web PASS; overall pending the Expo Go check
- Blocking issues: none in the app; Maestro runs deferred until the tooling exists
