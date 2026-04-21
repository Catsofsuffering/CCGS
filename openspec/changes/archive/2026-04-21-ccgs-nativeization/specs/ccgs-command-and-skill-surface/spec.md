## ADDED Requirements

### Requirement: Default command and skill namespace is ccgs-owned

The system SHALL expose `ccgs`-owned command, skill, rule, and template namespaces as the maintained default surface. Generated command and skill assets MUST NOT default to `ccg`-owned names or directories.

#### Scenario: Maintained command assets are generated

- **WHEN** the installer or template system generates current command assets
- **THEN** the default namespace and output names are `ccgs`-owned

#### Scenario: Codex-native workflow skills are installed

- **WHEN** the installer places Codex-native skills for the primary workflow
- **THEN** those skills use `ccgs`-native names and paths by default

### Requirement: Compatibility aliases are bounded and optional

The system SHALL support `ccg` command or skill aliases only as bounded compatibility bridges when necessary. The implementation SHOULD make it possible to reason about which alias surfaces remain and why.

#### Scenario: Compatibility alias is still installed

- **WHEN** a `ccg` command, skill, or rule alias remains available
- **THEN** it is explicitly treated as compatibility and does not redefine the primary workflow narrative

#### Scenario: Primary workflow documentation is shown

- **WHEN** a user is guided toward the maintained workflow
- **THEN** the guidance points to the `ccgs`-owned surface rather than the compatibility alias

### Requirement: Workflow templates remove deleted-upstream framing

The system SHALL remove deleted-upstream `ccg` framing from maintained workflow templates, prompt headers, and generated instructions. Maintained templates MUST align with the current `CCGS` product story.

#### Scenario: User opens a maintained workflow template

- **WHEN** a maintained command or prompt template is read
- **THEN** it reflects the `CCGS`-native workflow identity instead of presenting the deleted upstream as the active product

#### Scenario: Generated workflow guidance references commands

- **WHEN** generated guidance instructs the user which workflow commands or skills to use
- **THEN** the maintained default references `ccgs`-native surfaces

### Requirement: Maintained workflow guidance reflects generalized Codex/Claude host roles

The system SHALL describe Codex and Claude as generalized maintained workflow hosts rather than encoding one permanent orchestrator/executor pairing into templates, prompts, or generated guidance.

#### Scenario: Maintainer reads workflow role guidance

- **WHEN** a maintainer reads maintained workflow templates or prompt assets
- **THEN** the guidance allows Codex and Claude to be chosen for orchestration or execution according to the configured host role

#### Scenario: Generated setup guidance references host roles

- **WHEN** generated setup or execution guidance describes host responsibilities
- **THEN** it does not present Codex-only orchestration or Claude-only execution as an unchangeable maintained rule

### Requirement: Bundled prompt assets match the maintained workflow roles

The system SHALL bundle prompt and role assets only for the maintained default workflow roles. The packaged default surface MUST NOT continue shipping Gemini-specific prompt assets because Gemini is no longer part of the maintained workflow path.

#### Scenario: Packaged prompt assets are inspected

- **WHEN** a maintainer inspects the prompt assets shipped in the maintained package
- **THEN** the bundled default prompt surface matches the maintained Codex/Claude path rather than a stale Codex/Gemini split

#### Scenario: Maintained workflow guidance references secondary perspectives

- **WHEN** maintained templates or prompts describe optional secondary analysis or review perspectives
- **THEN** they do not depend on bundled Gemini-specific prompt assets being part of the default package surface
