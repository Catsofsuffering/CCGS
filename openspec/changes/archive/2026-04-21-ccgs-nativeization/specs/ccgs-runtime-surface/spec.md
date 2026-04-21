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

### Requirement: Maintained runtime ownership follows the active host home

The system SHALL resolve maintained config, prompt, command, backup, and monitor assets from the active host home instead of assuming `~/.claude` for every maintained surface. Host-aware runtime resolution MUST support Codex-owned and Claude-owned installs while still honoring legacy migration logic.

#### Scenario: Codex-owned maintained install is created

- **WHEN** the maintained install path is driven by Codex ownership
- **THEN** the default `ccgs` runtime paths resolve under the Codex home boundary rather than silently using `~/.claude`

#### Scenario: Claude execution runtime is prepared

- **WHEN** Claude-owned execution helpers or monitor assets are installed
- **THEN** those runtime paths resolve under the Claude home boundary while keeping the same `ccgs` namespace and migration behavior

### Requirement: Host-owned runtime supports generalized workflow roles

The system SHALL support host-owned runtime configuration for a generalized Codex/Claude role model. Runtime ownership MUST follow the selected host role instead of assuming Codex always orchestrates or Claude always executes.

#### Scenario: Claude is chosen for orchestration

- **WHEN** Claude is configured as the orchestrator host
- **THEN** the maintained runtime/config surfaces needed for orchestration resolve through Claude-owned home paths without breaking the `ccgs` namespace

#### Scenario: Codex is chosen for execution

- **WHEN** Codex is configured as the execution host
- **THEN** the maintained runtime/config surfaces needed for execution resolve through Codex-owned home paths without falling back to Claude-owned defaults

### Requirement: Verification guards against identity regressions

The system SHALL include verification that distinguishes canonical `ccgs` surfaces from approved compatibility or historical `ccg` references. Maintained source changes MUST be verifiable against that boundary.

#### Scenario: Maintained source accidentally reintroduces canonical ccg naming

- **WHEN** a maintained source or template change adds a new default `ccg` surface outside approved compatibility/historical locations
- **THEN** verification fails or flags the regression

#### Scenario: Residual ccg references are audited after migration

- **WHEN** implementation completes the nativeization pass
- **THEN** remaining `ccg` references can be explained as compatibility or history rather than default runtime ownership
