# 快速开始

## CCSM 是什么

CCSM 现在维护的是一条单主路径：

1. Codex 负责编排。
2. OpenSpec 负责 change 生命周期。
3. Claude Agent Teams 负责受边界约束的实现执行。
4. Codex 负责 review、测试、验收和归档。

本地运行监控面板是 `~/.ccsm/claude-monitor` 下的 Claude hook monitor。

## 前置依赖

- Node.js 20+
- Codex CLI
- Claude Code CLI

可选：

- MCP 工具
- 额外 skills

## 安装

```bash
npx ccsm
```

常用后续命令：

```bash
npx ccsm init
npx ccsm menu
npx ccsm monitor install
npx ccsm monitor hooks
npx ccsm monitor start --detach
```

## 第一条主流程

```bash
/ccsm:spec-init
/ccsm:spec-research 实现一个边界清晰的功能
/ccsm:spec-plan
/ccsm:team-plan
/ccsm:team-exec
/ccsm:team-review
/ccsm:spec-review
```

如果想走托管捷径：

```bash
/ccsm:spec-impl
```

## 监控面板

安装后本地监控默认地址：

```text
http://127.0.0.1:4820
```

如果还没启动：

```bash
ccsm monitor start --detach
```

## 下一步

- [命令参考](/guide/commands)
- [工作流说明](/guide/workflows)
- [配置说明](/guide/configuration)
- [MCP 配置](/guide/mcp)
