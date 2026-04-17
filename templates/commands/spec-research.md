---
description: '需求 -> 约束集合（Codex 主导研究，Claude 可选补充）'
---
<!-- CCG:SPEC:RESEARCH:START -->
**Core Philosophy**
- Research produces constraint sets, not information dumps.
- Constraints narrow later design and execution choices so implementation becomes mechanical.
- This phase only creates or updates the OpenSpec proposal artifact.
- Claude is an optional secondary perspective, not a prerequisite for the primary workflow.

**Guardrails**
- Run Prompt Enhancement before all other actions.
- Split exploration by context boundaries, not by persona labels.
- Use `{{MCP_SEARCH_TOOL}}` when available to minimize blind grep/find work.
- Do not make architecture decisions in this phase; surface constraints that guide later decisions.
- When guiding the user, always reference `/ccgs:*` commands rather than `/opsx:*`.
- Do not modify product source code in this phase.

**Steps**
0. **Prompt Enhancement First**
   - Analyze `$ARGUMENTS`, missing information, implied assumptions, and desired outcomes.
   - Convert the request into a structured research brief with goals, scope boundaries, technical constraints, and success criteria.
   - Use the enhanced brief for all later steps.

1. **Create or Select the OpenSpec Change**
   - Run `openspec list --json`.
   - If no matching change exists, run `openspec new change "<brief-descriptive-name>"`.
   - Continue with the selected change and confirm its status with `openspec status --change "<change_id>" --json`.

2. **Initial Codebase Assessment**
   - Use `{{MCP_SEARCH_TOOL}}` or fallback search to scan the codebase.
   - Determine project scale and identify likely context boundaries.
   - Decide whether backend-only exploration is sufficient or whether a separate frontend pass is useful.

3. **Define Exploration Boundaries**
   - Backend boundary: services, data flow, domain rules, infrastructure constraints.
   - Frontend boundary: UI, integration points, user-facing workflows, rendering constraints.
   - Additional boundaries are allowed when they are self-contained.

4. **Launch Configured Exploration Calls**
   - The backend exploration call is required and must use `{{BACKEND_PRIMARY}}`.
   - If a separate frontend perspective is useful, launch a second call with `{{FRONTEND_PRIMARY}}` as a background exploration.
   - If both roles use the same model, parallel boundary-focused calls are still allowed.
  - Use the configured prompt assets under `~/.claude/.ccgs/prompts/` instead of any wrapper-specific runtime.

   **Output Template**
   ```json
   {
     "module_name": "context boundary explored",
     "existing_structures": ["key patterns found"],
     "existing_conventions": ["standards in use"],
     "constraints_discovered": ["hard constraints limiting solution space"],
     "open_questions": ["ambiguities requiring user input"],
     "dependencies": ["cross-module dependencies"],
     "risks": ["potential blockers"],
     "success_criteria_hints": ["observable success behaviors"]
   }
   ```

   **Backend exploration brief**
   ```text
   Explore backend context boundaries for <change description>:
   - Existing structures and patterns
   - Conventions in use
   - Hard constraints limiting solution space
   - Dependencies and risks
   OUTPUT: JSON using the output template above
   ```

   **Frontend exploration brief**
   ```text
   Explore frontend context boundaries for <change description>:
   - Existing structures and patterns
   - Conventions in use
   - Hard constraints limiting solution space
   - Dependencies and risks
   OUTPUT: JSON using the output template above
   ```

   - Backend exploration is required; do not continue without it.
   - Frontend exploration is optional when it adds value. If it fails, record that and continue unless the user explicitly asked for that extra perspective.

5. **Aggregate and Synthesize**
   - Merge the exploration output into:
     - hard constraints
     - soft constraints
     - dependencies
     - risks
     - success criteria hints

6. **Resolve Ambiguities with the User**
   - Compile open questions in priority order.
   - Use `AskUserQuestion` for any unresolved ambiguity.
   - Convert confirmed answers into explicit constraints.

7. **Finalize the Proposal Context**
   - Before calling `/opsx:continue` internally, emit a structured summary:
     ```markdown
     ## Research Summary for OPSX

     **Discovered Constraints**:
     - ...

     **Dependencies**:
     - ...

     **Risks & Mitigations**:
     - ...

     **Success Criteria**:
     - ...

     **User Confirmations**:
     - ...
     ```
   - Then call `/opsx:continue` internally to generate or update `proposal.md`.
   - Stop after proposal generation and direct the user to `/ccgs:spec-plan`.

8. **Context Checkpoint**
   - Report current context usage.
   - If context is getting large, suggest clearing before `/ccgs:spec-plan`.

**Reference**
- `openspec list --json`
- `openspec status --change "<change_id>" --json`
- `openspec instructions apply --change "<change_id>" --json`
<!-- CCG:SPEC:RESEARCH:END -->
