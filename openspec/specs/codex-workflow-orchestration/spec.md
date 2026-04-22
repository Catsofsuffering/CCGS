## Purpose

Define the durable maintained workflow contract where Codex owns orchestration, Claude executes bounded downstream work, and optional integrations stay additive to the primary path.
## Requirements
### Requirement: Codex SHALL remain the primary orchestrator for the maintained workflow

The maintained workflow SHALL treat Codex as the control plane for change creation, spec progression, bounded execution dispatch, and acceptance.

#### Scenario: User starts the primary workflow

- **WHEN** a user starts or advances the maintained workflow
- **THEN** the default path SHALL remain Codex-led rather than Claude-led

#### Scenario: Specification artifacts are advanced

- **WHEN** a change moves through proposal, design, specs, or tasks
- **THEN** Codex SHALL remain the actor responsible for driving the artifact lifecycle

#### Scenario: User starts the primary workflow from Codex-native entrypoints

- **WHEN** a user starts the maintained workflow through Codex-native installed skills
- **THEN** the maintained entry surface SHALL be the top-level `spec-*` skill set instead of a product-prefixed compatibility skill name

### Requirement: Claude execution SHALL be invoked as bounded downstream work

The maintained workflow SHALL let Codex dispatch Claude execution work as a bounded downstream step rather than as an independent control plane.

#### Scenario: Codex dispatches implementation or documentation work

- **WHEN** Codex reaches a step that requires Claude execution
- **THEN** the workflow SHALL provide Claude with bounded scope, expected deliverables, and a return path back to Codex

#### Scenario: Claude returns execution output

- **WHEN** Claude completes a dispatched step
- **THEN** the resulting status and outputs SHALL be available to Codex for review and next-step decisions

### Requirement: Codex SHALL control acceptance and archive decisions

The maintained workflow SHALL require Codex to perform final verification and decide whether a change is ready for archive.

#### Scenario: Acceptance passes

- **WHEN** Codex verifies that the change satisfies its requirements and checks
- **THEN** the workflow SHALL mark the change as eligible for archive review

#### Scenario: Acceptance fails

- **WHEN** Codex finds unmet criteria or failed verification
- **THEN** the workflow SHALL keep the change open for rework instead of archiving it

### Requirement: Optional integrations SHALL remain additive to the Codex-led path

Gemini, MCP, and skills SHALL remain optional integrations that extend the maintained workflow without redefining its Codex-led ownership model.

#### Scenario: User installs or runs the default path without optional integrations

- **WHEN** a user skips Gemini or leaves MCP and skills unused
- **THEN** the maintained Codex-led workflow SHALL remain available and functional

#### Scenario: User enables an optional integration

- **WHEN** a user enables MCP, skills, or another optional integration
- **THEN** the integration SHALL enhance the workflow without replacing Codex as the orchestrator

### Requirement: Codex is the primary workflow orchestrator
The system SHALL treat Codex as the primary control plane for the default development workflow. Codex MUST be responsible for initiating change creation, advancing specification artifacts, dispatching implementation work, collecting execution results, and determining whether the change is ready for acceptance.

#### Scenario: Starting a new change from the default workflow
- **WHEN** a user starts the default project workflow
- **THEN** the workflow begins in a Codex-led path rather than a Claude-led path

#### Scenario: Advancing a change through specification phases
- **WHEN** a change is moved from proposal to specs, design, or tasks
- **THEN** Codex remains the actor responsible for driving the artifact lifecycle

### Requirement: Codex controls acceptance and archive decisions
The system SHALL require Codex to run the final verification and acceptance decision for the default workflow. The system MUST NOT archive a change until Codex has evaluated the implementation outcome and determined that acceptance criteria have passed.

#### Scenario: Acceptance passes
- **WHEN** Codex verifies that implementation results satisfy the change requirements and validation checks
- **THEN** the workflow marks the change as eligible for archive

#### Scenario: Acceptance fails
- **WHEN** Codex detects unmet acceptance criteria or failing verification checks
- **THEN** the workflow keeps the change open and routes it back for rework instead of archiving it

### Requirement: Default workflow preserves a single orchestration narrative
The system SHALL present the default product narrative as "Codex orchestrates, Claude executes" across workflow entry points, command guidance, and lifecycle descriptions. The system MUST avoid presenting Claude as the default host or control plane for the primary workflow.

#### Scenario: User reads workflow guidance
- **WHEN** a user reads the default workflow description or command help
- **THEN** the guidance describes Codex as the orchestrator for the primary path

#### Scenario: User compares available workflow paths
- **WHEN** the product shows the main workflow alongside optional alternatives
- **THEN** the main path is identified as Codex-led and any Claude-led or multi-model variants are treated as secondary or compatibility paths

#### Scenario: User reads compatibility workflow guidance
- **WHEN** a user opens a compatibility or secondary command from the same installation
- **THEN** the guidance keeps Codex-led ownership intact and does not describe Gemini as an unconditional authority or required collaborator

#### Scenario: User reads Codex-native workflow guidance
- **WHEN** a user reads the installed Codex-native workflow skills
- **THEN** the skills describe the maintained primary path through `spec-init`, `spec-research`, `spec-plan`, `spec-impl`, and `spec-review`

### Requirement: Installer surfaces orchestration ownership
The installer SHALL prompt users to confirm who acts as the workflow orchestrator before selecting frontend/backend execution models. Codex MUST remain the recommended default, while Claude SHOULD remain selectable for compatibility. The prompt outcome MUST persist into configuration metadata and be summarized back to the user.

#### Scenario: User runs interactive init with defaults
- **WHEN** a user runs the interactive installer without overriding any options
- **THEN** the orchestrator prompt recommends Codex, shows Claude as the execution host, and saves that ownership metadata into the config file

#### Scenario: User intentionally selects Claude as orchestrator
- **WHEN** a user selects Claude as the orchestrator during the installer step
- **THEN** the resulting configuration records Claude as the orchestrator, Codex as the execution host, and the summary reflects the compatibility setup
