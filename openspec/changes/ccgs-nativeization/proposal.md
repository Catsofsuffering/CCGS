## Why

The repository already presents itself as `CCGS` in selected top-level docs, but the maintained source still carries a broad `ccg` identity across package metadata, CLI/bin names, slash commands, Codex skills, installer paths, runtime directories, rule files, logo assets, and workflow copy.

That split identity is now a product problem rather than a cosmetic issue:

- the original upstream project has been deleted, so upstream-shaped `ccg` surfaces now read like stale shadows rather than active compatibility anchors
- the maintained fork wants to be more natively `ccgs`, not a lightly renamed wrapper around deleted upstream assets
- command, skill, runtime, and install surfaces still teach users to think in `ccg` terms even when docs already say `CCGS`
- workflow execution and generated assets still encode `ccg`-owned paths such as `.ccg`, `skills/ccg`, and `/ccg:*`

This change creates a dedicated plan for a repository-wide nativeization pass so the product can present one coherent identity: `CCGS` is the canonical project, while any temporary `ccg` aliases are explicit migration bridges rather than the default story.

## What Changes

- Define `CCGS` as the canonical product identity across package metadata, CLI entrypoints, slash commands, docs, workflow language, skills, templates, rules, and generated assets.
- Replace maintained `ccg` naming and path ownership with `ccgs`-owned surfaces wherever the project is still exposing deleted-upstream shadows by default.
- Introduce an explicit compatibility strategy for any retained `ccg` aliases so they are clearly marked as migration-only and no longer shape the primary workflow story.
- Migrate runtime and installation conventions away from `.ccg` and other `ccg`-owned directories toward `ccgs`-owned paths, while preserving a bounded migration path for existing installs if needed.
- Audit maintained docs, prompts, workflow templates, and logo/brand assets so they stop referring to the old project as the living canonical surface.
- Add verification coverage that prevents new maintained source from accidentally reintroducing canonical `ccg` naming outside explicitly allowed compatibility or historical contexts.

## Capabilities

### New Capabilities

- `ccgs-native-identity`: Defines `CCGS` as the canonical user-facing project identity and requires compatibility language to be explicitly labeled instead of silently inheriting deleted-upstream naming.
- `ccgs-command-and-skill-surface`: Defines the native command, skill, and template namespace expected from the maintained fork, including default `ccgs` naming and bounded `ccg` compatibility aliases.
- `ccgs-runtime-layout`: Defines the runtime-owned path layout, generated install targets, and migration expectations for moving from `ccg`-owned directories to `ccgs`-owned directories.

### Modified Capabilities

- `codex-orchestrated-workflow`: The Codex-led workflow remains the primary control model, but its command and execution surfaces now need to be expressed with `ccgs`-native naming rather than upstream `ccg` framing.
- `claude-execution-dispatch`: Claude stays the downstream execution layer, but command contracts, prompts, and return packets need to align with `ccgs`-native naming and install layout.
- `optional-integrations`: Optional integrations remain optional, but their docs, skill paths, and generated runtime references must stop assuming deleted-upstream `ccg` ownership.

## Impact

- Affected code: `package.json`, `bin/`, `src/commands/`, `src/utils/`, install/config helpers, workflow metadata, and any runtime path constants.
- Affected templates: `templates/commands/`, `templates/codex-skills/`, `templates/prompts/`, `templates/rules/`, and `templates/skills/`.
- Affected assets: `assets/logo/` and any generated output or references that still publish `ccg` filenames as the canonical brand.
- Affected docs: `README.md`, `README.zh-CN.md`, `AGENTS.md`, `CLAUDE.md`, release notes for the current change, and any maintained guidance surfaced to users.
- Affected verification: tests/build checks that currently allow `ccg` as the default identity, plus new checks to prevent identity regressions.
