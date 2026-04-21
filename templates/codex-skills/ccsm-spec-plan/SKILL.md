---
name: ccsm-spec-plan
description: Prepare the execution handoff contract from Codex. Use when a change needs design, task refinement, and a bounded Claude execution packet.
license: MIT
---

Plan the change from Codex and prepare the execution handoff.

**Core contract**

- Codex remains the orchestrator.
- Codex owns planning, boundary-setting, and acceptance criteria.
- Claude executes only after Codex has prepared a bounded handoff.

**Steps**

1. Select the active change with `openspec status --change "<change-name>" --json`.
2. Read `proposal.md`, `design.md`, `tasks.md`, and all relevant `specs/**/*.md`.
3. Update the OpenSpec artifacts so they clearly define:
   - allowed change surface
   - protected surface
   - work packages
   - required verification
   - rework triggers
4. Ensure `design.md` contains an `Execution Handoff Contract` section.
5. Ensure `tasks.md` is broken into concrete execution slices that Claude can implement without redefining the product decision.
6. End by preparing the exact bounded packet Codex will later send to Claude.

**Output**

- change id
- execution goal
- allowed/protected file boundaries
- required verification checklist
- next skill: `ccsm-spec-impl`

**Guardrails**

- Do not modify product code in this step.
- Do not ask Claude to decide the plan.
- Do not redirect the user to Claude slash commands.
