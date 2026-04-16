# Getting Started

## What CCG is

CCG is now maintained around one default path:

1. Codex owns orchestration.
2. OpenSpec owns the change lifecycle.
3. Claude Agent Teams execute the scoped implementation.
4. Codex reviews, tests, accepts, and archives.

The local runtime monitor is the Claude hook monitor under `~/.claude/.ccgs/claude-monitor`.

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
npx ccgs-workflow
```

Useful follow-up commands:

```bash
npx ccgs-workflow init
npx ccgs-workflow menu
npx ccgs-workflow monitor install
npx ccgs-workflow monitor hooks
npx ccgs-workflow monitor start --detach
```

## First run

The maintained flow is:

```bash
/ccgs:spec-init
/ccgs:spec-research implement a bounded feature
/ccgs:spec-plan
/ccgs:team-plan
/ccgs:team-exec
/ccgs:team-review
/ccgs:spec-review
```

If you want the managed shortcut:

```bash
/ccgs:spec-impl
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
