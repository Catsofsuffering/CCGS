## Why

The repository now has multiple substantial OpenSpec changes, but `openspec/specs/` is still empty and the active change set is not organized as a coherent capability catalog. That makes it harder to understand the maintained product surface, to tell which changes are durable versus in-flight, and to archive or extend work using OpenSpec best practices.

## What Changes

- Create a first-pass canonical capability catalog under `openspec/specs/` based on the current maintained product story and the requirements already defined in completed or near-complete changes.
- Reorganize and supplement the current OpenSpec change artifacts so active changes clearly declare capability coverage, execution boundaries, and validation intent.
- Normalize change-level documentation around capability naming, execution handoff clarity, and task structure without changing product code.
- Leave archive decisions to Codex after the resulting OpenSpec structure has been reviewed.

## Source Material

This change promotes and normalizes capability coverage derived from the following source changes:

- `codex-orchestrated-workflow`
- `agent-team-progress-mvp`
- `openspec-orchestration-control-plane`
- `ccgs-nativeization`

The first-pass canonical catalog created by this change targets these durable main-spec boundaries:

- `codex-workflow-orchestration`
- `execution-progress-monitoring`
- `orchestration-control-plane`
- `execution-dag-engine`
- `worker-container-runtime`
- `ccgs-command-and-skill-surface`
- `ccgs-runtime-surface`
- `ccgs-project-identity`

## Capabilities

### New Capabilities

- `capability-catalog`: Maintain a canonical main-spec catalog that describes the repository's durable maintained capabilities.
- `change-artifact-hygiene`: Keep active OpenSpec changes organized, capability-linked, and bounded for planning, execution, and archive review.

### Modified Capabilities

- None.

## Impact

- Affected surface: `openspec/specs/**` and `openspec/changes/**`
- Affected workflow: OpenSpec change review, archive readiness, and future change creation
- No application runtime or product code behavior changes are intended in this slice
