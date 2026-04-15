## Context

The previous iteration of this change improved the wrapper monitor, but that work no longer matches the product direction.

CCGS is now intentionally optimizing for one maintained path:

- Codex orchestrates
- Claude Agent Teams execute
- Codex reviews and accepts

That decision changes the architecture boundary:

- Monitoring should be attached to Claude-native execution events, not wrapper-managed task abstractions.
- The primary monitor should be a standalone local service and web app, not a page embedded into a Go execution wrapper.
- `codeagent-wrapper` is now a compatibility artifact, not a strategic product surface.

The cloned reference repository at `B:\project\Claude-Code-Agent-Monitor` is a better fit for the maintained path because it already implements the missing pieces:

- Claude hook ingestion
- persistent session/agent/event storage
- WebSocket-based live UI updates
- a richer monitoring dashboard and session analytics surface

## Goals / Non-Goals

**Goals:**

- Integrate a Claude hook-based monitor into CCG as the primary monitoring surface.
- Remove `codeagent-wrapper` from the maintained single-path workflow.
- Update install/runtime wiring so Claude hook events are configured and the monitor can be started locally.
- Reuse the upstream monitor architecture where it fits, while trimming it to CCG's supported path.

**Non-Goals:**

- Preserving `codeagent-wrapper` as a first-class product feature.
- Maintaining multi-backend execution normalization for the primary path.
- Shipping every ancillary feature from the upstream monitor repository on day one.
- Keeping the previous embedded wrapper UI alive as a parallel maintained frontend.

## Decisions

### Decision: Move monitoring to Claude-native hooks

The primary monitoring model will be driven by Claude Code hook events such as session start/end, tool activity, and subagent lifecycle changes.

Why this decision:

- The maintained execution path is Claude Agent Teams, so Claude-native events are the most honest source of truth.
- Hook events give access to session/agent/activity timelines without inventing wrapper-specific task identities.
- The reference monitor already proves this model end-to-end.

Alternatives considered:

- Keep deriving monitoring state from wrapper execution.
  Rejected because wrapper state is no longer the maintained runtime.
- Build a new monitor protocol from scratch.
  Rejected because the reference implementation already covers the needed local architecture.

### Decision: Use the cloned monitor repository as the new primary monitor integration base

CCG will integrate the `Claude-Code-Agent-Monitor` architecture as its primary dashboard instead of continuing the AgentField-inspired wrapper frontend.

Why this decision:

- It matches the Claude-execution-only direction directly.
- It includes a mature React UI and a Node service designed around Claude hooks.
- It removes the need to keep investing in wrapper-specific UI and persistence.

Alternatives considered:

- Continue with the AgentField-inspired wrapper monitor.
  Rejected because it improves the wrong runtime surface.
- Keep only the current minimal wrapper monitor.
  Rejected because it still centers the compatibility layer.

### Decision: Remove wrapper-owned monitoring and wrapper-specific install assumptions from the primary workflow

The maintained install path should configure Claude hooks and the new monitor service, not a wrapper binary and wrapper shell permissions.

Why this decision:

- The current installer, templates, and docs all still teach a wrapper-first model.
- Keeping both as equal first-class paths would create unnecessary product ambiguity.
- The user explicitly wants the single primary path, not an extra layer around it.

Alternatives considered:

- Dual-track support with wrapper and hook monitor both treated as primary.
  Rejected because it preserves complexity without product value.

### Decision: Rebuild the monitor presentation layer on a constrained React + Tailwind + shadcn/ui system

The integrated monitor client should keep React as the host framework, keep Tailwind CSS as the token and layout layer, and adopt shadcn/ui-compatible primitives for the shared interaction surface.

Why this decision:

- The current client already runs on React and Tailwind, so the redesign can stay within the existing runtime instead of introducing a second frontend stack.
- The current UI is still dominated by bespoke page markup, repeated card treatments, and accent usage that do not match the intended product tone.
- shadcn/ui-compatible primitives give the execution step a bounded component vocabulary without forcing a heavy design system rewrite.

Alternatives considered:

- Keep the current utility-only component layer and restyle pages ad hoc.
  Rejected because it would make the redesign inconsistent and harder to review.
- Rebuild the monitor in another framework.
  Rejected because it expands the change surface without product benefit.

### Decision: Use a dark industrial editorial language with one accent and one dominant visual per page

