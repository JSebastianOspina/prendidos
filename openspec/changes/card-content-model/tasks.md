# Tasks

## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Work on `feature/card-content-model`. It is stacked on `docs/card-content` (PRD 1.1 and content docs, not merged yet); rebase it onto `main` once that branch merges. Verify with `git branch --show-current`
- [x] 0.2 Verify the working tree is clean before the first code change (`git status --short` shows nothing)

## 1. Test Tooling

- [x] 1.1 Install test dependencies with `npx expo install jest-expo jest @types/jest --dev`; verify `package.json` devDependencies list `jest` 30.x and `jest-expo` ~58
- [x] 1.2 Add `"test": "jest --watchAll=false"`, the `jest-expo` preset, and coverage config (`collectCoverageFrom: ["src/features/**/*.ts"]`, 90 % global threshold) to `package.json`; add `"types": ["jest"]` to `tsconfig.json`; verify `npx tsc --noEmit` and `npx expo lint` still pass
- [x] 1.3 Add a throwaway smoke test, verify `npm test` runs it green, then delete it
- [x] 1.4 Fix the Jest install command in `docs/development_guide.md` (§ Running Tests) to the SDK 58 form and note that React Native Testing Library comes with the first component test; verify the documented command matches 1.1

## 2. Content Types

- [x] 2.1 Create `src/features/content/card-types.ts` with `GameMode`, `Difficulty`, `CardType`, `Heat`, `PlayerGender`, `DrinkPenalty`, `Category`, the `IndividualCard` / `GroupCard` union, `pointsRangeByDifficulty`, and the copy length limits (design §2, §4); verify `npx tsc --noEmit` passes
- [x] 2.2 Add a type-level test (`__tests__/card-types-test.ts`) showing that an individual card without `penalty` and a group card with `points` fail to compile (`// @ts-expect-error`); verify `npm test` and `npx tsc --noEmit` pass

## 3. Gendered Text (TDD)

- [x] 3.1 Write failing tests in `__tests__/gendered-text-test.ts` for: plain text, `{player}`, `{partner}`, a 3-option variant, a 2-option variant (malformed), an empty option (malformed), an unknown token, and rendering the three genders; verify they fail
- [x] 3.2 Implement `gendered-text.ts` (parse, render per gender, longest length with the 12-character placeholder estimate); verify 3.1 passes

## 4. Banned Phrases (TDD)

- [x] 4.1 Write failing tests in `__tests__/banned-phrases-test.ts`: each banned entry is found regardless of case and accents, and look-alike words ("computo", "fondos") are not; verify they fail
- [x] 4.2 Implement `banned-phrases.ts` with the initial list from design §5; verify 4.1 passes

## 5. Catalog Validator (TDD)

- [x] 5.1 Add a valid fixture catalog (`__tests__/fixtures/valid-catalog.ts`: `la-previa` friends, `entre-dos` couple, one card of each type and heat) and a failing test that it returns no violations
- [x] 5.2 Write one failing test per scenario in `specs/card-content/spec.md` (IDs, category, points, drinks, group fields, headline, lengths, heat × mode, banned phrases, placeholders and variants, target gender, several violations at once); verify they fail
- [x] 5.3 Implement `validate-cards.ts` with one small check per rule returning `ContentViolation[]` and never throwing on malformed input; verify 5.1 and 5.2 pass
- [x] 5.4 Add a test that a malformed card (missing fields, wrong types such as `points: "10"`) yields violations instead of throwing; verify it passes

## 6. Data Model and Content Docs

- [x] 6.1 Update `docs/data-model.md` per design §7 (Card fields, `GenderedText` format, launch catalog without `sin-filtro`, `spicyLayer` product, `GameSettings.spicyEnabled`, `DeviceState.lastSpicyEnabled`, access rule, validation rules pointing to the `card-content` spec); verify `grep -n "sin-filtro" docs/data-model.md` finds no category or product row and `Card` has no `text` field
- [x] 6.2 Mark `docs/content/card-templates.md` as adopted (status line, link to `src/features/content/`) and point `ai-specs/skills/write-cards/references/policy.md` to the validator for mechanical rules; verify links resolve

## 7. Review and Update Existing Unit Tests (MANDATORY)

- [x] 7.1 Review the new tests against every scenario in `specs/card-content/spec.md`; add any missing case; verify each scenario maps to at least one test

## 8. Run Unit Tests, Lint, and Typecheck (MANDATORY - AGENT MUST EXECUTE)

- [x] 8.1 Run targeted tests `npx jest src/features/content` (no direct DB or device-storage access)
- [x] 8.2 Run the full suite with coverage `npx jest --coverage`; coverage of `src/features/**` must be ≥ 90 %
- [x] 8.3 Run `npx expo lint` and `npx tsc --noEmit`; both must pass
- [x] 8.4 Create report `openspec/changes/card-content-model/specs/card-content/reports/YYYY-MM-DD-step-N+1-unit-test-verification.md`
- [x] 8.5 Mark this step complete only after tests, lint, and typecheck pass and the report exists

## 9. Manual Endpoint Testing with curl — N/A (no backend)

- [x] 9.1 Confirm the change adds no backend or API surface; record N/A in the step 8 report

## 10. E2E Testing with Maestro — N/A

- [x] 10.1 Confirm the change adds no screen, route, flow, or persisted state (pure module and docs); record N/A and the reason in the step 8 report

## 11. Update Technical Documentation (MANDATORY)

- [x] 11.1 Update `README.md` with the `npm test` command; verify the command in the README runs as written

## 12. Security / Schema Gate (MANDATORY when applicable)

- [x] 12.1 Confirm no auth, authorization, secrets, or age-gate code changed (no SECURITY REVIEW NEEDED) and no secrets in source or config; record in the step 8 report

## Workflow follow-up

- Run the `adversarial-review` skill against this change before archiving.
- Archive with `/opsx:archive`, then commit with Conventional Commits.
