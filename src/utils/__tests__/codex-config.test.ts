import { tmpdir } from 'node:os'
import { join } from 'pathe'
import { afterAll, describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import { parse } from 'smol-toml'
import { ensureCodexWorkspaceTrust } from '../codex-config'

describe('ensureCodexWorkspaceTrust', () => {
  const tempRoot = join(tmpdir(), `ccsm-codex-config-${Date.now()}`)
  const codexHomeDir = join(tempRoot, '.codex')
  const workspaceRoot = join(tempRoot, 'workspace')

  afterAll(async () => {
    await fs.remove(tempRoot)
  })

  it('creates a trusted project entry without removing unrelated config', async () => {
    const configPath = join(codexHomeDir, 'config.toml')
    await fs.ensureDir(codexHomeDir)
    await fs.ensureDir(workspaceRoot)
    await fs.writeFile(configPath, `
model = "gpt-5.4"

[projects."C:\\\\other"]
trust_level = "trusted"
`, 'utf-8')

    const result = await ensureCodexWorkspaceTrust(workspaceRoot, codexHomeDir)
    const content = await fs.readFile(configPath, 'utf-8')
    const parsed = parse(content) as Record<string, any>

    expect(result.configPath).toBe(configPath)
    expect(result.workspaceRoot).toBe(workspaceRoot.replace(/\//g, '\\'))
    expect(result.updated).toBe(true)
    expect(parsed.model).toBe('gpt-5.4')
    expect(parsed.projects['C:\\other'].trust_level).toBe('trusted')
    expect(parsed.projects[workspaceRoot.replace(/\//g, '\\')].trust_level).toBe('trusted')
  })

  it('is idempotent when the workspace is already trusted', async () => {
    const result = await ensureCodexWorkspaceTrust(workspaceRoot, codexHomeDir)

    expect(result.updated).toBe(false)
    expect(result.trustLevel).toBe('trusted')
  })

  it('reuses an equivalent windows-style key instead of creating a slash-variant duplicate', async () => {
    const configPath = join(codexHomeDir, 'config.toml')
    await fs.writeFile(configPath, `
[projects."B:\\\\project\\\\ccs"]
trust_level = "trusted"

[projects."B:/project/ccs"]
trust_level = "untrusted"
`, 'utf-8')

    const result = await ensureCodexWorkspaceTrust('B:/project/ccs', codexHomeDir)
    const parsed = parse(await fs.readFile(configPath, 'utf-8')) as Record<string, any>

    expect(result.workspaceRoot).toBe('B:\\project\\ccs')
    expect(result.updated).toBe(true)
    expect(parsed.projects['B:\\project\\ccs'].trust_level).toBe('trusted')
    expect(parsed.projects['B:/project/ccs']).toBeUndefined()
  })
})
