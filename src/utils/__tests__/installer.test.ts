import { readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import {
  getAllCommandIds,
  getWorkflowById,
  getWorkflowConfigs,
  injectConfigVariables,
  installWorkflows,
  uninstallWorkflows,
} from '../installer'

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
const SAMPLE_WORKFLOW_ID = getAllCommandIds()[0]

describe('workflow registry', () => {
  it('publish manifest includes codex skill templates', () => {
    const packageJson = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
    expect(packageJson.files).toContain('templates/codex-skills/')
  })

  it('getAllCommandIds returns the maintained command set', () => {
    const ids = getAllCommandIds()
    expect(ids.length).toBeGreaterThanOrEqual(10)
  })

  it('every command ID has a matching template file', () => {
    for (const id of getAllCommandIds()) {
      const workflow = getWorkflowById(id)
      expect(workflow, `workflow config missing for: ${id}`).toBeDefined()
      for (const cmd of workflow!.commands) {
        expect(
          fs.existsSync(join(TEMPLATES_DIR, `${cmd}.md`)),
          `template missing: templates/commands/${cmd}.md`,
        ).toBe(true)
      }
    }
  })

  it('every template file has a matching workflow config', () => {
    const templateFiles = readdirSync(TEMPLATES_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''))
    const allCommands = getAllCommandIds().flatMap(id => getWorkflowById(id)!.commands)

    for (const template of templateFiles) {
      expect(
        allCommands.includes(template),
        `template "${template}.md" has no workflow config`,
      ).toBe(true)
    }
  })

  it('getWorkflowConfigs returns sorted by order', () => {
    const configs = getWorkflowConfigs()
    for (let i = 1; i < configs.length; i++) {
      expect(configs[i].order).toBeGreaterThanOrEqual(configs[i - 1].order)
    }
  })

  it('all workflow IDs are unique', () => {
    const ids = getAllCommandIds()
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('injectConfigVariables', () => {
  it('injects configured model routing', () => {
    const result = injectConfigVariables('{{FRONTEND_PRIMARY}} / {{BACKEND_PRIMARY}}', {
      routing: {
        frontend: { models: ['claude'], primary: 'claude' },
        backend: { models: ['codex'], primary: 'codex' },
      },
    })
    expect(result).toBe('claude / codex')
  })

  it('falls back to codex routing by default', () => {
    expect(injectConfigVariables('{{FRONTEND_PRIMARY}} / {{BACKEND_PRIMARY}}', {})).toBe('codex / codex')
  })

  it('replaces MCP placeholders with Glob + Grep when MCP is skipped', () => {
    const result = injectConfigVariables('tool: {{MCP_SEARCH_TOOL}}', { mcpProvider: 'skip' })
    expect(result).toContain('Glob + Grep')
    expect(result).not.toContain('{{MCP_SEARCH_TOOL}}')
  })
})

describe('primary-path templates', () => {
  it('spec-research keeps Codex and Claude as the primary path', () => {
    const content = readFileSync(join(TEMPLATES_DIR, 'spec-research.md'), 'utf-8')
    const result = injectConfigVariables(content, {
      routing: {
        mode: 'smart',
        frontend: { models: ['claude'], primary: 'claude' },
        backend: { models: ['codex'], primary: 'codex' },
        review: { models: ['codex'] },
      },
    })

    expect(result).toContain('must use `codex`')
    expect(result).toContain('launch a second call with `claude`')
  })

  it('all current templates fully resolve installer variables', () => {
    const templateFiles = readdirSync(TEMPLATES_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => join(TEMPLATES_DIR, file))

    for (const file of templateFiles) {
      const content = readFileSync(file, 'utf-8')
      const result = injectConfigVariables(content, {
        routing: {
          mode: 'smart',
          frontend: { models: ['codex'], primary: 'codex' },
          backend: { models: ['codex'], primary: 'codex' },
          review: { models: ['codex'] },
        },
        mcpProvider: 'ace-tool',
      })

      const remaining = result.match(/\{\{[A-Z_]+\}\}/g) || []
      const unresolvedInstallerVars = remaining.filter(variable => variable !== '{{WORKDIR}}')
      expect(unresolvedInstallerVars, `unprocessed variables in ${file}`).toEqual([])
    }
  })
})

describe('installWorkflows E2E', () => {
  const tmpDir = join(tmpdir(), `ccsm-test-install-${Date.now()}`)
  const e2eTimeout = process.platform === 'win32' ? 60_000 : 20_000

  afterAll(async () => {
    await fs.remove(tmpDir)
  })

  it('installs all workflows without errors', { timeout: e2eTimeout }, async () => {
    const result = await installWorkflows(getAllCommandIds(), tmpDir, true, {
      mcpProvider: 'contextweaver',
    })
    expect(result.success).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('generated command files contain contextweaver references', () => {
    const planContent = readFileSync(join(tmpDir, 'commands', 'ccsm', 'spec-research.md'), 'utf-8')
    expect(planContent).toContain('mcp__contextweaver__codebase-retrieval')
    expect(planContent).not.toContain('{{MCP_SEARCH_TOOL}}')
  })

  it('generated agent files contain contextweaver references', () => {
    const plannerContent = readFileSync(join(tmpDir, 'agents', 'ccsm', 'planner.md'), 'utf-8')
    expect(plannerContent).toContain('mcp__contextweaver__codebase-retrieval')
  })
})

describe('uninstallWorkflows E2E', () => {
  const tmpDir = join(tmpdir(), `ccsm-test-uninstall-${Date.now()}`)
  const e2eTimeout = process.platform === 'win32' ? 60_000 : 20_000

  afterAll(async () => {
    await fs.remove(tmpDir)
  })

  it('installs then uninstalls cleanly', { timeout: e2eTimeout }, async () => {
    const installResult = await installWorkflows(getAllCommandIds(), tmpDir, true, {
      mcpProvider: 'ace-tool',
    })
    expect(installResult.success).toBe(true)
    expect(fs.existsSync(join(tmpDir, 'commands', 'ccsm', 'spec-init.md'))).toBe(true)

    const uninstallResult = await uninstallWorkflows(tmpDir)
    expect(uninstallResult.success).toBe(true)
    expect(uninstallResult.removedCommands.length).toBeGreaterThan(0)
    expect(fs.existsSync(join(tmpDir, 'commands', 'ccsm'))).toBe(false)
  })

  it('uninstall on empty dir succeeds without errors', async () => {
    const emptyDir = join(tmpdir(), `ccsm-test-empty-${Date.now()}`)
    const result = await uninstallWorkflows(emptyDir)
    expect(result.success).toBe(true)
    expect(result.errors).toEqual([])
    await fs.remove(emptyDir)
  })
})

describe('Claude monitor asset installation', () => {
  const tmpDir = join(tmpdir(), `ccsm-test-monitor-${Date.now()}`)

  afterAll(async () => {
    await fs.remove(tmpDir)
  })

  it('installs Claude monitor assets into the managed runtime directory', { timeout: 60_000 }, async () => {
    const result = await installWorkflows([SAMPLE_WORKFLOW_ID], tmpDir, true, {
      mcpProvider: 'skip',
    })

    expect(result.monitorInstalled).toBe(true)
    expect(result.monitorPath).toBeTruthy()
    expect(fs.existsSync(join(result.monitorPath!, 'server', 'index.js'))).toBe(true)
    expect(fs.existsSync(join(result.monitorPath!, 'client', 'src', 'App.tsx'))).toBe(true)
  })
})

describe('prompt installation', () => {
  const tmpDir = join(tmpdir(), `ccsm-test-prompts-${Date.now()}`)

  afterAll(async () => {
    await fs.remove(tmpDir)
  })

  it('installs codex and claude prompts by default', { timeout: 60_000 }, async () => {
    const result = await installWorkflows(getAllCommandIds(), tmpDir, true, {
      mcpProvider: 'skip',
    })
    expect(result.success).toBe(true)

    const promptsDir = join(tmpDir, '.ccsm', 'prompts')
    expect(fs.existsSync(join(promptsDir, 'codex'))).toBe(true)
    expect(fs.existsSync(join(promptsDir, 'claude'))).toBe(true)
    expect(fs.existsSync(join(promptsDir, 'gemini'))).toBe(false)
  })
})

describe('skills namespace isolation', () => {
  const tmpDir = join(tmpdir(), `ccsm-test-skills-${Date.now()}`)

  afterAll(async () => {
    await fs.remove(tmpDir)
  })

  it('installs skills under .ccsm/skills/ccsm/', { timeout: 60_000 }, async () => {
    const result = await installWorkflows([SAMPLE_WORKFLOW_ID], tmpDir, true, {
      mcpProvider: 'skip',
    })
    expect(result.success).toBe(true)
    expect(result.installedSkills).toBeGreaterThanOrEqual(1)
    expect(fs.existsSync(join(tmpDir, '.ccsm', 'skills', 'ccsm', 'SKILL.md'))).toBe(true)
  })

  it('uninstall only removes skills/ccsm/, preserves user skills', async () => {
    const userSkillDir = join(tmpDir, '.ccsm', 'skills', 'my-custom-skill')
    await fs.ensureDir(userSkillDir)
    await fs.writeFile(join(userSkillDir, 'SKILL.md'), '# My Custom Skill')

    const result = await uninstallWorkflows(tmpDir)
    expect(result.success).toBe(true)
    expect(fs.existsSync(join(tmpDir, '.ccsm', 'skills', 'ccsm'))).toBe(false)
    expect(fs.existsSync(join(userSkillDir, 'SKILL.md'))).toBe(true)
  })

  it('migrates the old root-level skills layout into .ccsm/skills/ccsm/', { timeout: 60_000 }, async () => {
    const migrateDir = join(tmpdir(), `ccsm-test-migrate-${Date.now()}`)
    try {
      const oldSkills = join(migrateDir, 'skills')
      await fs.ensureDir(join(oldSkills, 'tools', 'verify-security'))
      await fs.ensureDir(join(oldSkills, 'orchestration', 'multi-agent'))
      await fs.writeFile(join(oldSkills, 'SKILL.md'), '# Old Root')
      await fs.writeFile(join(oldSkills, 'run_skill.js'), '// old')
      await fs.writeFile(join(oldSkills, 'tools', 'verify-security', 'SKILL.md'), '# Old Security')
      await fs.writeFile(join(oldSkills, 'orchestration', 'multi-agent', 'SKILL.md'), '# Old Multi-Agent')
      await fs.ensureDir(join(oldSkills, 'brainstorming'))
      await fs.writeFile(join(oldSkills, 'brainstorming', 'SKILL.md'), '# User Brainstorming')

      const result = await installWorkflows([SAMPLE_WORKFLOW_ID], migrateDir, true, {
        mcpProvider: 'skip',
      })
      expect(result.success).toBe(true)
      expect(fs.existsSync(join(migrateDir, '.ccsm', 'skills', 'ccsm', 'SKILL.md'))).toBe(true)
      expect(fs.existsSync(join(migrateDir, 'skills', 'brainstorming', 'SKILL.md'))).toBe(true)
      expect(fs.existsSync(join(migrateDir, 'skills', 'tools'))).toBe(false)
      expect(fs.existsSync(join(migrateDir, 'skills', 'orchestration'))).toBe(false)
    }
    finally {
      await fs.remove(migrateDir)
    }
  })
})

describe('Codex workflow entrypoint', () => {
  const tmpDir = join(tmpdir(), `ccsm-test-codex-entry-${Date.now()}`)
  const codexHomeDir = join(tmpDir, '.codex-home')

  afterAll(async () => {
    await fs.remove(tmpDir)
  })

  it('installs top-level Codex workflow skills for the primary path', { timeout: 60_000 }, async () => {
    const result = await installWorkflows([SAMPLE_WORKFLOW_ID], tmpDir, true, {
      mcpProvider: 'skip',
      codexHomeDir,
    })

    expect(result.success).toBe(true)
    expect(result.installedCodexSkills).toEqual([
      'ccsm-spec-init',
      'ccsm-spec-plan',
      'ccsm-spec-impl',
    ])
    expect(fs.existsSync(join(codexHomeDir, 'skills', 'ccsm-spec-init', 'SKILL.md'))).toBe(true)
  })

  it('uninstall only removes CCG-owned Codex workflow skills', { timeout: 60_000 }, async () => {
    const uninstallDir = join(tmpdir(), `ccsm-test-codex-uninstall-${Date.now()}`)
    const uninstallCodexHome = join(uninstallDir, '.codex-home')
    const userSkillDir = join(uninstallCodexHome, 'skills', 'my-custom-skill')

    try {
      await installWorkflows([SAMPLE_WORKFLOW_ID], uninstallDir, true, {
        mcpProvider: 'skip',
        codexHomeDir: uninstallCodexHome,
      })

      await fs.ensureDir(userSkillDir)
      await fs.writeFile(join(userSkillDir, 'SKILL.md'), '# My Custom Skill')

      const result = await uninstallWorkflows(uninstallDir, { codexHomeDir: uninstallCodexHome })
      expect(result.success).toBe(true)
      expect(result.removedCodexSkills).toEqual([
        'ccsm-spec-init',
        'ccsm-spec-plan',
        'ccsm-spec-impl',
      ])
      expect(fs.existsSync(join(userSkillDir, 'SKILL.md'))).toBe(true)
    }
    finally {
      await fs.remove(uninstallDir)
    }
  })
})
