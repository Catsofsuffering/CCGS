## MODIFIED Requirements

### Requirement: Codex SHALL remain the primary orchestrator for the maintained workflow

The maintained workflow SHALL treat Codex as the control plane for change creation, spec progression, bounded execution dispatch, and acceptance.

#### Scenario: User starts the primary workflow from Codex-native entrypoints

- **WHEN** a user starts the maintained workflow through Codex-native installed skills
- **THEN** the maintained entry surface SHALL be the top-level `spec-*` skill set instead of a product-prefixed compatibility skill name

### Requirement: Default workflow preserves a single orchestration narrative

The system SHALL present the default product narrative as "Codex orchestrates, Claude executes" across workflow entry points, command guidance, and lifecycle descriptions. The system MUST avoid presenting Claude as the default host or control plane for the primary workflow.

#### Scenario: User reads Codex-native workflow guidance

- **WHEN** a user reads the installed Codex-native workflow skills
- **THEN** the skills describe the maintained primary path through `spec-init`, `spec-research`, `spec-plan`, `spec-impl`, and `spec-review`
