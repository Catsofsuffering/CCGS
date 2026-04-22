---
name: spec-init
description: Start or resume the primary OpenSpec change flow from Codex. Use when Codex should pick the active change and create the next OpenSpec artifact directly.
license: MIT
---

Start or resume the primary change from Codex.

**Core contract**

- Codex remains the orchestrator.
- OpenSpec remains the source of truth for change state.
- This is the native entrypoint for the primary spec-driven flow.

**Steps**

1. Confirm OpenSpec is available with `openspec --version`.
2. Inspect current changes with `openspec list --json`.
3. If no suitable change exists, create one with `openspec new change "<change-name>"`.
4. Run `openspec status --change "<change-name>" --json` to identify the first ready artifact.
5. Create or update the next OpenSpec artifact directly from Codex.
6. Stop after the change is selected and the next bounded artifact step is clear.

**Output**

- active change id
- current artifact status
- next artifact Codex should create
- next skill: `spec-plan`

**Guardrails**

- Do not redirect artifact creation into Claude.
- Do not skip OpenSpec status checks.
- Keep change-selection and artifact-progression decisions in Codex.
