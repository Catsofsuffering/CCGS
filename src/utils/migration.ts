/**
 * Migration utilities for v1.4.0+
 * Handles migration from legacy ccg-owned runtime/layout paths to canonical ccgs-owned paths.
 */

import fs from 'fs-extra'
import { homedir } from 'node:os'
import { dirname, join } from 'pathe'
import {
  CANONICAL_CODEX_SKILL_NAMES,
  CANONICAL_NAMESPACE,
  CANONICAL_RULE_FILES,
  CANONICAL_RUNTIME_DIRNAME,
  LEGACY_CODEX_SKILL_NAMES,
  LEGACY_NAMESPACE,
  LEGACY_RULE_FILES,
  LEGACY_RUNTIME_DIRNAME,
} from './identity'

export interface MigrationResult {
  success: boolean
  migratedFiles: string[]
  errors: string[]
  skipped: string[]
}

async function copyIfMissing(
  source: string,
  target: string,
  label: string,
  result: MigrationResult,
): Promise<void> {
  if (!await fs.pathExists(source)) {
    result.skipped.push(`${label} (does not exist)`)
    return
  }

  if (await fs.pathExists(target)) {
    result.skipped.push(`${label} (canonical target already exists)`)
    return
  }

  try {
    await fs.ensureDir(dirname(target))
    await fs.copy(source, target)
    result.migratedFiles.push(`${label} -> ${target}`)
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
  const codexSkillsDir = join(homedir(), '.codex', 'skills')
  const canonicalRuntimeDir = join(claudeDir, CANONICAL_RUNTIME_DIRNAME)

  try {
    await copyIfMissing(join(homedir(), '.ccg'), canonicalRuntimeDir, '~/.ccg', result)
    await copyIfMissing(join(claudeDir, LEGACY_RUNTIME_DIRNAME), canonicalRuntimeDir, `~/.claude/${LEGACY_RUNTIME_DIRNAME}`, result)
    await copyIfMissing(
      join(claudeDir, 'prompts', LEGACY_NAMESPACE),
      join(canonicalRuntimeDir, 'prompts'),
      `~/.claude/prompts/${LEGACY_NAMESPACE}`,
      result,
    )
    await copyIfMissing(
      join(claudeDir, 'commands', LEGACY_NAMESPACE),
      join(claudeDir, 'commands', CANONICAL_NAMESPACE),
      `~/.claude/commands/${LEGACY_NAMESPACE}`,
      result,
    )
    await copyIfMissing(
      join(claudeDir, 'agents', LEGACY_NAMESPACE),
      join(claudeDir, 'agents', CANONICAL_NAMESPACE),
      `~/.claude/agents/${LEGACY_NAMESPACE}`,
      result,
    )
    await copyIfMissing(
      join(claudeDir, 'skills', LEGACY_NAMESPACE),
      join(claudeDir, 'skills', CANONICAL_NAMESPACE),
      `~/.claude/skills/${LEGACY_NAMESPACE}`,
      result,
    )

    for (let i = 0; i < LEGACY_RULE_FILES.length; i++) {
      await copyIfMissing(
        join(claudeDir, 'rules', LEGACY_RULE_FILES[i]),
        join(claudeDir, 'rules', CANONICAL_RULE_FILES[i]),
        `~/.claude/rules/${LEGACY_RULE_FILES[i]}`,
        result,
      )
    }

    for (let i = 0; i < LEGACY_CODEX_SKILL_NAMES.length; i++) {
      await copyIfMissing(
        join(codexSkillsDir, LEGACY_CODEX_SKILL_NAMES[i]),
        join(codexSkillsDir, CANONICAL_CODEX_SKILL_NAMES[i]),
        `~/.codex/skills/${LEGACY_CODEX_SKILL_NAMES[i]}`,
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
  const legacyPaths = [
    join(homedir(), '.ccg'),
    join(claudeDir, LEGACY_RUNTIME_DIRNAME),
    join(claudeDir, 'prompts', LEGACY_NAMESPACE),
    join(claudeDir, 'commands', LEGACY_NAMESPACE),
    join(claudeDir, 'agents', LEGACY_NAMESPACE),
    join(claudeDir, 'skills', LEGACY_NAMESPACE),
  ]

  for (const legacyPath of legacyPaths) {
    if (await fs.pathExists(legacyPath))
      return true
  }

  return false
}
