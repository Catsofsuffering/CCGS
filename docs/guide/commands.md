# 命令参考

CCG 现在维护的是一组更小、更明确的命令面，围绕 Codex 主控路径展开。

## 主路径命令

| 命令 | 作用 |
|------|------|
| `/ccg:spec-init` | 初始化或修复 OpenSpec 工作区 |
| `/ccg:spec-research` | 把需求整理为约束和 change 输入 |
| `/ccg:spec-plan` | 生成执行交接契约 |
| `/ccg:team-plan` | 把范围明确的工作拆成执行包 |
| `/ccg:team-exec` | 让 Claude Agent Teams 按边界实施 |
| `/ccg:team-review` | 在验收前检查执行回包 |
| `/ccg:spec-review` | Codex 最终验收门禁 |
| `/ccg:spec-impl` | 把调度和验收串起来的托管捷径 |

## 工具命令

| 命令 | 作用 |
|------|------|
| `/ccg:context` | 管理项目上下文和决策日志 |
| `/ccg:enhance` | 把模糊需求整理成清晰任务 |
| `/ccg:init` | 生成项目级 `CLAUDE.md` |
| `/ccg:commit` | 根据当前改动生成提交信息 |
| `/ccg:rollback` | 交互式回滚 |
| `/ccg:clean-branches` | 安全清理分支 |
| `/ccg:worktree` | 管理 Git worktree |

## 示例

```bash
/ccg:spec-init
/ccg:spec-research 给发票系统增加审批流
/ccg:spec-plan
/ccg:team-plan
/ccg:team-exec
/ccg:team-review
/ccg:spec-review
```
