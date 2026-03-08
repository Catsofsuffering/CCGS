# CCG - Claude + Codex + Gemini Multi-Model Collaboration

<div align="center">

[![npm version](https://img.shields.io/npm/v/ccg-workflow.svg)](https://www.npmjs.com/package/ccg-workflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-green.svg)](https://claude.ai/code)

[简体中文](./README.zh-CN.md) | English

</div>

A multi-model collaboration development system where Claude Code orchestrates Codex + Gemini. Frontend tasks route to Gemini, backend tasks route to Codex, and Claude handles orchestration and code review.

## Installation

```bash
npx ccg-workflow
```

**Requirements**: Claude Code CLI, Node.js 20+

> **Important**: This project depends on `ora@9.x` and `string-width@8.x`, which require Node.js >= 20. Using Node.js 18 will cause `SyntaxError: Invalid regular expression flags`. Please upgrade to Node.js 20 or higher.

**Optional**: Codex CLI (backend), Gemini CLI (frontend)

## First-Time Setup

On first run, CCG will prompt you to select your preferred language (English or Chinese). This preference is saved and used for all subsequent sessions.

## Commands

| Command | Description |
|---------|-------------|
| `/ccg:workflow` | Full 6-phase development workflow |
| `/ccg:plan` | Multi-model collaborative planning (Phase 1-2) |
| `/ccg:execute` | Multi-model collaborative execution (Phase 3-5) |
| `/ccg:feat` | Smart feature development |
| `/ccg:frontend` | Frontend tasks (Gemini) |
| `/ccg:backend` | Backend tasks (Codex) |
| `/ccg:analyze` | Technical analysis |
| `/ccg:debug` | Problem diagnosis |
| `/ccg:optimize` | Performance optimization |
| `/ccg:test` | Test generation |
| `/ccg:review` | Code review |
| `/ccg:commit` | Git commit |
| `/ccg:rollback` | Git rollback |
| `/ccg:clean-branches` | Clean branches |
| `/ccg:worktree` | Worktree management |
| `/ccg:init` | Initialize CLAUDE.md |
| `/ccg:enhance` | Prompt enhancement |
| `/ccg:spec-init` | Initialize OPSX environment |
| `/ccg:spec-research` | Requirements → Constraints |
| `/ccg:spec-plan` | Constraints → Zero-decision plan |
| `/ccg:spec-impl` | Execute plan + archive |
| `/ccg:spec-review` | Dual-model cross-review |
| `/ccg:team-research` | Agent Teams requirements → constraints |
| `/ccg:team-plan` | Agent Teams constraints → parallel plan |
| `/ccg:team-exec` | Agent Teams parallel execution |
| `/ccg:team-review` | Agent Teams dual-model review |

### OPSX Spec-Driven (v1.7.52+)

Integrates [OPSX architecture](https://github.com/fission-ai/opsx) to turn requirements into constraints, eliminating AI improvisation:

```bash
# Initialize OPSX environment
/ccg:spec-init

# Research requirements → output constraints
/ccg:spec-research implement user authentication

# Parallel analysis → zero-decision plan
/ccg:spec-plan

# Execute the plan
/ccg:spec-impl

# Independent review (available anytime)
/ccg:spec-review
```

**Note**: `/ccg:spec-*` commands are CCG's wrapper around OPSX, internally calling `/opsx:*` commands. You can `/clear` between phases — state is persisted in the `openspec/` directory, so context overflow is not a concern.

### Agent Teams Parallel Execution (v1.7.60+)

Leverage Claude Code Agent Teams experimental feature to spawn multiple Builder teammates for parallel coding:

```bash
# 1. Requirements research → constraints (recommended for complex projects)
/ccg:team-research implement real-time collaboration kanban API

# 2. /clear then plan → zero-decision parallel plan
/ccg:team-plan kanban-api

# 3. /clear then parallel execution → Builder teammates write code in parallel
/ccg:team-exec

# 4. /clear then review → dual-model cross-review
/ccg:team-review
```

**Prerequisite**: Manually enable Agent Teams (`settings.json`: set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)

**vs Traditional Workflow**: Team series uses `/clear` between steps to isolate context, passing state through files. Builders work in parallel, ideal for tasks decomposable into 3+ independent modules.

### Planning & Execution Separation

```bash
# 1. Generate implementation plan
/ccg:plan implement user authentication

# 2. Review the plan (editable)
# Plan saved to .claude/plan/user-auth.md

# 3. Execute the plan (works in new sessions too)
/ccg:execute .claude/plan/user-auth.md
```

## Configuration

### Directory Structure

```
~/.claude/
├── commands/ccg/       # Slash commands
├── agents/ccg/         # Sub-agents
├── bin/codeagent-wrapper
└── .ccg/
    ├── config.toml
    └── prompts/{codex,gemini}/
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CODEAGENT_POST_MESSAGE_DELAY` | Wait time after Codex completion (seconds) | 5 |
| `CODEX_TIMEOUT` | codeagent-wrapper execution timeout (seconds) | 7200 |
| `BASH_DEFAULT_TIMEOUT_MS` | Claude Code Bash default timeout (ms) | 120000 |
| `BASH_MAX_TIMEOUT_MS` | Claude Code Bash max timeout (ms) | 600000 |

Configuration in `~/.claude/settings.json`:

```json
{
  "env": {
    "CODEAGENT_POST_MESSAGE_DELAY": "1",
    "CODEX_TIMEOUT": "7200",
    "BASH_DEFAULT_TIMEOUT_MS": "600000",
    "BASH_MAX_TIMEOUT_MS": "3600000"
  }
}
```

### codeagent-wrapper Auto-Authorization

CCG automatically installs a Hook in `settings.json` to auto-authorize codeagent-wrapper commands, so you don't have to manually approve each collaboration call.

**Requirement**: `jq` must be installed on your system.

```bash
# macOS
brew install jq

# Linux (Debian/Ubuntu)
sudo apt install jq

# Linux (RHEL/CentOS)
sudo yum install jq

# Windows
choco install jq
# or
scoop install jq
```

### MCP Configuration

Code retrieval MCP (choose one):
- **ContextWeaver** (recommended) - Local hybrid search, requires SiliconFlow API Key (free)
- **ace-tool** (paid) - Augment official, Token: https://augmentcode.com/

Optional MCP tools:
- **Context7** - Latest library documentation
- **Playwright** - Browser automation/testing
- **DeepWiki** - Knowledge base queries
- **Exa** - Search engine (requires API Key)

```bash
# Configure MCP
npx ccg-workflow menu  # Select "Configure MCP"
```

## Tools

```bash
npx ccg-workflow menu  # Select "Tools"
```

- **ccusage** - Claude Code usage analytics
- **CCometixLine** - Status bar tool (Git + usage tracking)

## Install Claude Code

```bash
npx ccg-workflow menu  # Select "Install Claude Code"
```

Supports multiple installation methods: npm, homebrew, curl, powershell, cmd

## Update / Uninstall

```bash
# Update
npx ccg-workflow@latest          # npx users
npm install -g ccg-workflow@latest  # npm global users

# Uninstall
npx ccg-workflow  # Select "Uninstall"
npm uninstall -g ccg-workflow  # npm global users need this extra step
```

## FAQ

### 1. How to auto-authorize codeagent-wrapper without manual approval?

CCG automatically installs the Hook during setup (v1.7.69+). If you installed an older version, add this to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' | grep -q 'codeagent-wrapper' && echo '{\"hookSpecificOutput\": {\"hookEventName\": \"PreToolUse\", \"permissionDecision\": \"allow\", \"permissionDecisionReason\": \"codeagent-wrapper auto-approved\"}}' || exit 1",
            "timeout": 1
          }
        ]
      }
    ]
  }
}
```

> **Note**: Requires `jq` installed on your system. See [codeagent-wrapper Auto-Authorization](#codeagent-wrapper-auto-authorization) for install instructions.

### 2. Codex CLI 0.80.0 process does not exit

In `--json` mode, Codex does not automatically exit after output completion.

Fix: Set `CODEAGENT_POST_MESSAGE_DELAY=1`

## Architecture

```
Claude Code (Orchestrator)
       │
   ┌───┴───┐
   ↓       ↓
Codex   Gemini
(Backend) (Frontend)
   │       │
   └───┬───┘
       ↓
  Unified Patch
```

External models have no write access — they only return patches, which Claude reviews before applying.

## Credits

- [cexll/myclaude](https://github.com/cexll/myclaude) - codeagent-wrapper
- [UfoMiao/zcf](https://github.com/UfoMiao/zcf) - Git tools
- [GudaStudio/skills](https://github.com/GuDaStudio/skills) - Routing design
- [ace-tool](https://linux.do/t/topic/1344562) - MCP tool

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=fengshao1227/ccg-workflow&type=timeline&legend=top-left)](https://www.star-history.com/#fengshao1227/ccg-workflow&type=timeline&legend=top-left)

## License

MIT

---

v1.7.69 | [Issues](https://github.com/fengshao1227/ccg-workflow/issues)