The monitor should feel like an operational publication rather than a SaaS card dashboard: restrained, typographic, and high-contrast, with monochrome structure and a single deep-green accent.

Why this decision:

- The current UI uses multiple accent hues, rounded card repetition, and dashboard conventions that work against the requested product character.
- A Japanese editorial layout model fits a monitoring product that needs hierarchy, rhythm, and discipline instead of decorative density.
- Constraining type, color, and motion forces clearer page structure and makes review objective.

Alternatives considered:

- Preserve the current dashboard aesthetic and only tweak colors.
  Rejected because the structural problems would remain.
- Use multiple status accents to encode more information.
  Rejected because the requested art direction explicitly limits the UI to one accent color.

## Frontend Experience Constraints

- Framework: React client remains the frontend host, with Tailwind CSS for tokens/layout and shadcn/ui-compatible primitives for shared controls.
- Palette: neutrals only for the base UI, with one deep-green accent used for focus, live state, and key emphasis.
- Typography: maximum two font families. Preferred pairing for implementation review is an industrial sans for UI metadata and a Japanese editorial serif for display hierarchy.
- Layout: avoid card-heavy dashboards. Prefer ruled layouts, tables, list ledgers, split columns, pinned rails, and deliberate white-space blocks.
- Page composition: each section should do one job. Each page should have one primary visual anchor only.
- Motion: no more than three motion patterns total across the app. Recommended set is page-enter reveal, live-update signal, and disclosure/expand transitions.
- Responsiveness: the editorial hierarchy must survive mobile and desktop without collapsing into dense card stacks.

## Risks / Trade-offs

- [Removing wrapper assumptions touches many surfaces at once] -> Mitigation: update OpenSpec boundaries first, then change installer/templates/runtime together.
- [The upstream monitor is larger than the minimum CCG need] -> Mitigation: integrate only the server/client/hook path required for the maintained workflow.
- [Existing compatibility flows may still mention wrapper execution] -> Mitigation: relabel or trim compatibility surfaces as part of this change.
- [Users who relied on wrapper-specific behavior may lose that path] -> Mitigation: this change is explicitly for the maintained single-path workflow; compatibility cleanup can stay bounded and deliberate.

## Migration Plan

1. Re-scope CCG docs/specs/install/runtime from wrapper-first to Claude-hook-first monitoring.
2. Integrate the hook monitor server/client as a local CCG-managed service.
3. Add installer support for Claude hook registration and monitor runtime assets.
4. Remove wrapper-owned monitoring/UI and wrapper-specific execution assumptions from the maintained path.
5. Verify install, hook ingestion, live dashboard behavior, and the revised Codex -> Claude -> Codex loop.

## Open Questions

- Whether `codeagent-wrapper` should remain in the repository temporarily as a compatibility artifact even after it leaves the maintained path.
- Whether the monitor service should be launched explicitly by the user at first, or be managed by a CCG helper command/install-time runtime helper.

## Execution Handoff Contract

### Execution Goal

Replace the wrapper-owned monitoring path with an integrated Claude hook-based monitor aligned to the maintained Codex -> Claude Agent Teams -> Codex workflow, and remove `codeagent-wrapper` from the primary product path.

### Upstream Reference

- Cloned repository: `B:\project\Claude-Code-Agent-Monitor`
- Relevant surfaces inspected: `server/`, `client/`, `scripts/install-hooks.js`, `scripts/hook-handler.js`, `server/routes/hooks.js`
- Key finding: the repository is not just a frontend; it is a complete local monitoring stack built around Claude hooks, persistent state, and a React dashboard.

### Allowed Change Surface

- `src/commands/*`, `src/utils/*`, and related installer/runtime wiring
- New integrated monitor source paths under the main Node workspace
- Claude hook installation and monitor runtime configuration
- Documentation and templates that still present `codeagent-wrapper` as the maintained path
- Removal of wrapper-owned monitoring/UI assets that no longer belong to the maintained workflow

### Protected Surface

- Unrelated MCP features and optional tool integrations unless required by the new monitor path
- OpenSpec changes unrelated to `agent-team-progress-mvp`
- Broad product rewrites outside the execution/monitoring path

### Work Packages

1. Integrate the monitor server/client foundation from `Claude-Code-Agent-Monitor` into CCG.
2. Add installer/runtime support for Claude hook registration and local monitor startup.
3. Repoint CCG docs/templates/config to the single primary path without wrapper-owned monitoring.
4. Remove wrapper monitoring/frontend assumptions and obsolete wrapper-specific runtime wiring from the maintained path.
5. Verify the new monitor path with build/test/install/runtime checks.

