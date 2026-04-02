## ADDED Requirements

### Requirement: Default installation path does not require optional integrations
The system SHALL support a default installation and workflow path that does not require MCP, skills, or Gemini. Users MUST be able to install and use the primary Codex-led workflow without configuring any of those integrations.

#### Scenario: User installs the default workflow with no optional tooling
- **WHEN** a user performs a default installation and does not configure MCP, skills, or Gemini
- **THEN** the primary Codex-led workflow remains available and functional

#### Scenario: User runs the primary workflow without optional integrations
- **WHEN** a user uses the default Codex-led workflow in an environment without MCP, skills, or Gemini
- **THEN** the workflow continues with non-optional fallbacks instead of blocking setup or execution

### Requirement: Optional integrations are additive enhancements
The system SHALL present MCP, skills, and Gemini as optional enhancements to the primary workflow. Enabling or disabling those integrations MUST NOT redefine the ownership model of the primary Codex-led workflow.

#### Scenario: User enables an optional integration
- **WHEN** a user enables MCP, skills, or Gemini after the base workflow is available
- **THEN** the integration extends the workflow without replacing Codex as the orchestrator

#### Scenario: User disables an optional integration
- **WHEN** a user removes or skips an optional integration
- **THEN** the workflow continues to identify the feature as optional rather than as a missing mandatory dependency

### Requirement: Product guidance distinguishes core dependencies from optional integrations
The system SHALL clearly distinguish between core dependencies required for the Codex-led workflow and optional integrations that enhance it. Documentation, installation flows, and command guidance MUST avoid implying that optional integrations are mandatory for the default path.

#### Scenario: User reads installation guidance
- **WHEN** installation or configuration steps are shown to the user
- **THEN** core requirements are separated from optional integrations

#### Scenario: User reads command or architecture guidance
- **WHEN** workflow documentation describes available tools and model roles
- **THEN** optional integrations are labeled as enhancements instead of prerequisites for the main path
