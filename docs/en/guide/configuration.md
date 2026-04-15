# Configuration

## Installed paths

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

## Key files

- `~/.claude/.ccg/config.toml`: CCG config
- `~/.claude/settings.json`: Claude env and hook config
- `~/.claude/.ccg/claude-monitor`: local monitor runtime

## Model routing

CCG still allows routing configuration, but the maintained story is:

- Codex orchestrates
- Claude executes
- Codex reviews and accepts

Gemini remains optional for secondary analysis or prompt assets.

## Monitor runtime

The monitor is installed and managed separately from the command templates:

```bash
ccg monitor install
ccg monitor hooks
ccg monitor start --detach
```

## FAQ

**The monitor page does not open**

Run:

```bash
ccg monitor start --detach
```

**Hooks are missing**

Run:

```bash
ccg monitor hooks
```
