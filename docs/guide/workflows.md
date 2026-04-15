# 工作流说明

## 默认主路径

这是当前维护的工作流：

```bash
/ccg:spec-init
/ccg:spec-research <需求>
/ccg:spec-plan
/ccg:team-plan
/ccg:team-exec
/ccg:team-review
/ccg:spec-review
openspec archive <change-id>
```

## 托管捷径

如果你希望把 Claude 调度和最终验收放进同一个循环：

```bash
/ccg:spec-impl
```

## 什么时候用 `team-*`

当 change 已经被约束清楚，并且需要把执行工作打包给 Claude Agent Teams 时，用 `team-plan / team-exec / team-review`。

## 什么时候用 `context` 和 `enhance`

- 需求还不清楚时，用 `/ccg:enhance`
- 需要记录项目决策和上下文快照时，用 `/ccg:context`

## 哪些已经不再是默认路线

下面这些不再属于维护中的产品主路径：

- wrapper 驱动执行
- 兼容型 quick flow
- 旧的 autopilot 多命令路径

仓库里可能还保留历史痕迹，但它们不是现在的产品方向。
