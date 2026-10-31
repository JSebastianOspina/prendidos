---
name: accessibility-audit
description: Run a WCAG 2.1 AA accessibility audit on frontend changes. Critical for UBITS EdTech products — learners with disabilities must be able to use all learning features. Use before merging any frontend change.
author: UBITS
version: 1.0.0
---

# accessibility-audit Skill

Use before merging any frontend change — UBITS EdTech products must be accessible to all learners. WCAG 2.1 AA is the minimum baseline.

## Instructions

Audit accessibility compliance for: $ARGUMENTS (defaults to changed React components in the current diff).

### Phase 1 — Keyboard Navigation

Check that all interactive elements are:

- Reachable via `Tab` key in a logical order
- Activatable via `Enter` or `Space`
- Part of the natural DOM focus order (no `tabindex > 0`)
- Visually distinguishable when focused (`:focus-visible` styles present)

For custom components (from `@flux-ui/core` or bespoke): verify they expose keyboard interaction as documented.

### Phase 2 — Screen Reader Compatibility

Check for:

- All images have descriptive `alt` text (or `alt=""` for decorative images)
- Form inputs have associated `<label>` elements or `aria-label` / `aria-labelledby`
- Interactive elements have accessible names (`aria-label` if not visually labelled)
- Dynamic content updates announce themselves (`aria-live` regions where appropriate)
- Modal dialogs trap focus and return focus on close
- Progress indicators and loading states are announced to screen readers

### Phase 3 — Color and Contrast

Check:

- Text contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text (18pt+ or 14pt bold+)
- Interactive element boundaries are not conveyed by color alone
- Error states are not indicated by red color alone (must include icon or text)
- `@flux-ui/core` components used correctly — do not override their contrast-safe color tokens

### Phase 4 — Forms and Error Handling

- All form fields have visible labels (not just placeholder text)
- Validation error messages are associated with their field via `aria-describedby`
- Required fields are marked with `aria-required="true"` and a visual indicator
- Error messages are meaningful and guide the user to fix the issue

### Phase 5 — EdTech-Specific Checks

For learning content:

- Video content has captions or transcripts
- Audio-only content has transcripts
- Time-limited interactions (quizzes, assessments) have accessible time extension mechanisms
- Progress indicators (course completion, quiz score) are accessible to screen readers

### Output Format

```
## Accessibility Audit Report

### Keyboard Navigation — [PASS / ISSUES]
[Findings or "All interactive elements are keyboard accessible"]

### Screen Reader — [PASS / ISSUES]
[Findings or "No screen reader issues found"]

### Color and Contrast — [PASS / ISSUES]
[Findings with specific elements and contrast ratios]

### Forms — [PASS / ISSUES / N/A]
[Findings or "No form changes in this diff"]

### EdTech Content — [PASS / ISSUES / N/A]
[Findings or "No learning content in this diff"]

### Verdict
[PASS — WCAG 2.1 AA compliant] OR [REQUIRES CHANGES: list issues by severity]
```

## Notes

- WCAG 2.1 AA is the minimum. AAA criteria are aspirational but not required.
- `@flux-ui/core` components are pre-audited for accessibility — do not override their ARIA roles or keyboard behavior.
- When in doubt about contrast ratios, use the WebAIM Contrast Checker as reference.
