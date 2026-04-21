import type { SpawnOptions } from 'node:child_process'
import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import { delimiter, dirname, extname, isAbsolute, join, resolve } from 'node:path'
import fs from 'fs-extra'

const CLAUDE_PACKAGE_NAME = '@anthropic-ai/claude-code'
const LOCAL_BYPASS_HOSTS = ['127.0.0.1', 'localhost']

export interface ClaudeLaunchSpec {
  command: string
  args: string[]
  source: 'override' | 'path' | 'cmd-shim' | 'package-root'
}

export interface ResolveClaudeLaunchOptions {
  env?: NodeJS.ProcessEnv
  platform?: NodeJS.Platform
}

export interface RunClaudeExecOptions extends ResolveClaudeLaunchOptions {
  cwd?: string
  prompt?: string
  promptFile?: string
  claudeArgs?: string[]
  enableAgentTeams?: boolean
  stdio?: SpawnOptions['stdio']
}

export function mergeNoProxyValue(existing?: string): string {
  const parts = (existing || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)

  for (const host of LOCAL_BYPASS_HOSTS) {
    if (!parts.includes(host)) {
      parts.push(host)
    }
  }

  return parts.join(',')
}

export function buildClaudeLaunchEnv(
  baseEnv: NodeJS.ProcessEnv = process.env,
  enableAgentTeams = true,
): NodeJS.ProcessEnv {
  const nextEnv = { ...baseEnv }
  if (nextEnv.CCSM_CLAUDE_APPEND_LOCAL_NO_PROXY === '1') {
    const mergedNoProxy = mergeNoProxyValue(nextEnv.NO_PROXY || nextEnv.no_proxy)
    nextEnv.NO_PROXY = mergedNoProxy
    nextEnv.no_proxy = mergedNoProxy
  }

  if (enableAgentTeams) {
    nextEnv.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = '1'
    nextEnv.CLAUDE_CODE_ENABLE_TASKS = '1'
  }

  return nextEnv
}

export function resolveWindowsCmdShimTarget(shimPath: string, content: string): string | null {
  const match = content.match(/"%dp0%\\([^"\r\n]+?\.(?:c|m)?js)"/i)
  if (!match) {
    return null
  }

  const relativeTarget = match[1].replace(/\\/g, '/')
  const candidate = resolve(dirname(shimPath), relativeTarget)
  return candidate
}

function normalizePathEntries(env: NodeJS.ProcessEnv, platform: NodeJS.Platform): string[] {
  const pathValue = env.PATH || env.Path || env.path || ''
  const pathDelimiter = platform === 'win32' ? ';' : delimiter

  return pathValue
    .split(pathDelimiter)
    .map(entry => entry.trim())
    .filter(Boolean)
}

async function resolveOverrideLaunchSpec(overridePath: string): Promise<ClaudeLaunchSpec> {
  const resolvedPath = resolve(overridePath)
  const extension = extname(resolvedPath).toLowerCase()

  if (extension === '.cmd') {
    const shimContent = await fs.readFile(resolvedPath, 'utf-8')
    const target = resolveWindowsCmdShimTarget(resolvedPath, shimContent)
    if (!target) {
      throw new Error(`Could not resolve Claude entry script from ${resolvedPath}`)
    }
    return {
      command: process.execPath,
      args: [target],
      source: 'override',
    }
  }

  if (['.js', '.cjs', '.mjs'].includes(extension)) {
    return {
      command: process.execPath,
      args: [resolvedPath],
      source: 'override',
    }
  }

  return {
    command: resolvedPath,
    args: [],
    source: 'override',
  }
}

async function resolveFromPath(env: NodeJS.ProcessEnv, platform: NodeJS.Platform): Promise<ClaudeLaunchSpec | null> {
  const candidateNames = platform === 'win32'
    ? ['claude.exe', 'claude.cmd', 'claude']
    : ['claude']

  for (const dir of normalizePathEntries(env, platform)) {
    for (const candidateName of candidateNames) {
      const fullPath = join(dir, candidateName)
      if (!await fs.pathExists(fullPath)) {
        continue
      }

      if (platform === 'win32' && fullPath.toLowerCase().endsWith('.cmd')) {
        const shimContent = await fs.readFile(fullPath, 'utf-8')
        const target = resolveWindowsCmdShimTarget(fullPath, shimContent)
        if (target) {
          return {
            command: process.execPath,
            args: [target],
            source: 'cmd-shim',
          }
        }
      }

      return {
        command: fullPath,
        args: [],
        source: 'path',
      }
    }
  }

  return null
}

