## Purpose

Define the maintained command, skill, template, and prompt surface so `CCGS` remains the canonical namespace while compatibility aliases stay bounded.

## Requirements

### Requirement: The maintained default command and skill namespace SHALL be CCGS-owned

The system SHALL expose the maintained slash-command surface under the canonical product namespace while allowing the Codex-native primary skill surface to use direct top-level OpenSpec driver names.

#### Scenario: Maintained command assets are generated

- **WHEN** the installer or template system generates current command assets
- **THEN** the default namespace and output names SHALL be `ccgs`-owned

#### Scenario: Codex-native workflow skills are installed

- **WHEN** the installer places Codex-native skills for the primary workflow
- **THEN** those skills SHALL be installed as `spec-init`, `spec-research`, `spec-plan`, `spec-impl`, and `spec-review`

#### Scenario: Deprecated prefixed Codex skills are encountered

- **WHEN** the installer or migration logic finds `ccsm-spec-*`, `ccgs-spec-*`, or `ccg-spec-*` workflow skills
- **THEN** those names SHALL be treated as deprecated migration inputs rather than maintained outputs

### Requirement: Compatibility aliases SHALL remain bounded and explicit

The system SHALL support `ccg` command or skill aliases only as bounded compatibility bridges.

#### Scenario: Compatibility alias is still installed

- **WHEN** a `ccg` command, skill, or rule alias remains available
- **THEN** it SHALL be explicitly treated as compatibility instead of as the primary workflow narrative

#### Scenario: Primary workflow guidance is shown

- **WHEN** a user is guided toward the maintained workflow
- **THEN** the guidance SHALL point to the `ccgs`-owned surface rather than the compatibility alias

### Requirement: Workflow templates SHALL match the maintained project story

Maintained workflow templates, prompt headers, and generated instructions SHALL reflect the current `CCGS` product story rather than deleted-upstream framing.

#### Scenario: User opens a maintained workflow template

- **WHEN** a maintained command or prompt template is read
- **THEN** it SHALL reflect the `CCGS`-native workflow identity instead of presenting deleted-upstream framing as current product reality

#### Scenario: Generated workflow guidance references commands

- **WHEN** generated guidance tells the user which workflow commands or skills to use
- **THEN** the maintained default SHALL reference `ccgs`-native surfaces

### Requirement: Workflow guidance SHALL support generalized Codex and Claude host roles

The maintained workflow surface SHALL describe Codex and Claude as generalized hosts rather than encoding one fixed orchestrator or executor pairing into templates and prompts.

#### Scenario: Maintainer reads workflow role guidance

- **WHEN** a maintainer reads maintained workflow templates or prompt assets
- **THEN** the guidance SHALL allow Codex and Claude to be chosen for orchestration or execution according to configured host role

#### Scenario: Generated setup guidance references host roles

- **WHEN** generated setup or execution guidance describes host responsibilities
- **THEN** it SHALL not present Codex-only orchestration or Claude-only execution as an unchangeable rule

### Requirement: Bundled prompt assets SHALL match the maintained workflow roles

The maintained package SHALL bundle prompt and role assets only for the maintained default workflow roles.

#### Scenario: Packaged prompt assets are inspected

- **WHEN** a maintainer inspects the prompt assets shipped in the maintained package
- **THEN** the bundled default prompt surface SHALL match the maintained Codex and Claude path rather than a stale Codex and Gemini split

#### Scenario: Optional secondary perspectives are described

- **WHEN** maintained templates or prompts mention optional secondary analysis or review perspectives
- **THEN** they SHALL not depend on Gemini-specific prompt assets being part of the default packaged surface
