## ADDED Requirements

### Requirement: The system SHALL generate the execution DAG dynamically from live orchestration state
The control plane SHALL generate its execution DAG from current facts, intents, hints, worker results, and operator actions rather than from a static predefined graph.

#### Scenario: New fact changes the plan
- **WHEN** a worker or operator introduces a fact that changes execution options
- **THEN** the control plane SHALL regenerate or update the DAG to reflect the new state

#### Scenario: Branch is no longer viable
- **WHEN** a node or branch becomes blocked, invalid, or completed
- **THEN** the DAG SHALL update node state and downstream readiness accordingly

### Requirement: The control-plane UI SHALL expose the DAG as a first-class workspace
The monitor-derived frontend SHALL present the execution DAG as a dedicated interactive workspace.

#### Scenario: Operator opens the DAG workspace
- **WHEN** the user navigates to the DAG page
- **THEN** the UI SHALL render the current graph, node states, and node relationships for the selected project

#### Scenario: Operator inspects a node
- **WHEN** the user selects a node
- **THEN** the UI SHALL display node detail, execution status, worker assignment, and related logs or outputs

### Requirement: The control-plane UI SHALL support drag-and-drop DAG interaction
The DAG workspace SHALL allow operators to drag nodes and perform bounded intervention actions without silently corrupting orchestration semantics.

#### Scenario: Operator rearranges layout
- **WHEN** the user drags a node to a new visual position
- **THEN** the UI SHALL persist or remember the updated layout state separately from durable OpenSpec artifact state

#### Scenario: Operator changes execution preference
- **WHEN** the user performs an explicit scheduling or dependency adjustment action
- **THEN** the system SHALL record the intervention as an intentional orchestration change rather than treating all drag events as semantic edits

### Requirement: The DAG workspace SHALL reflect real-time execution progress
The DAG workspace SHALL update in response to runtime changes without requiring a full page reload.

#### Scenario: Worker state changes
- **WHEN** a worker node starts, completes, fails, or is reopened
- **THEN** the corresponding DAG node SHALL update its state in the UI through the live control-plane channel
