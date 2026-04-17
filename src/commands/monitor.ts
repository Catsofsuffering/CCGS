import ansis from 'ansis'
import { getDefaultInstallDir } from '../utils/config'
import { configureClaudeMonitorHooks, prepareClaudeMonitorRuntime, startClaudeMonitor } from '../utils/claude-monitor'

export async function installMonitorRuntime(): Promise<void> {
  const installDir = getDefaultInstallDir()
  const result = await prepareClaudeMonitorRuntime({ installDir })

  console.log()
  console.log(ansis.green('  Claude monitor ready'))
  console.log(ansis.gray(`    monitor: ${result.monitorDir}`))
  console.log(ansis.gray(`    settings: ${result.settingsPath}`))
}

export async function installMonitorHooks(): Promise<void> {
  const installDir = getDefaultInstallDir()
  const result = await configureClaudeMonitorHooks({ installDir })

  console.log()
  console.log(ansis.green('  Claude hooks configured'))
  console.log(ansis.gray(`    settings: ${result.settingsPath}`))
  console.log(ansis.gray(`    installed: ${result.installed}, updated: ${result.updated}`))
}

export async function startMonitor(detached = false): Promise<void> {
  const installDir = getDefaultInstallDir()
  const result = await startClaudeMonitor({ installDir, detached })

  console.log()
  console.log(ansis.green(`  Claude monitor ${result.reused ? 'already running' : 'started'}`))
  console.log(ansis.cyan(`    ${result.url}`))
  console.log(ansis.gray(`    monitor: ${result.monitorDir}`))
}
