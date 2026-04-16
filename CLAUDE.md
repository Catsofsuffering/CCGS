# CCG Repository Guide

**Last Updated**: 2026-04-15  
**Status**: Codex-led primary path

## Product Story

CCG is maintained around one default workflow:

1. Codex owns workflow orchestration.
2. OpenSpec owns change artifacts and lifecycle.
3. Claude Agent Teams execute bounded implementation work.
4. Codex performs review, testing, acceptance, and archive decisions.

The maintained local runtime monitor is the Claude hook monitor under `~/.claude/.ccgs/claude-monitor`.

## Maintained Command Surface

Primary path:

- `/ccgs:spec-init`
- `/ccgs:spec-research`
- `/ccgs:spec-plan`
- `/ccgs:team-plan`
- `/ccgs:team-exec`
- `/ccgs:team-review`
- `/ccgs:spec-review`
- `/ccgs:spec-impl`

Utility commands:

- `/ccgs:context`
- `/ccgs:enhance`
- `/ccgs:commit`
- `/ccgs:rollback`
- `/ccgs:clean-branches`
- `/ccgs:worktree`
- `/ccgs:init`

## Runtime Notes

- Do not add binary download logic back into the installer.
- Local monitoring must go through Claude hooks plus `claude-monitor/`.
- Codex-native skills remain first-class and install into `~/.codex/skills/`.

## Repository Layout

```text
src/
├── commands/
├── utils/
└── i18n/

templates/
├── commands/
├── prompts/
├── codex-skills/
└── skills/

claude-monitor/
├── client/
├── server/
└── scripts/

openspec/
└── changes/
```

## Release Rules

For every release:

1. Update `package.json` version.
2. Update `CHANGELOG.md`.
3. Update `README.md` and `README.zh-CN.md`.
4. Update `AGENTS.md` and this file when product story or command surface changes.
5. Run:

```bash
pnpm typecheck
pnpm build
pnpm test
```

## Contribution Guidance

- Prefer OpenSpec-first changes.
- Keep the Codex-led path as the default story in docs and templates.
- Treat Gemini, MCP, and extra skills as optional layers.
- Keep installer behavior aligned with the Claude monitor runtime.
