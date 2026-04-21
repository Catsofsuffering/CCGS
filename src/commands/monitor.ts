import ansis from 'ansis'
import { getCanonicalHomeDir, getHostHomeDir } from '../utils/host'
import { configureClaudeMonitorHooks, prepareClaudeMonitorRuntime, prepareCodexMonitorRuntime, startClaudeMonitor } from '../utils/claude-monitor'
import { ensureCodexWorkspaceTrust } from '../utils/codex-config'

export async function installMonitorRuntime(): Promise<void> {
  const canonicalHomeDir = getCanonicalHomeDir()
  const claude = await prepareClaudeMonitorRuntime({ canonicalHomeDir })
  const codex = await prepareCodexMonitorRuntime({ canonicalHomeDir })
  const codexTrust = await ensureCodexWorkspaceTrust(process.cwd())

  console.log()
  console.log(ansis.green('  Monitor runtimes ready'))
  console.log(ansis.gray(`    claude monitor: ${claude.monitorDir}`))
  console.log(ansis.gray(`    claude settings: ${claude.settingsPath}`))
  console.log(ansis.gray(`    claude exec allowlist: ${claude.permissionsInstalled.length > 0 ? 'updated' : 'verified'}`))
  console.log(ansis.gray(`    codex monitor: ${codex.monitorDir}`))
  console.log(ansis.gray(`    codex trust: ${codexTrust.configPath}`))
}

export async function installMonitorHooks(): Promise<void> {
  const result = await configureClaudeMonitorHooks({
    installDir: getHostHomeDir('claude'),
    canonicalHomeDir: getCanonicalHomeDir(),
  })

  console.log()
  console.log(ansis.green('  Claude hooks configured'))
  console.log(ansis.gray(`    settings: ${result.settingsPath}`))
  console.log(ansis.gray(`    installed: ${result.installed}, updated: ${result.updated}`))
  console.log(ansis.gray(`    exec allowlist: ${result.permissionsInstalled.length > 0 ? 'updated' : 'verified'}`))
}

export async function startMonitor(detached = false): Promise<void> {
  const result = await startClaudeMonitor({ canonicalHomeDir: getCanonicalHomeDir(), detached })

  console.log()
  console.log(ansis.green(`  Claude monitor ${result.reused ? 'already running' : 'started'}`))
  console.log(ansis.cyan(`    ${result.url}`))
  console.log(ansis.gray(`    monitor: ${result.monitorDir}`))
}
