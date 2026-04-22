## MODIFIED Requirements

### Requirement: Product guidance distinguishes core dependencies from optional integrations

The system SHALL clearly distinguish between core dependencies required for the Codex-led workflow and optional integrations that enhance it. Documentation, installation flows, and command guidance MUST avoid implying that optional integrations are mandatory for the default path.

#### Scenario: User reads installation guidance

- **WHEN** installation or configuration steps are shown to the user
- **THEN** the base workflow install flow SHALL omit install-time MCP buffet selection and automatic MCP setup

#### Scenario: User wants MCP after base install

- **WHEN** a user wants MCP tools after the base workflow is already installed
- **THEN** MCP remains available through explicit later configuration rather than as a required install-time step
