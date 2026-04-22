## 1. Convert canonical identity to `ccsm`

- [x] 1.1 Inventory maintained source surfaces that still define `ccgs` as canonical and map which ones become `ccsm` vs deprecated migration-only sources.
- [x] 1.2 Refactor identity/package/bin/namespace constants so `ccsm` is canonical and no deprecated `ccg` / `ccgs` entrypoints are emitted in maintained outputs.
- [x] 1.3 Update CLI help, docs, i18n, templates, and generated instructions to present `CCSM` as the maintained default identity.

## 2. Establish `~/.ccsm` as the canonical maintained home

- [x] 2.1 Refactor path helpers, config discovery, and template path rewriting so canonical maintained assets resolve to `~/.ccsm`.
- [x] 2.2 Move canonical config, prompts, monitor assets, backups, generated workflow files, and canonical skill content under `~/.ccsm`.
- [x] 2.3 Add migration-safe handling from both legacy `ccg` and transitional `ccgs` runtime layouts into `~/.ccsm` without re-emitting deprecated entrypoints.

## 3. Preserve minimal host-native discovery surfaces

- [x] 3.1 Identify the minimum `.codex` and `.claude` files required for native discovery of commands, skills, prompts, and rules.
- [x] 3.2 Refactor installer behavior so host-facing files act as lightweight bridges into canonical `~/.ccsm` content rather than primary storage.
- [x] 3.3 Validate that native Codex and Claude invocation still works without broad duplication across host homes.

## 4. Audit and fix skill parity boundaries

- [x] 4.1 Inventory template skills, canonical `~/.ccsm` skill content, Codex-installed entrypoints, and Claude-installed entrypoints.
- [x] 4.2 Fix missing parity where the same maintained skill surface should exist for both hosts.
- [x] 4.3 Document intentional host-only surfaces while removing deprecated compatibility-only entrypoints.

## 5. Add verification and deliver the bounded packet

- [x] 5.1 Add regression checks for canonical `ccsm` naming, canonical-home ownership, and rejection of deprecated `ccg` / `ccgs` default surfaces.
- [x] 5.2 Run `pnpm typecheck`, `pnpm build`, and `pnpm test`, then inspect install outputs for `.ccsm` ownership and host-bridge correctness.
- [x] 5.3 Produce the implementation return packet with changed surfaces, removed deprecated entrypoints, host bridges, skill parity audit results, and residual blockers.
