---
description: 'Claude Agent Teams 执行 Codex 下发的并行任务，不负责最终验收'
---
<!-- CCG:TEAM:EXEC:START -->
**Core Philosophy**
- `team-exec` 是执行层，不是主控层。
- Claude Agent Teams 负责并行实施，Codex 负责最终判断。
- 执行完成后必须把结果完整交回给 Codex。

**Guardrails**
- 必须启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`。
- 只允许使用 Agent Teams，不允许退化为普通 Agent 流程。
- 执行层不做最终 accept/reject，不做 archive。
- 每个 worker 只能修改分配给自己的文件。

**Steps**
1. 前置检查
   - 确认 `.claude/team-plan/` 下存在计划文件。
   - 若不存在，停止并提示先运行 `/ccg:team-plan`。

2. 读取计划
   - 解析 work packages、文件边界、依赖和 required verification。
   - 向用户展示即将执行的层次结构。

3. 创建 Team 并分配任务
   - 先 `TeamCreate`。
   - 再为每个 work package 创建 task。
   - 使用 `Agent(team_name=..., name=...)` 创建 Claude teammates。
   - 每个 teammate prompt 必须包含：
     - package goal
     - allowed files
     - protected files
     - local verification expectations
     - return packet format

4. 执行并监控
   - 按 layer 并行执行。
   - 只通过 Task/SendMessage 协调，不由主控直接改产品代码。
   - 若 worker 阻塞，记录阻塞原因并保留给 Codex。

5. 回收结果
   - 所有包完成后，整理 `Execution Return Packet`：

```md
## Execution Return Packet

### Completed Packages
- Package 1
- Package 2

### Changed Files
- path/to/file-a
- path/to/file-b

### Verification Performed
- test: ...
- lint: ...
- typecheck: ...

### Unresolved Issues
- ...

### Recommendation
- accept
- rework
```

6. 结束执行层
   - 关闭 teammates。
   - 将执行摘要返回给 Codex。
   - 提示下一步：`/ccg:team-review` 或 `/ccg:spec-impl`

**Exit Criteria**
- [ ] 所有 work packages 已完成或明确失败
- [ ] changed files 已汇总
- [ ] verification evidence 已汇总
- [ ] unresolved issues 已回传给 Codex
- [ ] 未执行最终 archive
<!-- CCG:TEAM:EXEC:END -->
