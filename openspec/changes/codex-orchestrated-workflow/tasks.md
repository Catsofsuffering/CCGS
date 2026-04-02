## 1. Establish Codex-led workflow defaults

- [ ] 1.1 Audit host-specific assumptions in config, installer, and command registration files and document the exact Claude-first defaults that must be changed
- [ ] 1.2 Refactor config defaults so the primary workflow model identifies Codex as the orchestrator instead of treating Claude as the host assumption
- [ ] 1.3 Update command registry and default workflow metadata so the main product path is described as Codex-led rather than Claude-led

## 2. Introduce Codex-to-Claude execution dispatch

- [ ] 2.1 Define the execution handoff contract from Codex orchestration to Claude execution, including required context, expected outputs, and failure return path
- [ ] 2.2 Refactor `spec` and `team` command templates so Claude execution steps are framed as Codex-dispatched worker flows rather than top-level orchestration flows
- [ ] 2.3 Add or update acceptance-path guidance so implementation results return to Codex for final verification and archive decisions

## 3. Preserve compatibility while changing control ownership

- [ ] 3.1 Identify legacy Claude-first commands and label which ones remain compatibility flows in the first implementation phase
- [ ] 3.2 Update installer/template wiring so the Codex-led path can coexist with legacy command assets without breaking current installs
- [ ] 3.3 Add migration-safe messaging in workflow help and templates to distinguish the new primary path from compatibility paths

## 4. Make optional integrations truly optional

- [ ] 4.1 Refactor install and init flows so MCP, skills, and Gemini are not required for the default Codex-led path
- [ ] 4.2 Update template injection and fallback behavior so no optional integration is assumed in the primary workflow
- [ ] 4.3 Review menu/config/help surfaces and remove wording that implies MCP, skills, or Gemini are mandatory for the main path

## 5. Update docs and validate the new primary workflow

- [ ] 5.1 Rewrite README, AGENTS, and command descriptions so the primary product narrative is "Codex orchestrates, Claude executes"
- [ ] 5.2 Validate that a minimal install works for the Codex-led workflow without MCP, skills, or Gemini enabled
- [ ] 5.3 Run targeted verification on the updated workflow assets and confirm the change is ready for implementation/archive progression
