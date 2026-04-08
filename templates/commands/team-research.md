---
description: 'Agent Teams 需求研究 - 产出约束集合，Gemini 可选补充'
---
<!-- CCG:TEAM:RESEARCH:START -->
**Core Philosophy**
- Research outputs constraints and success criteria, not implementation decisions.
- The result feeds `team-plan` with enough clarity that execution can be delegated cleanly.
- Backend exploration is required; frontend exploration uses the configured model and does not require Gemini.

**Guardrails**
- Run Prompt Enhancement before all other actions.
- Split exploration by context boundaries rather than role labels.
- Do not make architecture decisions here; collect constraints that later stages must obey.
- Use `AskUserQuestion` for any ambiguity instead of guessing.
- Write the result into `.claude/team-plan/<task-name>-research.md`.

**Steps**
0. **Prompt Enhancement**
   - Expand `$ARGUMENTS` into a structured research brief.
   - Capture scope, success criteria, risks, and missing information.

1. **Codebase Assessment**
   - Scan the repository with available search tools.
   - Identify relevant backend and frontend boundaries.
   - Decide whether both boundaries need separate exploration.

2. **Define Exploration Boundaries**
   - Backend: services, APIs, state transitions, policies, persistence, build constraints.
   - Frontend: UI states, integration surfaces, rendering, interaction rules.
   - Add more boundaries only when they are independently explorable.

3. **Launch Configured Exploration Calls**
   - The backend call is mandatory and uses `{{BACKEND_PRIMARY}}`.
   - A frontend call is optional but recommended when the task has UI or integration impact, and it uses `{{FRONTEND_PRIMARY}}`.
   - If both roles share the same model, you may still run two boundary-focused calls.
   - Gemini is only involved when the configured execution model is Gemini.

   **Backend exploration**
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{BACKEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/{{BACKEND_PRIMARY}}/analyzer.md\n<TASK>\n需求：<增强后的需求>\n探索范围：后端相关上下文边界\n</TASK>\nOUTPUT (JSON):\n{\n  \"module_name\": \"探索的上下文边界\",\n  \"existing_structures\": [\"发现的关键模式\"],\n  \"existing_conventions\": [\"使用中的规范\"],\n  \"constraints_discovered\": [\"限制解决方案空间的硬约束\"],\n  \"open_questions\": [\"需要用户确认的歧义\"],\n  \"dependencies\": [\"跨模块依赖\"],\n  \"risks\": [\"潜在阻碍\"],\n  \"success_criteria_hints\": [\"可观察的成功行为\"]\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{BACKEND_PRIMARY}} 后端探索"
   })
   ```

   **Frontend exploration**
   ```
   Bash({
     command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--progress --backend {{FRONTEND_PRIMARY}} {{GEMINI_MODEL_FLAG}}- \"{{WORKDIR}}\" <<'EOF'\nROLE_FILE: ~/.claude/.ccg/prompts/{{FRONTEND_PRIMARY}}/analyzer.md\n<TASK>\n需求：<增强后的需求>\n探索范围：前端相关上下文边界\n</TASK>\nOUTPUT (JSON):\n{\n  \"module_name\": \"探索的上下文边界\",\n  \"existing_structures\": [\"发现的关键模式\"],\n  \"existing_conventions\": [\"使用中的规范\"],\n  \"constraints_discovered\": [\"限制解决方案空间的硬约束\"],\n  \"open_questions\": [\"需要用户确认的歧义\"],\n  \"dependencies\": [\"跨模块依赖\"],\n  \"risks\": [\"潜在阻碍\"],\n  \"success_criteria_hints\": [\"可观察的成功行为\"]\n}\nEOF",
     run_in_background: true,
     timeout: 3600000,
     description: "{{FRONTEND_PRIMARY}} 前端探索"
   })
   ```

   **Wait for results**
   ```
   TaskOutput({ task_id: "<backend_task_id>", block: true, timeout: 600000 })
   TaskOutput({ task_id: "<frontend_task_id>", block: true, timeout: 600000 })
   ```

   - Backend exploration must complete before synthesis.
   - Frontend exploration can be skipped or retried based on task relevance, but Gemini is never a mandatory prerequisite.

4. **Aggregate Constraints**
   - Merge findings into:
     - hard constraints
     - soft constraints
     - dependencies
     - risks
     - success criteria

5. **Resolve Open Questions**
   - Ask the user about unresolved ambiguity.
   - Convert answers into explicit constraints and append them to the research output.

6. **Write the Research File**
   - Save to `.claude/team-plan/<task-name>-research.md`.
   - Include:
     - structured request
     - hard constraints
     - soft constraints
     - dependencies
     - risks and mitigations
     - success criteria
     - resolved questions

7. **Next Step**
   - Stop after research is complete.
   - Direct the user to run `/ccg:team-plan <task-name>`.

**Exit Criteria**
- [ ] Backend exploration completed
- [ ] Frontend exploration completed or explicitly skipped
- [ ] Constraints and success criteria written to the research file
- [ ] No unresolved ambiguity remains
<!-- CCG:TEAM:RESEARCH:END -->
