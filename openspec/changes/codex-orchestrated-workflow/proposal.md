## Why

The current project assumes Claude Code is the primary host and orchestrator, while Codex and Gemini act as routed backends. That does not match the intended workflow, where Codex should own change/spec creation, dispatch Claude Agent Teams for implementation, and then perform final acceptance and archive decisions.

## What Changes

- Introduce a Codex-orchestrated primary workflow that treats Codex as the control plane for spec creation, execution dispatch, verification, and archive decisions.
- Reframe Claude from host/orchestrator into an execution worker that is invoked by Codex when Agent Teams or Claude-specific implementation flows are needed.
- Make MCP, skills, and Gemini optional integrations instead of default assumptions in installation, configuration, and command guidance.
- Update command, template, and documentation language so the default product story is "Codex orchestrates, Claude executes" rather than "Claude orchestrates multi-model collaboration."

## Capabilities

### New Capabilities
- `codex-orchestrated-workflow`: Defines the primary end-to-end workflow where Codex creates and advances OpenSpec artifacts, dispatches implementation work, performs acceptance, and decides whether to archive.
- `claude-execution-dispatch`: Defines how Codex-triggered workflows invoke Claude execution layers, especially Agent Teams, and how results are returned for Codex-led verification.
- `optional-integrations`: Defines installation and runtime behavior where MCP, skills, and Gemini are available as optional enhancements rather than required parts of the default path.

### Modified Capabilities

## Impact

- Affected code: CLI setup, init/update/menu flows, config defaults, installer and template injection logic, command registry, and spec/team command templates.
- Affected docs: README, AGENTS.md, command descriptions, installation guidance, and architecture explanations.
- Affected runtime behavior: default install target and workflow assumptions, model routing defaults, and how Claude/Codex responsibilities are described and enforced.
- Dependencies/systems: OpenSpec remains core; codeagent-wrapper remains core; Claude Agent Teams support remains important but becomes a downstream execution dependency instead of the primary host assumption.
