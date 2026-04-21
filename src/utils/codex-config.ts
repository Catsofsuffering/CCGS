import fs from 'fs-extra'
import { resolve as resolveFs } from 'node:path'
import { dirname, join } from 'pathe'
import { parse, stringify } from 'smol-toml'
import { getHostHomeDir } from './host'

export interface EnsureCodexWorkspaceTrustResult {
  configPath: string
  workspaceRoot: string
  updated: boolean
  trustLevel: string
}

function normalizeProjectKey(workspaceRoot: string): string {
  const resolvedWorkspaceRoot = resolveFs(workspaceRoot)
  return process.platform === 'win32'
    ? resolvedWorkspaceRoot.replace(/\//g, '\\')
    : resolvedWorkspaceRoot
}

function toComparableProjectKey(projectKey: string): string {
  return process.platform === 'win32'
    ? projectKey.replace(/\//g, '\\').toLowerCase()
    : projectKey
}

export async function ensureCodexWorkspaceTrust(
  workspaceRoot = process.cwd(),
  codexHomeDir = getHostHomeDir('codex'),
): Promise<EnsureCodexWorkspaceTrustResult> {
  const resolvedWorkspaceRoot = normalizeProjectKey(workspaceRoot)
  const configPath = join(codexHomeDir, 'config.toml')

  let config: Record<string, any> = {}
  if (await fs.pathExists(configPath)) {
    const content = await fs.readFile(configPath, 'utf-8')
    config = parse(content) as Record<string, any>
  }

  if (!config.projects || typeof config.projects !== 'object' || Array.isArray(config.projects)) {
    config.projects = {}
  }

  const equivalentProjectKeys = Object.keys(config.projects).filter(
    projectKey => toComparableProjectKey(projectKey) === toComparableProjectKey(resolvedWorkspaceRoot),
  )
  const projectKey = equivalentProjectKeys[0] || resolvedWorkspaceRoot
  const mergedProjectConfig = equivalentProjectKeys.reduce<Record<string, any>>((acc, currentKey) => {
    const currentValue = config.projects[currentKey]
    if (currentValue && typeof currentValue === 'object' && !Array.isArray(currentValue)) {
      Object.assign(acc, currentValue)
    }
    return acc
  }, {})
  const currentProjectConfig = equivalentProjectKeys.length > 0 ? mergedProjectConfig : config.projects[projectKey]
  const nextProjectConfig
    = currentProjectConfig && typeof currentProjectConfig === 'object' && !Array.isArray(currentProjectConfig)
      ? { ...currentProjectConfig }
      : {}

  const updated = nextProjectConfig.trust_level !== 'trusted'
  nextProjectConfig.trust_level = 'trusted'
  config.projects[projectKey] = nextProjectConfig

  for (const currentKey of equivalentProjectKeys) {
    if (currentKey !== projectKey) {
      delete config.projects[currentKey]
    }
  }

  const needsWrite = updated || equivalentProjectKeys.length > 1 || !await fs.pathExists(configPath)

  if (needsWrite) {
    await fs.ensureDir(dirname(configPath))
    const tmpPath = `${configPath}.tmp`
    await fs.writeFile(tmpPath, stringify(config), 'utf-8')
    await fs.rename(tmpPath, configPath)
  }

  return {
    configPath,
    workspaceRoot: projectKey,
    updated: needsWrite,
    trustLevel: nextProjectConfig.trust_level,
  }
}
