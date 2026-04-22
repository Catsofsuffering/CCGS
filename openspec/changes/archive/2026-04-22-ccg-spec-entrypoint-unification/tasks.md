## 1. Define the change contract

- [x] 1.1 Add proposal, design, tasks, and delta specs for the entrypoint unification change

## 2. Remove install-time MCP work from base install

- [x] 2.1 Refactor `src/commands/init.ts` to remove MCP buffet prompts and MCP summary output
- [x] 2.2 Stop automatic MCP installs and Codex MCP sync during `init`
- [x] 2.3 Default base-install MCP state to `skip` unless existing config already records a provider

## 3. Replace the maintained Codex skill surface

- [x] 3.1 Change canonical Codex skill names to `spec-init`, `spec-research`, `spec-plan`, `spec-impl`, and `spec-review`
- [x] 3.2 Add or move Codex skill templates so the maintained primary path uses the top-level `spec-*` set
- [x] 3.3 Remove maintained-source dependence on `ccsm-spec-*`, `ccgs-spec-*`, and `ccg-spec-*` entry templates

## 4. Migrate and verify the new surface

- [x] 4.1 Update migration logic to map old prefixed Codex skills into the new top-level names
- [x] 4.2 Update installer, migration, and skill-surface tests to assert the new maintained behavior
- [x] 4.3 Update docs and help text to describe `spec-*` as the Codex-native primary skill surface
- [x] 4.4 Run `pnpm typecheck`, `pnpm test`, and `pnpm build`
