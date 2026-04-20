## Context

CCGS currently contains the major ingredients of a useful agent system:

- OpenSpec for durable change artifacts and lifecycle
- a local monitor service and React frontend
- a stable Claude CLI launch path
- Codex-facing workflow ownership and planning guidance

What it does not yet have is a unified control plane. The current monitor is mostly observational, OpenSpec is mostly artifact-oriented, and worker execution is still tied to model-specific runtime assumptions. The target architecture is a Cairn-like system where a central state server and dispatcher coordinate lightweight Agent Workers through a blackboard model and a live DAG.

This change defines that architecture without forcing implementation to overreach. The system should stay minimal:

- OpenSpec owns durable change/project state
- the dispatcher owns real-time orchestration
- workers stay thin and replaceable
- the monitor frontend becomes the control surface rather than a separate reporting dashboard

## Goals / Non-Goals

**Goals**

- Treat OpenSpec as the canonical management layer for long-lived project/change state.
- Define a control-plane architecture composed of a state server, dispatcher, worker containers, and a monitor-derived UI.
- Generate the execution DAG dynamically from current facts, intents, worker results, and operator interventions.
- Allow DAG nodes to be reordered or adjusted through drag-and-drop without breaking OpenSpec as the source of durable truth.
- Support `Claude Code` and `Codex` as the minimum worker set under one shared runtime contract.
- Decide whether Worker Container should use SDKs or CLI tools as the primary execution boundary.

**Non-Goals**

- Replacing OpenSpec itself with a new spec system.
- Shipping a full remote cluster scheduler in the first pass.
- Building model-specific orchestration logic directly into the dispatcher.
- Locking the architecture to Claude/Codex only; future workers should remain possible.

## Proposed Architecture

### 1. OpenSpec-backed State Server

The system should introduce a Cairn-like state layer, but it should not duplicate OpenSpec's role. Instead, the CCGS control plane should treat OpenSpec as the durable management backbone and layer runtime state on top of it.

The logical state model is:

- `Project`: the tracked unit of work
- `Facts`: discovered truths, evidence, or environment observations
- `Intents`: current objectives, hypotheses, and desired outcomes
- `Hints`: external nudges, operator guidance, or challenge hints
- `Settings`: runtime constraints, worker policy, and orchestration mode
- `Graph`: current execution DAG derived from the above
- `Runs`: ephemeral execution attempts, heartbeats, and completion records

Durability split:

- OpenSpec remains the durable source for change lifecycle and artifact status.
- The control plane may keep a runtime store for graph layout, live execution state, and operator interactions.
- Runtime state must be reconstructable from OpenSpec plus event history whenever possible.

### 2. Dispatcher

The dispatcher is the system's real-time problem-solving engine. It watches OpenSpec-backed state, creates or updates DAG nodes, routes nodes to workers, and records outcomes back into the blackboard.

Minimum dispatcher phases:

1. `bootstrap`: create project context, load OpenSpec status, and initialize the first graph.
2. `reason`: derive next intents, missing facts, and candidate execution nodes.
3. `dispatch`: select an eligible worker and start execution.
4. `observe`: collect worker heartbeats, outputs, and completion state.
5. `reconcile`: write results back into facts/intents and regenerate the DAG when needed.
6. `complete-or-reopen`: mark success, spawn follow-up nodes, or reopen blocked branches.

The dispatcher must own:

- worker eligibility and routing
- node readiness rules
- replay/reopen behavior
- operator override handling
- DAG regeneration triggers

### 3. Worker Container

`Claude Code` and `Codex` are the minimum scheduling unit and are treated equally as `Agent Workers`.

Each Worker Container must support:

- declared worker type and capabilities
- lifecycle states: `created`, `ready`, `running`, `completed`, `failed`, `stopped`
- health checks and heartbeats
- bounded task input payloads
- structured result output
- logs and optional artifacts

The protocol should be runtime-agnostic so the dispatcher can route work without caring whether the worker is CLI-backed or SDK-backed.

### 4. Monitor-derived Control-plane UI

