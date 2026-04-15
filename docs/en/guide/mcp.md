# MCP Configuration

MCP is optional in the maintained workflow. The primary path works without it.

## What MCP is for

Use MCP when you want better codebase retrieval or library documentation lookup during research and planning.

## Supported retrieval options

- `ace-tool`
- `fast-context`
- `ContextWeaver`
- `context7`

## Configuration

Open the interactive setup:

```bash
npx ccg-workflow menu
```

Then choose `Configure MCP`.

## Sync targets

When configured, MCP settings can be synchronized to:

- `~/.codex/config.toml`
- `~/.gemini/settings.json`

This is an enhancement path. It is not required for the default Codex -> Claude Agent Teams -> Codex flow.

## Hooks

Claude hooks are now used for the local monitor, not for wrapper auto-authorization.

To repair hook setup:

```bash
ccg monitor hooks
```
