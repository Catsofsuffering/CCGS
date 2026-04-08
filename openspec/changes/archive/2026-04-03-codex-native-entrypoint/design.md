## Context

The repository now has a partially migrated product story:

- documentation says Codex orchestrates
- primary workflow templates describe Codex-to-Claude handoff
- Gemini is no longer mandatory

But the runtime still starts in Claude because installation only creates:

- `~/.claude/commands/ccg/*.md`
- `~/.claude/skills/ccg/...`
- `~/.claude/.ccg/...`

That leaves an important gap: the default user cannot open Codex and immediately use a CCG-native workflow surface.

## Goals / Non-Goals

**Goals**

- Provide a first-class Codex entrypoint for the primary workflow.
- Keep the initial implementation small and testable.
- Preserve Claude slash commands as compatibility assets.
- Keep Claude as the execution worker for the primary path.
- Ensure uninstall/update behavior only touches CCG-owned Codex skills.

**Non-Goals**

- Replace every existing Claude slash command with a Codex skill equivalent in one pass.
- Remove Claude compatibility flows.
- Rewrite OpenSpec integration.
- Rework MCP, skills, or Gemini again in this change unless needed for the Codex entrypoint.

## Decisions

### Decision: Ship a minimal Codex-native skill set first

The first Codex-native release should only install three workflow skills:

- `ccg-spec-init`
- `ccg-spec-plan`
- `ccg-spec-impl`

Why:

- They are enough to demonstrate the primary workflow end-to-end.
- They map closely to the intended story: create or select the change, prepare the handoff, dispatch execution and accept/reject.
- They keep the implementation small enough to verify with focused tests.

Alternatives considered:

- Port every `/ccg:*` command into Codex skills immediately.
  Rejected because it expands scope before the entrypoint contract is proven.

### Decision: Install Codex workflow skills into top-level `~/.codex/skills/<skill-name>/`

Each CCG workflow skill should be installed as a dedicated top-level Codex skill directory.

Why:

- Codex skill discovery works naturally with top-level skill directories.
- It matches how other Codex skills are typically installed.
- It avoids forcing users to navigate a nested CCG container skill.

Alternatives considered:

- Install everything under `~/.codex/skills/ccg/`.
  Rejected because nested layouts are less discoverable for Codex skill selection.

### Decision: Keep the Codex skill content self-sufficient

The Codex skill templates should not instruct the user to switch into Claude and manually type `/ccg:*`.

Instead, they should:

- describe the OpenSpec artifact work that Codex owns
- tell Codex when to shell out to Claude for bounded execution
- keep acceptance and archive decisions in Codex

Why:

- The user explicitly wants Codex to remain open as the workflow host.
- A Codex entrypoint that only redirects to Claude would not solve the actual problem.

Alternatives considered:

- Install Codex skills that simply proxy users back to Claude slash commands.
  Rejected because it preserves Claude-hosted control flow.

### Decision: Use explicit ownership language inside Codex skills

The skill templates should state:

- Codex is the orchestrator
- Claude executes bounded implementation work
- failures return to Codex for rework or retry decisions

Why:

- This keeps the runtime contract aligned with the product narrative.
- It gives us a clean textual acceptance target for tests.

### Decision: Manage only CCG-owned Codex skills during uninstall

Installer and uninstall logic should manage only the known CCG Codex skill directories.

Why:

- Users may already have their own Codex skills.
- A broad `~/.codex/skills` delete would be unsafe.

## Architecture

### Installed surfaces

- Claude compatibility assets stay under `~/.claude/...`
- Codex-native primary workflow assets are added under `~/.codex/skills/...`

### New installer responsibility

`installWorkflows()` gains a Codex skill installation step that:

1. locates `templates/codex-skills/`
2. copies known workflow skills into the Codex skills home
3. applies the same variable injection and home-path rewriting used for command templates

### New uninstall responsibility

`uninstallWorkflows()` removes only the known CCG Codex skill directories and leaves any other Codex skills intact.

## Skill Contract

### `ccg-spec-init`

- Runs from Codex
- Ensures OpenSpec is initialized or selects an existing change
- Produces the next bounded step in Codex rather than sending the user to Claude

### `ccg-spec-plan`

- Runs from Codex
- Reads proposal/spec/design/tasks context
- Produces the execution handoff contract and implementation boundaries

### `ccg-spec-impl`

- Runs from Codex
- Packages the execution prompt
- Invokes Claude for the execution phase
- Collects the return packet
- Performs acceptance, rework, and archive decisions in Codex

## Risks / Trade-offs

- [Risk: Skill wording drifts back into Claude-hosted instructions] -> Mitigation: add tests that reject `/ccg:*` redirect wording inside the Codex skill templates.
- [Risk: uninstall removes user-owned Codex skills] -> Mitigation: remove only the explicit CCG skill names.
- [Risk: the first skill set is incomplete] -> Mitigation: keep compatibility slash commands installed while the Codex-native surface grows incrementally.
- [Risk: Codex-side execution guidance becomes too implementation-specific] -> Mitigation: allow Claude invocation through the local CLI path while keeping the handoff contract tool-agnostic enough to evolve later.

## Open Questions

- Should later iterations add Codex-native equivalents for `spec-research`, `team-plan`, and `spec-review`, or should `spec-impl` remain the main managed shortcut?
- Should a later change move more usage guidance from slash-command language into Codex skill discovery and onboarding text?
