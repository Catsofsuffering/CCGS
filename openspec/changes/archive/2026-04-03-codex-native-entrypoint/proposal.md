## Why

The current fork now describes a Codex-orchestrated workflow, but the shipped runtime entrypoints are still Claude slash commands under `~/.claude/commands/ccg/`.

That means the product story and the actual entrypoint are still misaligned:

- users still need Claude as the host shell for the main workflow
- opening Codex does not expose a first-class CCG workflow surface
- "Codex orchestrates, Claude executes" remains descriptive rather than operational

To satisfy the intended workflow, the repository needs a Codex-native entrypoint that lets users open Codex first, advance OpenSpec artifacts there, and dispatch Claude from Codex when execution work is needed.

## What Changes

- Add a Codex-native workflow entrypoint that installs CCG-owned skills into `~/.codex/skills/`.
- Ship a minimal Codex skill set for the primary path: `ccg-spec-init`, `ccg-spec-plan`, and `ccg-spec-impl`.
- Ensure those skills keep Codex as the control plane and frame Claude as an execution worker invoked from Codex.
- Preserve the existing Claude slash-command surface as a compatibility path during migration.
- Extend installer and uninstall behavior so CCG-owned Codex skills are managed safely without deleting user-owned Codex skills.

## Capabilities

### New Capabilities

- `codex-native-entrypoint`: Users can start and progress the primary workflow directly from Codex without opening Claude as the host runtime.
- `codex-skill-installation`: Installer flows manage a bounded set of CCG-owned Codex workflow skills separately from user-owned Codex skills.

### Modified Capabilities

- `claude-execution-dispatch`: Codex-driven execution is no longer only described in Claude-hosted templates; it also has a Codex-native runtime entrypoint.

## Impact

- Affected code: installer, uninstall/update safety, init summary output, and installation result types.
- Affected assets: new Codex skill templates for the primary workflow.
- Affected docs: README, AGENTS, and usage guidance for the primary path.
- Runtime effect: users can start the main workflow from Codex, while Claude slash commands remain available as compatibility assets.
