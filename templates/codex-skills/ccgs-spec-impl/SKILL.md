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
$env:NO_PROXY = @($env:NO_PROXY, $localBypass) | Where-Object { $_ -and $_.Trim() -ne '' } | Select-Object -Unique | Join-String -Separator ','
$env:no_proxy = $env:NO_PROXY

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
