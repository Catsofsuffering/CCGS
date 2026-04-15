## Context

The fork has already started moving toward a Codex-led `CCGS` story, but the repository is still structurally mixed:

- top-level docs say `CCGS`
- the npm package is still `ccg-workflow`
- the binary is still `ccg`
- slash commands still use `/ccg:*`
- Codex-native skills still use names like `ccg-spec-plan`
- generated install/runtime paths still point to `.ccg` and `skills/ccg`
- rule files, template comments, prompt headers, and brand assets still publish `CCG`

That mixed state causes three real problems:

1. The product does not have a single canonical identity.
2. Deleted-upstream naming still controls the default user experience.
3. Future changes will keep leaking `ccg` shadows unless the identity model, path ownership, and compatibility policy are made explicit.

This change plans a repository-wide nativeization pass without implementing product code yet.

## Goals / Non-Goals

**Goals**

- Make `CCGS` the only canonical identity for maintained user-facing surfaces.
- Replace default `ccg` naming in commands, skills, paths, templates, and docs with `ccgs`-owned equivalents.
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

These findings define the minimum implementation slices for the next step.

## Implementation Approach

1. Establish a single source of truth for canonical names, namespaces, and owned path roots.
2. Migrate runtime/install/template generation to `ccgs`-owned defaults.
3. Rename maintained command, skill, rule, prompt, and documentation surfaces.
4. Add compatibility bridges only where needed, with explicit labeling.
5. Add verification checks that distinguish canonical, compatibility, and historical references.
6. Rebuild generated outputs only after source-level identity changes are verified.

## Risks / Trade-offs

- [Risk: External package or command renaming may have release-time constraints] -> Mitigation: keep the canonical source surface `ccgs`-native and treat any temporary published alias as a bounded compatibility bridge.
- [Risk: Existing installs may depend on `.ccg` paths] -> Mitigation: plan migration logic and compatibility shims before deleting old directories.
- [Risk: Broad search-and-replace damages historical records or archived artifacts] -> Mitigation: explicitly protect archive/history surfaces from indiscriminate edits.
- [Risk: Template/path renames break generated installs] -> Mitigation: verify installer outputs and generated path references as a dedicated work package.
- [Risk: Residual `ccg` references remain in maintained surfaces] -> Mitigation: add targeted regression checks and final audit output.

## Execution Handoff Contract

### Goal

Make the maintained fork natively `CCGS` by replacing default `ccg` identity, command, skill, path, asset, and workflow surfaces with `ccgs`-owned equivalents, while limiting any retained `ccg` usage to explicit migration compatibility.

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
2. Command, skill, and template surface migration
   - Rename maintained command namespace, Codex skill names, template comments, rule files, and install targets to `ccgs`-owned surfaces.
   - Completion signal: generated workflow assets no longer default to `ccg` naming.
3. Runtime path and migration handling
   - Move maintained config, worktree, and skill/rule path ownership away from `.ccg`/`skills/ccg` while preserving migration behavior for existing installs.
   - Completion signal: default generated paths are `ccgs`-owned and compatibility behavior is documented or implemented.
4. Docs and brand cleanup
   - Update maintained docs and brand assets so the fork no longer presents deleted-upstream `ccg` surfaces as primary.
   - Completion signal: top-level user guidance consistently teaches `ccgs`.
5. Verification and regression control
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
- List of retained `ccg` aliases and why they still exist
- Verification commands run and their results
- Residual-risk list for any blocked external rename
- Recommended next step: accept or rework

### Rework Triggers

- Any maintained default doc, command, or generated asset still presents `ccg` as canonical
- Runtime/install paths remain `.ccg`-owned without an explicit compatibility reason
- Compatibility aliases are present but unlabeled
- Verification misses newly introduced regression checks
- Implementation rewrites protected archive/history surfaces without justification

## Open Questions

- Whether published npm distribution should switch immediately to `ccgs-workflow` or temporarily keep `ccg-workflow` as a compatibility package alias if registry or release coordination requires a staged cutover.
- Whether `/ccg:*` aliases should continue to install by default during migration or only when a compatibility mode is explicitly selected.
