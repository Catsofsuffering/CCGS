---
name: spec-review
description: Run the independent acceptance gate from Codex. Use when a change needs final verification against its spec, design, tasks, and execution evidence.
license: MIT
---

Review the change from Codex before archive.

**Core contract**

- Codex performs the final acceptance gate.
- Review compares the implementation against proposal, design, tasks, and verification evidence.
- Archive only happens after Codex accepts the result.

**Steps**

1. Select the active change with `openspec status --change "<change-name>" --json`.
2. Read `proposal.md`, `design.md`, `tasks.md`, and `specs/**/*.md`.
3. Inspect the current diff and the latest execution return packet.
4. Verify:
   - tasks are complete
   - constraints are satisfied
   - required tests/checks were run
   - no out-of-scope edits slipped in
5. If needed, run additional local checks.
6. Decide:
   - `Acceptance Passed` and archive-ready
   - `Acceptance Failed` with a bounded rework packet

**Output**

- acceptance decision
- supporting findings
- rework packet or archive approval

**Guardrails**

- Do not archive without verification evidence.
- Do not delegate the final decision away from Codex.
- Keep the result tied to the change contract, not personal preference.
