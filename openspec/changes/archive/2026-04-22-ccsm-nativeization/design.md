## Context

The repository has an unfinished identity migration in flight:

- historical `ccg` defaults still remain in compatibility and source surfaces
- the current maintained default has already shifted many places to `ccgs`
- the requested end-state is now `ccsm`, not `ccgs`
- installer/runtime logic still mixes canonical ownership with host-specific discovery under `.codex` and `.claude`
- skill inventory is split across template sources and installed host directories, making it unclear whether Codex/Claude parity gaps are intentional or accidental

The planning problem is not just renaming strings. The repository needs one canonical maintained home and one explicit host-compatibility model:

1. `~/.ccsm` must become the canonical maintained home and be directly usable.
2. `.codex` and `.claude` must keep only the minimum surfaces their hosts need for native discovery and invocation.
3. Deprecated `ccg` and `ccgs` surfaces may be read for migration, but they must not remain installable entrypoints.

## Goals / Non-Goals

**Goals**

- Make `CCSM` the only canonical maintained identity across package, binary, namespace, workflow, runtime, and docs.
- Remove default `ccg` and transitional `ccgs` surfaces from maintained source and stop generating them as maintained entrypoints.
- Establish `~/.ccsm` as the canonical maintained home for config, prompts, monitor assets, backups, generated plans, and canonical skill content.
- Preserve host-native usability by keeping the minimum required discovery surfaces under `.codex` and `.claude`.
- Define how `.ccsm` is directly usable without requiring a host-specific shadow install to function.
- Audit skill inventory and installation parity so any Codex/Claude mismatch is either fixed or documented as an intentional host-specific exception.
- Produce a bounded implementation contract that can be handed off without re-opening product decisions.

**Non-Goals**

- Rewriting archived history to erase factual `ccg` or `ccgs` references.
- Reworking the overall OpenSpec or Claude execution architecture.
- Fully removing every host-owned file under `.codex` or `.claude`; some discovery hooks remain necessary.
- Implementing product code during this planning step.

## Decisions

### Decision: `CCSM` is the final canonical maintained identity

All maintained default surfaces should present `CCSM` / `ccsm` as canonical. `ccg` and `ccgs` may exist only as migration input sources, not as emitted aliases.

Why:

- `ccgs` still encodes the removed Gemini-era naming.
- a second transitional identity would keep the repository in permanent rename debt
- verification becomes much simpler when one canonical namespace exists

Alternatives considered:

- Keep `ccgs` as canonical and only demote `ccg`.
  Rejected because it preserves obsolete naming after Gemini removal.
- Treat `ccsm` only as a docs brand while code/runtime remain `ccgs`.
  Rejected because it recreates the same split identity problem.

### Decision: `~/.ccsm` is the canonical maintained home

The maintained runtime source of truth should live under `~/.ccsm`. Canonical config, prompts, monitor assets, backups, generated workflow data, and canonical skill content should resolve there by default.

Why:

- one maintained home is easier to reason about than host-specific storage scattered under `.codex` and `.claude`
- migration from both `~/.ccg` and host-owned `~/.claude/.ccgs` style layouts needs a stable target
- a canonical home makes direct native `ccsm` usage possible

Alternatives considered:

- Keep runtime ownership under `.codex` or `.claude`.
  Rejected because it mixes host compatibility with maintained ownership.
- Move everything outside home directories entirely.
  Rejected because it introduces a second migration problem without product value.

### Decision: `.codex` and `.claude` remain host discovery surfaces, not canonical storage

The system should preserve only the host-facing files those runtimes need to discover commands, skills, prompts, or rules naturally. Host homes should not remain the primary source of truth for maintained runtime state.

Why:

- both hosts have existing discovery rules that would break if their entry surfaces disappeared
- broad duplication creates drift and makes parity auditing impossible
- a thin host-facing layer can preserve native invocation while keeping canonical content in `~/.ccsm`

