## Context

The fork has already started moving toward a more natively generalized `CCGS` story, but the repository is still structurally mixed:

- top-level docs say `CCGS`
- the npm package is still `ccg-workflow`
- the binary is still `ccg`
- slash commands still use `/ccg:*`
- Codex-native skills still use names like `ccg-spec-plan`
- generated install/runtime paths still point to `.ccg` and `skills/ccg`
- rule files, template comments, prompt headers, and brand assets still publish `CCG`
- maintained config/runtime helpers still assume `~/.claude` as the home boundary even when Codex or Claude should each be able to own orchestration or execution
- Gemini-specific prompt assets are still bundled as maintained defaults even though Gemini is no longer part of the maintained path
- maintained docs, i18n strings, and MCP helper code still contain residual Gemini references that no longer match the product direction

That mixed state causes three real problems:

1. The product does not have a single canonical identity.
2. Deleted-upstream naming still controls the default user experience.
3. Future changes will keep leaking `ccg` shadows unless the identity model, host-owned path resolution, and compatibility policy are made explicit.

This change plans a repository-wide nativeization pass without implementing product code yet.

## Goals / Non-Goals

**Goals**

- Make `CCGS` the only canonical identity for maintained user-facing surfaces.
- Replace default `ccg` naming in commands, skills, paths, templates, and docs with `ccgs`-owned equivalents.
- Let Codex and Claude each be valid orchestrator or executor hosts in the maintained workflow model instead of hardcoding one fixed pairing.
- Resolve maintained config/runtime/install ownership from the active host home/role instead of assuming every maintained surface belongs under `~/.claude`.
- Remove Gemini from the maintained packaged prompt/model surface now that it has fallen behind the maintained workflow path.
- Remove residual maintained-source Gemini wording and helper logic so current docs, translations, and runtime helpers no longer imply supported Gemini participation.
- Define how compatibility aliases may exist without continuing to define the product story.
- Audit user-facing maintained content for deleted-upstream shadows.
- Encode a verification strategy that catches accidental regressions.

**Non-Goals**

- Rewriting archived history to erase factual references to earlier `ccg` releases.
- Rebuilding OpenSpec, Codex orchestration, or Claude execution architecture from scratch.
- Changing product code in this planning step.
- Guaranteeing immediate external package registry migration before the implementation work has been validated.

## Decisions

### Decision: `CCGS` is the canonical maintained identity

All maintained user-facing surfaces should treat `CCGS` and `ccgs` as canonical. A plain `ccg` surface may remain only when it is intentionally preserved as a temporary compatibility alias, with explicit deprecation or migration framing.

Why this decision:

- The maintained fork is no longer representing the deleted upstream project.
- Mixed identity makes commands, runtime layout, and docs feel unfinished.
- A single canonical name is needed before deeper cleanup can be verified.

Alternatives considered:

- Keep `CCGS` only as a doc-level brand while retaining `ccg` everywhere else.
  Rejected because it preserves the exact split identity causing the confusion.
- Leave both `ccg` and `ccgs` as first-class names indefinitely.
  Rejected because it permanently doubles the mental model and verification burden.

### Decision: User-facing naming and path ownership should be migrated together

The implementation should rename command surfaces, skill names, install directories, and runtime paths as one coordinated nativeization pass rather than renaming docs first and deferring runtime ownership.

Why this decision:

- A docs-only rename would leave generated files and execution instructions inconsistent.
- Runtime paths such as `.ccg` and `skills/ccg` are some of the strongest remaining upstream shadows.
- Coordinated migration reduces the chance of half-renamed behavior.

Alternatives considered:

- Rename docs and menu text first, then defer runtime path migration.
  Rejected because users would still install and execute through old ownership boundaries.
- Rename paths only and defer docs.
  Rejected because users would still learn the old product story.

### Decision: Codex and Claude are generalized workflow hosts

The maintained workflow should treat Codex and Claude as selectable hosts for orchestration and execution rather than encoding one permanent role pairing into runtime ownership, prompts, or generated guidance.

