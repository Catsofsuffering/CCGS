# Configuration

## Installed paths

```text
~/.claude/
├── commands/ccsm/
├── agents/ccsm/
├── rules/
├── settings.json

~/.ccsm/
├── config.toml
├── prompts/
├── skills/
│   └── ccsm/
└── claude-monitor/

~/.codex/
└── skills/
    ├── ccsm-spec-init/
    ├── ccsm-spec-plan/
    └── ccsm-spec-impl/
```

## Key files

- `~/.ccsm/config.toml`: CCSM config
- `~/.claude/settings.json`: Claude env and hook config
- `~/.ccsm/claude-monitor`: local monitor runtime

## Model routing

CCSM still allows routing configuration, but the maintained story is:

- Codex orchestrates
- Claude executes
- Codex reviews and accepts

Only the maintained Codex/Claude prompt and host surfaces are bundled by default.

## Monitor runtime

The monitor is installed and managed separately from the command templates:

```bash
ccsm monitor install
ccsm monitor hooks
ccsm monitor start --detach
```

## FAQ

**The monitor page does not open**

Run:

```bash
ccsm monitor start --detach
```

**Hooks are missing**

Run:

```bash
ccsm monitor hooks
```
