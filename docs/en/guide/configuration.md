# Configuration

## Installed paths

```text
~/.claude/
├── commands/ccgs/
├── agents/ccgs/
├── skills/ccgs/
├── rules/
├── settings.json
└── .ccgs/
    ├── config.toml
    ├── prompts/
    └── claude-monitor/

~/.codex/
└── skills/
    ├── ccgs-spec-init/
    ├── ccgs-spec-plan/
    └── ccgs-spec-impl/
```

## Key files

- `~/.claude/.ccgs/config.toml`: CCGS config
- `~/.claude/settings.json`: Claude env and hook config
- `~/.claude/.ccgs/claude-monitor`: local monitor runtime

## Model routing

CCG still allows routing configuration, but the maintained story is:

- Codex orchestrates
- Claude executes
- Codex reviews and accepts

Gemini remains optional for secondary analysis or prompt assets.

## Monitor runtime

The monitor is installed and managed separately from the command templates:

```bash
ccgs monitor install
ccgs monitor hooks
ccgs monitor start --detach
```

## FAQ

**The monitor page does not open**

Run:

```bash
ccgs monitor start --detach
```

**Hooks are missing**

Run:

```bash
ccgs monitor hooks
```
