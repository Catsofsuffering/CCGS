import { readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import { getAllCommandIds, installWorkflows } from '../installer'

const ALL_IDS = getAllCommandIds()

function collectMdFiles(dir: string): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir))
    return files

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory())
      files.push(...collectMdFiles(fullPath))
    else if (entry.name.endsWith('.md'))
      files.push(fullPath)
  }

  return files
}

describe('installWorkflows E2E - mcpProvider="skip"', () => {
  const tmpDir = join(tmpdir(), `ccgs-test-skip-${Date.now()}`)

  afterAll(async () => {
    await fs.remove(tmpDir)
  })

  it('installs all workflows without errors', { timeout: 60_000 }, async () => {
    const result = await installWorkflows(ALL_IDS, tmpDir, true, {
      mcpProvider: 'skip',
    })
    expect(result.success).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.installedCommands.length).toBeGreaterThan(0)
  })

  it('generated command files contain no MCP placeholders', () => {
    const files = collectMdFiles(join(tmpDir, 'commands', 'ccgs'))
    expect(files.length).toBeGreaterThan(0)

    for (const file of files) {
      const content = readFileSync(file, 'utf-8')
      expect(content, `${file} should not contain {{MCP_SEARCH_TOOL}}`).not.toContain('{{MCP_SEARCH_TOOL}}')
      expect(content, `${file} should not contain {{MCP_SEARCH_PARAM}}`).not.toContain('{{MCP_SEARCH_PARAM}}')
    }
  })

  it('spec-research contains Glob + Grep fallback guidance', () => {
    const content = readFileSync(join(tmpDir, 'commands', 'ccgs', 'spec-research.md'), 'utf-8')
    expect(content).toContain('Glob + Grep')
  })

  it('planner frontmatter drops the MCP tool from the tools declaration', () => {
    const content = readFileSync(join(tmpDir, 'agents', 'ccgs', 'planner.md'), 'utf-8')
    const toolsLine = content.split('\n').find(line => line.startsWith('tools:'))
    expect(toolsLine).toBe('tools: Read, Write')
  })
})

describe('installWorkflows E2E - mcpProvider="ace-tool"', () => {
  const tmpDir = join(tmpdir(), `ccgs-test-ace-${Date.now()}`)
  const e2eTimeout = process.platform === 'win32' ? 60_000 : 20_000

  afterAll(async () => {
    await fs.remove(tmpDir)
  })

  it('installs all workflows and injects ace-tool references', { timeout: e2eTimeout }, async () => {
    const result = await installWorkflows(ALL_IDS, tmpDir, true, {
      mcpProvider: 'ace-tool',
    })
    expect(result.success).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('generated command files contain ace-tool references', () => {
    const content = readFileSync(join(tmpDir, 'commands', 'ccgs', 'spec-research.md'), 'utf-8')
    expect(content).toContain('mcp__ace-tool__search_context')
    expect(content).not.toContain('{{MCP_SEARCH_TOOL}}')
  })

  it('generated agent files contain ace-tool references', () => {
    const content = readFileSync(join(tmpDir, 'agents', 'ccgs', 'planner.md'), 'utf-8')
    expect(content).toContain('mcp__ace-tool__search_context')
    expect(content).not.toContain('{{MCP_SEARCH_TOOL}}')
  })
})
