## Context

The current repository is built around a Claude-hosted product shape:
- installation targets `~/.claude` by default
- slash commands are installed into Claude command directories
- the primary workflow narrative presents Claude as the orchestrator
- Codex, Gemini, MCP, and skills are layered onto that Claude-first control plane

That architecture conflicts with the intended direction for this change:
- Codex should own change/spec creation and workflow progression
- Claude should be invoked by Codex as an execution layer, especially for Agent Teams
- final verification and archive decisions should return to Codex
- MCP, skills, and Gemini should remain available, but no longer define the default path

This is a cross-cutting change because it affects product story, install/config defaults, template semantics, and runtime orchestration boundaries.

## Goals / Non-Goals

**Goals:**
- Make Codex the default orchestrator for the primary workflow.
- Allow installers to explicitly confirm or override who orchestrates the workflow so the Codex-led path remains the recommendation but Claude-led compatibility stays accessible.
- Preserve OpenSpec as the change/spec lifecycle backbone.
- Preserve `codeagent-wrapper` as the backend invocation boundary.
- Preserve Claude Agent Teams as an execution capability, but only as a Codex-dispatched worker layer.
- Remove Gemini from the default dependency path for the primary workflow.
- Keep MCP and skills available as optional compatibility layers without forcing additional simplification work into this change.
- Keep enough compatibility that existing assets can be migrated instead of rewritten from scratch.

**Non-Goals:**
- Rebuild the entire project from zero.
- Remove Claude support from the project.
- Remove MCP, skills, or Gemini from the codebase entirely in the first pass.
- Redesign every legacy command before the new Codex-led path exists.
- Change the OpenSpec artifact model itself.

## Decisions

### Decision: Replace the host/orchestrator assumption before deleting features
The implementation should first change who owns orchestration, then simplify surrounding features.

Why this decision:
- The main mismatch is not feature count; it is control ownership.
- If optional features are removed first, the product can still remain Claude-first and fail the intended workflow.
- Reassigning orchestration early gives a stable foundation for later reductions.

Alternatives considered:
- Remove MCP, skills, and Gemini first.
  Rejected because it reduces complexity without correcting the central workflow ownership model.
- Rewrite the project from scratch.
  Rejected for the first pass because the repository already contains reusable OpenSpec, wrapper, installer, and template assets.

### Decision: Keep OpenSpec and codeagent-wrapper as core infrastructure
OpenSpec remains the artifact lifecycle engine, and `codeagent-wrapper` remains the standard boundary for invoking external backends.

Why this decision:
- OpenSpec already models proposal/spec/design/tasks/archive progression.
- `codeagent-wrapper` already normalizes backend execution and supports Codex, Gemini, and Claude.
- Reusing both preserves proven infrastructure while limiting the surface area of the refactor.

Alternatives considered:
- Replace OpenSpec with a custom change system.
  Rejected because it would expand scope into workflow engine replacement.
- Bypass `codeagent-wrapper` and shell out directly per backend.
  Rejected because it would duplicate backend invocation logic and fragment runtime behavior.

### Decision: Introduce a Codex-led primary path while keeping legacy paths as compatibility flows
The system should add a clearly defined Codex-led main workflow and downgrade existing Claude-first or multi-model flows into compatibility/secondary paths until they can be migrated or removed.

Why this decision:
- It lets the product pivot without breaking every existing asset at once.
- It creates a migration path for templates, docs, and installer defaults.
- It reduces risk by avoiding an all-at-once rewrite of every command.

Alternatives considered:
- Immediately rename and rewrite all legacy commands in one pass.
  Rejected because it increases rollout risk and makes verification harder.
- Keep the current main path and add Codex orchestration as an optional mode.
  Rejected because the desired product story requires Codex to be the default, not an optional variant.

### Decision: Model Claude Agent Teams as a dispatched execution subsystem
Claude Agent Teams should be invoked through Codex-controlled workflow steps, with explicit handoff context and explicit return of results.

Why this decision:
- It preserves Claude's strength in multi-agent execution without giving it control over the workflow lifecycle.
- It cleanly separates "planning and acceptance" from "implementation execution."
- It creates a clearer contract for retries, rejection, and rework loops.

Alternatives considered:
- Leave Agent Teams as the top-level workflow host.
  Rejected because it preserves the current inversion of control.
- Replace Agent Teams with Codex-native worker orchestration immediately.
  Rejected because the user explicitly wants Claude to remain the worker layer.

### Decision: Remove Gemini from the default path and leave MCP/skills as compatibility-safe optional layers
The primary install and runtime path should succeed without Gemini. MCP and skills remain available as additive features, but deeper streamlining of those surfaces is explicitly deferred from this change.

Why this decision:
- The user wants a simpler, more dependable default workflow.
- Gemini was the remaining default-path dependency that still leaked into prompts, routing, and install behavior.
- MCP and skills are already optional enough for current usage, so forcing further refactors here would widen scope without improving the main orchestration contract.

Alternatives considered:
- Keep Gemini in the default routing and rely on documentation to call it optional.
  Rejected because install/runtime behavior would still contradict the desired product story.
- Simplify MCP and skills in the same pass.
  Deferred because the user chose to prioritize Codex orchestration and Gemini soft dependency first.

