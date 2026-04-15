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
