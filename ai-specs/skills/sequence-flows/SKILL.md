---
name: sequence-flows
description: Use when documenting or updating runtime communication flows (who calls whom in order) as Mermaid sequence diagrams in docs/architecture/ — independently from C4 structure diagrams. Trigger for publish/notify, interactions, auth, or any cross-container happy path.
author: UBITS
version: 1.0.0
---

# sequence-flows Skill

Generate or update **runtime sequence diagrams** for Communications. This skill is **independent** of `/c4-model`: C4 answers _what exists and how it connects_; sequences answer _in what order things talk_ for a specific use case.

## Priority

Medium. Run on demand when someone needs to understand or document a flow — not automatically with every C4 update.

## Instructions

Generate sequence flow(s) for: $ARGUMENTS.

Accepted inputs:

- `publish` — HR create/update post + DSP notification fan-out
- `interact` — Collaborator list posts + like/view/click
- `auth` — JWT validation on a protected API request
- `all` — refresh the canonical set in `docs/architecture/sequence-flows.md`
- `<free text>` — one named flow (e.g. `archive post`, `access-state`)
- _(empty)_ — ask which flow, or update existing `sequence-flows.md` from code truth if it already exists

### Step 1 — Read sources of truth

Before drawing, read (as relevant):

1. `docs/architecture/c4-container.md` — participants and protocols (names must match)
2. `docs/api-spec.yml` — HTTP paths, roles, status codes
3. `docs/data-model.md` — which tables are written/read
4. Sibling code use cases in `communications-services-bk` (and MFEs if the flow starts in UI):
   - Prefer application use cases and SQS consumers over controllers alone
   - Confirm who creates DB rows (API vs DSP), feature flags, and skip/toggle branches

Do **not** invent steps that are not in code or OpenAPI. If unsure, mark an assumption in the Notes section.

### Step 2 — Choose scope

- Prefer **2–4 canonical flows**, not one diagram per endpoint
- One Mermaid `sequenceDiagram` per flow (or per major scenario)
- Include only participants that appear in the flow
- Show happy path first; use `alt` / `opt` / `loop` for important branches only

### Step 3 — Write Mermaid `sequenceDiagram`

Always emit:

````markdown
```mermaid
sequenceDiagram
  ...
```
````

Conventions:

| Concept            | Mermaid pattern                     |
| ------------------ | ----------------------------------- |
| Human actor        | `actor Alias as Display Name`       |
| System / container | `participant Alias as Display Name` |
| Sync call          | `A->>B: Message`                    |
| Return             | `B-->>A: Message`                   |
| Branch             | `alt` / `else` / `end`              |
| Optional           | `opt` / `end`                       |
| Repeat             | `loop` / `end`                      |
| Clarification      | `Note over A,B: text`               |

Rules:

1. Use ASCII in messages (avoid bare `&`, fancy arrows, unquoted special punctuation that breaks Mermaid).
2. Prefer stable aliases (`API`, `DSP`, `DB`, `DQ`) consistent with C4 container names.
3. Label protocols when useful (`HTTPS`, `SQS`, `SQL`, `JWKS`).
4. English only in diagram labels and surrounding Markdown.
5. Do **not** use Mermaid C4 dialect or `flowchart` for these docs.

### Step 4 — File layout

Default target: **`docs/architecture/sequence-flows.md`** (multiple flows in one file).

Structure:

1. Title + short intro (C4 = structure; this file = runtime order)
2. Index table of flows
3. One `##` section per flow with:
   - Brief purpose
   - Mermaid `sequenceDiagram`
   - `### Notes` (flags, contracts, edge cases, source use cases)
4. `## Related docs` linking C4, API spec, data model

Only split into `sequence-[flow].md` when a single flow becomes too large to maintain in the shared file.

### Step 5 — Update the architecture index

Ensure `docs/architecture/README.md` lists the Sequences row linking to `sequence-flows.md` (and last-updated date).

### Output format

1. Confirm which flow(s) were written/updated
2. Show paths under `docs/architecture/`
3. List assumptions that need human verification
4. Do **not** regenerate C4 diagrams unless the user also asked for `/c4-model`

## When to run (and when not)

**Run when:**

- Explaining how a cross-container path works (API → SQS → DSP → external)
- Onboarding on a specific use case
- A use case's order of operations changed (new queue hop, who persists what)

**Do not run when:**

- Only structure changed (new container with no new runtime story) → `/c4-model`
- Pure data-model or OpenAPI shape changes with no call-order change
- You would invent a flow without reading sibling use cases

## Relationship to C4

| Skill             | Artifact                                      | Question                                      |
| ----------------- | --------------------------------------------- | --------------------------------------------- |
| `/c4-model`       | `c4-*.md` Mermaid `flowchart`                 | What exists and how it connects?              |
| `/sequence-flows` | `sequence-flows.md` Mermaid `sequenceDiagram` | In what order do they talk for this use case? |

Keep them separate on purpose so either can be refreshed independently.

## Notes

- Living docs: update the affected flow when the use case changes; do not leave stale sequences.
- Accurate over comprehensive — a wrong sequence is worse than no sequence.
- Match participant naming with `c4-container.md` so readers can jump between map and movie.
