# Command Reference

CCSM now maintains a smaller command surface centered on the Codex-led workflow.

## Primary path

| Command | Purpose |
|---------|---------|
| `/ccsm:spec-init` | Initialize or repair the OpenSpec workspace |
| `/ccsm:spec-research` | Turn a request into constraints and change inputs |
| `/ccsm:spec-plan` | Produce the execution handoff contract |
| `/ccsm:team-plan` | Split the scoped work into execution packages |
| `/ccsm:team-exec` | Run Claude Agent Teams against the bounded plan |
| `/ccsm:team-review` | Review execution results before acceptance |
| `/ccsm:spec-review` | Final Codex acceptance gate |
| `/ccsm:spec-impl` | Managed shortcut for dispatch plus acceptance |

## Utility commands

| Command | Purpose |
|---------|---------|
| `/ccsm:context` | Manage project context and decision logs |
| `/ccsm:enhance` | Turn a rough request into a clearer task brief |
| `/ccsm:init` | Generate project-facing `CLAUDE.md` guidance |
| `/ccsm:commit` | Generate a commit message from current changes |
| `/ccsm:rollback` | Roll back interactively |
| `/ccsm:clean-branches` | Remove merged or stale branches safely |
| `/ccsm:worktree` | Manage Git worktrees |

## Example

```bash
/ccsm:spec-init
/ccsm:spec-research add an approval workflow to invoices
/ccsm:spec-plan
/ccsm:team-plan
/ccsm:team-exec
/ccsm:team-review
/ccsm:spec-review
```