The current monitor is the correct base for the frontend. It already has a server/client split, live updates, session analytics, and an OpenSpec board foundation.

This change upgrades that monitor into the primary control-plane UI with:

- project overview
- OpenSpec state and artifact readiness
- dynamic DAG browsing
- node detail/log panels
- drag-and-drop node interactions
- replay/reopen controls
- worker health and routing visibility

The monitor remains a local-first UI, but it stops being "monitoring only" and becomes the operator surface for the orchestration system.

## Decisions

### Decision: OpenSpec becomes the management backbone, not just an adjacent board

The new control plane should not merely show OpenSpec data in the UI. OpenSpec should become the durable management layer for projects and long-lived workflow state.

Why this decision:

- The user explicitly wants OpenSpec management fused into the system, not bolted on.
- OpenSpec already provides change identity, artifact status, and lifecycle semantics.
- Reusing it prevents the control plane from inventing a second product-level management model.

Alternatives considered:

- Keep OpenSpec as a read-only side panel.
  Rejected because it would preserve the current architectural split.
- Replace OpenSpec with a custom project store.
  Rejected because it increases scope and weakens existing workflow discipline.

### Decision: Extend the current monitor instead of building a second frontend

The control-plane frontend should be built on top of `claude-monitor/client` and `claude-monitor/server`.

Why this decision:

- The monitor already contains routing, live updates, OpenSpec board support, and workflow visualizations.
- Reusing it preserves momentum and keeps the system local-first.
- The user's requested UI shape naturally extends the existing monitor rather than replacing it.

Alternatives considered:

- Build a separate control-plane application.
  Rejected because it duplicates infrastructure and fractures the product.

### Decision: The execution DAG is generated dynamically and remains operator-adjustable

The DAG should be derived from live state rather than treated as a static task plan. Operators must be able to drag nodes to reorganize layout and express intervention intent.

Why this decision:

- The user's target architecture depends on real-time graph generation.
- Static DAGs fail to reflect new facts, hints, or worker discoveries.
- Human intervention is a feature, not a workaround.

Important boundary:

- Drag-and-drop should update graph arrangement and, when explicitly allowed, scheduling priority or dependency hints.
- It must not silently rewrite durable OpenSpec artifacts without an intentional reconciliation step.

### Decision: Worker Container should be protocol-first and CLI-first in phase one

Phase one should implement Worker Container through a shared worker protocol with CLI-backed adapters as the default execution path. SDK-backed adapters should remain a supported future path behind the same protocol.

Why this decision:

- The repository already contains a working Claude CLI discovery/launch path in [claude-cli.ts](/E:/CCGS/src/utils/claude-cli.ts).
- Codex execution is not yet represented by a mature SDK integration in this codebase.
- CLI-backed workers minimize integration risk while still allowing real orchestration progress.
- A protocol layer avoids baking CLI assumptions into the dispatcher forever.

Alternatives considered:

- Go SDK-first immediately.
  Rejected because it would force two unstable integrations at once and slow down the control-plane work.
- Keep workers model-specific with no shared protocol.
  Rejected because it blocks future lightweight agents and makes dispatcher logic brittle.

### Decision: Less Is More

The system should centralize orchestration complexity in the control plane and keep workers intentionally thin.

This means:

- the dispatcher decides, workers execute
- state lives in the blackboard/control plane, not inside workers
- worker-specific SDK features remain optional
- every added capability must strengthen the shared protocol or operator surface

## Worker Container Evaluation

### Option A: SDK-first Worker Container

Pros:

- richer streaming control
- stronger structured callbacks
- easier future remote execution in some environments

Cons:

- no existing Codex/Claude parity in this repository
- higher implementation and maintenance complexity
- larger risk of product lock-in at the worker boundary

### Option B: CLI-first Worker Container

Pros:

- matches the current repository state
- fast to validate locally
- easy to wrap with process lifecycle, heartbeat, logs, and exit semantics
- keeps worker implementations lightweight

Cons:

- weaker native control than a full SDK
- may require more adapter glue for structured streaming
- remote/containerized expansion later may need extra work

