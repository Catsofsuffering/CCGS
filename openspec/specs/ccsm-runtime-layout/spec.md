## Purpose

Define `~/.ccsm` as the canonical maintained runtime home and specify migration and verification rules around that ownership boundary.

## Requirements

### Requirement: Canonical maintained runtime lives under ~/.ccsm

The system SHALL use `~/.ccsm` as the canonical maintained home for config, prompts, monitor assets, backups, generated workflow files, and canonical skill content. Maintained defaults MUST NOT keep `.codex` or `.claude` as the primary ownership boundary for those assets.

#### Scenario: User performs a default maintained install

- **WHEN** a user performs the maintained default installation
- **THEN** the canonical maintained runtime assets are created under `~/.ccsm`

#### Scenario: Generated workflow output references maintained assets

- **WHEN** generated instructions or workflow output reference maintained config, prompts, monitor assets, or skill content
- **THEN** those references point to `~/.ccsm` as the canonical home

### Requirement: The canonical ccsm home is directly usable

The system SHALL make `~/.ccsm` directly usable rather than treating it as passive backend storage. A maintainer MUST be able to inspect, operate, and recover canonical maintained assets from that home.

#### Scenario: Maintainer inspects canonical runtime state

- **WHEN** a maintainer opens the maintained runtime home directly
- **THEN** canonical config, prompts, monitor assets, and generated workflow state are available under `~/.ccsm`

#### Scenario: Host-specific bridges are unavailable

- **WHEN** a maintainer needs to reason about maintained runtime state without relying on host-specific bridge files
- **THEN** `~/.ccsm` still contains the canonical maintained assets needed for inspection and recovery

### Requirement: Migration handles both legacy and transitional sources

The system SHALL define migration from both legacy `ccg`-owned layouts and transitional `ccgs`-owned layouts into `~/.ccsm`. Migration behavior MUST avoid silently dropping maintained assets that users still rely on.

#### Scenario: Existing install uses ccg-owned runtime paths

- **WHEN** the installer or updater encounters an existing `ccg`-named maintained install
- **THEN** it migrates or preserves compatibility with explicit logic toward `~/.ccsm`

#### Scenario: Existing install uses transitional ccgs-owned runtime paths

- **WHEN** the installer or updater encounters an existing `ccgs`-named maintained install
- **THEN** it migrates or preserves compatibility with explicit logic toward `~/.ccsm`

### Requirement: Verification guards the canonical-home boundary

The system SHALL include verification that distinguishes canonical `~/.ccsm` ownership from host-compatibility bridge surfaces and from approved historical or compatibility aliases.

#### Scenario: Maintained source reintroduces host-home primary storage

- **WHEN** a maintained source change causes `.codex` or `.claude` to become the default primary home for canonical maintained runtime assets
- **THEN** verification fails or flags the regression

#### Scenario: Residual host-facing paths remain after migration

- **WHEN** host-facing `.codex` or `.claude` paths remain in maintained defaults after implementation
- **THEN** they can be explained as required discovery bridges rather than canonical runtime ownership
