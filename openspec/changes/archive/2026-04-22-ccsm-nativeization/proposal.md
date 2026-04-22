## Why

The current in-progress nativeization work moves the maintained surface from legacy `ccg` naming to `ccgs`, but that target no longer matches the maintained product direction.

The new canonical identity needs to be `CCSM`, not `CCGS`:

- the remaining `g` in `ccgs` still carries the old Gemini-era naming baggage even though Gemini has already been removed from the maintained path
- maintained package, binary, runtime, and template surfaces still expose deleted-upstream `ccg` or transitional `ccgs` defaults instead of one final identity
- current installer logic still ties runtime ownership to `~/.codex` or `~/.claude`, which mixes host discovery surfaces with shared workflow data and leaves no single native `~/.ccsm` home
- Codex-installed workflow skills are not clearly audited against the Claude-installed skill surface, so it is hard to tell whether capability gaps come from missing templates, missing mirroring, or incorrect install targets

This change defines the final nativeization pass: remove redundant `ccg` defaults, stop shipping `ccg-workflow` or `ccgs-workflow` as maintained package identities, promote `ccsm` as the canonical surface, keep `.codex` and `.claude` minimally host-native for discovery, and establish `~/.ccsm` as a native maintained home that can be discovered and used directly.

## What Changes

- Define `CCSM` as the canonical maintained project identity across package metadata, CLI/bin names, command namespaces, skill names, docs, prompts, templates, and generated assets.
- Remove maintained default use of `ccg` and `ccgs`, and stop emitting deprecated alias entrypoints in maintained installs.
- Replace maintained `ccgs-workflow` and other `ccgs`-owned canonical identifiers with `ccsm`-owned equivalents.
- Separate canonical ownership from host compatibility:
  - define `~/.ccsm` as the canonical maintained home for shared runtime data and native maintained usage
  - keep only the host-specific discovery surfaces that Codex or Claude truly require under `.codex` and `.claude`
  - avoid broad duplication when a thin shim, pointer, wrapper, or mirrored entrypoint is enough to preserve host-native invocation
- Specify how `.ccsm` is natively discoverable and directly usable rather than existing only as an internal data directory.
- Audit template inventory, installer behavior, and installed host surfaces to identify workflow skills or reusable skills that exist only on the Claude side and are missing from Codex parity where parity is expected.
- Define which skills are host-native wrappers, which assets are shared runtime resources, and how both hosts resolve shared `~/.ccsm` data without breaking invocation.
- Add migration-safe handling from `ccg` and `ccgs` paths into `ccsm`, including package, binary, runtime, and skill-surface transitions.

## Capabilities

### New Capabilities

- `ccsm-project-identity`: Defines `CCSM` as the canonical maintained identity and forbids `ccg` or `ccgs` from remaining the silent default.
- `ccsm-host-compatibility-surface`: Defines the minimal host-facing entrypoints or mirrors required under `.codex` and `.claude` without letting those homes remain the canonical source of truth.
- `ccsm-runtime-layout`: Defines `~/.ccsm` as the canonical maintained home for monitor, prompts, config, backups, and related workflow data, and requires that it be directly usable rather than treated as passive storage only.

### Modified Capabilities

- `command-and-package-surface`: Canonical package, binary, and command names move from `ccgs` to `ccsm`, and deprecated `ccg` / `ccgs` entrypoints are removed from maintained outputs.
- `skill-installation-and-sync`: Skill installation must be audited for Codex/Claude parity and must distinguish canonical `~/.ccsm` assets from host-facing discovery surfaces.
- `runtime-migration`: Migration logic must account for both legacy `ccg` paths and transitional `ccgs` paths when upgrading to `ccsm`.

## Impact

- Affected code: identity constants, package/bin metadata, installer/runtime path helpers, migration logic, skill installation, host resolution, monitor setup, and tests.
- Affected templates: `templates/codex-skills/`, `templates/commands/`, `templates/prompts/`, `templates/rules/`, and any generated instructions that still reference `ccg` or `ccgs` as canonical.
- Affected docs: `README.md`, `README.zh-CN.md`, `AGENTS.md`, release notes, migration guidance, and any contributor instructions that still describe the wrong canonical identity.
- Affected verification: regression checks must flag new canonical `ccg` / `ccgs` defaults outside migration-only or historical contexts.
