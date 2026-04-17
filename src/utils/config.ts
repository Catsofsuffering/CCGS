import type { CcgConfig, HostRuntime, ModelRouting, ModelType, SupportedLang } from '../types'
import fs from 'fs-extra'
import { dirname, join } from 'pathe'
import { parse, stringify } from 'smol-toml'
import { version as packageVersion } from '../../package.json'
import { CANONICAL_NAMESPACE } from './identity'
import {
  DEFAULT_HOST,
  getConfigPathForInstallDir,
  getHostHomeDir,
  getLegacyConfigPathForInstallDir,
  getLegacyRuntimeDirForInstallDir,
  getRuntimeDirForInstallDir,
} from './host'

const DEFAULT_INSTALL_DIR = getHostHomeDir(DEFAULT_HOST)

function getConfigCandidates(): string[] {
  const codexHome = getHostHomeDir('codex')
  const claudeHome = getHostHomeDir('claude')

  return [
    getConfigPathForInstallDir(codexHome),
    getConfigPathForInstallDir(claudeHome),
    getLegacyConfigPathForInstallDir(claudeHome),
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
      return dirname(dirname(configPath))
    }
    catch {
      // ignore invalid config and continue
    }
  }

  return getHostHomeDir(preferredHost)
}

export function getCcgsDir(): string {
  return getRuntimeDirForInstallDir(getDefaultInstallDir())
}

export function getCcgDir(): string {
  return getCcgsDir()
}

export function getLegacyCcgDir(): string {
  return getLegacyRuntimeDirForInstallDir(getDefaultInstallDir())
}

export function getConfigPath(): string {
  return getConfigPathForInstallDir(getDefaultInstallDir())
}

export function getLegacyConfigPath(): string {
  return getLegacyConfigPathForInstallDir(getDefaultInstallDir())
}

export async function ensureCcgsDir(installDir = getDefaultInstallDir()): Promise<void> {
  await fs.ensureDir(getRuntimeDirForInstallDir(installDir))
}

export async function ensureCcgDir(installDir = getDefaultInstallDir()): Promise<void> {
  await ensureCcgsDir(installDir)
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
  const installDir = config.paths?.hostHome || getDefaultInstallDir()
  await ensureCcgsDir(installDir)
  const content = stringify(config as any)
  await fs.writeFile(getConfigPathForInstallDir(installDir), content, 'utf-8')
}

export function createDefaultConfig(options: {
  language: SupportedLang
  routing: ModelRouting
  installedWorkflows: string[]
  mcpProvider?: string
  skipImpeccable?: boolean
  installDir?: string
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

  const installDir = options.installDir || getHostHomeDir(ownership.orchestrator)
  const runtimeDir = getRuntimeDirForInstallDir(installDir)

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
      hostHome: installDir,
      commands: join(installDir, 'commands', CANONICAL_NAMESPACE),
      prompts: join(runtimeDir, 'prompts'),
      backup: join(runtimeDir, 'backup'),
    },
    mcp: {
      provider: options.mcpProvider || 'ace-tool',
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
