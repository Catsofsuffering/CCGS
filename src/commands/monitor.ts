import ansis from 'ansis'
import { getCanonicalHomeDir, getHostHomeDir } from '../utils/host'
import { configureClaudeMonitorHooks, prepareClaudeMonitorRuntime, prepareCodexMonitorRuntime, startClaudeMonitor } from '../utils/claude-monitor'

export async function installMonitorRuntime(): Promise<void> {
  const canonicalHomeDir = getCanonicalHomeDir()
  const claude = await prepareClaudeMonitorRuntime({ canonicalHomeDir })
  const codex = await prepareCodexMonitorRuntime({ canonicalHomeDir })

  console.log()
  console.log(ansis.green('  Monitor runtimes ready'))
  console.log(ansis.gray(`    claude monitor: ${claude.monitorDir}`))
  console.log(ansis.gray(`    claude settings: ${claude.settingsPath}`))
  console.log(ansis.gray(`    codex monitor: ${codex.monitorDir}`))
}

export async function installMonitorHooks(): Promise<void> {
  const result = await configureClaudeMonitorHooks({ installDir: getHostHomeDir('claude') })

  console.log()
  console.log(ansis.green('  Claude hooks configured'))
  console.log(ansis.gray(`    settings: ${result.settingsPath}`))
  console.log(ansis.gray(`    installed: ${result.installed}, updated: ${result.updated}`))
}

export async function startMonitor(detached = false): Promise<void> {
  const result = await startClaudeMonitor({ canonicalHomeDir: getCanonicalHomeDir(), detached })

  console.log()
  console.log(ansis.green(`  Claude monitor ${result.reused ? 'already running' : 'started'}`))
  console.log(ansis.cyan(`    ${result.url}`))
  console.log(ansis.gray(`    monitor: ${result.monitorDir}`))
}
