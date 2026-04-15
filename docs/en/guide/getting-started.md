# Getting Started

## What CCG is

CCG is now maintained around one default path:

1. Codex owns orchestration.
2. OpenSpec owns the change lifecycle.
3. Claude Agent Teams execute the scoped implementation.
4. Codex reviews, tests, accepts, and archives.

The local runtime monitor is the Claude hook monitor under `~/.claude/.ccg/claude-monitor`.

## Prerequisites

- Node.js 20+
- Codex CLI
- Claude Code CLI

Optional:

- Gemini CLI
- MCP tools
- Extra reusable skills

## Install

```bash
npx ccg-workflow
```

Useful follow-up commands:

```bash
npx ccg-workflow init
npx ccg-workflow menu
npx ccg-workflow monitor install
npx ccg-workflow monitor hooks
npx ccg-workflow monitor start --detach
```

## First run

The maintained flow is:

```bash
/ccg:spec-init
/ccg:spec-research implement a bounded feature
/ccg:spec-plan
/ccg:team-plan
/ccg:team-exec
/ccg:team-review
/ccg:spec-review
```

If you want the managed shortcut:

```bash
/ccg:spec-impl
```

## Monitor

After installation, open the local monitor at:

```text
http://127.0.0.1:4820
```

If it is not running yet:

```bash
ccg monitor start --detach
```

## Next

- [Command Reference](/en/guide/commands)
- [Workflow Guide](/en/guide/workflows)
- [Configuration](/en/guide/configuration)
- [MCP Configuration](/en/guide/mcp)
