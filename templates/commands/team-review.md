---
description: 'Codex 审查 Claude Agent Teams 的执行结果，并决定通过还是打回'
---
<!-- CCG:TEAM:REVIEW:START -->
**Core Philosophy**
- `team-review` 由 Codex 主导，目的是决定“通过”还是“打回”。
- review 不是补写代码的阶段，而是做质量门禁和返工决策。
- Gemini 可以参与辅助 review，但不是 mandatory。

**Guardrails**
- 审查范围仅限本轮执行变更和对应 plan/spec 约束。
- 发现问题后优先形成 rework packet，而不是在 review 阶段直接接管实现。
- Critical 问题未解决前，不得视为通过。

**Steps**
1. 收集材料
   - 读取 `git diff`。
   - 读取最近的 `.claude/team-plan/*.md`。
   - 读取 `Execution Return Packet`。
   - 如有 active change，同时读取对应 spec artifacts。

2. Codex 主审查
   - Codex 必须检查：
     - scope compliance
     - correctness
     - regression risk
     - verification completeness
   - 如配置了 `{{FRONTEND_PRIMARY}}` 且当前问题偏前端/集成，可选增加辅助审查。

3. 形成审查结论
   - 输出分级结果：
     - Critical
     - Warning
     - Info
   - 每个 Critical 必须附带明确返工条件。

4. 决策
   - 若存在 Critical：
     - 输出 `Rework Packet`
     - 指示回到 `/ccgs:team-exec`
   - 若无 Critical：
     - 标记 `team review passed`
     - 指示回到 `/ccgs:spec-impl` 或 `/ccgs:spec-review`

**Rework Packet**

```md
## Rework Packet

### Critical Findings
- file: ...
  issue: ...
  required fix: ...

### Verification Gaps
- ...

### Return Conditions
- rerun tests: ...
- maintain scope: ...
- include evidence: ...
```

**Exit Criteria**
- [ ] 审查材料已收集
- [ ] Critical/Warning/Info 已分级
- [ ] 失败时已生成 rework packet
- [ ] 通过时已明确交还给 Codex 的下一步
<!-- CCG:TEAM:REVIEW:END -->
