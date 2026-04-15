# 配置说明

## 安装后目录

```text
~/.claude/
├── commands/ccg/
├── agents/ccg/
├── skills/ccg/
├── rules/
├── settings.json
└── .ccg/
    ├── config.toml
    ├── prompts/
    └── claude-monitor/

~/.codex/
└── skills/
    ├── ccg-spec-init/
    ├── ccg-spec-plan/
    └── ccg-spec-impl/
```

## 关键文件

- `~/.claude/.ccg/config.toml`：CCG 配置
- `~/.claude/settings.json`：Claude 环境变量和 hooks
- `~/.claude/.ccg/claude-monitor`：本地监控运行时

## 模型路由

仓库仍支持模型路由配置，但维护中的默认叙事是：

- Codex 编排
- Claude 执行
- Codex 审核与验收

Gemini 是可选增强，不再是默认流程前提。

## 监控运行时

监控运行时和命令模板分开管理：

```bash
ccg monitor install
ccg monitor hooks
ccg monitor start --detach
```

## 常见问题

**监控页打不开**

运行：

```bash
ccg monitor start --detach
```

**hooks 丢了**

运行：

```bash
ccg monitor hooks
```
