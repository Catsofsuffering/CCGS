---
description: 'Codex 为 Claude Agent Teams 生成执行计划与 handoff 文件'
---
<!-- CCG:TEAM:PLAN:START -->
**Core Philosophy**
- `team-plan` 是 Codex 给 Claude 执行层准备的施工图，不是最终实现。
- 计划必须零歧义、可分包、可验收、可回退。
- Gemini 是可选补充，不是 mandatory。

**Guardrails**
- 不写产品代码，只生成执行计划。
- 每个 work package 必须有明确文件边界。
- 必须为执行结果定义 return packet。

**Steps**
1. 读取输入
   - 读取 `$ARGUMENTS`、当前 change artifacts、相关代码上下文。
   - 如由 `spec-impl` 进入，优先读取 `Execution Handoff Contract`。

2. Codex 主导拆分
   - 用 Codex 产出执行切片：
     - work package name
     - owned files
     - dependencies
     - completion criteria
     - verification required
   - 如确有必要，可用 `{{FRONTEND_PRIMARY}}` 补充 UI/集成建议。

3. 生成 Claude 执行计划
   - 输出到 `.claude/team-plan/<task-name>.md`
   - 文件中至少包含：

```md
# Team Plan: <task-name>

## Goal
<目标>

## Codex -> Claude Execution Contract
- source change: <change_id>
- allowed surface: ...
- protected surface: ...
- required verification: ...
- return packet: ...

## Work Packages
### Package 1
- owner role: builder
- files: ...
- steps: ...
- done when: ...

### Package 2
- owner role: builder
- files: ...
- depends on: Package 1
- done when: ...

## Parallelization
- Layer 1: Package 1, Package 2
- Layer 2: Package 3
```

4. 用户确认
   - 展示 work package 数量、并行层次、关键限制。
   - 提示下一步运行 `/ccg:team-exec`。

**Exit Criteria**
- [ ] 计划文件已生成
- [ ] work packages 文件范围不冲突
- [ ] 验证要求已写清
- [ ] return packet 已定义
<!-- CCG:TEAM:PLAN:END -->
