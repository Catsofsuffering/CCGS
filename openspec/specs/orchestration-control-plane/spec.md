## Purpose

Define the durable orchestration control-plane contract that uses OpenSpec as the backbone, maintains a blackboard model, and dispatches work through explicit reconciliation phases.
## Requirements
### Requirement: OpenSpec SHALL remain the durable orchestration backbone

The orchestration control plane SHALL use OpenSpec-managed project and change state as the durable management layer for long-lived workflow identity and lifecycle.

#### Scenario: Control-plane project is loaded

- **WHEN** the control plane loads a tracked project or change
- **THEN** it SHALL derive durable identity and lifecycle state from OpenSpec rather than creating a second durable project-management system

#### Scenario: Runtime state is reconstructed

- **WHEN** the control plane restarts or reloads
- **THEN** it SHALL be able to reconstruct runtime orchestration state from OpenSpec state plus runtime history where available

### Requirement: The control plane SHALL maintain a blackboard state model

The orchestration control plane SHALL maintain a blackboard model containing at least projects, facts, intents, hints, settings, graph state, and execution runs.

#### Scenario: New worker output is received

- **WHEN** a worker reports findings or completion data
- **THEN** the control plane SHALL reconcile those results into the blackboard model

#### Scenario: Operator adds guidance

- **WHEN** an operator adds a hint or intervention
- **THEN** the control plane SHALL record that guidance in the blackboard and use it during later reconciliation

### Requirement: The dispatcher SHALL run through explicit phases

The control plane SHALL schedule work through explicit dispatcher phases rather than ad hoc worker invocation.

#### Scenario: Project execution begins

- **WHEN** a project is initialized for execution
- **THEN** the dispatcher SHALL perform bootstrap before scheduling worker activity

#### Scenario: Work is in progress

- **WHEN** worker outputs or operator interventions change current state
- **THEN** the dispatcher SHALL reconcile state and reevaluate the execution graph before dispatching the next work item

### Requirement: Replay and reopen SHALL remain first-class orchestration actions

The control plane SHALL support replaying prior nodes and reopening blocked or completed branches when runtime or operator conditions require it.

#### Scenario: Operator reopens a branch

- **WHEN** an operator requests reopen on a node or branch
- **THEN** the dispatcher SHALL mark that branch eligible for re-evaluation and surface the state change in the control-plane UI

#### Scenario: Worker result needs replay

- **WHEN** a replay action is requested for a prior execution node
- **THEN** the control plane SHALL requeue the corresponding execution run without mutating unrelated project state

### Requirement: The system SHALL treat OpenSpec as the durable orchestration management backbone
The orchestration control plane SHALL use OpenSpec-managed project and change state as the durable management layer for long-lived workflow identity and lifecycle.

#### Scenario: Control-plane project is loaded
- **WHEN** the control plane loads a tracked project or change
- **THEN** it SHALL derive the durable project identity and lifecycle status from OpenSpec state
- **AND** it SHALL avoid creating a second durable project-management source of truth outside OpenSpec

#### Scenario: Runtime state is reconstructed
- **WHEN** the control plane restarts or reloads
- **THEN** it SHALL be able to reconstruct runtime orchestration state from OpenSpec state plus runtime event history where available

### Requirement: The system SHALL maintain a blackboard state model for orchestration
The orchestration control plane SHALL maintain a blackboard model containing at least projects, facts, intents, hints, settings, graph state, and execution runs.

#### Scenario: New worker output is received
- **WHEN** a worker reports new findings or completion data
- **THEN** the control plane SHALL reconcile those results into facts, intents, graph state, or run state as appropriate

#### Scenario: Operator adds guidance
- **WHEN** an operator adds a hint or intervention
- **THEN** the control plane SHALL record that guidance in the blackboard model and use it during the next reconciliation cycle

### Requirement: The dispatcher SHALL drive execution through explicit phases
The control plane SHALL schedule work through explicit dispatcher phases instead of ad hoc worker invocation.

#### Scenario: Project execution begins
- **WHEN** a project is initialized for execution
- **THEN** the dispatcher SHALL perform bootstrap before scheduling worker activity

#### Scenario: Work is in progress
- **WHEN** worker outputs or operator interventions change current state
- **THEN** the dispatcher SHALL reconcile state and reevaluate the DAG before dispatching the next work item

### Requirement: The system SHALL support replay and reopen flows
The control plane SHALL support replaying prior nodes and reopening blocked or completed branches when operator or runtime conditions require it.

#### Scenario: Operator reopens a branch
- **WHEN** an operator requests reopen on a node or branch
- **THEN** the dispatcher SHALL mark the branch eligible for re-evaluation
- **AND** the resulting state change SHALL be visible in the control-plane UI

#### Scenario: Worker result needs replay
- **WHEN** a replay action is requested for a prior execution node
- **THEN** the control plane SHALL create or requeue the corresponding execution run without mutating unrelated project state

