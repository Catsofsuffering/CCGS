## 1. Establish canonical `ccgs` identity

- [ ] 1.1 Inventory and centralize maintained naming/path constants that still encode canonical `ccg` ownership.
- [ ] 1.2 Refactor package metadata, CLI/bin entrypoints, install summaries, and workflow registry so `ccgs` is the canonical identity.
- [ ] 1.3 Define and document the compatibility policy for any retained `ccg` alias surface before implementation removes or demotes it.

## 2. Migrate commands, skills, and templates

- [ ] 2.1 Rename maintained slash-command, Codex-skill, rule-file, and template surfaces from `ccg` to `ccgs`.
- [ ] 2.2 Update installer/template injection and generated asset paths so default installs emit `ccgs`-owned commands, skills, and runtime references.
- [ ] 2.3 Audit workflow/prompt/template language to remove deleted-upstream `ccg` framing from the maintained default path.

## 3. Migrate runtime layout and owned directories

- [ ] 3.1 Refactor maintained config, worktree, skill, and rule path ownership from `.ccg` or `skills/ccg` to `ccgs`-owned equivalents.
- [ ] 3.2 Add migration-safe handling for existing installs that still have `ccg`-named runtime directories or command assets.
- [ ] 3.3 Validate that generated execution instructions, prompt paths, and install targets no longer depend on upstream-owned naming by default.

## 4. Clean docs and brand surfaces

- [ ] 4.1 Update maintained docs and help output so `CCGS` is the primary project story across command, workflow, and installation guidance.
- [ ] 4.2 Rename or regenerate maintained logo and brand assets that still publish `ccg` filenames or labels as the canonical brand.
- [ ] 4.3 Preserve archive/history accuracy while removing user-facing deleted-upstream shadows from maintained sources.

## 5. Add regression checks and verify the migration

- [ ] 5.1 Add targeted tests or scripted checks that fail on unintended canonical `ccg` references in maintained source/template surfaces.
- [ ] 5.2 Run `pnpm typecheck`, `pnpm build`, and `pnpm test`, then inspect outputs for residual identity leaks.
- [ ] 5.3 Produce the implementation return packet with changed surfaces, retained compatibility aliases, verification evidence, and any remaining release blockers.
