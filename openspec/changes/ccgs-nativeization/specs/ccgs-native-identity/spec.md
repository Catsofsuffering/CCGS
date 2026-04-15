## ADDED Requirements

### Requirement: Maintained user-facing defaults use CCGS as the canonical identity

The system SHALL present `CCGS` as the canonical maintained project identity across current user-facing defaults. The system MUST NOT present `ccg` as the default project name, binary name, package name, namespace, or workflow label except where an explicit compatibility bridge is intentionally preserved.

#### Scenario: User reads current project guidance

- **WHEN** a user reads maintained installation, workflow, or command guidance
- **THEN** the guidance identifies `CCGS` as the canonical project

#### Scenario: User inspects current package and CLI metadata

- **WHEN** a user inspects maintained package metadata, CLI help, or executable naming
- **THEN** the default identity surfaced to the user is `ccgs` or `CCGS`, not `ccg`

### Requirement: Compatibility naming is explicit rather than implicit

The system SHALL label any retained `ccg` naming as compatibility or migration-only. Compatibility naming MUST NOT silently define the maintained default experience.

#### Scenario: Compatibility alias is retained

- **WHEN** the implementation keeps a `ccg` alias for install, command, or runtime compatibility
- **THEN** the alias is documented or surfaced as compatibility/deprecated rather than canonical

#### Scenario: Canonical and compatibility surfaces coexist

- **WHEN** both `ccgs` and `ccg` surfaces exist during migration
- **THEN** the `ccgs` surface is clearly the preferred path and the `ccg` surface is bounded as a bridge

### Requirement: Historical references stay historical

The system SHALL preserve historical references to `ccg` in archived or historical records when they accurately describe prior states. Historical references MUST NOT be used as justification for leaving `ccg` as the maintained default identity.

#### Scenario: User reads archived history

- **WHEN** a user opens archived OpenSpec artifacts or past release notes
- **THEN** factual `ccg` references may remain as historical record

#### Scenario: Maintained guidance is updated

- **WHEN** current maintained guidance is revised during this change
- **THEN** it does not continue to present deleted-upstream `ccg` identity as the active default
