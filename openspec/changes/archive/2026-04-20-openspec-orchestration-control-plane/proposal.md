## Why

CCGS already has a monitor UI, an OpenSpec workflow, and a Claude-oriented execution path, but those pieces do not yet form one coherent control plane. The next step is to turn them into a single problem-solving system where OpenSpec manages durable change state, a dispatcher drives execution from that state, and lightweight Agent Workers execute bounded tasks against a live DAG.

## What Changes

- Introduce a new orchestration control-plane architecture that treats OpenSpec as the canonical blackboard for projects, facts, intents, hints, settings, and execution state.
- Define a dispatcher contract that derives and updates a live execution DAG in real time instead of relying on static, pre-authored task trees.
- Extend the existing monitor server/client into the primary control-plane UI, including dynamic DAG visualization, drag-and-drop node interaction, execution logs, and human intervention flows.
- Introduce a Worker Container contract for `Claude Code`, `Codex`, and future lightweight agents, with lifecycle, heartbeat, input/output, and completion semantics.
- Standardize on a "less is more" execution model: keep orchestration logic centralized, keep workers thin, and make SDK-specific integrations optional behind one worker protocol.

## Capabilities

### New Capabilities
- `orchestration-control-plane`: OpenSpec-backed blackboard state, dispatcher stages, replay/reopen flows, and control-plane coordination semantics.
- `execution-dag-engine`: Real-time generated DAG views, node state transitions, drag-and-drop adjustments, and operator-visible execution progress.
- `worker-container-runtime`: Worker lifecycle and routing contract for CLI-backed and future SDK-backed Agent Workers.

### Modified Capabilities
- None. This change introduces a new control-plane layer and reuses the current monitor implementation as the frontend base.

## Impact

- Affected code: `claude-monitor/server/**`, `claude-monitor/client/**`, selected command/runtime wiring under `src/**`, and new orchestration integration modules.
- Affected systems: OpenSpec change state, monitor APIs, live UI data models, and worker execution boundaries for Claude/Codex.
- Affected dependencies: likely frontend graph interaction support and optional worker adapter packages, while preserving the current CLI execution path as the minimum baseline.
