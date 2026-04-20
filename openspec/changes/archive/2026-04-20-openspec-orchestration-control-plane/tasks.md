## 1. Control-plane State Model

- [x] 1.1 Define the project/fact/intent/hint/settings/graph/run domain model and map which parts are durable in OpenSpec versus ephemeral in runtime state.
- [x] 1.2 Add a reconciliation layer that can derive control-plane state from OpenSpec change data and runtime events without creating a second durable source of truth.
- [x] 1.3 Define replay/reopen semantics and persistence boundaries for operator interventions.

## 2. Dispatcher

- [x] 2.1 Introduce dispatcher phases for bootstrap, reason, dispatch, observe, reconcile, and complete-or-reopen.
- [x] 2.2 Implement live DAG generation rules from facts, intents, worker outputs, and operator inputs.
- [x] 2.3 Add APIs for node readiness, node state transitions, replay, reopen, and routing decisions.

## 3. Worker Container

- [x] 3.1 Define the Worker Adapter Protocol, including lifecycle states, heartbeat, input payload, output payload, and failure reporting.
- [x] 3.2 Implement the first CLI-backed worker adapter for Claude execution using the existing launcher surface.
- [x] 3.3 Implement or scaffold the corresponding Codex worker adapter using the same protocol.
- [x] 3.4 Document SDK-backed adapters as a second-phase extension without making them required for MVP.

## 4. Control-plane UI

- [x] 4.1 Extend the monitor server with read/write-safe control-plane endpoints for projects, graph state, node detail, replay, and reopen.
- [x] 4.2 Extend the monitor frontend with a dedicated DAG workspace built on the current monitor shell.
- [x] 4.3 Add drag-and-drop node interaction and clearly separate layout edits from dependency/scheduling edits.
- [x] 4.4 Surface worker health, routing, logs, and operator actions in the UI without degrading the existing OpenSpec board.

## 5. OpenSpec Fusion

- [x] 5.1 Connect OpenSpec change/artifact status to the control-plane project model.
- [x] 5.2 Ensure monitor-driven actions reconcile back into OpenSpec-compatible lifecycle state where intended.
- [x] 5.3 Preserve the current OpenSpec board as a stage/status view alongside the new DAG workspace.

## 6. Verification

- [x] 6.1 Run `openspec validate openspec-orchestration-control-plane --strict`.
- [x] 6.2 Run the relevant monitor client/server build and test commands for any touched control-plane work.
- [x] 6.3 Manually verify runtime DAG generation, drag behavior, replay/reopen flows, and worker lifecycle visibility.
- [x] 6.4 Manually verify that CLI-backed workers can run under the shared protocol and that the design still permits later SDK adapters.
