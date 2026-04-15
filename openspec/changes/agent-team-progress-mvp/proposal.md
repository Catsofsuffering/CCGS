## Why

CCGS is now explicitly being narrowed to a single primary path:

1. Codex owns change progression and review.
2. Claude Agent Teams perform implementation.
3. Codex decides acceptance and archive readiness.

Under that product direction, `codeagent-wrapper` is no longer the right foundation for monitoring or delivery. It exists to normalize multiple backend CLIs behind a single binary, but the maintained story no longer needs a multi-backend execution wrapper as the default path.

At the same time, the current monitoring experience is still tied to wrapper-owned state and an embedded wrapper UI. That keeps CCG focused on a compatibility surface we no longer want to lead with.

This change reorients monitoring around Claude-native hook events and removes `codeagent-wrapper` from the primary flow instead of continuing to iterate on a wrapper-centric frontend.

## What Changes

- Replace wrapper-owned monitoring with a Claude hook-based monitor service modeled on `B:\project\Claude-Code-Agent-Monitor`.
- Adopt a dedicated Node/React monitoring app for Claude Agent Teams sessions, activity, and workflow visibility.
- Redesign the integrated monitor frontend around React + Tailwind CSS + shadcn/ui primitives with a dark, industrial, Japanese editorial presentation.
- Update installation so CCG writes the required Claude hook configuration into `~/.claude/settings.json`.
- Remove `codeagent-wrapper` from the maintained single-path workflow and stop presenting it as a required runtime boundary.
- Keep compatibility cleanup bounded to removing wrapper-owned monitoring/UI and wrapper-specific install/runtime wiring that is no longer needed for the Codex -> Claude -> Codex path.

## Capabilities

### New Capabilities
- `execution-progress-monitoring`: Track and present Claude Agent Teams session, agent, and event activity through a hook-driven monitoring service and dashboard.

### Modified Capabilities
- `single-primary-workflow`: The maintained execution path no longer requires `codeagent-wrapper` as the standard invocation boundary.

## Impact

- Affected code: installer/config/runtime wiring in `src/`, new monitor integration paths under the main Node workspace, and removal of wrapper-owned monitoring assumptions.
- Affected UI: the primary monitoring UI becomes the integrated Claude hook monitor rather than the wrapper-embedded page, and its frontend is restyled to a monochrome editorial system with a single deep-green accent.
- Affected runtime behavior: Claude hook events are forwarded into a local monitor service with persistent state and live updates.
- Affected verification: install/runtime tests, monitor build/test, and removal or replacement of wrapper-specific verification where it no longer applies.