async function resolveFromPackageRoot(packageRoot: string): Promise<ClaudeLaunchSpec | null> {
  const packageJsonPath = join(packageRoot, 'package.json')
  if (!await fs.pathExists(packageJsonPath)) {
    return null
  }

  const packageJson = await fs.readJson(packageJsonPath) as {
    bin?: string | Record<string, string>
  }

  const binField = packageJson.bin
  let entrypoint: string | undefined
  if (typeof binField === 'string') {
    entrypoint = binField
  }
  else if (binField && typeof binField === 'object') {
    entrypoint = binField.claude || Object.values(binField)[0]
  }

  if (!entrypoint) {
    return null
  }

  const entrypointPath = join(packageRoot, entrypoint)
  if (!await fs.pathExists(entrypointPath)) {
    return null
  }

  return {
    command: process.execPath,
    args: [entrypointPath],
    source: 'package-root',
  }
}

function getPackageRootCandidates(env: NodeJS.ProcessEnv, platform: NodeJS.Platform): string[] {
  const prefixes = new Set<string>()

  if (env.CCSM_CLAUDE_PACKAGE_ROOT) {
    prefixes.add(env.CCSM_CLAUDE_PACKAGE_ROOT)
  }

  if (env.npm_config_prefix) {
    prefixes.add(env.npm_config_prefix)
  }

  if (env.PREFIX) {
    prefixes.add(env.PREFIX)
  }

  if (platform === 'win32') {
    if (env.APPDATA) {
      prefixes.add(join(env.APPDATA, 'npm'))
    }
  }
  else {
    prefixes.add('/usr/local')
    prefixes.add('/opt/homebrew')
    prefixes.add(join(homedir(), '.npm-global'))
  }

  const candidates = new Set<string>()
  for (const prefix of prefixes) {
    const resolvedPrefix = isAbsolute(prefix) ? prefix : resolve(prefix)
    candidates.add(resolvedPrefix)
    candidates.add(join(resolvedPrefix, 'node_modules', CLAUDE_PACKAGE_NAME))
    candidates.add(join(resolvedPrefix, 'lib', 'node_modules', CLAUDE_PACKAGE_NAME))
  }

  return [...candidates]
}

export async function resolveClaudeLaunchSpec(
  options: ResolveClaudeLaunchOptions = {},
): Promise<ClaudeLaunchSpec> {
  const env = options.env || process.env
  const platform = options.platform || process.platform

  const pathSpec = await resolveFromPath(env, platform)
  if (pathSpec) {
    return pathSpec
  }

  if (env.CCSM_CLAUDE_PATH) {
    return await resolveOverrideLaunchSpec(env.CCSM_CLAUDE_PATH)
  }

  for (const candidate of getPackageRootCandidates(env, platform)) {
    const packageRootSpec = await resolveFromPackageRoot(candidate)
    if (packageRootSpec) {
      return packageRootSpec
    }
  }

  throw new Error(
    'Claude CLI was not found on PATH. Install Claude Code so the `claude` command is available, or set CCSM_CLAUDE_PATH only for a non-standard install.',
  )
}

async function readPrompt(options: Pick<RunClaudeExecOptions, 'prompt' | 'promptFile'>): Promise<string | null> {
  if (typeof options.prompt === 'string') {
    return options.prompt
  }

  if (options.promptFile) {
    return await fs.readFile(resolve(options.promptFile), 'utf-8')
  }

  return null
}

export async function runClaudeExec(options: RunClaudeExecOptions = {}): Promise<number> {
  const launchSpec = await resolveClaudeLaunchSpec(options)
  const env = buildClaudeLaunchEnv(options.env || process.env, options.enableAgentTeams !== false)
  const prompt = await readPrompt(options)
  const args = [...launchSpec.args]

  if (prompt !== null) {
    args.push('-p', prompt)
  }

  if (options.claudeArgs?.length) {
    args.push(...options.claudeArgs)
  }

  return await new Promise<number>((resolvePromise, rejectPromise) => {
    const child = spawn(launchSpec.command, args, {
      cwd: options.cwd,
      env,
      stdio: options.stdio || 'inherit',
      shell: false,
    })

    child.on('error', rejectPromise)
    child.on('close', (code, signal) => {
      if (signal) {
        rejectPromise(new Error(`Claude process terminated by signal ${signal}`))
        return
      }

      resolvePromise(code ?? 1)
    })
  })
}
