---
description: '初始化 OpenSpec 环境并校验主工作流运行时'
---
<!-- CCG:SPEC:INIT:START -->
**Core Philosophy**

- OpenSpec provides the change-state backbone; CCSM provides the maintained Codex-led workflow.
- This step prepares the project for the primary spec-driven path without requiring optional MCP setup.
- Fail early on missing runtime dependencies before planning or implementation begins.

**Guardrails**

- Detect the current environment before suggesting install commands.
- Respect existing OpenSpec and monitor state; do not overwrite blindly.
- Treat MCP as optional post-install configuration, not as a blocker for this step.

**Steps**

1. **Check OpenSpec availability**
   - Verify `openspec --version`.
   - If unavailable, install or instruct the user to install `@fission-ai/openspec`.

2. **Check project initialization state**
   - Inspect whether `openspec/` already exists in the current repository.
   - If the project is not initialized, run `openspec init`.
   - Confirm the expected OpenSpec project structure now exists.

3. **Check execution runtime**
   - Verify Claude Code availability with `claude --version`.
   - Verify monitor helper availability with `ccsm monitor hooks`.
   - If the runtime is not ready, run `ccsm monitor install`.
   - If the user wants a live dashboard, run `ccsm monitor start --detach`.
   - Confirm `~/.claude/settings.json` contains the monitor hook entries and `~/.codex/config.toml` trusts the current workspace.

4. **Report readiness**
   - Summarize:
     - OpenSpec CLI
     - project initialization state
     - Claude runtime availability
     - monitor runtime status
     - workspace trust status

5. **Direct the user to the next maintained step**
   - Claude slash flow:
     - `/ccsm:spec-research <request>`
     - `/ccsm:spec-plan`
     - `/ccsm:spec-impl`
   - Codex-native skill flow:
     - `spec-research`
     - `spec-plan`
     - `spec-impl`

**Reference**

- OpenSpec CLI: `openspec --help`
- CCSM CLI: `ccsm`
- Monitor helpers: `ccsm monitor <install|start|hooks>`
<!-- CCG:SPEC:INIT:END -->
