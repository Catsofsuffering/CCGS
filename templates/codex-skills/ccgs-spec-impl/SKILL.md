---
name: ccgs-spec-impl
description: Dispatch Claude execution from Codex and keep acceptance in Codex. Use when the change is planned and ready for implementation.
license: MIT
---

Implement the planned change while keeping Codex as the host workflow.

**Core contract**

- Codex remains the orchestrator.
- Claude is the execution worker.
- Codex owns testing, acceptance, rework, and archive decisions.

**Steps**

1. Select the active change with `openspec status --change "<change-name>" --json`.
2. Read the full execution context from `proposal.md`, `design.md`, `tasks.md`, and the change specs.
3. Build a bounded execution packet that includes:
   - the implementation goal
   - allowed and protected paths
   - required tests and checks
   - the return packet format
4. Invoke Claude from Codex with a bounded prompt. Prefer the local Claude CLI:

```powershell
$localBypass = '127.0.0.1,localhost'
$proxyParts = @($env:NO_PROXY, $localBypass) | Where-Object { $_ -and $_.Trim() -ne '' } | ForEach-Object { $_.Split(',') } | ForEach-Object { $_.Trim() } | Where-Object { $_ }
$env:NO_PROXY = ($proxyParts | Select-Object -Unique) -join ','
$env:no_proxy = $env:NO_PROXY
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = '1'
$env:CLAUDE_CODE_ENABLE_TASKS = '1'

$prompt = @'
You are the Claude execution worker for this change.

Implement only the approved scope.
Return:
- changed files
- tests run
- unresolved issues
- recommended next step: accept or rework
'@

claude -p $prompt
```

   Preserve your existing proxy, but make sure local Anthropic-compatible endpoints such as `127.0.0.1` and `localhost` bypass the proxy via `NO_PROXY` / `no_proxy`.
   Treat `claude -p` as the host entrypoint. Do not assume a separate `claude teammates` CLI command exists.
   If the execution packet requires Agent Teams, enable both `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` and `CLAUDE_CODE_ENABLE_TASKS=1`, then instruct Claude to use the in-session team tools (`TeamCreate`, `TaskCreate`, `SendMessage`, `Agent(team_name=..., name=...)`) after the Claude session starts.
   Require every teammate prompt to define its mailbox return protocol explicitly: if `SendMessage` is deferred, the teammate must run `ToolSearch select:SendMessage` before its first mailbox reply, and any string reply must include both `summary` and `message`.
   Tell Claude that a teammate is not considered finished just because it goes idle or emits `SubagentStop`; the required report only counts after the team lead receives the teammate mailbox message.
   In non-interactive `claude -p` sessions, require Claude to emit the full return packet before shutdown, then follow the official shutdown order: gracefully shut down teammates, wait for approvals, and run cleanup exactly once.
   If cleanup reports success or `nothing to clean up`, do not let Claude keep retrying cleanup. Treat the last complete return packet as terminal output and stop the host Claude process if it falls into the known shutdown-reminder loop.

5. Review the Claude return packet in Codex.
6. Run the required local verification in Codex.
7. If verification fails, keep the change open and produce a rework packet for the next Claude execution cycle.
8. If verification passes, approve archive from Codex with `openspec archive <change-name>`.

**Output**

- execution packet
- Claude return packet
- Codex acceptance decision
- archive approval or rework packet

**Guardrails**

- Do not tell the user to switch into Claude and run legacy slash commands.
- Do not let Claude make the final archive decision.
- Do not archive before Codex verification passes.
