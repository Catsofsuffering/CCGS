# Command Reference

CCG now maintains a smaller command surface centered on the Codex-led workflow.

## Primary path

| Command | Purpose |
|---------|---------|
| `/ccg:spec-init` | Initialize or repair the OpenSpec workspace |
| `/ccg:spec-research` | Turn a request into constraints and change inputs |
| `/ccg:spec-plan` | Produce the execution handoff contract |
| `/ccg:team-plan` | Split the scoped work into execution packages |
| `/ccg:team-exec` | Run Claude Agent Teams against the bounded plan |
| `/ccg:team-review` | Review execution results before acceptance |
| `/ccg:spec-review` | Final Codex acceptance gate |
| `/ccg:spec-impl` | Managed shortcut for dispatch plus acceptance |

## Utility commands

| Command | Purpose |
|---------|---------|
| `/ccg:context` | Manage project context and decision logs |
| `/ccg:enhance` | Turn a rough request into a clearer task brief |
| `/ccg:init` | Generate project-facing `CLAUDE.md` guidance |
| `/ccg:commit` | Generate a commit message from current changes |
| `/ccg:rollback` | Roll back interactively |
| `/ccg:clean-branches` | Remove merged or stale branches safely |
| `/ccg:worktree` | Manage Git worktrees |

## Example

```bash
/ccg:spec-init
/ccg:spec-research add an approval workflow to invoices
/ccg:spec-plan
/ccg:team-plan
/ccg:team-exec
/ccg:team-review
/ccg:spec-review
```
