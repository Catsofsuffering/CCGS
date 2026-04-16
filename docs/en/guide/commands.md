# Command Reference

CCG now maintains a smaller command surface centered on the Codex-led workflow.

## Primary path

| Command | Purpose |
|---------|---------|
| `/ccgs:spec-init` | Initialize or repair the OpenSpec workspace |
| `/ccgs:spec-research` | Turn a request into constraints and change inputs |
| `/ccgs:spec-plan` | Produce the execution handoff contract |
| `/ccgs:team-plan` | Split the scoped work into execution packages |
| `/ccgs:team-exec` | Run Claude Agent Teams against the bounded plan |
| `/ccgs:team-review` | Review execution results before acceptance |
| `/ccgs:spec-review` | Final Codex acceptance gate |
| `/ccgs:spec-impl` | Managed shortcut for dispatch plus acceptance |

## Utility commands

| Command | Purpose |
|---------|---------|
| `/ccgs:context` | Manage project context and decision logs |
| `/ccgs:enhance` | Turn a rough request into a clearer task brief |
| `/ccgs:init` | Generate project-facing `CLAUDE.md` guidance |
| `/ccgs:commit` | Generate a commit message from current changes |
| `/ccgs:rollback` | Roll back interactively |
| `/ccgs:clean-branches` | Remove merged or stale branches safely |
| `/ccgs:worktree` | Manage Git worktrees |

## Example

```bash
/ccgs:spec-init
/ccgs:spec-research add an approval workflow to invoices
/ccgs:spec-plan
/ccgs:team-plan
/ccgs:team-exec
/ccgs:team-review
/ccgs:spec-review
```
