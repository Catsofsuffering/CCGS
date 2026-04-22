## Why

The current primary install and Codex entry surface still reflects an older transition state:

- `ccsm init` still opens an install-time MCP buffet, collects provider credentials, and attempts MCP installation during the base workflow setup
- the maintained Codex-native workflow entry still uses `ccsm-spec-init`, `ccsm-spec-plan`, and `ccsm-spec-impl` instead of one direct top-level `spec-*` surface
- OPSX / OpenSpec progression is still mentally split between the maintained CCSM workflow and a separate prefixed Codex skill surface, which keeps the primary path less direct than it needs to be

The maintained primary path should now be simpler:

1. install the workflow without requiring MCP decisions
2. let MCP remain optional post-install configuration
3. expose the Codex-native OpenSpec driver directly as top-level `spec-*` skills
4. treat old `ccsm-spec-*`, `ccgs-spec-*`, and `ccg-spec-*` names as migration-only history rather than maintained entrypoints

## What Changes

- Remove install-time MCP selection, credential prompts, automatic MCP installs, and MCP sync from `ccsm init`.
- Keep MCP as an optional later configuration path rather than part of base installation.
- Replace the maintained Codex-native primary skill surface with:
  - `spec-init`
  - `spec-research`
  - `spec-plan`
  - `spec-impl`
  - `spec-review`
- Fold the OpenSpec driver guidance into that main Codex skill set so the default Codex entry path no longer depends on `ccsm-spec-*` naming.
- Treat prior prefixed Codex skill names as deprecated migration inputs to be cleaned up or migrated into the new top-level skill names.

## Capabilities

### Modified Capabilities

- `codex-workflow-orchestration`: the primary Codex-driven workflow entry is exposed through the top-level `spec-*` skill set.
- `ccgs-command-and-skill-surface`: maintained Codex workflow skills no longer use `ccsm-spec-*` naming and old prefixed skill names are removed from maintained outputs.
- `optional-integrations`: the default install path no longer includes MCP buffet selection or automatic MCP setup.

## Impact

- Affected code: `src/commands/init.ts`, installer/config defaults, identity constants, migration logic, and Codex skill installation.
- Affected templates: `templates/codex-skills/`, `templates/commands/spec-*.md`.
- Affected docs: `AGENTS.md`, `README.md`, `README.zh-CN.md`, menu/help/i18n strings.
- Affected verification: installer, migration, and Codex-skill tests.
