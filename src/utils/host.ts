import { homedir } from 'node:os'
import { join } from 'pathe'
import type { HostRuntime } from '../types'
import {
  CANONICAL_RUNTIME_DIRNAME,
  DEPRECATED_RUNTIME_DIRNAMES,
} from './identity'

export const DEFAULT_HOST: HostRuntime = 'codex'

export function getHostHomeDir(host: HostRuntime): string {
  return join(homedir(), host === 'codex' ? '.codex' : '.claude')
}

export function getCanonicalHomeDir(): string {
  return join(homedir(), CANONICAL_RUNTIME_DIRNAME)
}

export function getDeprecatedCanonicalHomeDirs(): string[] {
  return DEPRECATED_RUNTIME_DIRNAMES.map(dirname => join(homedir(), dirname))
}

export function getDeprecatedConfigPaths(): string[] {
  return getDeprecatedCanonicalHomeDirs().map(canonicalHome => join(canonicalHome, 'config.toml'))
}

export function getConfigPathForCanonicalHome(canonicalHome = getCanonicalHomeDir()): string {
  return join(canonicalHome, 'config.toml')
}
