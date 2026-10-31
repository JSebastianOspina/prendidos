---
name: write-us
description: Write a product-level user story from a raw idea or Jira ticket — business value and acceptance criteria only, no technical detail. Use before enrich-us.
author: UBITS
version: 1.1.0
---

# write-us Skill

**Canonical workflow** for product-level user stories in Harness. The `product-manager` agent references this skill and provides the PM persona — do not duplicate this format in the agent definition.

Use when a PM needs to structure a raw idea or rough ticket into a clean, Jira-ready product user story before the dev enriches it technically.

## Instructions

Please create a product user story for: $ARGUMENTS.

Follow these steps:

1. Determine the input source:
   - **Direct input mode (default):** Use the idea or ticket content provided in the prompt.
   - **Jira mode:** If a Jira ticket ID is provided (e.g. `UBITS-234`), fetch it via Jira MCP.

2. Act as a Product Manager focused exclusively on business value and user experience. Do NOT include any technical implementation details, stack names, or architectural decisions.

3. Structure the output as follows:

   ### User Story

   **As a** [specific user persona],
   **I want to** [specific goal or action],
   **So that** [measurable business outcome].

   ### Context

   2–3 sentences on why this matters now — user pain, market context, or business goal.

   ### Acceptance Criteria

   A checklist of testable, observable behaviors — each one written from the user's point of view, specific and verifiable, free of technical detail.

   ### Out of Scope

   What this story explicitly does NOT include.

   ### Business Value

   One sentence on impact: retention, conversion, user satisfaction, or operational efficiency.

4. Output format must always include:
   - `## User Story`
   - `## Context`
   - `## Acceptance Criteria`
   - `## Out of Scope`
   - `## Business Value`

5. Jira write-back (only in Jira mode):
   - Update the Jira ticket with the structured user story.
   - If ticket status is `Backlog` or `To Do`, move it to `Refinement`.

## Notes

- This skill is intentionally non-technical. If you feel compelled to mention implementation details, resist — that is enrich-us's job.
- The output of this skill is the direct input for `/enrich-us`.
- Focus on WHAT and WHY, never HOW.
- UBITS primary personas: corporate learner, HR manager, content creator, platform admin.
