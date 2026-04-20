## 1. Establish Codex-led workflow defaults

- [x] 1.1 Audit host-specific assumptions in config, installer, and command registration files and document the exact Claude-first defaults that must be changed
- [x] 1.2 Refactor config defaults so the primary workflow model identifies Codex as the orchestrator instead of treating Claude as the host assumption
- [x] 1.3 Update command registry and default workflow metadata so the main product path is described as Codex-led rather than Claude-led

## 2. Introduce Codex-to-Claude execution dispatch

- [x] 2.1 Define the execution handoff contract from Codex orchestration to Claude execution, including required context, expected outputs, and failure return path
- [x] 2.2 Refactor `spec` and `team` command templates so Claude execution steps are framed as Codex-dispatched worker flows rather than top-level orchestration flows
- [x] 2.3 Add or update acceptance-path guidance so implementation results return to Codex for final verification and archive decisions

## 3. Preserve compatibility while changing control ownership

- [x] 3.1 Identify legacy Claude-first commands and label which ones remain compatibility flows in the first implementation phase
- [x] 3.2 Update installer/template wiring so the Codex-led path can coexist with legacy command assets without breaking current installs
- [x] 3.3 Add migration-safe messaging in workflow help and templates to distinguish the new primary path from compatibility paths

## 4. Remove Gemini from the default path

- [x] 4.1 Refactor install and init flows so Gemini is not required for the default Codex-led path, while leaving MCP and skills as unchanged optional layers
- [x] 4.2 Update template injection, prompt installation, and fallback behavior so Gemini is only included when the configured routing actually uses it
- [x] 4.3 Review menu/config/help surfaces and remove wording that implies Gemini is mandatory for the main path, while documenting MCP and skills as retained optional layers

## 5. Update docs and validate the new primary workflow

- [x] 5.1 Rewrite README, AGENTS, and command descriptions so the primary product narrative is "Codex orchestrates, Claude executes"
- [x] 5.2 Validate that a minimal install works for the Codex-led workflow without Gemini enabled and without requiring additional optional setup
- [x] 5.3 Run targeted verification on the updated workflow assets and confirm the change is ready for implementation/archive progression

## 6. Surface orchestrator selection during install

- [x] 6.1 Add an orchestrator selection step ahead of model routing in `init`, persist the choice in config ownership metadata, and expose it via CLI summary
- [x] 6.2 Update docs/i18n/help text so the installer explains the orchestrator vs execution roles and defaults
- [x] 6.3 Extend automated tests to cover custom ownership persistence and ensure non-interactive flows keep prior selections

## 7. Remove remaining mandatory Gemini wording from the main path

- [x] 7.1 Refactor `spec-research` so Gemini is optional and the command follows configured frontend/backend execution models
- [x] 7.2 Refactor `team-research` so Gemini is optional and prompt paths follow configured execution models instead of hardcoded Gemini assets
- [x] 7.3 Add targeted verification that primary-path research templates no longer require Gemini when routing excludes it

## 8. Remove Gemini hard-binding from compatibility and secondary flows

- [x] 8.1 Add compatibility-flow requirements to the OpenSpec artifacts so legacy commands may remain installed without requiring Gemini
- [x] 8.2 Add failing tests that capture hardcoded Gemini prompts, Gemini-only session names, and misleading compatibility/help descriptions
- [x] 8.3 Refactor compatibility planning/execution templates to follow configured frontend/backend models instead of hardcoded Gemini roles
- [x] 8.4 Refactor compatibility utility templates and help/registry descriptions so Gemini is optional rather than mandatory
- [x] 8.5 Run targeted verification that compatibility and secondary flows no longer require Gemini when routing excludes it
- [x] 8.6 Extend compatibility verification to cover the `feat` secondary flow and capture its remaining Gemini hard-binding
- [x] 8.7 Refactor `feat` so it follows configured frontend/backend models and treats Gemini as optional
- [x] 8.8 Re-run targeted verification for compatibility and secondary flows after the `feat` refactor
