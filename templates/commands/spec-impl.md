---
description: 'Codex 调度 Claude 执行，并在通过验收后决定 archive'
---
<!-- CCG:SPEC:IMPL:START -->
**Core Philosophy**
- Codex 负责推进 change、分发执行、回收结果、测试验收、决定 archive。
- Claude 负责执行，不负责最终验收，不负责最终归档决策。
- 验收失败时，必须形成明确 rework packet 并打回执行层。

**Guardrails**
- 不直接把外部模型输出当成最终实现。
- 不在验收通过前 archive。
- 当建议下一步时，始终使用 `/ccg:*` 命令。
- `tasks.md` 必须持续保持 checkbox 格式。

**Steps**
1. 选择 change
   - 运行 `openspec list --json`。
   - 确认 change id。
   - 运行 `openspec status --change "<change_id>" --json`。

2. 进入实现前检查
   - 内部调用 `/opsx:apply` 进入实现上下文。
   - 若 state 为 `blocked` 或 tasks 不可解析，停止并提示重新运行 `/ccg:spec-plan`。

3. 读取执行契约
   - 读取 `proposal.md`、`design.md`、`tasks.md`、`specs/**/*.md`。
   - 从 `design.md` 中提取 `Execution Handoff Contract`。
   - 明确：
     - allowed/protected surface
     - work packages
     - required verification
     - rework triggers

4. 调度 Claude 执行
   - 如果还没有执行计划，先运行 `/ccg:team-plan`，基于 handoff contract 生成 Claude Agent Teams 计划。
   - 然后运行 `/ccg:team-exec` 让 Claude Agent Teams 干活。
   - Claude 返回后，必须回收一份 return packet，至少包含：
     - changed files
     - tests run
     - unresolved issues
     - suggested accept/rework

5. Codex 进行验收
   - 基于 return packet、自身代码审查和本地验证做验收。
   - 运行 handoff contract 里要求的测试/检查。
   - 必要时运行 `/ccg:spec-review` 作为独立验收门禁。

6. 失败时打回
   - 若出现任一情况，必须打回执行层：
     - 规格不满足
     - 测试失败
     - 变更越界
     - 缺少验证证据
   - 输出 `Rework Packet`，至少包含：
     - failed checks
     - violated constraints
     - files requiring rework
     - specific return conditions
   - 指示下一步：`/ccg:team-exec` 或 `/ccg:spec-impl`

7. 通过时归档
   - 仅当 Codex 验收通过时，才允许 archive。
   - 归档前确保 `tasks.md` 已全部完成。
   - 内部调用 `/opsx:archive` 完成归档。

**Output Shape**
成功时：

```md
## Acceptance Passed

- change: <change_id>
- verification: passed
- archive: approved
```

失败时：

```md
## Acceptance Failed

### Rework Packet
- failed check: ...
- violated constraint: ...
- file scope: ...
- required fix: ...

Next: /ccg:team-exec
```

**Exit Criteria**
- [ ] Claude 执行结果已回流给 Codex
- [ ] Codex 已完成必需验证
- [ ] 失败时已形成 rework packet 并打回
- [ ] 通过时 change 已 archive
<!-- CCG:SPEC:IMPL:END -->
