$ErrorActionPreference = 'Stop'

$sessionLabel = 'ccgs-agent-teams-shutdown-fix-20260417'
$startTime = Get-Date
$outFile = Join-Path $env:TEMP "$sessionLabel.out.txt"
$errFile = Join-Path $env:TEMP "$sessionLabel.err.txt"
$promptFile = Join-Path $env:TEMP "$sessionLabel.prompt.txt"
$runnerFile = Join-Path $env:TEMP "$sessionLabel.runner.ps1"

Remove-Item $outFile, $errFile, $promptFile, $runnerFile -ErrorAction SilentlyContinue

$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = '1'
$env:CLAUDE_CODE_ENABLE_TASKS = '1'
$env:NO_PROXY = '127.0.0.1,localhost'
$env:no_proxy = $env:NO_PROXY

$prompt = @'
You are validating the non-interactive Claude Agent Teams shutdown path after a template fix.

Requirements:
- Create an agent team with exactly 2 teammates.
- If team tools are deferred, use ToolSearch first.
- Read only. Do not edit any files.
- Use these exact teammate prompt requirements when you create the two teammates.
- Teammate 1 prompt must instruct:
  1. Read only B:/project/ccs/package.json
  2. Before the first mailbox reply, if SendMessage is deferred, run ToolSearch with query select:SendMessage
  3. Send a mailbox reply to team-lead with summary "package.json report"
  4. The message body must contain only the package name and version
  5. Do not emit pseudo tool markup such as <invoke name="SendMessage">
- Teammate 2 prompt must instruct:
  1. Read only B:/project/ccs/templates/commands/team-exec.md
  2. Before the first mailbox reply, if SendMessage is deferred, run ToolSearch with query select:SendMessage
  3. Send a mailbox reply to team-lead with summary "team-exec.md report"
  4. The message body must state whether team-exec.md explicitly mentions CLAUDE_CODE_ENABLE_TASKS=1 and whether cleanup must not be retried after success / nothing-to-clean-up
  5. Do not emit pseudo tool markup such as <invoke name="SendMessage">
- After both reports arrive, gracefully shut down teammates, wait for approvals, and clean up the team exactly once.
- A teammate report only counts after the team lead receives the actual teammate mailbox message. Idle or SubagentStop alone do not count.
- If cleanup succeeds or says nothing to clean up / no team found, do not retry cleanup even if more shutdown reminders arrive.
- Then return one final response in Chinese beginning with CCGS_SMOKE_DONE.
- In that final response include:
  1. Whether team creation succeeded
  2. Whether exactly 2 teammates were created
  3. Each teammate's finding
  4. Which tools were actually used
  5. Whether cleanup succeeded
'@