### Recommendation

Adopt a hybrid roadmap:

1. Define one `Worker Adapter Protocol`.
2. Implement `Claude CLI Adapter` first.
3. Implement `Codex CLI Adapter` or equivalent command-backed adapter next.
4. Leave `SDK Adapter` as a second-phase extension once dispatcher semantics and DAG UX stabilize.

This gives CCGS a minimal viable worker runtime without overcommitting to a vendor-specific SDK boundary too early.

## Frontend Direction

The frontend should evolve from the current monitor with three major additions:

1. a project/control-plane home instead of pure monitoring dashboards
2. a live DAG canvas with drag interaction
3. operator workflows for replay, reopen, route, and inspect

Recommended frontend approach:

- keep the existing React/Tailwind base
- add a graph interaction library only where needed
- preserve the existing OpenSpec board as a stage/status lens
- add a separate DAG workspace page for node interaction and execution detail

## Risks / Trade-offs

- [OpenSpec and runtime state can drift] -> Mitigation: define explicit reconciliation rules between durable OpenSpec state and ephemeral graph/runtime state.
- [Dynamic DAGs can become visually noisy] -> Mitigation: separate layout state from dependency state and constrain human edits.
- [CLI-backed workers may feel less powerful than SDKs] -> Mitigation: keep the protocol stable so SDK adapters can be added later.
- [Monitor code can become overloaded] -> Mitigation: separate control-plane modules from legacy analytics views and phase the rollout.

## Execution Handoff Contract

### Execution Goal

Introduce a new OpenSpec-backed orchestration control plane for CCGS that uses the existing monitor as its frontend base, generates a live operator-adjustable DAG, and standardizes `Claude Code` and `Codex` as lightweight Agent Workers behind a shared worker container protocol.

### Allowed Change Surface

- `openspec/changes/openspec-orchestration-control-plane/**`
- `claude-monitor/server/**`
- `claude-monitor/client/**`
- new orchestration/control-plane modules under `src/**` if needed
- targeted runtime wiring under `src/commands/**` and `src/utils/**`
- docs/templates only where they must reflect the new control-plane architecture

### Protected Surface

- unrelated OpenSpec changes
- unrelated MCP integrations
- package/release work unrelated to orchestration control-plane scope
- broad installer rewrites beyond what is needed for this architecture

### Work Packages

1. Introduce the control-plane domain model and OpenSpec-backed state reconciliation layer.
2. Add dispatcher services and APIs for live DAG generation, node lifecycle, replay, and reopen.
3. Upgrade the monitor server/client into the control-plane UI with DAG and operator interactions.
4. Implement the first worker adapter protocol with CLI-backed worker containers.
5. Verify the control plane with OpenSpec status, live UI behavior, worker lifecycle behavior, and DAG interactions.

### Required Verification

- `openspec validate openspec-orchestration-control-plane --strict`
- relevant root verification commands for any touched runtime modules
- monitor client build/test
- monitor server test
- manual verification of dynamic DAG rendering, node drag behavior, and operator replay/reopen flows
- manual verification that OpenSpec remains the durable management layer

### Rework Triggers

- the design introduces a second durable project-management source of truth outside OpenSpec
- the UI remains monitoring-only and cannot act as a control-plane surface
- DAG generation is static or compile-time instead of runtime-derived
- worker execution is hardcoded to one runtime with no shared adapter protocol
- implementation requires SDK-only execution from day one

### Exact Bounded Packet For `ccgs-spec-impl`

- Change id: `openspec-orchestration-control-plane`
- Execution goal: build the OpenSpec-backed orchestration control plane, control-plane UI, and CLI-first worker container protocol
- Allowed boundaries: control-plane OpenSpec artifacts, monitor server/client, and targeted runtime wiring
- Protected boundaries: unrelated changes, unrelated MCP features, and non-control-plane product rewrites
- Required verification: OpenSpec validation, monitor build/test, runtime checks relevant to changed files, and manual DAG/operator-flow verification
- Next skill: `ccgs-spec-impl`
