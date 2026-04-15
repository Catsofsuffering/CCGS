## ADDED Requirements

### Requirement: Default runtime layout is ccgs-owned

The system SHALL use `ccgs`-owned runtime and installation paths as the maintained default. Default generated config, worktree, skill, rule, and helper paths MUST NOT continue to use `.ccg` or `skills/ccg` as the primary ownership boundary.

#### Scenario: User performs a default install

- **WHEN** a user performs the maintained default installation
- **THEN** generated runtime and install paths are `ccgs`-owned by default

#### Scenario: Generated execution instructions reference local assets

- **WHEN** the workflow prints or installs runtime path references for prompts, skills, rules, or worktrees
- **THEN** those references point to `ccgs`-owned paths by default

### Requirement: Existing installs have a migration path

The system SHALL define how existing `ccg`-named runtime directories or generated assets are migrated, reused, or deprecated during nativeization. The migration path MUST avoid silently breaking current users.

#### Scenario: Existing install still uses ccg-owned runtime paths

- **WHEN** the installer or updater encounters an existing `ccg`-named install
- **THEN** it either migrates the install or preserves compatibility behavior with explicit user-facing logic

#### Scenario: Legacy command assets remain during transition

- **WHEN** old generated assets still exist during migration
- **THEN** the system distinguishes them from the new `ccgs`-owned defaults and avoids treating them as canonical

### Requirement: Verification guards against identity regressions

The system SHALL include verification that distinguishes canonical `ccgs` surfaces from approved compatibility or historical `ccg` references. Maintained source changes MUST be verifiable against that boundary.

#### Scenario: Maintained source accidentally reintroduces canonical ccg naming

- **WHEN** a maintained source or template change adds a new default `ccg` surface outside approved compatibility/historical locations
- **THEN** verification fails or flags the regression

#### Scenario: Residual ccg references are audited after migration

- **WHEN** implementation completes the nativeization pass
- **THEN** remaining `ccg` references can be explained as compatibility or history rather than default runtime ownership