Set-Content -Path $promptFile -Value $prompt -Encoding UTF8
@"
`$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = '1'
`$env:CLAUDE_CODE_ENABLE_TASKS = '1'
`$env:NO_PROXY = '127.0.0.1,localhost'
`$env:no_proxy = `$env:NO_PROXY
Get-Content -Raw '$promptFile' | & 'C:\Users\82162\.local\bin\claude.exe' --name '$sessionLabel' -p
"@ | Set-Content -Path $runnerFile -Encoding UTF8

$proc = Start-Process -FilePath 'powershell.exe' `
  -ArgumentList @('-ExecutionPolicy', 'Bypass', '-File', $runnerFile) `
  -RedirectStandardOutput $outFile `
  -RedirectStandardError $errFile `
  -PassThru

$session = $null
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 2
  $sessions = (Invoke-RestMethod -Uri 'http://127.0.0.1:4820/api/sessions?limit=20').sessions
  $session = $sessions |
    Where-Object { $_.cwd -eq 'B:\project\ccs' -and ([datetime]$_.started_at) -ge $startTime.AddSeconds(-5) } |
    Sort-Object { [datetime]$_.started_at } -Descending |
    Select-Object -First 1
  if ($session) {
    break
  }
}

if (-not $session) {
  try {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  }
  catch {
  }
  throw 'Failed to locate smoke-test Claude session in monitor.'
}

$sessionId = $session.id
$transcript = "C:\Users\82162\.claude\projects\B--project-ccs\$sessionId.jsonl"
$markerSeen = $false
$killedForLoop = $false
$timeoutHit = $false

for ($i = 0; $i -lt 180; $i++) {
  Start-Sleep -Seconds 2
  $proc.Refresh()
  $raw = if (Test-Path $transcript) { Get-Content $transcript -Raw } else { '' }
  $markerSeen = $raw -match 'CCGS_SMOKE_DONE'
  $reminderCount = ([regex]::Matches($raw, 'You are running in non-interactive mode and cannot return a response to the user until your team is shut down')).Count

  if ($markerSeen -and $reminderCount -ge 2 -and -not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    $killedForLoop = $true
    break
  }

  if ($proc.HasExited) {
    break
  }

  if ($i -eq 179) {
    $timeoutHit = $true
    if (-not $proc.HasExited) {
      Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
  }
}

$events = (Invoke-RestMethod -Uri "http://127.0.0.1:4820/api/events?limit=250&session_id=$sessionId").events
$usedTools = $events |
  Where-Object { $_.tool_name } |
  Select-Object -ExpandProperty tool_name -Unique
$raw = if (Test-Path $transcript) { Get-Content $transcript -Raw } else { '' }
$reminderCount = ([regex]::Matches($raw, 'You are running in non-interactive mode and cannot return a response to the user until your team is shut down')).Count
$teamCreateSucceeded = [bool]($events | Where-Object { $_.tool_name -eq 'TeamCreate' -and $_.event_type -eq 'PostToolUse' } | Select-Object -First 1)
$teamDeleteSucceeded = [bool]($events | Where-Object { $_.tool_name -eq 'TeamDelete' -and $_.event_type -eq 'PostToolUse' } | Select-Object -First 1)
$spawnedTeammates = $events |
  Where-Object { $_.tool_name -eq 'Agent' -and $_.event_type -eq 'PostToolUse' } |
  ForEach-Object {
    try {
      ($_.data | ConvertFrom-Json).tool_response.name
    }
    catch {
      $null
    }
  } |
  Where-Object { $_ } |
  Select-Object -Unique
$reportMessages = $events |
  Where-Object { $_.tool_name -eq 'SendMessage' -and $_.event_type -eq 'PostToolUse' } |
  ForEach-Object {
    try {
      $payload = $_.data | ConvertFrom-Json
      [pscustomobject]@{
        agentType = $payload.agent_type
        summary = $payload.tool_input.summary
        message = $payload.tool_input.message
      }
    }
    catch {
      $null
    }
  } |
  Where-Object { $_ -and $_.summary -in @('package.json report', 'team-exec.md report') }
$markerLines = if (Test-Path $transcript) {
  Get-Content $transcript |
    Select-String -Pattern 'CCGS_SMOKE_DONE|Whether team creation succeeded|Whether exactly 2 teammates were created|Whether cleanup succeeded' |
    ForEach-Object { $_.Line }
}
else {
  @()
}

$result = [pscustomobject]@{
  sessionId = $sessionId
  processId = $proc.Id
  markerSeen = $markerSeen
  killedForLoop = $killedForLoop
  timeoutHit = $timeoutHit
  reminderCount = $reminderCount
  teamCreateSucceeded = $teamCreateSucceeded
  teamDeleteSucceeded = $teamDeleteSucceeded
  spawnedTeammates = @($spawnedTeammates)
  spawnedTeammateCount = @($spawnedTeammates).Count
  reportMessages = @($reportMessages)
  toolsUsed = @($usedTools)
  markerLines = @($markerLines)
  stdoutTail = if (Test-Path $outFile) { [string[]](Get-Content $outFile | Select-Object -Last 20) } else { @() }
  stderrTail = if (Test-Path $errFile) { [string[]](Get-Content $errFile | Select-Object -Last 20) } else { @() }
}

Write-Output ($result | ConvertTo-Json -Depth 6)
