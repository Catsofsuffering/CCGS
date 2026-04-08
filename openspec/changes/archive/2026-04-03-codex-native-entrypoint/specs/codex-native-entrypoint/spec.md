## ADDED Requirements

### Requirement: The primary workflow has a Codex-native runtime entrypoint

The system SHALL install a Codex-native workflow surface for the primary path so users can begin the CCG workflow directly inside Codex without first opening Claude as the host runtime.

#### Scenario: Default install creates Codex workflow skills

- **WHEN** a user installs the workflow with the default Codex-led setup
- **THEN** the installation creates top-level Codex skills for the primary workflow
- **AND** those skills include at least `ccg-spec-init`, `ccg-spec-plan`, and `ccg-spec-impl`

#### Scenario: User starts the primary workflow from Codex

- **WHEN** a user opens Codex after installation
- **THEN** the primary CCG workflow can be started from installed Codex skills rather than requiring Claude slash commands as the first step

### Requirement: Codex-native skills keep Codex as the control plane

The installed Codex workflow skills SHALL describe Codex as the orchestrator and SHALL NOT redirect the user to manually continue the primary workflow by opening Claude and typing `/ccg:*` commands.

#### Scenario: User reads `ccg-spec-plan`

- **WHEN** a user opens the `ccg-spec-plan` skill
- **THEN** the instructions describe Codex-owned planning and handoff preparation
- **AND** the instructions do not tell the user to switch into Claude and run `/ccg:spec-plan`

#### Scenario: User reads `ccg-spec-impl`

- **WHEN** a user opens the `ccg-spec-impl` skill
- **THEN** the instructions describe Codex-owned dispatch, acceptance, rework, and archive decisions
- **AND** Claude is presented as the execution worker rather than the workflow host

### Requirement: Codex-native implementation flow dispatches Claude without surrendering ownership

The Codex-native implementation skill SHALL support invoking Claude for bounded execution work while keeping acceptance and retry decisions in Codex.

#### Scenario: Claude execution succeeds

- **WHEN** Codex dispatches implementation work from the Codex-native implementation skill and Claude returns a satisfactory result
- **THEN** the skill keeps final testing and archive approval in Codex

#### Scenario: Claude execution fails or returns insufficient output

- **WHEN** Claude execution fails or returns output that does not satisfy the handoff contract
- **THEN** the skill instructs Codex to keep the change open and produce a rework or retry path
