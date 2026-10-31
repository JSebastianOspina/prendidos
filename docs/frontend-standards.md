---
description: Frontend development standards for the Expo / React Native app — platform rules, component architecture, state management, UI/UX, testing, and conventions.
globs: ['src/**', 'app.json', 'assets/**']
alwaysApply: false
---

# Frontend Standards

## Status

| Field                   | Value                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Customized              | Yes                                                                                              |
| Applies to this project | Yes — Expo / React Native app for iOS and Android (web build exists but is not a product target) |

---

## Technology Stack

This is an **Expo / React Native** mobile application (iOS, Android, and web via `react-native-web`). Prioritize mobile-first patterns, performance, and cross-platform compatibility. This file overrides the Harness frontend defaults (React + `@flux-ui/core`, React Router, Cypress) — do not use them here.

- Framework: **Expo SDK 58** (`expo` ~58), **React Native 0.88**, **React 19.3**
- Language: **TypeScript** (~6.0), strict typing
- Routing: **Expo Router** (file-based, `src/app/`)
- Native UI: **`@expo/ui`** (SwiftUI / Jetpack Compose), `expo-symbols`, `expo-glass-effect`, `expo-image`
- Animation and gestures: `react-native-reanimated` 4 + `react-native-worklets`, `react-native-gesture-handler`
- Package manager: **npm** (`package-lock.json`)
- Build and release: **EAS** (Build, Submit, Update)
- Testing: **Jest** via `jest-expo` + **React Native Testing Library** (unit / component); **Maestro** (E2E) — see § Testing
- Coverage target: ≥ 90% line coverage (see `docs/base-standards.md` §1)

---

## Expo Platform Rules

### Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

### Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

### Navigation and Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

### Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

### Native Code Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

## Component Architecture

- Folder structure:
  - `src/app/` — **routes only** (Expo Router). Screens stay thin: read params, call hooks, render feature components.
  - `src/components/` — reusable UI (`themed-text.tsx`, `themed-view.tsx`); `src/components/ui/` for low-level primitives.
  - `src/features/<feature>/` — feature modules (e.g. `game`, `categories`, `purchases`) with their own `components/`, `hooks/`, and pure logic. Create on first use.
  - `src/hooks/` — cross-feature hooks (`use-theme.ts`, `use-color-scheme.ts`).
  - `src/constants/` — theme tokens and static configuration.
  - Game rules (challenge selection, difficulty, scoring) live in **pure TypeScript modules with no React or Expo imports**, so they are unit-testable without rendering.
- Component types: route screens (`src/app/`) → feature components → shared components → primitives (`ui/`).
- Props and composition: typed props interfaces, composition over configuration flags, no default exports except where Expo Router requires them (route files and `_layout.tsx`).
- Platform variants: use `*.web.tsx` / `*.ios.tsx` / `*.android.tsx` file suffixes instead of large `Platform.OS` branches.
- When to split vs. colocate: colocate with the feature until a second feature needs it, then move to `src/components/` or `src/hooks/`.
- Path alias: import from `@/…` (maps to `src/`) instead of long relative paths.

---

## State Management

- Local state: `useState` / `useReducer` inside components. The React Compiler is enabled (`app.json` → `experiments.reactCompiler`), so do **not** add `useMemo` / `useCallback` / `memo` by default — only when profiling shows a need.
- Game session state: a reducer (`useReducer`) or small store owned by the game feature; state transitions are pure functions covered by unit tests.
- Server/async state: not applicable today (no backend). If a remote API is added, use TanStack Query and update this section.
- Persistence: on-device storage for progress, scores, and unlocked content. The library is **to be decided** (candidates: `expo-sqlite`, `expo-sqlite/kv-store`, `expo-secure-store` for small secrets) — record the choice with `/create-adr` before implementing.
- Form handling: plain controlled inputs; add a form library only through an ADR.

---

## API Communication

Not applicable today: Prendidos has no backend, and challenge content is bundled with the app. The only external calls are App Store / Google Play in-app purchases and EAS Update.

- Wrap every external SDK (purchases, analytics, storage) in an adapter module under `src/features/<feature>/` so screens never import vendor SDKs directly.
- Error handling in the UI: every screen that waits on async work shows explicit loading, empty, and error states.
- If a backend is added, fill `docs/backend-standards.md` and `docs/api-spec.yml` first, then update this section.

---

## Styling and UI/UX

