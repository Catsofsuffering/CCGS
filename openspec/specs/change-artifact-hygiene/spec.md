# change-artifact-hygiene Specification

## Purpose
Define how active and archive-pending OpenSpec changes stay reviewable, capability-linked, and bounded for Codex-led planning, execution, and acceptance.
## Requirements
### Requirement: Active changes SHALL declare capability coverage clearly

Each active change SHALL make it clear which capabilities it introduces, extends, or reorganizes so the relationship between proposal, specs, and future archive work is reviewable.

#### Scenario: User reads a proposal for an active change

- **WHEN** the user inspects the change proposal
- **THEN** the proposal SHALL list the relevant capability names clearly
- **AND** the capability naming SHALL align with the current main-spec catalog or the change-local spec directories it creates

#### Scenario: Change-local specs are reviewed

- **WHEN** a change contains one or more spec deltas
- **THEN** those deltas SHALL be easy to map back to the capability coverage declared by the proposal

### Requirement: Active changes SHALL expose bounded execution and validation intent

Each active change SHALL provide enough design and task structure for Codex to dispatch bounded execution work and review the result without redefining the change on the fly.

#### Scenario: Codex prepares an execution packet

- **WHEN** Codex reads the change design and tasks
- **THEN** the artifacts SHALL describe the allowed surface, protected surface, and required verification clearly enough to support bounded execution

#### Scenario: A maintainer reviews task readiness

- **WHEN** the maintainer inspects the task artifact for an active change
- **THEN** the task list SHALL be grouped, concrete, and trackable through checkbox progress rather than vague implementation notes

### Requirement: Completed changes pending archive SHALL remain distinguishable from active drafting work

Changes that are effectively complete but not yet archived SHALL remain organized well enough that Codex can evaluate them for sync or archive without re-auditing the entire repository from scratch.

#### Scenario: User reviews a completed change that is still active in `openspec/changes/`

- **WHEN** the change tasks are complete but the change is still present under `openspec/changes/`
- **THEN** its capability coverage and artifact status SHALL remain understandable enough to support a later Codex archive decision

### Requirement: Active changes SHALL follow a reviewable artifact structure

Active changes SHALL keep proposal, design, specs, and tasks organized so capability linkage, execution boundaries, and validation intent remain easy to audit.

#### Scenario: Proposal documents source material and capability targets

- **WHEN** a change reorganizes or promotes existing capability coverage
- **THEN** its proposal SHALL name the relevant source changes or source capabilities
- **AND** it SHALL make the intended capability boundaries easy to identify

#### Scenario: Design and tasks are used for bounded execution

- **WHEN** Codex prepares a bounded execution packet from the change design and task artifacts
- **THEN** those artifacts SHALL restate the allowed surface, protected surface, and required verification clearly enough to support dispatch without redefining the change
