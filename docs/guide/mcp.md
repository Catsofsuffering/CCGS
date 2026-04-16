# MCP 配置

MCP 在当前维护路径里是可选增强，不是必需前提。

## 用途

当你希望研究和规划阶段获得更强的代码检索或库文档能力时，再配置 MCP。

## 支持的检索方案

- `ace-tool`
- `fast-context`
- `ContextWeaver`
- `context7`

## 配置方式

打开交互式菜单：

```bash
npx ccgs-workflow menu
```

然后选择 `配置 MCP`。

## 同步目标

配置完成后，MCP 可以同步到：

- `~/.codex/config.toml`
- `~/.gemini/settings.json`

这属于增强路径，不影响默认的 `Codex -> Claude Agent Teams -> Codex` 主流程。

## Hooks

Claude hooks 现在主要用于本地 monitor，而不是给 wrapper 自动放行。

如果 hooks 需要修复：

```bash
ccg monitor hooks
```
