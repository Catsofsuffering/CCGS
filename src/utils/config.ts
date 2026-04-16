import type { CcgConfig, HostRuntime, ModelRouting, ModelType, SupportedLang } from '../types'
import fs from 'fs-extra'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { parse, stringify } from 'smol-toml'
import { version as packageVersion } from '../../package.json'
import {
  CANONICAL_NAMESPACE,
  CANONICAL_RUNTIME_DIRNAME,
  LEGACY_RUNTIME_DIRNAME,
} from './identity'

const DEFAULT_INSTALL_DIR = join(homedir(), '.claude')
const CCGS_DIR = join(DEFAULT_INSTALL_DIR, CANONICAL_RUNTIME_DIRNAME)
const LEGACY_CCG_DIR = join(DEFAULT_INSTALL_DIR, LEGACY_RUNTIME_DIRNAME)
const CONFIG_FILE = join(CCGS_DIR, 'config.toml')
const LEGACY_CONFIG_FILE = join(LEGACY_CCG_DIR, 'config.toml')

export function getDefaultInstallDir(): string {
  return DEFAULT_INSTALL_DIR
}

export function getCcgsDir(): string {
  return CCGS_DIR
}

export function getCcgDir(): string {
  return CCGS_DIR
}

export function getLegacyCcgDir(): string {
  return LEGACY_CCG_DIR
}

export function getConfigPath(): string {
  return CONFIG_FILE
}

export function getLegacyConfigPath(): string {
  return LEGACY_CONFIG_FILE
}

export async function ensureCcgsDir(): Promise<void> {
  await fs.ensureDir(CCGS_DIR)
}

export async function ensureCcgDir(): Promise<void> {
  await ensureCcgsDir()
}

export async function readCcgConfig(): Promise<CcgConfig | null> {
  for (const configPath of [CONFIG_FILE, LEGACY_CONFIG_FILE]) {
    try {
      if (await fs.pathExists(configPath)) {
        const content = await fs.readFile(configPath, 'utf-8')
        return parse(content) as unknown as CcgConfig
      }
    }
    catch {
      // Config doesn't exist or is invalid
    }
  }

  return null
}

export async function writeCcgConfig(config: CcgConfig): Promise<void> {
  await ensureCcgsDir()
  const content = stringify(config as any)
  await fs.writeFile(CONFIG_FILE, content, 'utf-8')
}

export function createDefaultConfig(options: {
  language: SupportedLang
  routing: ModelRouting
  installedWorkflows: string[]
  mcpProvider?: string
  liteMode?: boolean
  skipImpeccable?: boolean
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
      commands: join(DEFAULT_INSTALL_DIR, 'commands', CANONICAL_NAMESPACE),
      prompts: join(CCGS_DIR, 'prompts'),
      backup: join(CCGS_DIR, 'backup'),
    },
    mcp: {
      provider: options.mcpProvider || 'ace-tool',
      setup_url: 'https://augmentcode.com/',
    },
    performance: {
      liteMode: options.liteMode || false,
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
