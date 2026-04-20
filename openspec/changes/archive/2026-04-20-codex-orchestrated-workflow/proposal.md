## Why

The current project assumes Claude Code is the primary host and orchestrator, while Codex and Gemini act as routed backends. That does not match the intended workflow, where Codex should own change/spec creation, dispatch Claude Agent Teams for implementation, and then perform final acceptance and archive decisions.

## What Changes

- Introduce a Codex-orchestrated primary workflow that treats Codex as the control plane for spec creation, execution dispatch, verification, and archive decisions.
- Reframe Claude from host/orchestrator into an execution worker that is invoked by Codex when Agent Teams or Claude-specific implementation flows are needed.
- Add an explicit installer step to confirm who acts as the orchestrator so users can keep Codex as default while still switching back to Claude for compatibility when needed.
- Remove Gemini from the default dependency path so the primary workflow no longer assumes Gemini routing, prompt assets, or setup steps.
- Keep MCP and skills available as compatibility-safe optional layers, but defer deeper simplification of those surfaces to a later change.
- Update command, template, and documentation language so the default product story is "Codex orchestrates, Claude executes" rather than "Claude orchestrates multi-model collaboration."
- Remove remaining mandatory Gemini wording from the primary research-stage commands so `spec-research` and `team-research` match the optional-integrations contract of the rest of the main path.
- Remove remaining Gemini-first assumptions from compatibility and secondary flows so legacy commands can stay installed without contradicting the configured model routing or the new Codex-led product narrative.

## Capabilities

### New Capabilities
- `codex-workflow-orchestration`: Defines the primary end-to-end workflow where Codex creates and advances OpenSpec artifacts, dispatches implementation work, performs acceptance, and decides whether to archive.
- `claude-execution-dispatch`: Defines how Codex-triggered workflows invoke Claude execution layers, especially Agent Teams, and how results are returned for Codex-led verification.
- `optional-integrations`: Defines installation and runtime behavior where Gemini is opt-in for the default path, while MCP and skills remain additive compatibility layers rather than required workflow gates. The installer now surfaces an explicit “orchestrator” choice and documents that Codex is the recommended default.

### Modified Capabilities

## Impact

- Affected code: CLI setup, init/update/menu flows, config defaults, installer and template injection logic, command registry, and spec/team command templates.
- Affected docs: README, AGENTS.md, command descriptions, installation guidance, and architecture explanations.
- Affected runtime behavior: default install target and workflow assumptions, model routing defaults, and how Claude/Codex responsibilities are described and enforced.
- Dependencies/systems: OpenSpec remains core; codeagent-wrapper remains core; Claude Agent Teams support remains important but becomes a downstream execution dependency instead of the primary host assumption.