Why this decision:

- The current branch is introducing host-owned runtime behavior specifically so workflow role ownership can move with the chosen host.
- Hardcoding Codex as the only orchestrator or Claude as the only executor would reintroduce hidden product constraints at the runtime layer.
- Generalized host roles keep the maintained workflow adaptable without reopening deleted-upstream naming or multi-model sprawl.

Alternatives considered:

- Keep Codex permanently as orchestrator and Claude permanently as executor.
  Rejected because it makes host-owned runtime design unnecessary and contradicts the intended product direction.
- Reintroduce a fully generic multi-model host system including Gemini.
  Rejected because the maintained path is being narrowed, not expanded.

### Decision: Runtime ownership follows the active host home

The maintained runtime should resolve config, prompts, commands, backup, and monitor assets from the active host home (`~/.codex` for Codex-owned surfaces, `~/.claude` for Claude-owned surfaces) instead of treating `~/.claude` as the universal default.

Why this decision:

- The maintained product story is host-generalized, so default persisted state should follow the selected host instead of silently falling back to Claude ownership.
- The repository now owns both Codex and Claude runtime surfaces, which need distinct home directories even when they share the same `ccgs` namespace.
- Host-aware runtime resolution makes compatibility logic explicit and prevents future regressions from re-hardcoding `~/.claude`.

Alternatives considered:

- Keep using `~/.claude` as the default and special-case Codex only where it breaks.
  Rejected because it leaves the primary workflow's ownership model misleading.
- Introduce a third shared global directory outside host homes.
  Rejected because it creates a second migration and config model without product benefit.

### Decision: Compatibility aliases are bridges, not the product story

If implementation keeps any `ccg` alias, it must be clearly bounded as a migration bridge. Canonical docs, defaults, and generated assets must not present the alias as the preferred path.

Why this decision:

- Existing users may still have installed assets or habits built around `ccg`.
- Some external surfaces may need a staged migration.
- Without an explicit rule, compatibility paths will quietly keep dictating the default experience.

Alternatives considered:

- Delete every `ccg` surface in one step without fallback.
  Rejected because it increases rollout risk and can strand existing installs.
- Leave compatibility implicit.
  Rejected because the repo already shows how implicit compatibility becomes the default story.

### Decision: Gemini is removed from the maintained default surface

The maintained package should bundle prompt and role assets only for the workflow hosts that still define the maintained path. Gemini-specific prompt assets should not continue shipping as default maintained package content because Gemini is no longer part of the maintained workflow surface.

Why this decision:

- Shipping Gemini assets as first-class defaults implies a maintained role that the current product story no longer promises.
- Prompt bundles shape how users reason about supported workflow roles just as much as docs and menu text do.
- Trimming the packaged prompt surface reduces the chance that future workflow templates continue referencing obsolete Codex/Gemini pairings.
- Gemini has fallen behind the maintained path, so leaving its assets in the default package would overstate support and confuse role planning.

Alternatives considered:

- Keep Gemini prompt assets bundled but simply stop mentioning them in docs.
  Rejected because bundled assets are still part of the maintained default surface.
- Remove all non-Codex prompt assets.
  Rejected because Claude remains part of the maintained host split and still needs maintained prompt surfaces.

### Decision: Historical records remain historical records

Archived OpenSpec changes, past release notes, and other historical artifacts may continue to mention `ccg` when they are accurately describing prior states. The nativeization pass should target maintained, user-facing default surfaces, not rewrite history indiscriminately.

Why this decision:

- Historical records are evidence, not active defaults.
- Mass-editing old release entries increases noise and review risk.
- The real problem is current canonical surfaces, not faithful history.

Alternatives considered:

- Rewrite all historical references to `ccgs`.
  Rejected because it obscures chronology and expands scope for little product value.

### Decision: Identity regression checks must become part of verification

Implementation should add automated or scripted checks that fail when canonical maintained source reintroduces default `ccg` naming outside approved compatibility or historical locations.

Why this decision:

