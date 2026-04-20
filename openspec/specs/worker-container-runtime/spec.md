## Purpose

Define the shared worker container contract that lets Codex, Claude Code, and future workers participate in orchestration through one runtime interface.
## Requirements
### Requirement: Claude Code and Codex SHALL be modeled through one worker contract

The orchestration control plane SHALL treat `Claude Code` and `Codex` as lightweight Agent Workers that implement one shared runtime contract.

#### Scenario: Dispatcher routes work

- **WHEN** the dispatcher selects a worker for an eligible node
- **THEN** it SHALL route the node through the shared worker container contract instead of worker-specific orchestration logic

#### Scenario: Future worker is introduced

- **WHEN** a new lightweight worker type is added later
- **THEN** it SHALL be able to integrate by implementing the same contract

### Requirement: The worker contract SHALL define lifecycle and health semantics

Each worker adapter SHALL expose readiness, heartbeat, running, completion, and failure semantics to the dispatcher.

#### Scenario: Worker starts execution

- **WHEN** a worker accepts a node
- **THEN** the control plane SHALL be able to observe that the worker has entered a running state

#### Scenario: Worker becomes unhealthy

- **WHEN** heartbeats stop or the process becomes unavailable
- **THEN** the control plane SHALL mark the worker or run as unhealthy and surface that state to the operator

### Requirement: The MVP runtime SHALL support CLI-backed adapters

The first maintained worker runtime SHALL support CLI-backed adapters as the minimum execution baseline.

#### Scenario: Claude worker is launched

- **WHEN** the dispatcher starts a Claude-backed run
- **THEN** the system SHALL execute it through a CLI-backed adapter using the shared contract

#### Scenario: Codex worker is launched

- **WHEN** the dispatcher starts a Codex-backed run
- **THEN** the system SHALL use the same contract shape even if the adapter implementation differs

### Requirement: SDK-backed adapters SHALL remain optional

The worker contract SHALL allow future SDK-backed adapters without making SDK integration mandatory for the maintained baseline.

#### Scenario: SDK adapter is added later

- **WHEN** an SDK-backed worker adapter is introduced in a future phase
- **THEN** it SHALL fit behind the same dispatcher-facing contract used by CLI-backed workers
- **AND** existing CLI-backed worker flows SHALL remain valid

### Requirement: The system SHALL treat Claude Code and Codex as Agent Workers under one worker container contract
The orchestration control plane SHALL model `Claude Code` and `Codex` as lightweight Agent Workers that implement one shared runtime contract.

#### Scenario: Dispatcher routes work
- **WHEN** the dispatcher selects a worker for an eligible node
- **THEN** it SHALL route the node through the shared worker container contract rather than through worker-specific orchestration logic

#### Scenario: Future worker is introduced
- **WHEN** a new lightweight worker type is added later
- **THEN** it SHALL be able to integrate by implementing the same contract

### Requirement: The worker container contract SHALL define lifecycle and health semantics
Each worker adapter SHALL expose lifecycle, readiness, heartbeat, completion, and failure semantics to the dispatcher.

#### Scenario: Worker starts execution
- **WHEN** a worker accepts a node
- **THEN** the control plane SHALL be able to observe that the worker has entered a running state

#### Scenario: Worker becomes unhealthy
- **WHEN** heartbeats stop or the process becomes unavailable
- **THEN** the control plane SHALL mark the worker or run as unhealthy and surface that state to the operator

### Requirement: The MVP worker runtime SHALL support CLI-backed adapters
The first implementation of Worker Container SHALL support CLI-backed worker adapters as the minimum execution baseline.

#### Scenario: Claude worker is launched
- **WHEN** the dispatcher starts a Claude-backed run
- **THEN** the system SHALL be able to execute it through a CLI-backed adapter using the shared contract

#### Scenario: Codex worker is launched
- **WHEN** the dispatcher starts a Codex-backed run
- **THEN** the system SHALL use the same contract shape even if the adapter implementation differs

### Requirement: SDK-backed worker adapters SHALL remain optional and compatible
The worker contract SHALL allow future SDK-backed adapters without making SDK integration mandatory for MVP execution.

#### Scenario: SDK adapter is added later
- **WHEN** an SDK-backed worker adapter is introduced in a future phase
- **THEN** it SHALL fit behind the same dispatcher-facing contract used by CLI-backed workers
- **AND** existing CLI-backed worker flows SHALL remain valid

