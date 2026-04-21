/**
 * Migration utilities for nativeization.
 * Handles migration from deprecated pre-CCSM runtime/layout paths to canonical ccsm-owned paths.
 */

import fs from 'fs-extra'
import { homedir } from 'node:os'
import { dirname, join } from 'pathe'
import {
  CANONICAL_CODEX_SKILL_NAMES,
  CANONICAL_NAMESPACE,
  CANONICAL_RULE_FILES,
  DEPRECATED_CODEX_SKILL_NAMES,
  DEPRECATED_HOST_NAMESPACES,
  DEPRECATED_RULE_FILES,
  DEPRECATED_RUNTIME_DIRNAMES,
} from './identity'
import { getCanonicalHomeDir } from './host'

export interface MigrationResult {
  success: boolean
  migratedFiles: string[]
  errors: string[]
  skipped: string[]
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getErrorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as NodeJS.ErrnoException).code)
    : undefined
}

function isDeferredCleanupError(error: unknown): boolean {
  const code = getErrorCode(error)
  return code === 'EBUSY' || code === 'EPERM'
}

function formatCleanupReason(error: unknown): string {
  const code = getErrorCode(error)
  return code ? `cleanup deferred: ${code}` : `cleanup deferred: ${String(error)}`
}

async function mergeIntoCanonical(
  source: string,
  target: string,
): Promise<void> {
  const sourceStat = await fs.stat(source)

  if (sourceStat.isDirectory()) {
    await fs.ensureDir(target)
    const entries = await fs.readdir(source)
    for (const entry of entries) {
      await mergeIntoCanonical(join(source, entry), join(target, entry))
    }
    return
  }

  if (await fs.pathExists(target))
    return

  await fs.ensureDir(dirname(target))
  await fs.copy(source, target)
}

async function removeLegacyPath(source: string): Promise<void> {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await fs.remove(source)
      return
    }
    catch (error) {
      lastError = error
      if (!isDeferredCleanupError(error) || attempt === 2)
        break
      await sleep(250)
    }
  }

  throw lastError
}

async function migratePath(
  source: string,
  target: string,
  label: string,
  result: MigrationResult,
): Promise<void> {
  if (!await fs.pathExists(source))
    return

  try {
    await mergeIntoCanonical(source, target)
    result.migratedFiles.push(`${label} -> ${target}`)

    try {
      await removeLegacyPath(source)
    }
    catch (error) {
      if (isDeferredCleanupError(error)) {
        result.skipped.push(`${label} (${formatCleanupReason(error)})`)
        return
      }

      throw error
    }
  }
  catch (error) {
    result.errors.push(`Failed to migrate ${label}: ${error}`)
    result.success = false
  }
}