- This refactor spans templates, docs, runtime paths, and assets.
- Manual review alone will miss future regressions.
- The repository already demonstrates how identity drift accumulates over time.

Alternatives considered:

- Rely only on code review and periodic manual audits.
  Rejected because the surface area is too broad.

## Audit Findings

The planning audit found deleted-upstream `ccg` shadows in at least these maintained areas:

- package and binary identity: `package.json`, `bin/ccg.mjs`
- command surfaces: `/ccg:*` references across docs and templates
- Codex-native skills: `templates/codex-skills/ccg-spec-*`
- rules and skill paths: `templates/rules/ccg-*.md`, `~/.claude/skills/ccg/...`
- runtime layout: `~/.claude/.ccg/...`, `../.ccg/...`
- brand assets: `assets/logo/ccg-*`
- prompt headers and workflow comments that still brand the old project as active
- config/runtime helpers that still assume `~/.claude` for maintained ownership even when Codex or Claude should each be able to own orchestration or execution
- Gemini prompt bundles and model-routing helpers that still advertise Gemini as a maintained workflow role after it has been removed from the maintained path
- maintained docs, i18n resources, `.npmignore`, and MCP sync utilities that still mention or support Gemini as a living maintained surface

These findings define the minimum implementation slices for the next step.

## Implementation Approach

1. Establish a single source of truth for canonical names, namespaces, and owned path roots.
2. Generalize workflow host ownership so Codex and Claude can each own orchestration or execution without changing the `ccgs` identity model.
3. Migrate runtime/install/template generation to `ccgs`-owned defaults with host-aware home directory resolution.
4. Rename maintained command, skill, rule, prompt, and documentation surfaces.
5. Remove Gemini from the maintained packaged prompt/model surface and relabel any future Gemini support as an explicit optional integration rather than a default role.
6. Remove residual Gemini wording and helper behavior from maintained docs, translations, ignore files, and runtime helper code.
7. Add compatibility bridges only where needed, with explicit labeling.
8. Add verification checks that distinguish canonical, compatibility, and historical references.
9. Rebuild generated outputs only after source-level identity changes are verified.

## Risks / Trade-offs

- [Risk: External package or command renaming may have release-time constraints] -> Mitigation: keep the canonical source surface `ccgs`-native and treat any temporary published alias as a bounded compatibility bridge.
- [Risk: Existing installs may depend on `.ccg` paths] -> Mitigation: plan migration logic and compatibility shims before deleting old directories.
- [Risk: Host-aware runtime resolution may read or write the wrong home directory] -> Mitigation: centralize host-home helpers and make config discovery explicit for Codex and Claude regardless of which one owns orchestration or execution.
- [Risk: Broad search-and-replace damages historical records or archived artifacts] -> Mitigation: explicitly protect archive/history surfaces from indiscriminate edits.
- [Risk: Template/path renames break generated installs] -> Mitigation: verify installer outputs and generated path references as a dedicated work package.
- [Risk: Removing Gemini bundled prompts may surprise users who still depend on that optional path] -> Mitigation: treat Gemini as a removed maintained surface and keep any future support explicit rather than implicit in packaged defaults.
- [Risk: Residual maintained Gemini references survive in docs or helper code and confuse users] -> Mitigation: run a maintained-source grep audit and remove remaining Gemini wording outside protected history/archive surfaces.
- [Risk: Residual `ccg` references remain in maintained surfaces] -> Mitigation: add targeted regression checks and final audit output.

## Execution Handoff Contract

### Goal

Make the maintained fork natively `CCGS` by replacing default `ccg` identity, command, skill, path, asset, and workflow surfaces with `ccgs`-owned equivalents, while generalizing Codex/Claude host roles and removing Gemini from the maintained default surface.

### Required Inputs

