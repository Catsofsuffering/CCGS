## Purpose

Define the minimal host-facing discovery surfaces that preserve Codex and Claude native invocation while keeping `~/.ccsm` as the canonical maintained home.

## Requirements

### Requirement: Host discovery surfaces are minimal and compatibility-focused

The system SHALL preserve only the minimum `.codex` and `.claude` surfaces required for native host discovery and invocation. Host-facing files MUST NOT remain the canonical maintained source of truth when the same asset belongs to the maintained runtime.

#### Scenario: Codex host discovers maintained workflow entrypoints

- **WHEN** Codex needs to discover maintained workflow skills or commands
- **THEN** the required host-facing entrypoints exist under `.codex` without redefining `.codex` as the canonical maintained home

#### Scenario: Claude host discovers maintained workflow entrypoints

- **WHEN** Claude needs to discover maintained workflow skills or commands
- **THEN** the required host-facing entrypoints exist under `.claude` without redefining `.claude` as the canonical maintained home

### Requirement: Host-facing assets resolve to canonical ccsm-owned content

The system SHALL make host-facing discovery surfaces resolve to canonical `~/.ccsm` content whenever the host does not require a separate canonical copy. The implementation SHOULD prefer thin wrappers, pointers, or generated mirrors over broad duplicated stores.

#### Scenario: Host-facing skill entrypoint is installed

- **WHEN** a maintained skill is installed for host-native discovery
- **THEN** the host-facing entrypoint resolves to canonical `~/.ccsm` content or an equivalent minimal bridge

#### Scenario: Host-facing prompt or rule surface is retained

- **WHEN** a prompt or rule file remains under a host home for discovery reasons
- **THEN** it is bounded as a host-compatibility surface rather than the primary maintained store

### Requirement: Skill parity differences are explainable

The system SHALL make Codex and Claude skill inventory differences auditable and explainable. Residual differences MUST be classified as required parity, intentional host-only behavior, or compatibility-only carryover.

#### Scenario: Same maintained skill should exist for both hosts

- **WHEN** a maintained skill surface is intended for both Codex and Claude
- **THEN** installation and verification show parity across both host-facing surfaces

#### Scenario: Skill exists on only one host

- **WHEN** a skill remains available on only one host-facing surface
- **THEN** the implementation documents whether it is host-specific or compatibility-only
