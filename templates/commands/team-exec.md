---
description: "Claude Agent Teams 执行 Codex 下发的并行任务，不负责最终验收。"
---
<!-- CCG:TEAM:EXEC:START -->
**Core Philosophy**
- `team-exec` 是执行层，不是主控层。
- Claude Agent Teams 负责并行实施，Codex 负责最终判断。
- 执行完成后必须把结果完整交回给 Codex。

**Guardrails**
- 必须启用 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`。
- 在 `claude -p` 等非交互入口中，还必须启用 `CLAUDE_CODE_ENABLE_TASKS=1`，否则 `TeamCreate` / `TaskCreate` 可能不会暴露。
- 只允许使用 Agent Teams，不允许退化为普通 Agent 流程。
- 执行层不做最终 `accept` / `reject`，不做 `archive`。
- 每个 worker 只能修改分配给自己的文件。
- 在非交互 `claude -p` 会话中，必须按官方顺序关闭团队：先要求每个 teammate 优雅关闭，等待关闭确认，再清理 team。
- 一旦 cleanup 已返回成功，或明确返回 `nothing to clean up` / `no team found`，禁止在同一会话里继续重复 cleanup。
- 如果非交互会话在 cleanup 后仍然进入已知的 shutdown reminder 循环，主控宿主应将最近一次完整 `Execution Return Packet` 视为终态结果，并直接结束该 Claude 会话。
- Teammate mailbox rules are strict: before a teammate sends its first report or shutdown approval, it must load `SendMessage` with `ToolSearch select:SendMessage` if needed.
- When a teammate sends a string message, it must include both `summary` and `message`. Do not emit pseudo tool XML such as `<invoke name="SendMessage">`.

**Steps**
1. 前置检查
   - 确认 `.claude/team-plan/` 下存在计划文件。
   - 若不存在，停止并提示先运行 `/ccgs:team-plan`。
2. 读取计划
   - 解析 work packages、文件边界、依赖和 required verification。
   - 向用户展示即将执行的层次结构。
3. 创建 Team 并分配任务
   - 先 `TeamCreate`。
   - 再为每个 work package 创建 task。
   - 在 Claude 会话内使用 Agent Teams 工具创建 teammates：`TeamCreate`、`TaskCreate`、`SendMessage`、`Agent(team_name=..., name=...)`。
   - 如果这些工具是 deferred tools，先用 `ToolSearch` 拉取它们的 schema。
   - 不要假设存在独立的 `claude teammates` CLI 子命令。
   - 每个 teammate prompt 必须包含：
     - package goal
     - allowed files
     - protected files
     - local verification expectations
     - return packet format
     - mailbox return protocol: `ToolSearch select:SendMessage` before first mailbox reply when deferred, then `SendMessage` with `summary` and `message`
4. 执行并监控
   - 按 layer 并行执行。
   - 只通过 `Task*` / `SendMessage` 协调，不由主控直接改产品代码。
   - 不要把 teammate `SubagentStop` 或 idle notification 当成已完成回报。只有 team lead 实际收到 `teammate-message`，这份报告才算送达。
   - 如果 teammate 停止或 idle，但必需报告还没送达 team lead mailbox，应重发或重建 teammate，而不是无限等待。
   - 若 worker 阻塞，记录阻塞原因并回传给 Codex。
5. 回收结果
   - 所有包完成后，先整理完整的 `Execution Return Packet`，再进入 shutdown / cleanup。
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
   - 先要求 teammates 优雅关闭并等待确认。
   - 再对 team 做一次 cleanup。
   - cleanup 成功后不要重复 cleanup 重试。
   - 将执行摘要返回给 Codex。
   - 提示下一步：`/ccgs:team-review` 或 `/ccgs:spec-impl`

**Exit Criteria**
- [ ] 所有 work packages 已完成或明确失败
- [ ] changed files 已汇总
- [ ] verification evidence 已汇总
- [ ] unresolved issues 已回传给 Codex
- [ ] 未执行最终 archive
<!-- CCG:TEAM:EXEC:END -->