- `openspec/changes/ccgs-nativeization/proposal.md`
- `openspec/changes/ccgs-nativeization/design.md`
- `openspec/changes/ccgs-nativeization/tasks.md`
- `openspec/changes/ccgs-nativeization/specs/**/*.md`
- Current maintained source under `src/`, `templates/`, `assets/`, `bin/`, and top-level docs
- Current package/runtime identity in `package.json`

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
- `assets/logo/`
- `README.md`
- `README.zh-CN.md`
- `AGENTS.md`
- `CLAUDE.md`
- focused test files and supporting fixtures if needed
- generated `dist/` outputs only via build, never by hand-edit

### Protected Surface

- `openspec/changes/archive/`
- unrelated active OpenSpec changes
- `node_modules/`
- `.git/`
- historical release-note sections that document past `ccg` states, except for adding a new top entry when needed
- `codeagent-wrapper/main.go` unless the implementation proves a real path/name dependency requires touching it; if touched, the wrapper version sync rule must be followed

### Work Packages

1. Identity source of truth
   - Normalize canonical project naming, binary/package metadata, and install/runtime constants.
   - Completion signal: maintained defaults describe `ccgs` as canonical and any `ccg` alias is explicit.
2. Host-role generalization
   - Make workflow/runtime ownership independent from a fixed Codex->Claude role pairing so Codex and Claude can each own orchestration or execution.
   - Completion signal: maintained workflow guidance and runtime ownership no longer encode one permanent host pairing.
3. Command, skill, and template surface migration
   - Rename maintained command namespace, Codex skill names, template comments, rule files, install targets, and bundled prompt surfaces to `ccgs`-owned or explicitly maintained equivalents.
   - Completion signal: generated workflow assets no longer default to `ccg` naming or stale Codex/Gemini role framing.
4. Runtime path and migration handling
   - Move maintained config, worktree, and skill/rule path ownership away from `.ccg`/`skills/ccg` while preserving migration behavior for existing installs and resolving ownership from the active host home.
   - Completion signal: default generated paths are `ccgs`-owned, Codex/Claude host homes resolve correctly for either orchestration or execution ownership, and compatibility behavior is documented or implemented.
5. Docs and brand cleanup
   - Update maintained docs and brand assets so the fork no longer presents deleted-upstream `ccg` surfaces as primary.
   - Completion signal: top-level user guidance consistently teaches `ccgs`.
6. Verification and regression control
   - Add tests or scripted audits for canonical naming, then run typecheck/build/test and perform a residual-reference audit.
   - Completion signal: verification passes and remaining `ccg` references are either compatibility-labeled or historical.

### Required Verification

- Targeted search audit for maintained default `ccg` references after implementation
- `pnpm typecheck`
- `pnpm build`
- `pnpm test`
- Manual review of generated install/output paths for `ccgs` ownership
- Manual confirmation that compatibility aliases, if kept, are labeled as compatibility/deprecated rather than canonical

### Return Packet

- Changed files grouped by work package
- List of canonical surfaces now renamed to `ccgs`
- List of host-owned runtime surfaces now resolved through Codex vs Claude homes and how role ownership is chosen
- List of retained `ccg` aliases and why they still exist
- List of removed Gemini packaged surfaces and why they no longer ship by default
- Verification commands run and their results
- Residual-risk list for any blocked external rename
- Recommended next step: accept or rework

### Rework Triggers

- Any maintained default doc, command, or generated asset still presents `ccg` as canonical
- Runtime/install paths remain `.ccg`-owned without an explicit compatibility reason
- Maintained workflow guidance still hardcodes Codex or Claude to one permanent role instead of supporting host-role generalization
- Codex-owned or Claude-owned maintained surfaces still resolve through the wrong host home without an explicit host-aware reason
- Compatibility aliases are present but unlabeled
- Gemini-specific prompt assets still ship as maintained defaults
- Verification misses newly introduced regression checks
- Implementation rewrites protected archive/history surfaces without justification

## Open Questions

- Whether published npm distribution should switch immediately to `ccgs-workflow` or temporarily keep `ccg-workflow` as a compatibility package alias if registry or release coordination requires a staged cutover.
- Whether `/ccg:*` aliases should continue to install by default during migration or only when a compatibility mode is explicitly selected.
