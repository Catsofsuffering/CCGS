---
name: ccgs-spec-init
description: Start or resume a CCGS change from Codex. Use when you want Codex to own change selection and artifact progression from the first step.
license: MIT
---

Start or resume a CCGS change from Codex.

**Core contract**

- Codex remains the orchestrator.
- Claude is not the host shell for this flow.
- OpenSpec remains the source of truth for change state.

**Steps**

1. Confirm OpenSpec is available by running `openspec --version`.
2. Inspect active changes with `openspec list --json`.
3. If no suitable change exists, create one with `openspec new change "<change-name>"`.
4. Run `openspec status --change "<change-name>" --json` to identify the first ready artifact.
5. Create or update the next OpenSpec artifact directly from Codex.
6. Stop after the change is selected and the next bounded artifact step is clear.

**Output**

- active change id
- current artifact status
- the next artifact Codex should create
- next skill: `ccgs-spec-plan`

**Guardrails**

- Do not redirect the user into Claude for artifact creation.
- Do not skip OpenSpec status checks.
- Keep all change-selection and artifact-progression decisions in Codex.