### Required Verification

- Integrated monitor frontend build succeeds
- Integrated monitor server tests pass
- Installer/runtime changes for hook setup are verified locally
- Root typecheck/build/test pass where still applicable after the integration
- Any new monitor-specific test command added by this change is run and recorded

### Rework Triggers

- The integration still depends on `codeagent-wrapper` for the maintained path
- Installer changes leave Claude hooks unconfigured or inconsistent
- The resulting monitor cannot represent Claude Agent Teams sessions and agent activity from real hook events
- The single primary workflow still documents wrapper-owned execution as required

### Exact Bounded Packet For `ccg-spec-impl`

- Change id: `agent-team-progress-mvp`
- Execution goal: replace wrapper-owned monitoring with an integrated Claude hook-based monitor and remove `codeagent-wrapper` from the maintained path
- Allowed boundaries: installer/runtime/templates/docs plus new monitor integration surfaces and wrapper-monitor removal
- Protected boundaries: unrelated optional integrations and unrelated OpenSpec changes
- Required verification: integrated monitor build/test, local hook/install verification, root verification commands still relevant after integration
- Next skill: `ccg-spec-impl`

### Frontend Redesign Execution Slice

#### Execution Goal

Redesign the integrated monitor frontend in `claude-monitor/client` so the primary monitoring experience uses React + Tailwind CSS + shadcn/ui primitives, a dark industrial editorial layout, one deep-green accent, at most two fonts, minimal card usage, and only purposeful motion.

#### Allowed Change Surface

- `claude-monitor/client/package.json`
- `claude-monitor/client/tailwind.config.js`
- `claude-monitor/client/src/index.css`
- `claude-monitor/client/src/main.tsx`
- `claude-monitor/client/src/App.tsx`
- `claude-monitor/client/src/components/**`
- `claude-monitor/client/src/pages/**`
- New shared primitives under `claude-monitor/client/src/components/ui/**`

#### Protected Surface

- `claude-monitor/server/**`
- Hook ingestion, persistence, and WebSocket protocol files unless a frontend-only type import must be adjusted
- Data shape contracts in `claude-monitor/client/src/lib/api.ts`, `claude-monitor/client/src/lib/eventBus.ts`, and `claude-monitor/client/src/lib/types.ts` unless required for rendering correctness
- Root installer/runtime wiring in `src/**`
- Unrelated OpenSpec changes

#### Work Packages

1. Add the frontend design-system foundation: shadcn/ui-compatible primitives, color/type tokens, and motion utilities inside `claude-monitor/client`.
2. Redesign the shared shell and navigation so the app establishes the editorial tone without leaning on stacked cards.
3. Rebuild the primary monitoring pages (`Dashboard`, `Sessions`, `ActivityFeed`, `SessionDetail`) so each section has one responsibility and each page has one dominant visual.
4. Bring secondary pages into visual alignment without inventing extra hero visuals or new accent colors.
5. Verify build, tests, responsiveness, reduced-motion behavior, and the constrained visual system.

#### Required Verification

- `pnpm --dir claude-monitor/client build`
- `pnpm --dir claude-monitor/client test`
- Manual review of dashboard, sessions, activity feed, and session detail at desktop and mobile widths
- Manual review that only one accent color is present, no more than two font families are loaded, and animation patterns stay within the approved set

#### Rework Triggers

- The redesign introduces more than one accent color or more than two font families
- The resulting pages still depend on card grids as their default composition pattern
- A page contains multiple competing hero visuals or sections without a single clear responsibility
- Motion is added as decoration rather than communicating load, live state, or disclosure
- The frontend change requires backend protocol or installer changes to function

#### Exact Bounded Packet For `ccg-spec-impl`

- Change id: `agent-team-progress-mvp`
- Execution goal: redesign the `claude-monitor/client` monitoring UI to the constrained editorial system defined above
- Allowed boundaries: `claude-monitor/client` styles, shared components, page components, and new `components/ui` primitives
- Protected boundaries: server, hook ingestion/runtime wiring, root installer code, and unrelated OpenSpec artifacts
- Required verification: client build/test plus manual checks for responsiveness, accent/font limits, layout discipline, and sparse motion
- Next skill: `ccg-spec-impl`
