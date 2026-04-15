# CCGS

<div align="center">

[![npm version](https://img.shields.io/npm/v/ccg-workflow.svg)](https://www.npmjs.com/package/ccg-workflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Primary Path](https://img.shields.io/badge/Primary%20Path-Codex%20Led-green.svg)]()

[English](./README.md) | [简体中文](./README.zh-CN.md)

</div>

CCGS is the Codex-led fork of `ccg-workflow`. In this fork, the extra `S` stands for `Spec`: OpenSpec is the backbone, Codex owns workflow progression, Claude Agent Teams handle bounded execution, and Codex performs review, testing, acceptance, and archive decisions.

This repository no longer uses the upstream README as its product story. Upstream compatibility remains valuable, but the maintained default path in this fork is:

1. Codex creates or advances the OpenSpec change.
2. Codex prepares the execution handoff contract.
3. Claude Agent Teams implement the scoped work.
4. Codex reviews the return packet, verifies results, and decides archive readiness.

## Why This Fork

- Codex is the workflow owner, not a side model behind another orchestrator.
- OpenSpec is required for the maintained path, not an optional afterthought.
- Claude remains important, but primarily as the execution layer.
- MCP, reusable skills, and Gemini are optional integrations rather than baseline requirements.
- Legacy surfaces are not part of the maintained product path.

## Primary Workflow

The recommended end-to-end flow is:

```bash
/ccg:spec-init
/ccg:spec-research <request>
/ccg:spec-plan
/ccg:team-plan
/ccg:team-exec
/ccg:team-review
/ccg:spec-review
openspec archive <change-id>
```

`/ccg:spec-impl` is the managed shortcut when you want Codex to dispatch Claude execution and keep acceptance inside the same Codex-led loop.

## Codex-Native Entrypoint

After install, CCGS also places Codex-native skills under `~/.codex/skills/`:

- `ccg-spec-init`
- `ccg-spec-plan`
- `ccg-spec-impl`

That means the maintained path can start directly inside Codex instead of relying on Claude as the shell host.

## Installation

### Prerequisites

- Node.js 20+
- Codex CLI for the primary host workflow
- Claude Code CLI for Agent Teams execution and compatibility command surfaces

Optional:

- Gemini CLI
- MCP tooling
- Extra reusable skills

### Install

```bash
npx ccg-workflow
``` 

You can also run:

```bash
npx ccg-workflow init
npx ccg-workflow monitor
npx ccg-workflow menu
npx ccg-workflow update
```

During setup, the installer asks who orchestrates the workspace before frontend/backend model selection. Codex is the recommended default, but Claude can still be selected for compatibility.

## What Gets Installed

Current install behavior keeps compatibility with existing environments:

- Claude-facing commands and assets are installed under `~/.claude/`
- Codex-native workflow skills are installed under `~/.codex/skills/`
- Workflow configuration is stored under `~/.claude/.ccg/`
- The Claude hook monitor is installed under `~/.claude/.ccg/claude-monitor`
- Claude hook entries are written into `~/.claude/settings.json`

## Repository Landmarks

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
└── skills/

openspec/
└── changes/

claude-monitor/
├── server/
├── client/
└── scripts/
```

## Architecture

```mermaid
graph TD
    User["User"] --> Codex["Codex-led workflow"]
    Codex --> OpenSpec["OpenSpec artifacts"]
    Codex --> Contract["Execution handoff contract"]
    Contract --> Claude["Claude Agent Teams"]
    Claude --> Packet["Execution return packet"]
    Packet --> Codex
    Codex --> Verify["Tests + review + acceptance"]
    Verify --> Archive["Archive"]
    Codex -. optional .-> MCP["MCP"]
    Codex -. optional .-> Skills["Skills"]
    Codex -. optional .-> Gemini["Gemini"]
```

## Contributing

- Prefer OpenSpec-first changes over direct ad hoc edits.
- Keep compatibility flows labeled as compatibility before removing them.
- Do not assume MCP, skills, or Gemini are mandatory in new product language.
- Keep the maintained path centered on Codex orchestration, Claude Agent Teams execution, and Codex review.

Project workflow and project guidance are documented in [AGENTS.md](./AGENTS.md).

## License

MIT
