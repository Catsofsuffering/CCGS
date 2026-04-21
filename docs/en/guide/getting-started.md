# Getting Started

## What CCSM is

CCSM is now maintained around one default path:

1. Codex owns orchestration.
2. OpenSpec owns the change lifecycle.
3. Claude Agent Teams execute the scoped implementation.
4. Codex reviews, tests, accepts, and archives.

The local runtime monitor is the Claude hook monitor under `~/.ccsm/claude-monitor`.

## Prerequisites

- Node.js 20+
- Codex CLI
- Claude Code CLI

Optional:

- MCP tools
- Extra reusable skills

## Install

```bash
npx ccsm
```

Useful follow-up commands:

```bash
npx ccsm init
npx ccsm menu
npx ccsm monitor install
npx ccsm monitor hooks
npx ccsm monitor start --detach
```

## First run

The maintained flow is:

```bash
/ccsm:spec-init
/ccsm:spec-research implement a bounded feature
/ccsm:spec-plan
/ccsm:team-plan
/ccsm:team-exec
/ccsm:team-review
/ccsm:spec-review
```

If you want the managed shortcut:

```bash
/ccsm:spec-impl
```

## Monitor

After installation, open the local monitor at:

```text
http://127.0.0.1:4820
```

If it is not running yet:

```bash
ccsm monitor start --detach
```

## Next

- [Command Reference](/en/guide/commands)
- [Workflow Guide](/en/guide/workflows)
- [Configuration](/en/guide/configuration)
- [MCP Configuration](/en/guide/mcp)
