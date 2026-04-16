## ADDED Requirements

### Requirement: The maintained workflow SHALL monitor Claude Agent Teams through Claude hook events
The system SHALL collect monitoring data for the maintained workflow from Claude Code hook events rather than from wrapper-managed execution state.

#### Scenario: Claude session starts
- **WHEN** Claude Code emits a session start hook event
- **THEN** the monitoring system SHALL register or reactivate the corresponding monitored session

#### Scenario: Claude tools and subagents execute
- **WHEN** Claude Code emits tool-use or subagent lifecycle hook events
- **THEN** the monitoring system SHALL update the corresponding session, agent, and activity records

#### Scenario: Claude session ends
- **WHEN** Claude Code emits a session end hook event
- **THEN** the monitoring system SHALL mark the session as completed or otherwise terminal according to the received event data

### Requirement: The primary monitoring UI SHALL be delivered by an integrated local monitor service
The system SHALL provide the maintained monitoring dashboard through an integrated local service and web UI rather than through the embedded `codeagent-wrapper` page.

#### Scenario: User opens the monitor UI
- **WHEN** the integrated monitor service is running locally
- **THEN** the user SHALL be able to open a dashboard that shows sessions, agent activity, and recent event history

#### Scenario: Monitoring data changes live
- **WHEN** new hook events are received
- **THEN** the monitoring UI SHALL update without requiring a full page reload

### Requirement: Installation SHALL configure Claude hooks for the maintained path
The system SHALL configure the Claude hook entries needed by the integrated monitor during installation or update of the maintained workflow.

#### Scenario: User installs or updates CCG
- **WHEN** the maintained workflow is installed or refreshed
- **THEN** the required Claude hook entries SHALL be present in `~/.claude/settings.json`

#### Scenario: Existing Claude settings are present
- **WHEN** hook configuration is written
- **THEN** existing unrelated Claude settings SHALL be preserved

### Requirement: The maintained primary workflow SHALL not require `codeagent-wrapper`
The maintained Codex -> Claude Agent Teams -> Codex workflow SHALL not depend on `codeagent-wrapper` as its required execution or monitoring boundary.

#### Scenario: User follows the maintained workflow
- **WHEN** the user uses the primary CCG path
- **THEN** execution and monitoring SHALL work without requiring `codeagent-wrapper`

#### Scenario: Product documentation describes the maintained path
- **WHEN** CCG documents the primary workflow
- **THEN** it SHALL describe the Claude hook-based monitor path instead of wrapper-owned monitoring as the required default

### Requirement: The monitoring UI SHALL be implemented as a React frontend using Tailwind CSS and shadcn/ui primitives
The integrated monitor frontend SHALL remain a React application and SHALL use Tailwind CSS tokens plus shadcn/ui-style primitives for shared UI building blocks instead of ad hoc page-specific styling.

#### Scenario: Shared UI primitives are needed
- **WHEN** the monitor frontend needs buttons, inputs, separators, drawers, tables, or similar primitives
- **THEN** the implementation SHALL define or adopt them through a shared Tailwind + shadcn/ui-compatible component layer in `claude-monitor/client`

#### Scenario: Primary monitoring pages are rendered
- **WHEN** the user opens the dashboard, sessions, activity, or session detail pages
- **THEN** those pages SHALL be rendered by the existing React client using the shared Tailwind + shadcn/ui design system rather than bespoke one-off page shells

### Requirement: The monitoring UI SHALL follow a restrained dark editorial visual system
The integrated monitor UI SHALL present a dark, industrial, Japanese magazine-inspired interface with a monochrome palette, one deep-green accent, and at most two font families.

#### Scenario: Color and typography tokens are defined
- **WHEN** the monitor design system defines its visual tokens
- **THEN** it SHALL limit colors to black, white, and gray neutrals plus a single deep-green accent color
- **AND** it SHALL use no more than two font families across the primary interface

#### Scenario: A page section is composed
- **WHEN** a dashboard or detail section is laid out
- **THEN** that section SHALL perform one primary job
- **AND** the page SHALL not introduce multiple competing hero visuals inside the same viewport
- **AND** unnecessary card grids SHALL be avoided in favor of editorial rails, rules, tables, lists, and typographic grouping

### Requirement: The monitoring UI SHALL expose OpenSpec change progression in a board view
The integrated monitor UI SHALL provide an OpenSpec board that groups changes by workflow stage and summarizes artifact readiness and task completion without becoming a second source of truth.

#### Scenario: User opens the OpenSpec board
- **WHEN** the repository contains OpenSpec changes and the monitor UI is open
- **THEN** the user SHALL be able to open a dedicated OpenSpec board page from monitor navigation
- **AND** the page SHALL group changes into workflow-stage columns derived from OpenSpec artifact completion and overall change status

#### Scenario: User inspects a change tile
- **WHEN** a change is rendered on the OpenSpec board
- **THEN** the tile SHALL show the change name, current stage, artifact completion summary, and task completion progress
- **AND** the tile SHALL indicate the next artifact or whether the change is already in implementation/completed state

#### Scenario: OpenSpec state cannot be loaded
- **WHEN** the monitor cannot read OpenSpec state from the local workspace
- **THEN** the OpenSpec board SHALL fail read-only with an explanatory empty or error state
- **AND** the rest of the monitor UI SHALL remain usable

### Requirement: Motion in the monitoring UI SHALL be purposeful and sparse
The integrated monitor frontend SHALL use no more than two or three intentional motion patterns, and those patterns SHALL communicate state changes, page entry, or content disclosure rather than decorative noise.

#### Scenario: Live monitoring state changes
- **WHEN** new hook events arrive or a status transitions in the UI
- **THEN** motion MAY be used to draw attention to the changed item
- **BUT** the motion set SHALL remain limited to purposeful patterns defined by the shared design system

#### Scenario: Reduced-motion preferences are present
- **WHEN** the user's environment requests reduced motion
- **THEN** non-essential animation SHALL be disabled or simplified while preserving usability
