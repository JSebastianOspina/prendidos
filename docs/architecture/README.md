# Architecture (C4)

C4 documentation for Prendidos, a native Expo / React Native party game for iOS and Android (single app container, on-device data, no backend). Update with `/c4-model` when containers or external systems change.

**Rendering rule:** C4 is the modeling method; diagrams MUST be written as Mermaid `flowchart` (not Mermaid `C4Context` / `C4Container` / `C4Component`). The experimental C4 Mermaid dialect fails in common Markdown previewers with a Mermaid Syntax Error. See `ai-specs/skills/c4-model/SKILL.md`.

| Level         | File                                 | Status     | Last updated |
| ------------- | ------------------------------------ | ---------- | ------------ |
| 1 — Context   | [c4-context.md](./c4-context.md)     | Customized | 2026-10-31   |
| 2 — Container | [c4-container.md](./c4-container.md) | Customized | 2026-10-31   |
| 3 — Component | [c4-component.md](./c4-component.md) | Customized | 2026-10-31   |

Related standards: [base-standards §2.3–§2.4](../base-standards.md), [frontend (Expo Platform Rules)](../frontend-standards.md#expo-platform-rules). Backend, serverless, and data-model standards do not apply while the app has no backend.
