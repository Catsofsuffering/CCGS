---
name: spec-research
description: Research a requested change from Codex and turn findings into proposal-ready constraints. Use when a request needs bounded discovery before planning.
license: MIT
---

Research the request from Codex and produce proposal-ready constraints.

**Core contract**

- Codex owns the research brief, constraint synthesis, and proposal progression.
- Claude can be used as an optional secondary perspective, not as the workflow owner.
- This step updates the OpenSpec proposal context, not product code.

**Steps**

1. Create or select the active change with `openspec list --json` and `openspec status --change "<change-name>" --json`.
2. Convert the user request into a bounded research brief:
   - goal
   - scope boundaries
   - known constraints
   - success signals
3. Inspect the relevant codebase and surrounding project context.
4. Collect:
   - hard constraints
   - soft constraints
   - dependencies
   - risks
   - open questions
5. Resolve blocking ambiguities with the user when necessary.
6. Update or generate `proposal.md` so the change is ready for planning.
7. Stop after proposal context is clear and bounded.

**Output**

- active change id
- research summary
- proposal status
- next skill: `spec-plan`

**Guardrails**

- Do not modify product code in this step.
- Do not make final implementation decisions here.
- Keep the output constraint-focused rather than brainstorming indefinitely.
