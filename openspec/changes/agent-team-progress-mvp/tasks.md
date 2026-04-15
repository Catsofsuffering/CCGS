## 1. Monitor Integration

- [x] 1.1 Integrate the minimum viable server/client/hook assets from `B:\project\Claude-Code-Agent-Monitor` into the CCG workspace.
- [x] 1.2 Wire the integrated monitor to run as the primary local dashboard for Claude Agent Teams activity.

## 2. Install And Runtime Wiring

- [x] 2.1 Update installation logic so CCG writes the required Claude hook configuration into `~/.claude/settings.json`.
- [x] 2.2 Add any runtime helpers or commands needed to start/use the monitor without relying on `codeagent-wrapper`.

## 3. Primary Path Simplification

- [x] 3.1 Remove wrapper-owned monitoring/frontend code from the maintained path.
- [x] 3.2 Update command templates, runtime assumptions, and docs so the maintained workflow is explicitly `Codex orchestrates -> Claude Agent Teams execute -> Codex reviews`.

## 4. Verification

- [x] 4.1 Add or adapt tests for hook installation/configuration and monitor runtime behavior.
- [x] 4.2 Run the relevant build/test/typecheck verification for the integrated monitor and CCG root workspace.
- [x] 4.3 Validate the revised local installation path on this machine after the integration changes land.

## 5. Monitoring UI Redesign

- [ ] 5.1 Add shadcn/ui-compatible frontend foundations in `claude-monitor/client` for shared primitives, monochrome tokens, deep-green accent rules, typography, and constrained motion utilities.
- [ ] 5.2 Redesign the shared shell (`App.tsx`, `Layout.tsx`, `Sidebar.tsx`, and global styles) into a dark industrial editorial structure that avoids default dashboard card stacks.
- [ ] 5.3 Rebuild `Dashboard.tsx`, `Sessions.tsx`, `ActivityFeed.tsx`, and `SessionDetail.tsx` so each section serves one job and each page has one primary visual anchor.
- [ ] 5.4 Bring remaining monitor pages into the same system without introducing extra accent colors, extra fonts, or decorative animations.
- [ ] 5.5 Verify `pnpm --dir claude-monitor/client build` and `pnpm --dir claude-monitor/client test`, then manually confirm desktop/mobile responsiveness, reduced-motion behavior, and the visual constraints from the spec.
