## 1. Inventory Current OpenSpec State

- [x] 1.1 Audit the current source changes under `openspec/changes/` and map the capability coverage that already exists in change-local specs:
  `codex-orchestrated-workflow`, `agent-team-progress-mvp`, `openspec-orchestration-control-plane`, and `ccgs-nativeization`.
- [x] 1.2 Identify which durable requirements should be promoted into canonical main specs under `openspec/specs/`, including:
  `codex-workflow-orchestration`, `execution-progress-monitoring`, `orchestration-control-plane`, `execution-dag-engine`, `worker-container-runtime`, `ccgs-command-and-skill-surface`, `ccgs-runtime-surface`, and `ccgs-project-identity`.

## 2. Build The Main Capability Catalog

- [x] 2.1 Create or supplement canonical capability specs under `openspec/specs/` so the repository has a first coherent main-spec catalog.
- [x] 2.2 Ensure each new main spec uses durable capability naming and scenario-based OpenSpec requirements rather than task-specific wording.

## 3. Normalize Current Changes

- [x] 3.1 Update current change artifacts so proposals, specs, and task structure make capability coverage and execution boundaries easier to review.
- [x] 3.2 Supplement any missing or weak OpenSpec artifact details needed for archive review or future bounded execution, while staying inside `openspec/**`.

## Execution Boundaries

- Allowed surface:
  `openspec/specs/**`,
  `openspec/changes/openspec-capabilities-and-change-hygiene/**`,
  `openspec/changes/codex-orchestrated-workflow/**`,
  `openspec/changes/agent-team-progress-mvp/**`,
  `openspec/changes/openspec-orchestration-control-plane/**`,
  `openspec/changes/ccgs-nativeization/**`
- Protected surface:
  `openspec/changes/archive/**` and any file outside `openspec/**`

## 4. Validate And Summarize

- [x] 4.1 Run `openspec list --specs --json`, `openspec list --json`, and `openspec validate openspec-capabilities-and-change-hygiene --strict`.
- [x] 4.2 Return a summary of the created main specs, the normalized changes, and any remaining follow-up items for Codex review.
  Acceptance criteria:
  - enumerate the created main specs
  - identify which active change artifacts were normalized
  - note any remaining archive-review or sync follow-up items
