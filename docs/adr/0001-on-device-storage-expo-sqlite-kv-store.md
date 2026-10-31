# ADR-0001: On-device storage with expo-sqlite/kv-store

**Date**: 2026-10-31
**Status**: Accepted
**Deciders**: Product owner (decision given in the HU-00 brief), coordinating agent

---

## Context

Prendidos has no backend. The phone must remember the 18+ confirmation, the last players, the cards already seen, the last Sin Filtro choice, and the game in progress (`DeviceState` in `docs/data-model.md`), offline and across launches. The data is small (a few kilobytes of JSON), holds no secrets, and is read once at startup and written after each turn. `docs/frontend-standards.md` listed `expo-sqlite`, `expo-sqlite/kv-store`, and `expo-secure-store` as candidates.

## Decision

We will store `DeviceState` as one JSON value under the versioned key `device.v1` with `expo-sqlite/kv-store`, using its synchronous API (`getItemSync` / `setItemSync`). All access goes through the adapter `src/features/device/device-storage.ts`; screens never import the storage library. A shape change bumps the key version and adds a migration from the previous version.

## Alternatives Considered

### Option A: `@react-native-async-storage/async-storage`

**Pros**:
- Widely used, simple key-value API

**Cons**:
- Async only, so the first screen would wait for a load state
- Extra dependency when `expo-sqlite` offers the same API

### Option B: `expo-sqlite` with tables

**Pros**:
- Queries and indexes if history ever grows

**Cons**:
- Schema and migrations for a single small document; more code for no current need

### Option C (chosen): `expo-sqlite/kv-store`

**Pros**:
- Drop-in AsyncStorage API plus synchronous reads, so state is ready on the first render
- Expo module, included in Expo Go for SDK 58; works offline; can grow into SQL tables without a new library

**Cons**:
- Synchronous writes run on the JS thread (acceptable for a few KB once per turn)

## Consequences

### Positive

- One adapter, one key, deterministic tests with an in-memory mock

### Negative / Trade-offs

- The whole document is rewritten on every save

### Neutral

- `expo-secure-store` stays reserved for future secrets (none today)
