# claude-execution-dispatch Specification

## Purpose
Define the maintained contract for Codex-dispatched Claude execution, including bounded handoff, result return, and Codex-controlled retry or rejection.
## Requirements
### Requirement: Codex can dispatch Claude as an execution worker
The system SHALL support a Codex-led workflow step that invokes Claude for execution-oriented work. Claude MUST be treated as a downstream executor that receives bounded context and returns execution results to Codex for follow-up handling.

#### Scenario: Codex dispatches implementation work
- **WHEN** the Codex-led workflow reaches an implementation phase that requires Claude execution
- **THEN** the system provides a dispatch path that sends the relevant task and context to Claude

#### Scenario: Claude returns results to Codex
- **WHEN** Claude completes a dispatched execution step
- **THEN** the resulting status and outputs are made available to Codex for review and next-step decisions

### Requirement: Claude Agent Teams are exposed as a Codex-invoked execution capability
The system SHALL allow Codex-led workflows to invoke Claude Agent Teams for implementation work. The dispatch contract MUST preserve task boundaries, expected deliverables, and the return path needed for Codex-led verification.

#### Scenario: Codex requests Agent Teams execution
- **WHEN** a workflow step requires parallel implementation through Claude Agent Teams
- **THEN** the system provides a Claude execution path that is explicitly framed as work dispatched by Codex

#### Scenario: Agent Teams finish with actionable output
- **WHEN** Claude Agent Teams finish a dispatched task
- **THEN** the workflow returns sufficient output for Codex to assess completion, quality, and next actions

### Requirement: Claude execution failures return control to Codex
The system SHALL route Claude execution failures, incomplete runs, and rejected results back to Codex rather than allowing Claude to unilaterally close the workflow. Codex MUST remain responsible for deciding whether to retry, revise inputs, or return the change for rework.

#### Scenario: Claude execution fails
- **WHEN** Claude cannot complete a dispatched task or returns an error state
- **THEN** the workflow reports the failure back to Codex and leaves the change under Codex control

#### Scenario: Claude output is insufficient for acceptance
- **WHEN** Claude returns output that does not satisfy the expected task boundary or verification needs
- **THEN** Codex can reject the result and request another execution cycle without archiving the change
