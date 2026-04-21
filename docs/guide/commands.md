# 命令参考

CCSM 现在维护的是一组更小、更明确的命令面，围绕 Codex 主控路径展开。

## 主路径命令

| 命令 | 作用 |
|------|------|
| `/ccsm:spec-init` | 初始化或修复 OpenSpec 工作区 |
| `/ccsm:spec-research` | 把需求整理为约束和 change 输入 |
| `/ccsm:spec-plan` | 生成执行交接契约 |
| `/ccsm:team-plan` | 把范围明确的工作拆成执行包 |
| `/ccsm:team-exec` | 让 Claude Agent Teams 按边界实施 |
| `/ccsm:team-review` | 在验收前检查执行回包 |
| `/ccsm:spec-review` | Codex 最终验收门禁 |
| `/ccsm:spec-impl` | 把调度和验收串起来的托管捷径 |

## 工具命令

| 命令 | 作用 |
|------|------|
| `/ccsm:context` | 管理项目上下文和决策日志 |
| `/ccsm:enhance` | 把模糊需求整理成清晰任务 |
| `/ccsm:init` | 生成项目级 `CLAUDE.md` |
| `/ccsm:commit` | 根据当前改动生成提交信息 |
| `/ccsm:rollback` | 交互式回滚 |
| `/ccsm:clean-branches` | 安全清理分支 |
| `/ccsm:worktree` | 管理 Git worktree |

## 示例

```bash
/ccsm:spec-init
/ccsm:spec-research 给发票系统增加审批流
/ccsm:spec-plan
/ccsm:team-plan
/ccsm:team-exec
/ccsm:team-review
/ccsm:spec-review
```
