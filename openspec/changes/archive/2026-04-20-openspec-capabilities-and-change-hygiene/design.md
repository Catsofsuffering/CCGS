## Context

The current repository already expresses substantial behavior through change-local specs in:

- `codex-orchestrated-workflow`
- `agent-team-progress-mvp`
- `openspec-orchestration-control-plane`
- `ccgs-nativeization`

Those changes collectively describe the current maintained product story, but the main OpenSpec catalog in `openspec/specs/` is empty. As a result, durable capabilities are scattered across change-local deltas, completed changes remain hard to evaluate for archive readiness, and active changes do not yet benefit from a stable capability baseline.

This design keeps Codex as the planner and reviewer while delegating the bounded documentation execution to Claude Agent Teams.

## Goals / Non-Goals

**Goals:**

- Create a first usable set of canonical main specs in `openspec/specs/`
- Organize and supplement current change artifacts so capability coverage is explicit
- Improve change hygiene using OpenSpec best practices without expanding into product-code edits
- Produce a bounded execution packet that Claude can implement safely inside `openspec/**`

**Non-Goals:**

- Editing product source files outside `openspec/**`
- Rewriting repository docs outside OpenSpec artifacts in this execution slice
- Automatically archiving changes during Claude execution
- Changing product behavior beyond clarifying and structuring the OpenSpec source of truth

## Decisions

### Decision: Build the first main-spec catalog from stable current requirements

The execution should derive canonical main specs from requirements that already appear stable across the maintained product story, especially completed changes and strongly established active changes.

The first-pass catalog promoted by this change is organized around these durable main-spec boundaries:

- `codex-workflow-orchestration`
- `execution-progress-monitoring`
- `orchestration-control-plane`
- `execution-dag-engine`
- `worker-container-runtime`
- `ccgs-command-and-skill-surface`
- `ccgs-runtime-surface`
- `ccgs-project-identity`

Why:

- `openspec/specs/` is currently empty, so a main catalog must start from the best available repository truth
- Completed and near-complete changes already contain scenario-based requirements that can be promoted into durable capabilities
- This keeps the work grounded in existing repository intent rather than inventing a parallel taxonomy

Alternatives considered:

- Leave `openspec/specs/` empty and continue using only change-local specs
  Rejected because it weakens archive readiness and long-term capability discovery
- Archive completed changes first and derive specs later
  Rejected because the main-spec gap should be closed before archive decisions are made

### Decision: Keep the execution scope strictly inside `openspec/**`

Claude should only modify OpenSpec artifacts for this run.

Why:

- The user request is specifically about organizing capabilities and changes under OpenSpec best practices
- This keeps the execution bounded, reviewable, and safe for a live workflow demonstration
- It prevents the execution worker from drifting into product or monitor implementation

Alternatives considered:

- Allow README, AGENTS, or source changes during the same run
  Rejected because that would blur the change boundary and make review noisier

### Decision: Treat completed-but-unarchived changes as source material, not auto-approved archive candidates

The execution may reorganize or supplement change artifacts, but Codex keeps archive review as a separate acceptance step.

Why:

- The Codex-led workflow explicitly reserves acceptance and archive decisions for Codex
- Some completed changes may still need capability normalization or main-spec promotion before archive
- This preserves a clean planning/execution/review separation

Alternatives considered:

- Ask Claude to archive any change it believes is ready
  Rejected because it violates the Codex acceptance boundary

## Risks / Trade-offs

- [Capability names could be overfit to current change wording] -> Mitigation: prefer stable, broad capability names and keep requirements scenario-based
- [The execution might duplicate requirements across main specs and change-local specs] -> Mitigation: use main specs for durable behavior and keep changes focused on in-flight deltas or cleanup
- [Completed changes may remain partially redundant after the first pass] -> Mitigation: treat this run as capability and hygiene normalization, then let Codex decide follow-up archive or sync steps

## Migration Plan

1. Audit current change-local specs and maintained product narrative
2. Create canonical main specs under `openspec/specs/`
3. Update the current change set so capability coverage and artifact structure are clearer
4. Validate the resulting OpenSpec tree
5. Return the result packet to Codex for acceptance and any follow-up archive decisions

## Open Questions

- Which completed changes should be archived immediately after the new main-spec catalog is reviewed
- Whether a follow-up change should standardize archive-ready metadata or naming conventions further

## Execution Handoff Contract

### Execution Goal

Organize and supplement the current OpenSpec capabilities and changes using OpenSpec best practices, with work limited to `openspec/**`.

### Allowed Change Surface

- `openspec/specs/**`
- `openspec/changes/openspec-capabilities-and-change-hygiene/**`
- `openspec/changes/codex-orchestrated-workflow/**`
- `openspec/changes/agent-team-progress-mvp/**`
- `openspec/changes/openspec-orchestration-control-plane/**`
- `openspec/changes/ccgs-nativeization/**`

### Protected Surface

- Any file outside `openspec/**`
- `openspec/changes/archive/**`
- Product code, monitor code, installer code, and repo docs outside OpenSpec
- Archive commands or destructive cleanup

### Work Packages

1. Audit current change-local specs and active changes
2. Create the first canonical main specs under `openspec/specs/`
3. Normalize and supplement current change artifacts so capability coverage and execution boundaries are explicit
4. Run OpenSpec validation and summarize results

### Required Verification

- `openspec list --specs --json`
- `openspec list --json`
- `openspec validate openspec-capabilities-and-change-hygiene --strict`

### Rework Triggers

- The execution edits files outside `openspec/**`
- Main specs are created without clear scenario-based requirements
- Current changes remain unclear about capability coverage after the update
- Validation fails or the resulting structure is internally inconsistent