Alternatives considered:

- Move all maintained assets into `~/.ccsm` and stop writing anything to `.codex` or `.claude`.
  Rejected because host-native discovery would degrade.
- Continue writing full copies into every host home.
  Rejected because it perpetuates drift and makes sync ambiguous.

### Decision: `.ccsm` must be directly usable, not passive storage

The canonical maintained home must support direct operation, inspection, and recovery. It cannot exist only as a backend store referenced by host wrappers.

Why:

- otherwise `.ccsm` becomes an internal implementation detail rather than the canonical maintained surface
- direct usability helps debugging, migration, and future host additions
- the user explicitly wants `.ccsm` to be natively discoverable and usable

Direct usability means at minimum:

- canonical config lives there
- canonical prompts and monitor assets live there
- canonical skill content can be inspected and used from there
- generated workflow state and backups can be reasoned about there

### Decision: Skill parity is audited, not assumed

Implementation must produce an explicit skill-surface audit between:

- template sources
- canonical `~/.ccsm` skill content
- Codex-installed entrypoints
- Claude-installed entrypoints

Any mismatch must be classified as one of:

- required parity gap to fix
- intentional host-only surface
- deprecated historical surface to remove from maintained outputs

Why:

- the current repository does not make missing skill parity explainable
- without an audit, install behavior will keep drifting silently

### Decision: Migration spans both legacy and transitional paths

Migration logic must handle both `ccg` and `ccgs` sources when moving to `ccsm`.

Why:

- users may have installs rooted in `~/.ccg`
- recent branch work has already introduced `ccgs` paths, binaries, and skills
- a `ccg -> ccgs -> ccsm` chain should not require multiple manual migrations

## Audit Findings

The planning audit found the following maintained-source categories that will require implementation attention:

- identity constants and package metadata still use `CCGS`, `ccgs-workflow`, and `ccgs`
- binary aliases still expose `ccg`
- runtime helpers resolve host homes as `.codex` and `.claude`, with canonical runtime directories still named `.ccgs`
- template path substitution currently rewrites both `.codex` and `.claude` references toward host homes instead of a canonical `~/.ccsm` home
- installer logic writes prompts, commands, skills, rules, and monitor assets relative to an `installDir` host home
- Codex workflow skills are installed directly under `.codex/skills`, while Claude-oriented skills and commands still resolve through host-specific locations
- templates still reference `.ccgs`, `/ccgs:*`, `ccgs-spec-*`, and multiple `~/.claude/...` discovery paths
- installed local workspace state shows `.codex` and `.claude` content but no canonical `.ccsm` home yet

## Implementation Approach

1. Introduce canonical `ccsm` identity constants and migration-aware deprecated-source definitions.
2. Split path ownership into:
   - canonical maintained home: `~/.ccsm`
   - Codex discovery surfaces: only what Codex must see in `.codex`
   - Claude discovery surfaces: only what Claude must see in `.claude`
3. Refactor installer and path rewriting so canonical content is emitted to `~/.ccsm`, with host-facing bridge files or mirrored entrypoints only where necessary.
4. Rename canonical package/bin/command/skill/rule/template surfaces from `ccgs` to `ccsm`.
5. Audit skill inventory and encode parity expectations plus allowed host-specific exceptions.
6. Update docs and tests to describe the new canonical `.ccsm` model and removal of deprecated entrypoints.
7. Add regression checks covering canonical naming, canonical-home ownership, and host parity boundaries.

## Risks / Trade-offs

- [Risk: Host runtimes may require more local files than expected] -> Mitigation: classify host-facing files by required discovery behavior before deleting or relocating them.
- [Risk: `~/.ccsm` becomes canonical on paper but not in actual install flow] -> Mitigation: require direct usability scenarios and installer verification for `.ccsm`.
- [Risk: Broad rename from `ccgs` to `ccsm` misses transitional references] -> Mitigation: add regression checks for canonical `ccgs` and `ccg` leaks outside approved migration/history surfaces.
- [Risk: Skill parity work over-corrects and forces unnecessary duplication] -> Mitigation: allow intentional host-only surfaces, but require them to be explicitly documented.
- [Risk: Migration logic copies stale files from multiple legacy homes into `.ccsm`] -> Mitigation: define deterministic source precedence and conflict handling.

