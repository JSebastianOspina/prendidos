---
name: create-adr
description: Create a formal Architecture Decision Record (ADR) in docs/adr/ whenever a significant technical decision is made. Use when choosing a new technology, pattern, or architectural approach.
author: UBITS
version: 1.1.0
---

# create-adr Skill

**Canonical workflow** for creating ADRs in Harness. The file structure and placeholders live in **`references/adr-template.md`** — do not duplicate that template here.

Use whenever a significant, hard-to-reverse technical decision is being made — technology choices, architectural patterns, data model approaches, integration strategies. ADRs give future team members context on why things are the way they are.

## When to Create an ADR

Create an ADR when the decision:

- Introduces a new technology, library, or framework to the project
- Changes an architectural pattern that affects multiple files or teams
- Has multiple viable alternatives that were considered
- Will be difficult or costly to reverse later
- Is the kind of thing a new team member would wonder "why did they do it this way?"

## Instructions

Create an ADR for: $ARGUMENTS.

1. Determine the next ADR number by checking `docs/adr/` for existing ADRs (e.g., `0001-use-prisma.md` → next is `0002`).

2. Read **`references/adr-template.md`** and create the file at `docs/adr/NNNN-[kebab-case-title].md` using that template. Replace all placeholders with the decision content.

3. After creating the file, update `docs/adr/README.md` (create it if it doesn't exist) with a one-line entry in the ADR index table.

## Notes

- ADRs are immutable once accepted — do not edit the decision section after the fact. If a decision changes, create a new ADR that supersedes the old one and update the old one's status.
- Keep ADRs focused on the decision, not the implementation details.
- A good ADR takes 15–30 minutes to write and saves hours of future confusion.
