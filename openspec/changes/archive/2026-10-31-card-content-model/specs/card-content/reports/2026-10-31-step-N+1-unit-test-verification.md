# Step N+1 Report - Unit Tests, Lint, Typecheck

- Date: 2026-10-31
- Change: card-content-model
- Agent: Claude Code (Opus 5.5)

## Runs

| Run | Trigger | Tests | Coverage (`src/features/**`) | Lint | Typecheck |
| --- | ------- | ----- | ---------------------------- | ---- | --------- |
| 1   | Initial implementation (tasks 1–7) | 70 passed / 4 suites | 100 % | PASS | PASS |
| 2   | After the first adversarial review (FAIL, 5 majors; tasks 3.3–3.4, 4.3–4.4, 5.5–5.7, 6.3–6.5, 7.2) | 130 passed / 5 suites | 100 % statements, branches, functions, lines | PASS | PASS |
| 3   | After the second adversarial review (FAIL, 3 majors on text heuristics) and the product decisions: heuristics become warnings, group cards neutral without placeholders, drinks rule on body and quip only (tasks 4.5–4.6, 5.8–5.9, 6.6, 7.3) | 168 passed / 5 suites | 100 % statements, branches, functions, lines | PASS | PASS |

Run 3 also passed `openspec validate card-content-model --strict`. The coverage glob now includes `src/features/**/*.tsx`.

## Scenarios Added in Run 3

| Requirement | Tests |
| ----------- | ----- |
| Violations are errors or warnings | `validate-cards-test` › severity: warnings for banned phrase + drinks in copy, `hasErrors` false; error for 4 drinks, `hasErrors` true; empty list |
| Bounded drink penalty (penalty fields) | unknown `qiup` field; blank quip; quip limit read from `copyLengthLimits` |
| Copy that prescribes drinks is flagged | "se toma 2", "tres guaros", "cinco cervezas", "dos chupitos", "media botella", "5tragos", zero-width split, "se toman uno"; "tómense una selfie" passes; five legacy penalty phrasings flagged |
| Copy with banned phrases is flagged | `banned-phrases-test`: puta, putas, pelotuda, maricón, maricones, hpta, hijueputa, hijo de puta; documented limits (`puuuto` not caught, `MK` flagged) |
| Placeholders and variants (group cards) | `{player}` rejected in a group card; variants allowed in a group card |

## Commands Executed (run 2 and run 3)

- `npx jest src/features/content --coverage=false`
- `npm test -- --coverage` (`jest --watchAll=false --coverage`)
- `npx expo lint --no-cache`
- `npx tsc --noEmit`
- `openspec validate card-content-model --strict`

## Unit Test Results (run 3)

- Targeted tests (run 3): 168 passed, 0 failed, 0 skipped (5 suites)
- Full/required suite (run 3): 168 passed, 0 failed, 0 skipped (5 suites)
- Runtime: ~0.4–0.8 s
- Notes: run 1 hit a stale `expo lint` cache (`import/no-unresolved` on a module that existed); `--no-cache` passes. Run 2 added `@types/node` (dev only) for the test that reads `ai-specs/skills/write-cards/SKILL.md`; it is referenced only in that file.

## Scenario Coverage

Every scenario in `specs/card-content/spec.md` maps to at least one test:

| Requirement | Tests |
| ----------- | ----- |
| Catalog validation reports every violation | `validate-cards-test`: valid catalog; several violations |
| Validation never fails on malformed input | malformed catalog (`null`, string, number, `{}`, non-list fields); non-object card and category by position; malformed card fields |
| Categories are well-formed | mode case (`Couple`) skips mode rules; duplicate category ID; free difficulties; blank and non-text category ID |
| Card IDs are unique slugs | duplicate across categories; not a slug; blank and non-text ID by position |
| Cards belong to an existing category | unknown category; missing category |
| Card fields are known | misspelled field; authoring notes and `null` optional fields; `write-cards-skill-test` (skill output example passes) |
| Points within the level | out of range; non-integer; not a number; missing |
| Bounded drink penalty | 4 drinks; 0 drinks; missing; non-text quip |
| Group cards carry no points or penalty | points; penalty |
| Required copy is not blank | empty headline; whitespace-only body; invisible-only headline; `gendered-text-test` blank variant options |
| Copy fits the card | long headline; body long only in one variant; quip over 30; `gendered-text-test` NFC and emoji counting |
| Copy does not prescribe drinks | digits, number words, "una copa"; quip; "nada de trago" allowed |
| Spicy only in friends | spicy card in `entre-dos` |
| Copy avoids banned phrases | `FONDO BLANCO`; split across a variant; quip; `banned-phrases-test`: case, accents, plurals, elongation, `hpt*`, separators, full-width, zero-width, soft hyphen, look-alikes, legacy corpus regression |
| Placeholders and variants | two-option variant; unknown placeholder (also with unknown category); `{partner}` in friends; `{player}`/`{partner}` allowed; broken braces; `gendered-text-test` prototype keys not resolved |
| Target gender | `undisclosed` |

## Not Applicable

- Step N+2 (manual endpoint testing with curl): N/A — no backend or API surface.
- Step N+3 (E2E with Maestro): N/A — no screen, route, user flow, or persisted state; the module is pure TypeScript not yet used by the app.

## Security / Schema Gate

- No auth, authorization, secrets handling, or age-gate code changed: no SECURITY REVIEW NEEDED.
- No secrets in source or config (changed files searched for keys, tokens, and passwords).
- No backend schema or migrations.

## Data Safety

- Direct DB / device-storage access used: No
- Human mutating grant required: No
- Isolation / teardown (if grant used): N/A
- Cleanup outcome: none needed

## Outcome

- Step N+1 status: PASS
- Blocking issues: none
