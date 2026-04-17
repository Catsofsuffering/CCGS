import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import { dirname, join } from 'pathe'
import fs from 'fs-extra'
import { version as workspaceVersion } from '../../package.json'
import { PACKAGE_ROOT } from './installer-template'
import {
  CANONICAL_RUNTIME_DIRNAME,
  LEGACY_RUNTIME_DIRNAME,
} from './identity'
import { getHostHomeDir } from './host'

export const DEFAULT_MONITOR_PORT = 4820
export const CLAUDE_MONITOR_NAME = 'claude-monitor'
export const CODEX_MONITOR_NAME = 'codex-monitor'

async function isMonitorHealthy(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`)
    if (!response.ok) {
      return false
    }
    const body = await response.json() as { status?: string }
    return body.status === 'ok'
  }
  catch {
    return false
  }
}

async function waitForMonitorReady(port: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isMonitorHealthy(port)) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  return false
}

const HOOKS_WITH_MATCHER = ['PreToolUse', 'PostToolUse', 'Stop', 'SubagentStop', 'Notification'] as const
const HOOKS_WITHOUT_MATCHER = ['SessionStart', 'SessionEnd'] as const
const ALL_HOOK_TYPES = [...HOOKS_WITH_MATCHER, ...HOOKS_WITHOUT_MATCHER]

function toForwardSlash(path: string): string {
  return path.replace(/\\/g, '/')
}

export function getBundledMonitorDir(): string {
  return join(PACKAGE_ROOT, 'claude-monitor')
}

export function getInstalledMonitorDir(
  installDir = getHostHomeDir('claude'),
  monitorName = CLAUDE_MONITOR_NAME,
): string {
  return join(installDir, CANONICAL_RUNTIME_DIRNAME, monitorName)
}

export function getInstalledCodexMonitorDir(installDir = getHostHomeDir('codex')): string {
  return getInstalledMonitorDir(installDir, CODEX_MONITOR_NAME)
}

function getLegacyMonitorDir(
  installDir = getHostHomeDir('claude'),
  monitorName = CLAUDE_MONITOR_NAME,
): string {
  return join(installDir, LEGACY_RUNTIME_DIRNAME, monitorName)
}

async function resolveInstalledMonitorDir(
  installDir = getHostHomeDir('claude'),
  monitorName = CLAUDE_MONITOR_NAME,
): Promise<string> {
  const canonicalDir = getInstalledMonitorDir(installDir, monitorName)
  if (await fs.pathExists(canonicalDir))
    return canonicalDir
  return getLegacyMonitorDir(installDir, monitorName)
}

export function getClaudeSettingsPath(installDir = getHostHomeDir('claude')): string {
  return join(installDir, 'settings.json')
}

export function getHookHandlerPath(
  installDir = getHostHomeDir('claude'),
  monitorName = CLAUDE_MONITOR_NAME,
): string {
  return toForwardSlash(join(getInstalledMonitorDir(installDir, monitorName), 'scripts', 'hook-handler.js'))
}

function makeHookEntry(hookType: string, installDir: string) {
  const entry: Record<string, any> = {
    hooks: [
      {
        type: 'command',
        command: `node "${getHookHandlerPath(installDir)}" ${hookType}`,
      },
    ],
  }

  if ((HOOKS_WITH_MATCHER as readonly string[]).includes(hookType)) {
    entry.matcher = '*'
  }

  return entry
}

function isMonitorHookEntry(entry: Record<string, any>): boolean {
  if (typeof entry?.command === 'string' && entry.command.includes('hook-handler.js')) {
    return true
  }

  if (Array.isArray(entry?.hooks)) {
    return entry.hooks.some((hook: Record<string, any>) => typeof hook?.command === 'string' && hook.command.includes('hook-handler.js'))
  }

  return false
}

async function readJsonObject(path: string): Promise<Record<string, any>> {
  if (!await fs.pathExists(path)) {
    return {}
  }

  const raw = await fs.readFile(path, 'utf-8')
  return JSON.parse(raw)
}

async function writeJsonObject(path: string, value: Record<string, any>): Promise<void> {
  await fs.ensureDir(dirname(path))
  await fs.writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8')
}

async function runNpm(args: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const npmCmd = process.platform === 'win32' ? 'npm' : 'npm'
    const child = spawn(npmCmd, args, {
      cwd,
      stdio: ['ignore', 'ignore', 'pipe'],
      env: process.env,
      shell: process.platform === 'win32',
    })

    let stderr = ''
    child.stderr.on('data', chunk => stderr += chunk.toString())
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(stderr.trim() || `npm ${args.join(' ')} failed with exit code ${code}`))
    })
  })
}

export async function installBundledMonitor(
  installDir = getHostHomeDir('claude'),
  monitorName = CLAUDE_MONITOR_NAME,
): Promise<string> {
  const sourceDir = getBundledMonitorDir()
  const targetDir = getInstalledMonitorDir(installDir, monitorName)

  if (!await fs.pathExists(sourceDir)) {
    throw new Error(`Bundled monitor source not found: ${sourceDir}`)
  }

  await fs.ensureDir(join(installDir, CANONICAL_RUNTIME_DIRNAME))
  await fs.copy(sourceDir, targetDir, {
    overwrite: true,
    errorOnExist: false,
    filter: (src) => {
      const normalized = src.replace(/\\/g, '/')
      return !normalized.includes('/node_modules/')
        && !normalized.endsWith('/node_modules')
        && !normalized.includes('/.git/')
        && !normalized.endsWith('/.git')
        && !normalized.includes('/client/dist/')
        && !normalized.endsWith('/client/dist')
        && !normalized.endsWith('.tsbuildinfo')
    },
  })

  const monitorPackagePath = join(targetDir, 'package.json')
  if (await fs.pathExists(monitorPackagePath)) {
    const monitorPackage = await fs.readJson(monitorPackagePath)
    monitorPackage.version = workspaceVersion
    await fs.writeJson(monitorPackagePath, monitorPackage, { spaces: 2 })
  }

  return targetDir
}

export async function configureClaudeMonitorHooks(options?: {
  installDir?: string
  port?: number
}): Promise<{ settingsPath: string, installed: number, updated: number }> {
  const installDir = options?.installDir || getHostHomeDir('claude')
  const settingsPath = getClaudeSettingsPath(installDir)
  const settings = await readJsonObject(settingsPath)

  if (!settings.hooks) {
    settings.hooks = {}
  }
  if (!settings.env) {
    settings.env = {}
  }
  settings.env.CLAUDE_DASHBOARD_PORT = String(options?.port || DEFAULT_MONITOR_PORT)

  let installed = 0
  let updated = 0

  for (const hookType of ALL_HOOK_TYPES) {
    if (!Array.isArray(settings.hooks[hookType])) {
      settings.hooks[hookType] = []
    }

    const nextEntry = makeHookEntry(hookType, installDir)
    const existingIndex = settings.hooks[hookType].findIndex(isMonitorHookEntry)
    if (existingIndex >= 0) {
      settings.hooks[hookType][existingIndex] = nextEntry
      updated++
    }
    else {
      settings.hooks[hookType].push(nextEntry)
      installed++
    }
  }

  await writeJsonObject(settingsPath, settings)
  return { settingsPath, installed, updated }
}

export async function removeClaudeMonitorHooks(installDir = getHostHomeDir('claude')): Promise<void> {
  const settingsPath = getClaudeSettingsPath(installDir)
  if (!await fs.pathExists(settingsPath)) {
    return
  }

  const settings = await readJsonObject(settingsPath)
  if (!settings.hooks) {
    return
  }

  for (const hookType of Object.keys(settings.hooks)) {
    if (!Array.isArray(settings.hooks[hookType])) {
      continue
    }

    settings.hooks[hookType] = settings.hooks[hookType].filter((entry: Record<string, any>) => !isMonitorHookEntry(entry))
    if (settings.hooks[hookType].length === 0) {
      delete settings.hooks[hookType]
    }
  }

  if (settings.env?.CLAUDE_DASHBOARD_PORT) {
    delete settings.env.CLAUDE_DASHBOARD_PORT
    if (Object.keys(settings.env).length === 0) {
      delete settings.env
    }
  }

  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks
  }

  await writeJsonObject(settingsPath, settings)
}

export async function prepareClaudeMonitorRuntime(options?: {
  installDir?: string
  port?: number
}): Promise<{ monitorDir: string, settingsPath: string }> {
  const installDir = options?.installDir || getHostHomeDir('claude')
  const monitorDir = await installBundledMonitor(installDir, CLAUDE_MONITOR_NAME)

  await runNpm(['install', '--no-package-lock'], monitorDir)
  await runNpm(['install', '--prefix', 'client', '--no-package-lock'], monitorDir)
  await runNpm(['run', 'build', '--prefix', 'client'], monitorDir)
  const hookResult = await configureClaudeMonitorHooks({ installDir, port: options?.port })

  return {
    monitorDir,
    settingsPath: hookResult.settingsPath,
  }
}

export async function prepareCodexMonitorRuntime(options?: {
  installDir?: string
}): Promise<{ monitorDir: string, settingsPath: string }> {
  const installDir = options?.installDir || getHostHomeDir('codex')
  const monitorDir = await installBundledMonitor(installDir, CODEX_MONITOR_NAME)

  await runNpm(['install', '--no-package-lock'], monitorDir)
  await runNpm(['install', '--prefix', 'client', '--no-package-lock'], monitorDir)
  await runNpm(['run', 'build', '--prefix', 'client'], monitorDir)

  return {
    monitorDir,
    settingsPath: join(installDir, 'config.toml'),
  }
}

export async function startClaudeMonitor(options?: {
  installDir?: string
  port?: number
  detached?: boolean
}): Promise<{ url: string, monitorDir: string, reused: boolean }> {
  const installDir = options?.installDir || getHostHomeDir('claude')
  const monitorDir = await resolveInstalledMonitorDir(installDir, CLAUDE_MONITOR_NAME)
  const port = options?.port || DEFAULT_MONITOR_PORT

  if (!await fs.pathExists(join(monitorDir, 'server', 'index.js'))) {
    throw new Error(`Claude monitor is not installed at ${monitorDir}`)
  }

  if (await isMonitorHealthy(port)) {
    return {
      url: `http://127.0.0.1:${port}`,
      monitorDir,
      reused: true,
    }
  }

  const child = spawn(process.execPath, [join(monitorDir, 'server', 'index.js')], {
    cwd: monitorDir,
    env: {
      ...process.env,
      DASHBOARD_PORT: String(port),
      CLAUDE_DASHBOARD_PORT: String(port),
      CCG_WORKSPACE_ROOT: process.cwd(),
      OPENSPEC_WORKSPACE_ROOT: process.cwd(),
    },
    stdio: options?.detached ? 'ignore' : 'inherit',
    detached: options?.detached ?? false,
  })

  const ready = await waitForMonitorReady(port, 10_000)
  if (!ready) {
    if (!child.killed) {
      child.kill()
    }
    throw new Error(`Claude monitor failed to start on port ${port}`)
  }

  if (options?.detached) {
    child.unref()
  }

  return {
    url: `http://127.0.0.1:${port}`,
    monitorDir,
    reused: false,
  }
}
