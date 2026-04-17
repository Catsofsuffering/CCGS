import { homedir } from 'node:os'
import { join } from 'pathe'
import type { HostRuntime } from '../types'
import { CANONICAL_RUNTIME_DIRNAME, LEGACY_RUNTIME_DIRNAME } from './identity'

export const DEFAULT_HOST: HostRuntime = 'codex'

export function getHostHomeDir(host: HostRuntime): string {
  return join(homedir(), host === 'codex' ? '.codex' : '.claude')
}

export function getRuntimeDirForInstallDir(installDir: string): string {
  return join(installDir, CANONICAL_RUNTIME_DIRNAME)
}

export function getLegacyRuntimeDirForInstallDir(installDir: string): string {
  return join(installDir, LEGACY_RUNTIME_DIRNAME)
}

export function getConfigPathForInstallDir(installDir: string): string {
  return join(getRuntimeDirForInstallDir(installDir), 'config.toml')
}

export function getLegacyConfigPathForInstallDir(installDir: string): string {
  return join(getLegacyRuntimeDirForInstallDir(installDir), 'config.toml')
}