## Execution Handoff Contract

### Execution Goal

Make `CCSM` the canonical maintained identity, establish `~/.ccsm` as the canonical maintained home, preserve minimal `.codex` and `.claude` discovery surfaces, and audit/fix skill parity boundaries without redefining product direction during implementation.

### Allowed Change Surface

- `package.json`
- `bin/`
- `src/cli.ts`
- `src/cli-setup.ts`
- `src/commands/`
- `src/utils/`
- `src/i18n/`
- `templates/commands/`
- `templates/codex-skills/`
- `templates/prompts/`
- `templates/rules/`
- `templates/skills/`
- `README.md`
- `README.zh-CN.md`
- `AGENTS.md`
- `CLAUDE.md`
- focused tests and fixtures under `src/utils/__tests__/`
- generated `dist/` outputs only through build

### Protected Surface

- `openspec/changes/archive/`
- unrelated active OpenSpec changes
- `.git/`
- `node_modules/`
- archived or historical release content except for adding new factual entries
- unrelated product areas not involved in naming, install layout, runtime layout, or skill discovery

### Work Packages

1. Canonical identity conversion
- rename canonical package, binary, namespace, rule, and skill constants from `ccgs` to `ccsm`
- remove emitted `ccg` and `ccgs` aliases while keeping migration-safe detection of existing installs
2. Canonical-home refactor
   - make `~/.ccsm` the canonical root for config, prompts, monitor assets, backups, generated workflow files, and canonical skill content
3. Host-compatibility bridge layer
   - keep only the minimal `.codex` and `.claude` files needed for native discovery and invocation
   - ensure those surfaces resolve into canonical `~/.ccsm` content rather than becoming full duplicate stores
4. Skill parity audit and sync rules
   - inventory template skill sources and installed host-facing entrypoints
   - fix missing parity where parity is required
   - document justified host-specific exceptions
5. Docs/templates/test cleanup
   - update maintained docs and templates to teach the `ccsm` canonical model
   - add regression checks for naming and path ownership boundaries

### Required Verification

- targeted grep/search audit for canonical `ccg` and `ccgs` references in maintained default surfaces
- targeted audit for host-facing files that still act as primary storage instead of lightweight discovery bridges
- targeted audit for Codex/Claude skill parity plus documented exceptions
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- manual inspection of generated install output showing canonical assets under `~/.ccsm`

### Return Packet

- changed files grouped by work package
- list of canonical `ccsm` surfaces introduced
- list of removed deprecated `ccg` / `ccgs` entrypoints and any remaining migration-only readers
- list of host-facing `.codex` / `.claude` bridge surfaces that still exist
- skill parity audit summary: fixed gaps, intentional exceptions, unresolved risks
- verification commands run and results
- residual migration risks or release blockers

### Rework Triggers

- maintained defaults still present `ccgs` or `ccg` as canonical or installable entrypoints
- canonical config/prompt/monitor/backup ownership still lives primarily under `.codex` or `.claude`
- `.ccsm` exists but cannot be used directly as the maintained home
- host-facing skill or command installs become broad duplicates instead of minimal discovery bridges
- skill parity mismatches remain unexplained
- migration logic ignores either legacy `ccg` or transitional `ccgs` sources
- verification lacks a canonical-home or parity audit

## Open Questions

- Whether the published npm package should switch directly to `ccsm-workflow` in the same release or temporarily keep a compatibility publishing path.
- Whether host-facing bridge files should be implemented as copies, generated wrappers, or lightweight pointers per host capability.