### Decision: Compatibility flows may remain installed, but they must follow configured models instead of hardcoded Gemini roles
Legacy and secondary commands can stay available during migration, but they must stop assuming Gemini is the default frontend authority or an always-on review partner.

Why this decision:
- Keeping compatibility commands is useful for existing users and for staged migration.
- Leaving hardcoded Gemini prompts and session names in those commands creates a product contradiction: the menu says Gemini is optional, while the command bodies still require it.
- Reusing configured `FRONTEND_PRIMARY` / `BACKEND_PRIMARY` routing keeps compatibility flows usable without freezing them to one model pair.

Alternatives considered:
- Hide all compatibility commands until they are fully redesigned.
  Rejected because the current fork still intentionally ships those commands as transitional surfaces.
- Leave compatibility commands unchanged and rely on docs to warn users.
  Rejected because runtime instructions would still fail the "Gemini is optional" contract in practice.

## Risks / Trade-offs

- [Risk: Dual workflow confusion during migration] -> Mitigation: define one explicit "primary path" and label legacy paths as compatibility flows in commands and docs.
- [Risk: Claude-specific assets remain deeply wired into installer and templates] -> Mitigation: separate install targets, command registry, and template defaults into host-agnostic vs host-specific layers before simplifying further.
- [Risk: Existing users may rely on current Claude-first behavior] -> Mitigation: preserve legacy commands initially and migrate documentation in phases.
- [Risk: Codex-led acceptance may require new retry and rejection loops] -> Mitigation: encode the Codex dispatch -> Claude execute -> Codex accept cycle explicitly in tasks and command templates.
- [Risk: Compatibility surfaces may still mention integrations that are no longer part of the default path] -> Mitigation: audit installer prompts, config defaults, menu entries, and template language for mandatory Gemini wording while documenting MCP/skills as retained optional layers.

## Implementation Audit

The first implementation pass confirmed that the current Claude-first assumption is encoded in multiple layers, not just in documentation:

- `src/utils/config.ts` stores config and command paths under Claude-owned defaults and previously routed the default frontend path to Gemini.
- `src/commands/init.ts` brands the installer as "Claude + Codex + Gemini", defaults the interactive frontend choice to Gemini, and assumes the old host narrative.
- `src/cli-setup.ts` presents the CLI help as a Claude-first multi-model product rather than a Codex-led workflow.
- `src/commands/menu.ts` brands the main menu around Claude Code and reads the workflow config from Claude-owned paths.
- `src/commands/update.ts` still resolves its install root from the host directory assumption instead of a workflow-owned helper.
- `src/utils/installer-template.ts` only rewrote `~/.claude/...` placeholders, so template installation could not absorb future Codex-owned path references.
- `src/utils/installer-data.ts` described the primary commands as Claude-led or Gemini-default rather than Codex-led with Claude execution handoff.

This audit defines the minimum foundation that must change before template semantics and optional integration behavior can be migrated safely.

## Migration Plan

1. Define the Codex-led workflow contract in OpenSpec artifacts.
2. Introduce Codex-first command and template semantics without removing legacy flows.
3. Refactor config and installer defaults so the primary path is no longer Claude-first.
4. Reframe Claude execution assets as downstream worker paths.
5. Remove Gemini from the default install/config/docs path and document MCP/skills as retained optional layers.
6. Surface orchestrator selection during install so users can explicitly confirm the Codex-led default (with Claude execution) or fall back to a Claude-led compatibility path.
7. Validate that a minimal Codex-led install works without Gemini enabled.
8. Audit the primary-path research commands and remove any remaining mandatory Gemini wording or hardcoded Gemini prompt paths.
9. Audit compatibility and secondary commands, replacing mandatory Gemini assumptions with configured routing and optional-participation guidance.
10. Retire or rewrite legacy Claude-first messaging once the new path is stable.

Rollback strategy:
- Keep legacy commands and routing definitions available until the Codex-led path is verified.
- If the new host/orchestrator split proves unstable, restore the previous defaults while retaining the new artifacts for a later iteration.

## Open Questions

- Should the Codex-led path continue to install into Claude-owned directories for compatibility, or should installation targets move toward Codex-owned paths in the first implementation phase?
- Should legacy `/ccg:*` command names be preserved with changed semantics, or should the Codex-led path introduce a new command surface first?
- How much of the existing menu/config UX should survive if the main experience moves away from Claude as the host shell?
- Should acceptance be implemented as a dedicated Codex-only command, or folded into an updated spec implementation flow?
- [New Decision: Surface orchestrator selection before model routing]
  - **Why**: Users need to see and optionally override which runtime owns orchestration. Without an explicit installer step, the CLI still feels Claude-first because the only visible choices are frontend/backend models.
  - **Implementation**: Add an “orchestrator” prompt ahead of frontend/backend model selection, persist it into `config.ownership`, and show it in the install summary. Default stays Codex-led, but Claude can be selected for compatibility.
  - **Alternatives Considered**: Keep orchestrator implicit and rely on docs. Rejected because it fails to reassure users who expect to pick the orchestrator role explicitly, leading to confusion about Claude’s execution role.
