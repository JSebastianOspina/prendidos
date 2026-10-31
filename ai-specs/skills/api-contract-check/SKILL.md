---
name: api-contract-check
description: Validate that code changes do not introduce breaking changes to the API contracts defined in docs/api-spec.yml. Use before merging backend changes that touch endpoints, request/response shapes, or auth requirements.
author: UBITS
version: 1.0.0
---

# api-contract-check Skill

Use before merging any backend change that touches controllers, DTOs, route definitions, or response shapes.

## Instructions

Check API contract compliance for: $ARGUMENTS (defaults to current diff).

### Phase 1 — Identify API Changes

Read the current diff and identify:

- New endpoints added (new routes, new controllers)
- Modified endpoints (changed URL, HTTP method, or handler)
- Modified request DTOs (added/removed/renamed fields)
- Modified response shapes (added/removed/renamed fields, changed types)
- Changed authentication or authorization requirements

### Phase 2 — Compare Against docs/api-spec.yml

Read `docs/api-spec.yml` (OpenAPI 3.0 spec) and for each changed endpoint:

- Compare the actual implementation against the spec definition
- Flag any divergence between code and spec

### Phase 3 — Breaking Change Detection

A breaking change is any modification that would cause existing API consumers (frontend, other services) to fail:

| Change                      | Breaking? |
| --------------------------- | --------- |
| New optional request field  | No        |
| New required request field  | YES       |
| Removed request field       | YES       |
| Renamed request field       | YES       |
| New optional response field | No        |
| Removed response field      | YES       |
| Renamed response field      | YES       |
| Changed field type          | YES       |
| Changed HTTP status code    | YES       |
| Changed auth requirement    | YES       |
| New endpoint                | No        |
| Removed endpoint            | YES       |
| Changed URL or HTTP method  | YES       |

### Phase 4 — Spec Update Check

If new endpoints or modified contracts are found, verify that `docs/api-spec.yml` has been updated to reflect the changes. An unupdated spec is a documentation failure.

### Output Format

```
## API Contract Report

### Changes Detected
[List of changed endpoints/DTOs]

### Breaking Changes — [NONE / FOUND]
[Per-change assessment: what breaks and which consumers are affected]

### Spec Sync — [UP TO DATE / NEEDS UPDATE]
[List of spec entries that need updating, or "Spec matches implementation"]

### Verdict
[APPROVED] OR [BLOCKED: breaking changes or spec out of sync]
```

## Notes

- If `docs/api-spec.yml` does not exist yet, the skill should prompt to create it using the current endpoint structure as a baseline.
- Frontend teams depend on this contract — breaking changes without coordination cause integration failures.
- New endpoints that add fields to responses are generally safe; removing or renaming fields is always breaking.
