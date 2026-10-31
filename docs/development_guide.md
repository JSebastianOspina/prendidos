---
description: Local development setup, environment configuration, and test workflows. Customize before onboarding developers or agents.
alwaysApply: false
---

# Development Guide

## Status

| Field        | Value     |
| ------------ | --------- |
| Customized   | Yes       |
| Project name | Prendidos |

---

## Project Overview

Prendidos is a native party drinking game for Android and iPhone: players pick a category and play challenges with friends or a partner, with difficulty levels and points for completed challenges.

---

## Prerequisites

- Runtime: Node.js ≥ 20.19 (LTS recommended)
- Package manager: **npm** (`package-lock.json`). Add dependencies only with `npx expo install <package>`.
- iOS: Xcode + iOS Simulator (macOS only), for development builds and Maestro E2E
- Android: Android Studio + an emulator
- CLIs: EAS CLI via `npx eas-cli@latest <command>` (Expo account with access to the `prendidos` owner); Maestro CLI for E2E (https://docs.maestro.dev/getting-started/installing-maestro)
- OpenSpec ≥ 1.16 (`npm install -g @fission-ai/openspec@latest`)

---

## Repository Layout

```
prendidos/
├── src/
│   ├── app/              ← Expo Router routes only (screens, _layout.tsx)
│   ├── components/       ← shared UI (ui/ = primitives)
│   ├── features/         ← feature modules: game, categories, purchases (created on first use)
│   ├── hooks/            ← cross-feature hooks
│   └── constants/        ← theme tokens (theme.ts)
├── assets/               ← icons, splash, images
├── .maestro/             ← Maestro E2E flows (created with the first flow)
├── app.json              ← Expo config (native config lives here, not in ios/ or android/)
├── docs/                 ← standards (single source of truth for agents)
├── ai-specs/             ← Harness agents, skills, hooks, evals
├── openspec/             ← OpenSpec specs and changes
├── scripts/              ← Harness scripts + reset-project.js
└── templates/            ← Harness templates (CI, pre-commit, env examples)
```

This is a single-repo project (Harness "monorepo" mode). There are no sibling repos, so `scripts/bootstrap`, `pull-all`, `status-all`, and `branch-all` are not used.

---

## Environment Configuration

There are no environment variables today. When config is needed:

- Public, build-time values use the `EXPO_PUBLIC_` prefix in a local `.env` file. **Everything with `EXPO_PUBLIC_` is embedded in the app bundle and is public** — never put secrets there.
- Per-build values for EAS builds are managed with EAS environment variables (`npx eas-cli@latest env:create`), per environment (development / preview / production).
- Never commit `.env` files; keep a `.env.example` with placeholder values (see `templates/frontend.env.example`).

---

## Local Setup

### App

```bash
npm install
npx expo start            # Metro dev server — press i (iOS) / a (Android)
```

Expo Go only includes Expo's bundled native modules. After adding a library with native code, use a development build:

```bash
npx expo run:ios          # local development build (iOS Simulator)
npx expo run:android      # local development build (Android emulator)
npx eas-cli@latest build --profile development --platform ios   # cloud development build
```

### Backend / serverless

Not applicable — Prendidos has no backend today.

---

## Running Tests

| Layer            | Command                  | Notes                                                                        |
| ---------------- | ------------------------ | ---------------------------------------------------------------------------- |
| Lint             | `npx expo lint`          | Mandatory before any task is done                                            |
| Typecheck        | `npx tsc --noEmit`       | Mandatory before any task is done                                            |
| Unit / component | `npm test`               | Jest 30 with the `jest-expo` preset                                          |
| Coverage         | `npm test -- --coverage` | ≥ 90% on `src/features/**` (threshold enforced in `package.json`)            |
| E2E              | `maestro test .maestro/` | **Maestro** against a running simulator/emulator with the app installed      |

Jest is installed and configured following https://docs.expo.dev/develop/unit-testing/ (SDK 58 requires Jest 30). Tests live in `__tests__/` folders next to the code, named `<module>-test.ts`. To reinstall:

```bash
npx expo install jest-expo jest @types/jest @types/node --dev
```

React Native Testing Library is added with the first component test: `npx expo install @testing-library/react-native --dev` (v14 or later for Expo Router).

---

## Build and Release (EAS)

| Task                      | Command                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| Configure EAS (first run) | `npx eas-cli@latest build:configure` (creates `eas.json`)         |
| Preview build (internal)  | `npx eas-cli@latest build --profile preview --platform all`       |
| Production build          | `npx eas-cli@latest build --profile production --platform all`    |
| Submit to stores          | `npx eas-cli@latest submit --platform ios` / `--platform android` |
| OTA update                | `npx eas-cli@latest update --channel <channel> --message "<msg>"` |

Store submissions and production OTA updates are human-approved actions — agents prepare the command and wait for confirmation.

---

## Common Tasks

- Diagnose dependency / config issues: `npx expo-doctor`
- Fix SDK-incompatible versions: `npx expo install --fix`
- Regenerate typed routes: start the dev server (`npx expo start`); types land in `.expo/types/`
- Start from a blank `src/app/`: `npm run reset-project` (moves the starter code to `example/`)
- Sync Harness skill symlinks after adding a skill: `bash scripts/sync-skills.sh`

---

## Troubleshooting

- **"Native module not found" in Expo Go** → the library needs a development build (`npx expo run:ios|android`).
- **Version mismatch warnings** → `npx expo install --fix`, then `npx expo-doctor`.
- **Stale Metro cache** → `npx expo start --clear`.
- **Expo API behaves differently than expected** → check the versioned docs for the installed SDK (`https://docs.expo.dev/versions/v58.0.0/`), not memory or older blog posts.
