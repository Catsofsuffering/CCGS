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
- Preserve OpenSpec as the change/spec lifecycle backbone.
- Preserve `codeagent-wrapper` as the backend invocation boundary.
- Preserve Claude Agent Teams as an execution capability, but only as a Codex-dispatched worker layer.
- Make MCP, skills, and Gemini optional enhancements rather than assumed dependencies.
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

### Decision: Treat MCP, skills, and Gemini as optional integration layers
The primary install and runtime path should succeed without MCP, skills, or Gemini. Those systems remain available as additive features.

Why this decision:
- The user wants a simpler, more dependable default workflow.
- Optionality reduces setup friction and makes responsibilities easier to understand.
- Existing fallback behavior for non-MCP search already exists and can be expanded.

Alternatives considered:
- Keep current defaults and rely on documentation to describe them as optional.
  Rejected because current product behavior still signals that they are part of the normal path.
- Remove those systems entirely.
  Rejected because they may still provide value for secondary workflows and backward compatibility.

## Risks / Trade-offs

- [Risk: Dual workflow confusion during migration] -> Mitigation: define one explicit "primary path" and label legacy paths as compatibility flows in commands and docs.
- [Risk: Claude-specific assets remain deeply wired into installer and templates] -> Mitigation: separate install targets, command registry, and template defaults into host-agnostic vs host-specific layers before simplifying further.
- [Risk: Existing users may rely on current Claude-first behavior] -> Mitigation: preserve legacy commands initially and migrate documentation in phases.
- [Risk: Codex-led acceptance may require new retry and rejection loops] -> Mitigation: encode the Codex dispatch -> Claude execute -> Codex accept cycle explicitly in tasks and command templates.
- [Risk: Optional integrations may still leak into the default user experience] -> Mitigation: audit installer prompts, config defaults, menu entries, and template language for mandatory wording.

## Migration Plan

1. Define the Codex-led workflow contract in OpenSpec artifacts.
2. Introduce Codex-first command and template semantics without removing legacy flows.
3. Refactor config and installer defaults so the primary path is no longer Claude-first.
4. Reframe Claude execution assets as downstream worker paths.
5. Downgrade MCP, skills, and Gemini to optional integration flows in install/config/docs.
6. Validate that a minimal Codex-led install works without optional integrations.
7. Retire or rewrite legacy Claude-first messaging once the new path is stable.

Rollback strategy:
- Keep legacy commands and routing definitions available until the Codex-led path is verified.
- If the new host/orchestrator split proves unstable, restore the previous defaults while retaining the new artifacts for a later iteration.

## Open Questions

- Should the Codex-led path continue to install into Claude-owned directories for compatibility, or should installation targets move toward Codex-owned paths in the first implementation phase?
- Should legacy `/ccg:*` command names be preserved with changed semantics, or should the Codex-led path introduce a new command surface first?
- How much of the existing menu/config UX should survive if the main experience moves away from Claude as the host shell?
- Should acceptance be implemented as a dedicated Codex-only command, or folded into an updated spec implementation flow?
