import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

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

function collectFiles(root: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      files.push(...collectFiles(fullPath))
      continue
    }

    if (/\.(md|ts|tsx|yaml|yml)$/.test(entry))
      files.push(fullPath)
  }
  return files
}

describe('native identity audit', () => {
  it('does not reintroduce canonical ccg-owned defaults in maintained surfaces', () => {
    const packageRoot = findPackageRoot()
    const files = [
      join(packageRoot, 'README.md'),
      join(packageRoot, 'README.zh-CN.md'),
      join(packageRoot, 'CLAUDE.md'),
      ...collectFiles(join(packageRoot, 'docs')),
      ...collectFiles(join(packageRoot, 'templates')),
      ...collectFiles(join(packageRoot, 'src', 'commands')),
      ...collectFiles(join(packageRoot, 'src', 'i18n')),
    ]

    const bannedSnippets = [
      '/ccg:',
      'commands/ccg/',
      'agents/ccg/',
      'skills/ccg/',
      'ccg-spec-',
      'ccg-skills.md',
      'ccg-skill-routing.md',
      'ccg-grok-search.md',
      '~/.claude/.ccg/',
      '../.ccg/',
    ]

    const findings: string[] = []
    const allowedCompatibilityFindings = new Set([
      `${join(packageRoot, 'README.md')}: ~/.claude/.ccg/`,
    ])
    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      for (const snippet of bannedSnippets) {
        const finding = `${file}: ${snippet}`
        if (content.includes(snippet) && !allowedCompatibilityFindings.has(finding))
          findings.push(finding)
      }
    }

    expect(findings).toEqual([])
  })
})
