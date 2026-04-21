## 1. Establish canonical `ccgs` identity

- [x] 1.1 Inventory and centralize maintained naming/path constants that still encode canonical `ccg` ownership.
- [x] 1.2 Refactor package metadata, CLI/bin entrypoints, install summaries, and workflow registry so `ccgs` is the canonical identity.
- [x] 1.3 Define and document the compatibility policy for any retained `ccg` alias surface before implementation removes or demotes it.
- [x] 1.4 Generalize the maintained host-role model so Codex and Claude can each act as orchestrator or executor without changing the canonical `ccgs` identity.

## 2. Migrate commands, skills, and templates

- [x] 2.1 Rename maintained slash-command, Codex-skill, rule-file, and template surfaces from `ccg` to `ccgs`.
- [x] 2.2 Update installer/template injection and generated asset paths so default installs emit `ccgs`-owned commands, skills, and runtime references.
- [x] 2.3 Audit workflow/prompt/template language to remove deleted-upstream `ccg` framing from the maintained default path.
- [x] 2.4 Remove Gemini from the maintained bundled prompt/model surface now that it has fallen behind the maintained Codex/Claude workflow path.
- [x] 2.5 Remove residual maintained-source Gemini references from docs, contribution guidance, translations, ignore files, and helper code.

## 3. Migrate runtime layout and owned directories

- [x] 3.1 Refactor maintained config, worktree, skill, and rule path ownership from `.ccg` or `skills/ccg` to `ccgs`-owned equivalents.
- [x] 3.2 Add migration-safe handling for existing installs that still have `ccg`-named runtime directories or command assets.
- [x] 3.3 Validate that generated execution instructions, prompt paths, and install targets no longer depend on upstream-owned naming by default.
- [x] 3.4 Generalize maintained runtime/config ownership around the active host role so Codex and Claude can each own orchestration or execution without hardcoded `~/.claude` defaults.

## 4. Clean docs and brand surfaces

- [x] 4.1 Update maintained docs and help output so `CCGS` is the primary project story across command, workflow, and installation guidance.
- [ ] 4.2 Rename or regenerate maintained logo and brand assets that still publish `ccg` filenames or labels as the canonical brand.
- [x] 4.3 Preserve archive/history accuracy while removing user-facing deleted-upstream shadows from maintained sources.

## 5. Add regression checks and verify the migration

- [x] 5.1 Add targeted tests or scripted checks that fail on unintended canonical `ccg` references in maintained source/template surfaces.
- [x] 5.2 Run `pnpm typecheck`, `pnpm build`, and `pnpm test`, then inspect outputs for residual identity leaks.
- [x] 5.3 Produce the implementation return packet with changed surfaces, retained compatibility aliases, verification evidence, and any remaining release blockers.
