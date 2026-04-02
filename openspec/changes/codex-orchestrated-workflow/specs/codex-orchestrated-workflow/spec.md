## ADDED Requirements

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
