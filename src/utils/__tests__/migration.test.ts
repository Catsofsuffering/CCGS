import { tmpdir } from 'node:os'
import { join, normalize } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import fs from 'fs-extra'
import { migrateToV1_4_0, needsMigration } from '../migration'

describe.sequential('migration cleanup', () => {
  const originalHome = process.env.HOME
  const originalUserProfile = process.env.USERPROFILE
  const homeDir = join(tmpdir(), `ccsm-migration-${Date.now()}`)

  beforeAll(async () => {
    process.env.HOME = homeDir
    process.env.USERPROFILE = homeDir

    await fs.ensureDir(join(homeDir, '.ccg', 'prompts', 'codex'))
    await fs.ensureDir(join(homeDir, '.claude', 'commands', 'ccg'))
    await fs.ensureDir(join(homeDir, '.claude', 'agents', 'ccg'))
    await fs.ensureDir(join(homeDir, '.claude', 'rules'))
    await fs.ensureDir(join(homeDir, '.codex', 'skills', 'ccg-spec-init'))
    await fs.ensureDir(join(homeDir, '.ccsm', 'prompts', 'claude'))
    await fs.ensureDir(join(homeDir, '.claude', 'commands', 'ccsm'))

    await fs.writeFile(join(homeDir, '.ccg', 'prompts', 'codex', 'legacy.md'), '# legacy runtime')
    await fs.writeFile(join(homeDir, '.ccsm', 'prompts', 'claude', 'existing.md'), '# existing canonical')
    await fs.writeFile(join(homeDir, '.claude', 'commands', 'ccg', 'spec-init.md'), '# legacy command')
    await fs.writeFile(join(homeDir, '.claude', 'commands', 'ccsm', 'existing.md'), '# existing command')
    await fs.writeFile(join(homeDir, '.claude', 'agents', 'ccg', 'planner.md'), '# legacy agent')
    await fs.writeFile(join(homeDir, '.claude', 'rules', 'ccg-skills.md'), '# legacy rule')
    await fs.writeFile(join(homeDir, '.codex', 'skills', 'ccg-spec-init', 'SKILL.md'), '# legacy codex skill')
  })

  afterAll(async () => {
    process.env.HOME = originalHome
    process.env.USERPROFILE = originalUserProfile
    await fs.remove(homeDir)
  })

  it('merges deprecated assets into canonical paths and removes legacy entrypoints', async () => {
    await expect(needsMigration()).resolves.toBe(true)

    const result = await migrateToV1_4_0()

    expect(result.success).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.migratedFiles).toEqual(expect.arrayContaining([
      expect.stringContaining('~/.ccg'),
      expect.stringContaining('~/.claude/commands/ccg'),
      expect.stringContaining('~/.claude/agents/ccg'),
      expect.stringContaining('~/.claude/rules/ccg-skills.md'),
      expect.stringContaining('~/.codex/skills/ccg-spec-init'),
    ]))

    expect(await fs.pathExists(join(homeDir, '.ccsm', 'prompts', 'codex', 'legacy.md'))).toBe(true)
    expect(await fs.pathExists(join(homeDir, '.ccsm', 'prompts', 'claude', 'existing.md'))).toBe(true)
    expect(await fs.pathExists(join(homeDir, '.claude', 'commands', 'ccsm', 'spec-init.md'))).toBe(true)
    expect(await fs.pathExists(join(homeDir, '.claude', 'commands', 'ccsm', 'existing.md'))).toBe(true)
    expect(await fs.pathExists(join(homeDir, '.claude', 'agents', 'ccsm', 'planner.md'))).toBe(true)
    expect(await fs.pathExists(join(homeDir, '.claude', 'rules', 'ccsm-skills.md'))).toBe(true)
    expect(await fs.pathExists(join(homeDir, '.codex', 'skills', 'spec-init', 'SKILL.md'))).toBe(true)

    expect(await fs.pathExists(join(homeDir, '.ccg'))).toBe(false)
    expect(await fs.pathExists(join(homeDir, '.claude', 'commands', 'ccg'))).toBe(false)
    expect(await fs.pathExists(join(homeDir, '.claude', 'agents', 'ccg'))).toBe(false)
    expect(await fs.pathExists(join(homeDir, '.claude', 'rules', 'ccg-skills.md'))).toBe(false)
    expect(await fs.pathExists(join(homeDir, '.codex', 'skills', 'ccg-spec-init'))).toBe(false)

    await expect(needsMigration()).resolves.toBe(false)
  })

  it('downgrades locked legacy cleanup to deferred cleanup after merge', async () => {
    const busyHomeDir = join(tmpdir(), `ccsm-migration-busy-${Date.now()}`)
    const previousHome = process.env.HOME
    const previousUserProfile = process.env.USERPROFILE

    process.env.HOME = busyHomeDir
    process.env.USERPROFILE = busyHomeDir

    try {
      const legacyRuntime = join(busyHomeDir, '.claude', '.ccgs')
      await fs.ensureDir(join(legacyRuntime, 'claude-monitor'))
      await fs.writeFile(join(legacyRuntime, 'claude-monitor', 'locked.txt'), 'legacy monitor')
      const normalizedLegacyRuntime = normalize(legacyRuntime)

      const originalRemove = fs.remove.bind(fs)
      const removeSpy = vi.spyOn(fs, 'remove').mockImplementation(async (target: string) => {
        if (normalize(target) === normalizedLegacyRuntime) {
          const error = new Error(`EBUSY: resource busy or locked, rmdir '${join(legacyRuntime, 'claude-monitor')}'`) as NodeJS.ErrnoException
          error.code = 'EBUSY'
          throw error
        }
        return originalRemove(target)
      })

      try {
        const result = await migrateToV1_4_0()
        expect(result.success).toBe(true)
        expect(result.errors).toEqual([])
        expect(result.migratedFiles).toEqual(expect.arrayContaining([
          expect.stringContaining('~/.claude/.ccgs'),
        ]))
        expect(result.skipped).toEqual(expect.arrayContaining([
          expect.stringContaining('~/.claude/.ccgs (cleanup deferred: EBUSY)'),
        ]))
        expect(await fs.pathExists(join(busyHomeDir, '.ccsm', 'claude-monitor', 'locked.txt'))).toBe(true)
        await expect(needsMigration()).resolves.toBe(true)
      }
      finally {
        removeSpy.mockRestore()
      }
    }
    finally {
      process.env.HOME = previousHome
      process.env.USERPROFILE = previousUserProfile
      await fs.remove(busyHomeDir)
    }
  })

  it('skips Codex skill migration when a user-owned top-level skill already exists', async () => {
    const conflictHomeDir = join(tmpdir(), `ccsm-migration-conflict-${Date.now()}`)
    const previousHome = process.env.HOME
    const previousUserProfile = process.env.USERPROFILE

    process.env.HOME = conflictHomeDir
    process.env.USERPROFILE = conflictHomeDir

    try {
      await fs.ensureDir(join(conflictHomeDir, '.codex', 'skills', 'ccg-spec-init'))
      await fs.ensureDir(join(conflictHomeDir, '.codex', 'skills', 'spec-init'))
      await fs.writeFile(join(conflictHomeDir, '.codex', 'skills', 'ccg-spec-init', 'SKILL.md'), '# legacy codex skill')
      await fs.writeFile(join(conflictHomeDir, '.codex', 'skills', 'spec-init', 'SKILL.md'), '# user owned skill')

      const result = await migrateToV1_4_0()

      expect(result.success).toBe(true)
      expect(result.skipped).toEqual(expect.arrayContaining([
        expect.stringContaining('~/.codex/skills/ccg-spec-init (canonical spec-init already exists and is not managed by CCSM)'),
      ]))
      expect(await fs.readFile(join(conflictHomeDir, '.codex', 'skills', 'spec-init', 'SKILL.md'), 'utf-8')).toBe('# user owned skill')
      expect(await fs.pathExists(join(conflictHomeDir, '.codex', 'skills', 'ccg-spec-init', 'SKILL.md'))).toBe(true)
    }
    finally {
      process.env.HOME = previousHome
      process.env.USERPROFILE = previousUserProfile
      await fs.remove(conflictHomeDir)
    }
  })
})
