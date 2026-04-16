import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { injectConfigVariables } from '../installer'

function findPackageRoot(): string {
  let dir = import.meta.dirname
  for (let i = 0; i < 10; i++) {
    try {
      readFileSync(join(dir, 'package.json'))
      return dir
    }
    catch {
      dir = join(dir, '..')
    }
  }
  throw new Error('Could not find package root')
}

const PACKAGE_ROOT = findPackageRoot()
const TEMPLATES_DIR = join(PACKAGE_ROOT, 'templates', 'commands')

describe('mcpProvider = "skip"', () => {
  const skipConfig = { mcpProvider: 'skip' }

  it('removes MCP tool from agent frontmatter tools declaration', () => {
    const result = injectConfigVariables('tools: Read, Write, {{MCP_SEARCH_TOOL}}', skipConfig)
    expect(result).toBe('tools: Read, Write')
  })

  it('replaces code blocks containing MCP tool invocation (JS-style)', () => {
    const input = [
      '```',
      '{{MCP_SEARCH_TOOL}}({',
      '  query: "<semantic query>",',
      '  project_root_path: "/path/to/project"',
      '})',
      '```',
    ].join('\n')

    const result = injectConfigVariables(input, skipConfig)
    expect(result).toContain('> MCP is not configured. Use `Glob` to locate files, `Grep` to search symbols, and `Read` to inspect file content.')
    expect(result).not.toContain('{{MCP_SEARCH_TOOL}}')
    expect(result).not.toContain('```')
  })

  it('replaces code blocks containing MCP tool invocation (JSON-style)', () => {
    const input = [
      '```',
      '{{MCP_SEARCH_TOOL}} {',
      '  "project_root_path": "{{WORKDIR}}",',
      '  "query": "reusable UI components"',
      '}',
      '```',
    ].join('\n')

    const result = injectConfigVariables(input, skipConfig)
    expect(result).toContain('> MCP is not configured.')
    expect(result).not.toContain('{{MCP_SEARCH_TOOL}}')
  })

  it('replaces inline backtick references', () => {
    const result = injectConfigVariables('Call `{{MCP_SEARCH_TOOL}}` to search related code', skipConfig)
    expect(result).toBe('Call `Glob + Grep` (MCP not configured) to search related code')
  })

  it('replaces bare references as a safety net', () => {
    const result = injectConfigVariables('Use {{MCP_SEARCH_TOOL}} to search codebase.', skipConfig)
    expect(result).toBe('Use Glob + Grep to search codebase.')
  })

  it('removes {{MCP_SEARCH_PARAM}} references', () => {
    const result = injectConfigVariables('param: {{MCP_SEARCH_PARAM}}', skipConfig)
    expect(result).toBe('param: ')
  })

  it('handles multiple patterns in a single template correctly', () => {
    const input = [
      '---',
      'tools: Read, Write, {{MCP_SEARCH_TOOL}}',
      '---',
      '',
      '### Step 2',
      '',
      '```',
      '{{MCP_SEARCH_TOOL}} {',
      '  "project_root_path": "{{WORKDIR}}",',
      '  "query": "{{QUERY}}"',
      '}',
      '```',
      '',
      'Call `{{MCP_SEARCH_TOOL}}` to search related code',
    ].join('\n')

    const result = injectConfigVariables(input, skipConfig)
    expect(result).toContain('tools: Read, Write')
    expect(result).toContain('> MCP is not configured.')
    expect(result).toContain('`Glob + Grep` (MCP not configured)')
    expect(result).not.toContain('{{MCP_SEARCH_TOOL}}')
    expect(result).not.toContain('mcp__ace-tool__search_context')
  })

  it('does not inject provider-specific MCP tools when skip is selected', () => {
    const result = injectConfigVariables('Use {{MCP_SEARCH_TOOL}}', skipConfig)
    expect(result).not.toContain('mcp__ace-tool')
    expect(result).not.toContain('mcp__contextweaver')
  })
})

describe('mcpProvider = "contextweaver"', () => {
  const cwConfig = { mcpProvider: 'contextweaver' }

  it('replaces {{MCP_SEARCH_TOOL}} with contextweaver tool name', () => {
    const result = injectConfigVariables('Use {{MCP_SEARCH_TOOL}}', cwConfig)
    expect(result).toContain('mcp__contextweaver__codebase-retrieval')
  })

  it('replaces {{MCP_SEARCH_PARAM}} with information_request', () => {
    const result = injectConfigVariables('{{MCP_SEARCH_PARAM}}', cwConfig)
    expect(result).toBe('information_request')
  })
})

describe('mcpProvider = "ace-tool" (default)', () => {
  it('replaces {{MCP_SEARCH_TOOL}} with ace-tool tool name', () => {
    const result = injectConfigVariables('Use {{MCP_SEARCH_TOOL}}', { mcpProvider: 'ace-tool' })
    expect(result).toContain('mcp__ace-tool__search_context')
  })

  it('replaces {{MCP_SEARCH_PARAM}} with query', () => {
    const result = injectConfigVariables('{{MCP_SEARCH_PARAM}}', { mcpProvider: 'ace-tool' })
    expect(result).toBe('query')
  })

  it('defaults to ace-tool when mcpProvider is not specified', () => {
    const result = injectConfigVariables('{{MCP_SEARCH_TOOL}}', {})
    expect(result).toBe('mcp__ace-tool__search_context')
  })

  it('defaults to ace-tool when mcpProvider is undefined', () => {
    const result = injectConfigVariables('{{MCP_SEARCH_TOOL}}', { mcpProvider: undefined })
    expect(result).toBe('mcp__ace-tool__search_context')
  })
})

describe('integration: real templates with skip mode', () => {
  function collectTemplateFiles(dir: string): string[] {
    const files: string[] = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...collectTemplateFiles(fullPath))
      }
      else if (entry.name.endsWith('.md')) {
        files.push(fullPath)
      }
    }
    return files
  }

  const templateFiles = collectTemplateFiles(TEMPLATES_DIR)
  const filesWithMcpRef = templateFiles.filter((file) => {
    const content = readFileSync(file, 'utf-8')
    return content.includes('{{MCP_SEARCH_TOOL}}')
  })

  it('finds templates containing {{MCP_SEARCH_TOOL}}', () => {
    expect(filesWithMcpRef.length).toBeGreaterThanOrEqual(3)
  })

  for (const file of filesWithMcpRef) {
    it(`${file.replace(`${PACKAGE_ROOT}/`, '')}: no MCP tool references remain after skip processing`, () => {
      const content = readFileSync(file, 'utf-8')
      const result = injectConfigVariables(content, { mcpProvider: 'skip' })

      expect(result).not.toContain('{{MCP_SEARCH_TOOL}}')
      expect(result).not.toContain('{{MCP_SEARCH_PARAM}}')
      expect(result).not.toContain('mcp__ace-tool__search_context')
      expect(result).not.toContain('mcp__contextweaver__codebase-retrieval')
    })
  }
})
