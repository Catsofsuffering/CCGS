# 快速开始

## CCG 是什么

CCG 现在维护的是一条单主路径：

1. Codex 负责编排。
2. OpenSpec 负责 change 生命周期。
3. Claude Agent Teams 负责受边界约束的实现执行。
4. Codex 负责 review、测试、验收和归档。

本地运行监控面板是 `~/.claude/.ccg/claude-monitor` 下的 Claude hook monitor。

## 前置依赖

- Node.js 20+
- Codex CLI
- Claude Code CLI

可选：

- Gemini CLI
- MCP 工具
- 额外 skills

## 安装

```bash
npx ccg-workflow
```

常用后续命令：

```bash
npx ccg-workflow init
npx ccg-workflow menu
npx ccg-workflow monitor install
npx ccg-workflow monitor hooks
npx ccg-workflow monitor start --detach
```

## 第一条主流程

```bash
/ccg:spec-init
/ccg:spec-research 实现一个边界清晰的功能
/ccg:spec-plan
/ccg:team-plan
/ccg:team-exec
/ccg:team-review
/ccg:spec-review
```

如果想走托管捷径：

```bash
/ccg:spec-impl
```

## 监控面板

安装后本地监控默认地址：

```text
http://127.0.0.1:4820
```

如果还没启动：

```bash
ccg monitor start --detach
```

## 下一步

- [命令参考](/guide/commands)
- [工作流说明](/guide/workflows)
- [配置说明](/guide/configuration)
- [MCP 配置](/guide/mcp)
