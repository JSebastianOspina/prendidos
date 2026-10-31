# Third-Party Skills

Skills in this folder that were not written for Harness. They are vendored (copied and pinned) instead of installed as plugins so they follow the same `ai-specs/skills` → `.claude/skills` / `.cursor/skills` symlink model as the rest of the Harness skills (see `docs/base-standards.md` §7).

Each vendored skill folder keeps the upstream `LICENSE` file. To update one, re-download the upstream repository, review the diff (especially any scripts), copy it over, reapply the local changes listed below, and run `bash scripts/sync-skills.sh`.

## ui-ux-pro-max

| Field         | Value                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- |
| Source        | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (`.claude/skills/ui-ux-pro-max/`)   |
| Version       | 2.15.0, commit `9a3f14f7423037ccb8feeb4fee7482291b9c820e`                                   |
| License       | MIT                                                                                         |
| Vendored on   | 2026-10-31                                                                                  |
| Purpose       | Design system generation (style, palette, typography) and UI/UX guideline search, with a `react-native` stack |
| Scripts       | Python 3 standard library only; reviewed: no network access, no subprocesses               |
| Local changes | Script path in `SKILL.md` changed from `${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/` to `ai-specs/skills/ui-ux-pro-max/`; upstream `scripts/tests/` not vendored; trailing whitespace stripped from `scripts/design_system.py` by the pre-commit hook |
| Repo config   | `data/` holds catalogs over 500 KB (`google-fonts.csv` is read at runtime), so it is excluded from `check-added-large-files` in `.pre-commit-config.yaml` |

The other skills in that upstream plugin (`design`, `banner-design`, `ui-styling`, `brand`, `slides`, `design-system`) were not vendored.

## designer-skills: interaction-design and visual-critique

| Field         | Value                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- |
| Source        | https://github.com/Owl-Listener/designer-skills (`interaction-design/skills/`, `visual-critique/skills/`) |
| Version       | interaction-design 1.0.0, visual-critique 1.0.0, commit `9a6930cf84a822eb458624bd11c61aac5bbdf224` |
| License       | MIT                                                                                         |
| Vendored on   | 2026-10-31                                                                                  |
| Purpose       | UX flows and interaction design before implementation; visual critique of rendered screens |
| Scripts       | None (Markdown only)                                                                        |
| Local changes | None. Plugin slash commands (`/map-states`, `/critique-screen`, etc.) were not vendored     |

Vendored skills:

- **interaction-design:** `animation-principles`, `conversational-ux`, `doherty-threshold`, `error-handling-ux`, `feedback-patterns`, `fitts-law`, `form-design`, `gesture-patterns`, `hicks-law`, `interfaces-that-feel`, `jakobs-law`, `loading-states`, `micro-interaction-spec`, `millers-law`, `navigation-patterns`, `onboarding-design`, `peak-end-rule`, `search-ux`, `serial-position-effect`, `state-machine`, `teslers-law`, `zeigarnik-effect`
- **visual-critique:** `critique-affordance`, `critique-brand-consistency`, `critique-color`, `critique-composition`, `critique-information-density`, `critique-typography`, `critique-visual-hierarchy`

Some of these skills point to skills from other designer-skills plugins (for example `platform-conventions` or `color-system` in `ui-design`) that are not vendored here.
