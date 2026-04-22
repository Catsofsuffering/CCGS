## MODIFIED Requirements

### Requirement: The maintained default command and skill namespace SHALL be CCGS-owned

The system SHALL expose the maintained slash-command surface under the canonical product namespace while allowing the Codex-native primary skill surface to use direct top-level OpenSpec driver names.

#### Scenario: Codex-native workflow skills are installed

- **WHEN** the installer places Codex-native skills for the primary workflow
- **THEN** those skills SHALL be installed as `spec-init`, `spec-research`, `spec-plan`, `spec-impl`, and `spec-review`

#### Scenario: Deprecated prefixed Codex skills are encountered

- **WHEN** the installer or migration logic finds `ccsm-spec-*`, `ccgs-spec-*`, or `ccg-spec-*` workflow skills
- **THEN** those names SHALL be treated as deprecated migration inputs rather than maintained outputs
