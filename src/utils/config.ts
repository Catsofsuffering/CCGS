import type { CcgConfig, HostRuntime, ModelRouting, ModelType, SupportedLang } from '../types'
import fs from 'fs-extra'
import { dirname, join } from 'pathe'
import { parse, stringify } from 'smol-toml'
import { version as packageVersion } from '../../package.json'
import { CANONICAL_NAMESPACE } from './identity'
import {
  DEFAULT_HOST,
  getCanonicalHomeDir,
  getDeprecatedCanonicalHomeDirs,
  getDeprecatedConfigPaths,
  getConfigPathForCanonicalHome,
  getHostHomeDir,
} from './host'

const DEFAULT_INSTALL_DIR = getHostHomeDir(DEFAULT_HOST)

function getConfigCandidates(): string[] {
  const hostHomes = [getHostHomeDir('codex'), getHostHomeDir('claude')]
  const deprecatedDirnames = getDeprecatedCanonicalHomeDirs().map(path => path.split('\\').pop() || '.ccg')

  return [
    getConfigPathForCanonicalHome(),
    ...getDeprecatedConfigPaths(),
    ...hostHomes.flatMap(hostHome => [
      ...deprecatedDirnames.map(dirname => join(hostHome, dirname, 'config.toml')),
    ]),
  ]
}

export function getDefaultInstallDir(preferredHost: HostRuntime = DEFAULT_HOST): string {
  for (const configPath of getConfigCandidates()) {
    if (!fs.existsSync(configPath)) {
      continue
    }

    try {
      const content = fs.readFileSync(configPath, 'utf-8')
      const config = parse(content) as unknown as CcgConfig
      if (config.paths?.hostHome) {
        return config.paths.hostHome
      }
      return getHostHomeDir(preferredHost)
    }
    catch {
      // ignore invalid config and continue
    }
  }

  return getHostHomeDir(preferredHost)
}

export function getCcsmDir(): string {
  for (const configPath of getConfigCandidates()) {
    try {
      if (!fs.existsSync(configPath)) {
        continue
      }
      const content = fs.readFileSync(configPath, 'utf-8')
      const config = parse(content) as unknown as CcgConfig
      if (config.paths?.canonicalHome) {
        return config.paths.canonicalHome
      }
      return dirname(configPath)
    }
    catch {
      // ignore invalid config and continue
    }
  }

  return getCanonicalHomeDir()
}

export function getCcgsDir(): string {
  return getCcsmDir()
}

export function getCcgDir(): string {
  return getCcsmDir()
}

export function getLegacyCcgDir(): string {
  return getDeprecatedCanonicalHomeDirs()[getDeprecatedCanonicalHomeDirs().length - 1]
}

export function getConfigPath(): string {
  return getConfigPathForCanonicalHome(getCcsmDir())
}

export function getLegacyConfigPath(): string {
  return getDeprecatedConfigPaths()[getDeprecatedConfigPaths().length - 1]
}

export async function ensureCcsmDir(canonicalHome = getCcsmDir()): Promise<void> {
  await fs.ensureDir(canonicalHome)
}

export async function ensureCcgsDir(canonicalHome = getCcsmDir()): Promise<void> {
  await ensureCcsmDir(canonicalHome)
}

export async function ensureCcgDir(canonicalHome = getCcsmDir()): Promise<void> {
  await ensureCcsmDir(canonicalHome)
}

export async function readCcgConfig(): Promise<CcgConfig | null> {
  for (const configPath of getConfigCandidates()) {
    try {
      if (!await fs.pathExists(configPath)) {
        continue
      }

      const content = await fs.readFile(configPath, 'utf-8')
      return parse(content) as unknown as CcgConfig
    }
    catch {
      // ignore invalid config and continue
    }
  }

  return null
}

export async function writeCcgConfig(config: CcgConfig): Promise<void> {
  const canonicalHome = config.paths?.canonicalHome || getCcsmDir()
  await ensureCcsmDir(canonicalHome)
  const content = stringify(config as any)
  await fs.writeFile(getConfigPathForCanonicalHome(canonicalHome), content, 'utf-8')
}

export function createDefaultConfig(options: {
  language: SupportedLang
  routing: ModelRouting
  installedWorkflows: string[]
  mcpProvider?: string
  skipImpeccable?: boolean
  installDir?: string
  canonicalHome?: string
  ownership?: {
    orchestrator: ModelType
    executionHost: HostRuntime
    acceptance: ModelType
  }
}): CcgConfig {
  const ownership = options.ownership || {
    orchestrator: 'codex',
    executionHost: 'claude',
    acceptance: 'codex',
  }

  const hostHome = options.installDir || getHostHomeDir(ownership.orchestrator)
  const canonicalHome = options.canonicalHome || getCanonicalHomeDir()

  return {
    general: {
      version: packageVersion,
      language: options.language,
      createdAt: new Date().toISOString(),
    },
    ownership,
    routing: options.routing,
    workflows: {
      installed: options.installedWorkflows,
    },
    paths: {
      hostHome,
      canonicalHome,
      commands: join(hostHome, 'commands', CANONICAL_NAMESPACE),
      prompts: join(canonicalHome, 'prompts'),
      backup: join(canonicalHome, 'backup'),
    },
    mcp: {
      provider: options.mcpProvider || 'skip',
      setup_url: 'https://augmentcode.com/',
    },
    performance: {
      skipImpeccable: options.skipImpeccable || false,
    },
  }
}

export function createDefaultRouting(): ModelRouting {
  return {
    frontend: {
      models: ['codex'],
      primary: 'codex',
      strategy: 'fallback',
    },
    backend: {
      models: ['codex'],
      primary: 'codex',
      strategy: 'fallback',
    },
    review: {
      models: ['codex'],
      strategy: 'parallel',
    },
    mode: 'smart',
  }
}
