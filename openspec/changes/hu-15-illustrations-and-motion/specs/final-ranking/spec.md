# Spec Delta

## ADDED Requirements

### Requirement: Winner mascot pop

When the ranking opens, the crowned winking mascot in the header SHALL pop in once with a spring that settles within 450 ms, or fade in under Reduce Motion. It SHALL keep its art and its 48 pt size, never larger than the podium avatars, and SHALL not animate again while the screen stays open.

#### Scenario: Ranking opens

- **WHEN** a game ends and the ranking opens with Reduce Motion off
- **THEN** the crowned mascot pops in once and settles at 48 pt within 450 ms

#### Scenario: Ranking with Reduce Motion

- **WHEN** the ranking opens with Reduce Motion on
- **THEN** the crowned mascot fades in over 200 ms at 48 pt
