---
description: 'Codex 收敛 proposal，生成执行交接契约与零决策计划'
---
<!-- CCG:SPEC:PLAN:START -->
**Core Philosophy**
- Codex 负责把需求收敛成可执行、可验收、可打回的 change 计划。
- Claude 不是本阶段的主控，只是后续执行层。
- MCP、skills 都是可选增强，不是本阶段的硬前提。

**Guardrails**
- 本阶段只更新 OpenSpec artifacts，不修改产品源码。
- 必须把执行边界写清楚，避免 Claude 在执行阶段二次做产品决策。
- 当建议下一步时，始终使用 `/ccsm:*` 命令，不向用户暴露 `/opsx:*`。
- `tasks.md` 必须使用 checkbox 格式：`- [ ] X.Y description`。

**Steps**
1. 选择 change
   - 运行 `openspec list --json` 查看 active changes。
   - 确认要规划的 change id。
   - 运行 `openspec status --change "<change_id>" --json` 查看当前状态。

2. 收集上下文
   - 读取 `proposal.md`、现有 `design.md`、`specs/**/*.md`。
   - 读取与该 change 直接相关的代码上下文。
   - 如需工作目录，先通过 Bash 执行 `pwd`（Unix）或 `cd`（Windows CMD）获取 `{{WORKDIR}}`。

3. 进行 Codex 主分析
   - 必须使用 Codex 做主分析，聚焦以下内容：
     - implementation slices
     - file ownership boundaries
     - acceptance gates
     - failure return path
   - 如前端/集成问题复杂，且已配置相应模型，可选补充 `{{FRONTEND_PRIMARY}}` 分析。
   - 不再把双模型并行当作 mandatory 条件。

4. 消除歧义
   - 任何会让 Claude 在执行阶段重新做产品决策的内容，都要前置收敛。
   - 重点补全：
     - 哪些文件允许改
     - 哪些文件禁止改
     - 必须运行哪些测试/检查
     - 什么结果算通过
     - 什么情况必须打回

5. 更新 OpenSpec artifacts
   - 产出或更新 `design.md` 与 `tasks.md`。
   - `design.md` 中必须包含 `## Execution Handoff Contract` 段落。
   - `tasks.md` 中的任务拆分要能直接映射到 Claude worker 的独立任务。

**Execution Handoff Contract**
在 `design.md` 中至少包含以下结构：

```md
## Execution Handoff Contract

### Goal
<本次 change 的唯一目标>

### Required Inputs
- proposal/specs/design/tasks
- relevant code paths
- constraints and non-goals

### Allowed Change Surface
- <允许修改的文件或目录>

### Protected Surface
- <禁止修改的文件或目录>

### Work Packages
1. <包 1：目标、文件范围、完成标准>
2. <包 2：目标、文件范围、完成标准>

### Required Verification
- <必须运行的测试、lint、typecheck、手动检查>

### Return Packet
- changed files
- tests run and results
- unresolved issues
- recommended next step: accept or rework

### Rework Triggers
- spec violation
- failed tests
- scope creep
- missing verification evidence
```

6. 结束本阶段
   - 明确告诉用户：
     - 已完成计划与交接契约
     - 下一步运行 `/ccsm:spec-impl`

**Exit Criteria**
- [ ] change 已选定并加载
- [ ] 核心歧义已消除
- [ ] `design.md` 包含 `Execution Handoff Contract`
- [ ] `tasks.md` 可直接映射到执行任务
- [ ] 未修改产品源码
<!-- CCG:SPEC:PLAN:END -->