export async function migrateToV1_4_0(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedFiles: [],
    errors: [],
    skipped: [],
  }

  const claudeDir = join(homedir(), '.claude')
  const codexDir = join(homedir(), '.codex')
  const codexSkillsDir = join(homedir(), '.codex', 'skills')
  const canonicalRuntimeDir = getCanonicalHomeDir()
  const [transitionalRuntimeDir, legacyRuntimeDir] = DEPRECATED_RUNTIME_DIRNAMES.map(dirname => join(homedir(), dirname))
  const [transitionalNamespace, legacyNamespace] = DEPRECATED_HOST_NAMESPACES

  try {
    await migratePath(legacyRuntimeDir, canonicalRuntimeDir, `~/${DEPRECATED_RUNTIME_DIRNAMES[1]}`, result)
    await migratePath(transitionalRuntimeDir, canonicalRuntimeDir, `~/${DEPRECATED_RUNTIME_DIRNAMES[0]}`, result)
    await migratePath(join(claudeDir, DEPRECATED_RUNTIME_DIRNAMES[1]), canonicalRuntimeDir, `~/.claude/${DEPRECATED_RUNTIME_DIRNAMES[1]}`, result)
    await migratePath(join(claudeDir, DEPRECATED_RUNTIME_DIRNAMES[0]), canonicalRuntimeDir, `~/.claude/${DEPRECATED_RUNTIME_DIRNAMES[0]}`, result)
    await migratePath(join(codexDir, DEPRECATED_RUNTIME_DIRNAMES[1]), canonicalRuntimeDir, `~/.codex/${DEPRECATED_RUNTIME_DIRNAMES[1]}`, result)
    await migratePath(join(codexDir, DEPRECATED_RUNTIME_DIRNAMES[0]), canonicalRuntimeDir, `~/.codex/${DEPRECATED_RUNTIME_DIRNAMES[0]}`, result)
    await migratePath(
      join(claudeDir, 'prompts', legacyNamespace),
      join(canonicalRuntimeDir, 'prompts'),
      `~/.claude/prompts/${legacyNamespace}`,
      result,
    )
    await migratePath(
      join(claudeDir, 'prompts', transitionalNamespace),
      join(canonicalRuntimeDir, 'prompts'),
      `~/.claude/prompts/${transitionalNamespace}`,
      result,
    )
    await migratePath(
      join(claudeDir, 'commands', legacyNamespace),
      join(claudeDir, 'commands', CANONICAL_NAMESPACE),
      `~/.claude/commands/${legacyNamespace}`,
      result,
    )
    await migratePath(
      join(claudeDir, 'commands', transitionalNamespace),
      join(claudeDir, 'commands', CANONICAL_NAMESPACE),
      `~/.claude/commands/${transitionalNamespace}`,
      result,
    )
    await migratePath(
      join(claudeDir, 'agents', legacyNamespace),
      join(claudeDir, 'agents', CANONICAL_NAMESPACE),
      `~/.claude/agents/${legacyNamespace}`,
      result,
    )
    await migratePath(
      join(claudeDir, 'agents', transitionalNamespace),
      join(claudeDir, 'agents', CANONICAL_NAMESPACE),
      `~/.claude/agents/${transitionalNamespace}`,
      result,
    )
    await migratePath(
      join(claudeDir, 'skills', legacyNamespace),
      join(canonicalRuntimeDir, 'skills', CANONICAL_NAMESPACE),
      `~/.claude/skills/${legacyNamespace}`,
      result,
    )
    await migratePath(
      join(claudeDir, 'skills', transitionalNamespace),
      join(canonicalRuntimeDir, 'skills', CANONICAL_NAMESPACE),
      `~/.claude/skills/${transitionalNamespace}`,
      result,
    )

    for (let i = 0; i < CANONICAL_RULE_FILES.length; i++) {
      await migratePath(
        join(claudeDir, 'rules', DEPRECATED_RULE_FILES[i + CANONICAL_RULE_FILES.length]),
        join(claudeDir, 'rules', CANONICAL_RULE_FILES[i]),
        `~/.claude/rules/${DEPRECATED_RULE_FILES[i + CANONICAL_RULE_FILES.length]}`,
        result,
      )
    }

    for (let i = 0; i < CANONICAL_RULE_FILES.length; i++) {
      await migratePath(
        join(claudeDir, 'rules', DEPRECATED_RULE_FILES[i]),
        join(claudeDir, 'rules', CANONICAL_RULE_FILES[i]),
        `~/.claude/rules/${DEPRECATED_RULE_FILES[i]}`,
        result,
      )
    }

    for (let i = 0; i < CANONICAL_CODEX_SKILL_NAMES.length; i++) {
      await migratePath(
        join(codexSkillsDir, DEPRECATED_CODEX_SKILL_NAMES[i + CANONICAL_CODEX_SKILL_NAMES.length]),
        join(codexSkillsDir, CANONICAL_CODEX_SKILL_NAMES[i]),
        `~/.codex/skills/${DEPRECATED_CODEX_SKILL_NAMES[i + CANONICAL_CODEX_SKILL_NAMES.length]}`,
        result,
      )
    }

    for (let i = 0; i < CANONICAL_CODEX_SKILL_NAMES.length; i++) {
      await migratePath(
        join(codexSkillsDir, DEPRECATED_CODEX_SKILL_NAMES[i]),
        join(codexSkillsDir, CANONICAL_CODEX_SKILL_NAMES[i]),
        `~/.codex/skills/${DEPRECATED_CODEX_SKILL_NAMES[i]}`,
        result,
      )
    }
  }
  catch (error) {
    result.errors.push(`Migration failed: ${error}`)
    result.success = false
  }

  return result
}

export async function needsMigration(): Promise<boolean> {
  const claudeDir = join(homedir(), '.claude')
  const codexDir = join(homedir(), '.codex')
  const codexSkillsDir = join(codexDir, 'skills')
  const legacyPaths = [
    ...DEPRECATED_RUNTIME_DIRNAMES.map(dirname => join(homedir(), dirname)),
    ...DEPRECATED_RUNTIME_DIRNAMES.map(dirname => join(claudeDir, dirname)),
    ...DEPRECATED_RUNTIME_DIRNAMES.map(dirname => join(codexDir, dirname)),
    ...DEPRECATED_HOST_NAMESPACES.flatMap(namespace => [
      join(claudeDir, 'prompts', namespace),
      join(claudeDir, 'commands', namespace),
      join(claudeDir, 'agents', namespace),
      join(claudeDir, 'skills', namespace),
    ]),
    ...DEPRECATED_RULE_FILES.map(ruleFile => join(claudeDir, 'rules', ruleFile)),
    ...DEPRECATED_CODEX_SKILL_NAMES.map(skillName => join(codexSkillsDir, skillName)),
  ]

  for (const legacyPath of legacyPaths) {
    if (await fs.pathExists(legacyPath))
      return true
  }

  return false
}
