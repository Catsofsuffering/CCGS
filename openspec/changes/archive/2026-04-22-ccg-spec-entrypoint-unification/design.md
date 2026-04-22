## Context

CCSM has already converged on a Codex-led primary story, but two pieces of product surface still create avoidable friction:

- install asks users to decide on optional MCP integrations before the base workflow is ready
- Codex-native entrypoints are installed under transitional prefixed names instead of a direct top-level `spec-*` skill set

This change does not rename the package, binary, slash namespace, or runtime home again. It only simplifies the primary path:

- package / binary / runtime remain `ccsm`
- Claude slash commands remain `/ccsm:*`
- Codex-native workflow skills become top-level `spec-*`
- MCP moves entirely out of base install and into optional post-install configuration

## Goals / Non-Goals

**Goals**

- Make `ccsm init` install the primary workflow without any install-time MCP buffet.
- Preserve MCP provider state only as optional config metadata for later template injection or explicit reconfiguration.
- Install the top-level Codex workflow skills `spec-init`, `spec-research`, `spec-plan`, `spec-impl`, and `spec-review`.
- Remove maintained-source dependence on `ccsm-spec-*`, `ccgs-spec-*`, and `ccg-spec-*` as active Codex entrypoints.
- Migrate old prefixed Codex workflow skills into the new top-level names when they already exist on disk.

**Non-Goals**

- Renaming the `ccsm` package, binary, or slash-command namespace in this change.
- Removing optional MCP configuration commands from the product.
- Redesigning the broader Claude Agent Teams execution flow.

## Decisions

### Decision: Base install no longer performs MCP setup

The primary installer should only set up the maintained workflow, config, monitor runtime, and host-facing discovery surfaces.

Why:

- MCP is optional for the maintained path
- install-time MCP questions delay first-run success
- optional integrations should be configured explicitly after the base workflow is ready

Consequences:

- `init` no longer prompts for MCP providers or credentials
- `init` no longer installs `ace-tool`, `fast-context`, `context7`, `contextweaver`, or `grok-search`
- `config mcp` remains the opt-in path for later MCP setup

### Decision: Codex primary workflow skills use top-level `spec-*`

The maintained Codex-native entrypoint becomes a five-skill set installed directly under `~/.codex/skills/`:

- `spec-init`
- `spec-research`
- `spec-plan`
- `spec-impl`
- `spec-review`

Why:

- the workflow should be discoverable as the primary path, not as a transitional compatibility surface
- the OpenSpec driver should feel native inside Codex rather than split behind a product-prefixed wrapper name
- the user explicitly wants the OPSX-driven path folded into the main skill surface

### Decision: Old prefixed Codex skill names become migration-only inputs

The implementation should stop emitting:

- `ccsm-spec-init`
- `ccsm-spec-plan`
- `ccsm-spec-impl`
- `ccgs-spec-init`
- `ccgs-spec-plan`
- `ccgs-spec-impl`
- `ccg-spec-init`
- `ccg-spec-plan`
- `ccg-spec-impl`

Why:

- old entrypoints are now stale and should not survive as maintained outputs
- migration still matters for existing users with installed prefixed skills

## Implementation Approach

1. Add the OpenSpec change artifacts and update the relevant delta specs.
2. Refactor `src/commands/init.ts` to remove MCP prompts, summaries, and automatic installs.
3. Change config/install defaults so skipped MCP is the default base-install state.
4. Replace canonical Codex workflow skill names with the top-level `spec-*` set.
5. Add new skill templates for `spec-research` and `spec-review`, and move existing skill contracts into the new top-level naming.
6. Update migration logic to map old prefixed skill names into the new top-level names.
7. Update tests, menu/help/docs, and workflow guidance accordingly.

## Risks / Trade-offs

- [Risk: Existing installs lose MCP-backed template injection] -> Mitigation: preserve configured MCP provider metadata when already present in config; only remove install-time prompting and auto-install.
- [Risk: Existing users still have old prefixed Codex skills installed] -> Mitigation: migrate old skill directories into the new top-level names and remove deprecated directories on install/uninstall.
- [Risk: Product guidance mixes slash-command and Codex-skill naming] -> Mitigation: keep slash commands under `/ccsm:*`, but document Codex-native skills separately as `spec-*`.

## Execution Handoff Contract

### Goal

Make the maintained base install MCP-free and expose the Codex-native OpenSpec flow through top-level `spec-*` skills instead of `ccsm-spec-*`.

### Allowed Change Surface

- `openspec/changes/ccg-spec-entrypoint-unification/**`
- `src/commands/init.ts`
- `src/commands/menu.ts`
- `src/i18n/index.ts`
- `src/utils/config.ts`
- `src/utils/identity.ts`
- `src/utils/installer.ts`
- `src/utils/migration.ts`
- focused tests under `src/utils/__tests__/`
- `templates/codex-skills/**`
- `templates/commands/spec-*.md`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`

### Protected Surface

- unrelated monitor implementation details
- archived OpenSpec changes
- unrelated command flows outside documentation touch-ups

### Work Packages

1. Remove install-time MCP buffet and automatic MCP work from `init`.
2. Switch the canonical Codex workflow skill set to top-level `spec-*`.
3. Migrate old prefixed Codex skills into the new names and clean up deprecated outputs.
4. Update tests and docs to reflect the new primary surface.

### Required Verification

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- targeted install/migration assertions for `spec-*` skills

### Return Packet

- changed install behavior summary
- installed Codex skill surface summary
- migration mapping for old prefixed skill names
- verification results

### Rework Triggers

- `init` still prompts for or installs MCP tools
- canonical Codex workflow skills still emit `ccsm-spec-*`
- migration leaves deprecated prefixed skill directories as maintained outputs
- docs still describe `ccsm-spec-*` as the primary Codex entrypoint
