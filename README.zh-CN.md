# CCGS

`ccg-workflow` 的 Codex 主控分支。

当前主路径已经收敛为：

1. Codex 负责 change 创建、推进和验收。
2. Codex 产出受边界约束的执行交接包。
3. Claude Agent Teams 负责实现执行。
4. Codex 负责 review、测试、acceptance 和 archive。

`MCP`、skills、Gemini 仍可作为增强层使用，但它们不再是主路径前提。

## 主工作流

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

如果你希望从 Codex 里直接把 Claude 执行和最终验收串起来，可以使用：

```bash
/ccg:spec-impl
```

## Codex 原生入口

安装后会把以下 skills 放到 `~/.codex/skills/`：

- `ccg-spec-init`
- `ccg-spec-plan`
- `ccg-spec-impl`

这意味着主路径可以直接从 Codex 启动，不需要把 Claude 作为宿主入口。

## 安装

前置依赖：

- Node.js 20+
- Codex CLI
- Claude Code CLI

安装命令：

```bash
npx ccg-workflow
```

也可以显式执行：

```bash
npx ccg-workflow init
npx ccg-workflow menu
npx ccg-workflow update
npx ccg-workflow monitor install
npx ccg-workflow monitor hooks
npx ccg-workflow monitor start --detach
```

## 安装结果

当前默认会安装这些资产：

- Claude 侧命令、prompts、rules、skills 到 `~/.claude/`
- Codex 原生 workflow skills 到 `~/.codex/skills/`
- Claude monitor 到 `~/.claude/.ccg/claude-monitor`
- Claude hooks 写入 `~/.claude/settings.json`

当前维护的本地监控面板是 Claude hook monitor。

## 仓库结构

```text
src/
├── cli.ts
├── cli-setup.ts
├── commands/
├── utils/
└── i18n/

templates/
├── commands/
├── prompts/
├── codex-skills/
└── skills/

openspec/
└── changes/

claude-monitor/
├── client/
├── server/
└── scripts/
```

## 架构

```mermaid
graph TD
    User["用户"] --> Codex["Codex-led workflow"]
    Codex --> OpenSpec["OpenSpec artifacts"]
    Codex --> Contract["Execution handoff contract"]
    Contract --> Claude["Claude Agent Teams"]
    Claude --> Packet["Execution return packet"]
    Packet --> Codex
    Codex --> Verify["Tests + review + acceptance"]
    Verify --> Archive["Archive"]
    Claude --> Monitor["Claude hook monitor"]
```

## 维护说明

- 优先使用 OpenSpec 驱动变更，而不是直接做无边界修改。
- 删除旧入口前，先把产品叙事、命令集和安装行为切到新路径。
- 新增文档不要把旧兼容命令或多模型并行当成默认前提。

更完整的协作规则见 [AGENTS.md](./AGENTS.md)。

## License

MIT
