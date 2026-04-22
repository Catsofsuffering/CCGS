## Purpose

Define `CCSM` as the canonical maintained project identity and bound `ccg` and `ccgs` naming to compatibility, migration, or history-only use.

## Requirements

### Requirement: Maintained defaults use CCSM as the canonical identity

The system SHALL present `CCSM` as the canonical maintained project identity across current user-facing defaults. Maintained defaults MUST NOT present `ccg` or `ccgs` as the canonical package name, binary name, namespace, workflow label, or install surface.

#### Scenario: User reads maintained guidance

- **WHEN** a user reads current installation, workflow, or command guidance
- **THEN** the guidance identifies `CCSM` as the maintained default identity

#### Scenario: User inspects package or CLI metadata

- **WHEN** a user inspects maintained package metadata, help output, or executable naming
- **THEN** the default identity surfaced is `ccsm` or `CCSM`

### Requirement: Transitional names are explicit compatibility aliases

The system SHALL treat `ccg` and `ccgs` naming as compatibility or migration-only when they are retained. Transitional names MUST NOT silently define the maintained default experience.

#### Scenario: Transitional alias remains available

- **WHEN** a `ccg` or `ccgs` package, binary, command, or skill alias is retained
- **THEN** that alias is explicitly bounded as compatibility or migration-only

#### Scenario: Canonical and alias surfaces coexist

- **WHEN** `ccsm` surfaces coexist with retained `ccg` or `ccgs` aliases during migration
- **THEN** `ccsm` is clearly the preferred maintained path

### Requirement: Historical references remain historical

The system SHALL preserve factual `ccg` or `ccgs` references in archived or historical records when they accurately describe prior states. Historical references MUST NOT be used to justify keeping those names as maintained defaults.

#### Scenario: User reads archived history

- **WHEN** a user opens archived OpenSpec changes or past release notes
- **THEN** factual `ccg` or `ccgs` references may remain as historical record

#### Scenario: Maintained guidance is updated

- **WHEN** current maintained guidance is revised during this change
- **THEN** it does not continue to present `ccg` or `ccgs` as the active default identity