- Styling approach: `StyleSheet.create` with theme tokens from `src/constants/theme.ts` (`Colors.light` / `Colors.dark`, `Fonts`). Never hardcode colors; read them through `useTheme()`.
- Light and dark mode: both must work (`userInterfaceStyle: automatic`).
- Native controls: prefer `@expo/ui` (SwiftUI / Jetpack Compose) for pickers, switches, sliders, sheets, and menus; `expo-symbols` for icons; `expo-image` for images.
- Animation: `react-native-reanimated` + `react-native-gesture-handler`; respect the system "Reduce Motion" setting.
- Layout: portrait only (`app.json` → `orientation: portrait`); respect safe areas; support small (iPhone SE) to large phones.
- Accessibility target: WCAG 2.1 AA equivalents for mobile — `accessibilityLabel` / `accessibilityRole` on interactive elements, Dynamic Type / font scaling, minimum 44×44 pt touch targets, sufficient contrast in both themes. Run `/accessibility-audit` before merging UI changes.
- Copy and i18n: user-facing copy is **Spanish** (product language); code, identifiers, and docs stay in English. Keep copy in one place per feature so it can move to an i18n library later.
- Responsible-drinking UX: show an 18+ age confirmation before first play and never pressure players to drink — players marked as non-drinkers get a generic non-alcoholic penalty per difficulty, and no penalty asks for more than 3 drinks or to finish a drink (App Store guideline 1.4.3; see `docs/prd.md` §5.8).

---

## Testing

- Unit and component tests: **Jest 30** with the `jest-expo` preset (installed; run `npm test`, see `docs/development_guide.md` § Running Tests). Add **React Native Testing Library** with the first component test: `npx expo install @testing-library/react-native --dev`.
  - Test files: `__tests__/<module>-test.ts(x)` in a `__tests__` folder next to the code under test (Expo's convention). Shared test data goes in `__tests__/fixtures/`, which Jest does not run as tests.
  - Game logic modules: 100% branch coverage target; overall target ≥ 90% line coverage.
  - Coverage scope: measured on `src/features/**` (threshold enforced in `package.json`). Template code outside `src/features/` is deliberately excluded until it is replaced by real screens.
  - Query by role / label / text (user-facing), not by test IDs, unless there is no accessible alternative.
- E2E: **Maestro** flows in `.maestro/` run against the iOS Simulator or Android emulator (`maestro test .maestro/`). Cover the critical path: age gate → choose mode and category → play challenges → score summary → purchase flow (store sandbox).
- Visual regression: none.
- Always run `npx expo lint` and `npx tsc --noEmit` before declaring a task done.

---

## Security

Follow `docs/security-standards.md`.

- Never store secrets in the JS bundle or `app.json` — anything in the bundle is public. Use EAS environment variables only for non-secret build-time config.
- Use `expo-secure-store` for any sensitive on-device value; never `AsyncStorage` for secrets.
- In-app purchases go through the App Store / Google Play only; the app never collects or stores card data. Validate entitlements with the store SDK, not with local flags alone.

---

## Naming Conventions

See `docs/base-standards.md` §2.2 for the full table.

| Artifact        | Convention                                      | Example                                        |
| --------------- | ----------------------------------------------- | ---------------------------------------------- |
| Component files | kebab-case `.tsx`, PascalCase export            | `challenge-card.tsx` → `ChallengeCard`         |
| Route files     | kebab-case in `src/app/`, `[param]` for dynamic | `src/app/play/[category-id].tsx`               |
| Hooks           | `use-*.ts`, `useCamelCase` export               | `use-game-session.ts` → `useGameSession`       |
| Utilities       | kebab-case `.ts`, camelCase exports             | `pick-next-challenge.ts` → `pickNextChallenge` |
| Styling files   | colocated `StyleSheet.create`; CSS only for web | `animated-icon.module.css` (web only)          |
| Tests           | `__tests__/<file>-test.ts(x)` next to the source | `__tests__/pick-next-challenge-test.ts`       |

---

## Code Examples

Themed component — read colors from the theme, never hardcode them:

```tsx
// Before
<Text style={{ color: '#000000' }}>{challenge.title}</Text>;

// After
import { ThemedText } from '@/components/themed-text';

<ThemedText>{challenge.title}</ThemedText>;
```

Game logic stays pure and testable — no React inside rules:

```ts
// src/features/game/pick-next-challenge.ts
export function pickNextChallenge(
  challenges: readonly Challenge[],
  playedIds: ReadonlySet<string>,
  difficulty: Difficulty,
): Challenge | undefined {
  return challenges.find((c) => c.difficulty === difficulty && !playedIds.has(c.id));
}
```
