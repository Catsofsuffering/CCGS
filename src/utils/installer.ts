import type { InstallResult } from '../types'
import fs from 'fs-extra'
import { homedir } from 'node:os'
import { basename, join } from 'pathe'
import { installBundledMonitor, removeClaudeMonitorHooks } from './claude-monitor'
import {
  getAllCommandIds,
  getDefaultCommandIds,
  getWorkflowById,
  getWorkflowConfigs,
  getWorkflowPreset,
  WORKFLOW_PRESETS,
} from './installer-data'
import {
  ALL_CODEX_SKILL_NAMES,
  ALL_RULE_FILES,
  CANONICAL_CODEX_SKILL_NAMES,
  CANONICAL_NAMESPACE,
  CANONICAL_RUNTIME_DIRNAME,
  CANONICAL_RULE_FILES,
  LEGACY_NAMESPACE,
  LEGACY_RUNTIME_DIRNAME,
} from './identity'
import {
  injectConfigVariables,
  PACKAGE_ROOT,
  replaceHomePathsInTemplate,
} from './installer-template'
import { collectInvocableSkills, collectSkills, installSkillCommands, parseFrontmatter } from './skill-registry'

export {
  getAllCommandIds,
  getDefaultCommandIds,
  getWorkflowById,
  getWorkflowConfigs,
  getWorkflowPreset,
  WORKFLOW_PRESETS,
} from './installer-data'
export type { WorkflowPreset } from './installer-data'

export { injectConfigVariables } from './installer-template'

export {
  installAceTool,
  installAceToolRs,
  installContextWeaver,
  installFastContext,
  installMcpServer,
  syncMcpToCodex,
  uninstallAceTool,
  uninstallContextWeaver,
  uninstallFastContext,
  uninstallMcpServer,
} from './installer-mcp'
export type { ContextWeaverConfig } from './installer-mcp'

export {
  removeFastContextPrompt,
  writeFastContextPrompt,
} from './installer-prompt'

export {
  collectInvocableSkills,
  collectSkills,
  parseFrontmatter,
} from './skill-registry'
export type { SkillMeta } from './skill-registry'

interface InstallConfig {
  routing: {
    mode: string
    frontend: { models: string[], primary: string }
    backend: { models: string[], primary: string }
    review: { models: string[] }
  }
  mcpProvider: string
  skipImpeccable?: boolean
}

interface InstallContext {
  installDir: string
  codexHomeDir: string
  force: boolean
  config: InstallConfig
  templateDir: string
  result: InstallResult
}

async function copyMdTemplates(
  ctx: InstallContext,
  srcDir: string,
  destDir: string,
  options: { inject?: boolean } = {},
): Promise<string[]> {
  const installed: string[] = []
  if (!(await fs.pathExists(srcDir))) {
    console.error(`[CCGS] Template source directory not found: ${srcDir}`)
    return installed
  }

  await fs.ensureDir(destDir)
  const files = await fs.readdir(srcDir)
  for (const file of files) {
    if (!file.endsWith('.md'))
      continue

    const destFile = join(destDir, file)
    if (ctx.force || !(await fs.pathExists(destFile))) {
      let content = await fs.readFile(join(srcDir, file), 'utf-8')
      if (options.inject)
        content = injectConfigVariables(content, ctx.config)
      content = replaceHomePathsInTemplate(content, ctx.installDir)
      await fs.writeFile(destFile, content, 'utf-8')
    }
    installed.push(file.replace('.md', ''))
  }

  return installed
}

async function installCommandFiles(ctx: InstallContext, workflowIds: string[]): Promise<void> {
  const commandsDir = join(ctx.installDir, 'commands', CANONICAL_NAMESPACE)
  await fs.ensureDir(commandsDir)

  for (const workflowId of workflowIds) {
    const workflow = getWorkflowById(workflowId)
    if (!workflow) {
      ctx.result.errors.push(`Unknown workflow: ${workflowId}`)
      ctx.result.success = false
      continue
    }

    for (const cmd of workflow.commands) {
      const srcFile = join(ctx.templateDir, 'commands', `${cmd}.md`)
      const destFile = join(commandsDir, `${cmd}.md`)

      try {
        if (!(await fs.pathExists(srcFile))) {
          ctx.result.errors.push(`Missing command template: templates/commands/${cmd}.md`)
          ctx.result.success = false
          continue
        }

        if (ctx.force || !(await fs.pathExists(destFile))) {
          let content = await fs.readFile(srcFile, 'utf-8')
          content = injectConfigVariables(content, ctx.config)
          content = replaceHomePathsInTemplate(content, ctx.installDir)
          await fs.writeFile(destFile, content, 'utf-8')
        }

        ctx.result.installedCommands.push(cmd)
      }
      catch (error) {
        ctx.result.errors.push(`Failed to install ${cmd}: ${error}`)
        ctx.result.success = false
      }
    }
  }
}

async function installAgentFiles(ctx: InstallContext): Promise<void> {
  try {
    await copyMdTemplates(
      ctx,
      join(ctx.templateDir, 'commands', 'agents'),
      join(ctx.installDir, 'agents', CANONICAL_NAMESPACE),
      { inject: true },
    )
  }
  catch (error) {
    ctx.result.errors.push(`Failed to install agents: ${error}`)
    ctx.result.success = false
  }
}

async function installPromptFiles(ctx: InstallContext): Promise<void> {
  const promptsTemplateDir = join(ctx.templateDir, 'prompts')
  const promptsDir = join(ctx.installDir, CANONICAL_RUNTIME_DIRNAME, 'prompts')
  if (!(await fs.pathExists(promptsTemplateDir))) {
    ctx.result.errors.push(`Prompts template directory not found: ${promptsTemplateDir}`)
    ctx.result.success = false
    return
  }

  const promptModels = ['codex', 'claude']

  for (const model of promptModels) {
    try {
      const installed = await copyMdTemplates(
        ctx,
        join(promptsTemplateDir, model),
        join(promptsDir, model),
      )
      for (const name of installed)
        ctx.result.installedPrompts.push(`${model}/${name}`)
    }
    catch (error) {
      ctx.result.errors.push(`Failed to install ${model} prompts: ${error}`)
      ctx.result.success = false
    }
  }
}

async function collectSkillNames(dir: string, depth = 0): Promise<string[]> {
  const names: string[] = []
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        names.push(...await collectSkillNames(join(dir, entry.name), depth + 1))
      }
      else if (entry.name === 'SKILL.md' && depth > 0) {
        names.push(basename(dir))
      }
    }
  }
  catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== 'ENOENT')
      console.error(`[CCGS] Failed to read skills directory ${dir}: ${code || error}`)
  }
  return names
}

async function removeDirCollectMdNames(dir: string): Promise<string[]> {
  if (!(await fs.pathExists(dir)))
    return []

  const files = await fs.readdir(dir)
  const names = files.filter(file => file.endsWith('.md')).map(file => file.replace('.md', ''))
  await fs.remove(dir)
  return names
}

async function installSkillFiles(ctx: InstallContext): Promise<void> {
  const skillsTemplateDir = join(ctx.templateDir, 'skills')
  const skillsDestDir = join(ctx.installDir, 'skills', CANONICAL_NAMESPACE)

  if (!(await fs.pathExists(skillsTemplateDir))) {
    ctx.result.errors.push(`Skills template directory not found: ${skillsTemplateDir}`)
    ctx.result.success = false
    return
  }

  try {
    const oldSkillsRoot = join(ctx.installDir, 'skills')
    const legacyItems = ['tools', 'orchestration', 'SKILL.md', 'run_skill.js']
    const needsMigration = !await fs.pathExists(skillsDestDir)
      && await fs.pathExists(join(oldSkillsRoot, 'tools'))

    if (needsMigration) {
      await fs.ensureDir(skillsDestDir)
      for (const item of legacyItems) {
        const oldPath = join(oldSkillsRoot, item)
        const newPath = join(skillsDestDir, item)
        if (await fs.pathExists(oldPath)) {
          try {
            await fs.move(oldPath, newPath, { overwrite: true })
          }
          catch (error) {
            ctx.result.errors.push(`Skills migration: failed to move ${item}: ${error}`)
          }
        }
      }
    }

    await fs.copy(skillsTemplateDir, skillsDestDir, {
      overwrite: true,
      errorOnExist: false,
    })

    const replacePathsInDir = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
          await replacePathsInDir(fullPath)
        }
        else if (entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8')
          const processed = replaceHomePathsInTemplate(content, ctx.installDir)
          if (processed !== content)
            await fs.writeFile(fullPath, processed, 'utf-8')
        }
      }
    }

    await replacePathsInDir(skillsDestDir)

    const installedSkills = await collectSkillNames(skillsDestDir)
    ctx.result.installedSkills = installedSkills.length
    if (installedSkills.length === 0) {
      ctx.result.errors.push(`Skills copy completed but no SKILL.md was found in ${skillsDestDir}`)
      ctx.result.success = false
    }
  }
  catch (error) {
    ctx.result.errors.push(`Failed to install skills: ${error}`)
    ctx.result.success = false
  }
}

async function installCodexWorkflowSkills(ctx: InstallContext): Promise<void> {
  const skillsTemplateDir = join(ctx.templateDir, 'codex-skills')
  const codexSkillsDir = join(ctx.codexHomeDir, 'skills')

  if (!(await fs.pathExists(skillsTemplateDir))) {
    ctx.result.errors.push(`Codex skills template directory not found: ${skillsTemplateDir}`)
    ctx.result.success = false
    return
  }

  try {
    await fs.ensureDir(codexSkillsDir)
    const installed: string[] = []

    for (const skillName of CANONICAL_CODEX_SKILL_NAMES) {
      const srcDir = join(skillsTemplateDir, skillName)
      const skillFile = join(srcDir, 'SKILL.md')
      if (!(await fs.pathExists(skillFile))) {
        ctx.result.errors.push(`Missing Codex workflow skill template: ${skillFile}`)
        ctx.result.success = false
        continue
      }

      const destDir = join(codexSkillsDir, skillName)
      await fs.ensureDir(destDir)
      let content = await fs.readFile(skillFile, 'utf-8')
      content = injectConfigVariables(content, ctx.config)
      content = replaceHomePathsInTemplate(content, ctx.installDir)
      await fs.writeFile(join(destDir, 'SKILL.md'), content, 'utf-8')
      installed.push(skillName)
    }

    ctx.result.installedCodexSkills = installed
  }
  catch (error) {
    ctx.result.errors.push(`Failed to install Codex workflow skills: ${error}`)
    ctx.result.success = false
  }
}

async function installSkillGeneratedCommands(ctx: InstallContext): Promise<void> {
  const skillsTemplateDir = join(ctx.templateDir, 'skills')
  const skillsInstallDir = join(ctx.installDir, 'skills', CANONICAL_NAMESPACE)
  const commandsDir = join(ctx.installDir, 'commands', CANONICAL_NAMESPACE)

  if (!(await fs.pathExists(skillsTemplateDir)))
    return

  try {
    const existingCommandNames = new Set<string>()
    const existingFiles = await fs.readdir(commandsDir).catch(() => [] as string[])
    for (const file of existingFiles) {
      if (file.endsWith('.md'))
        existingCommandNames.add(basename(file, '.md'))
    }

    const skipCategories: import('./skill-registry').SkillCategory[] = []
    if (ctx.config.skipImpeccable)
      skipCategories.push('impeccable')

    const generated = await installSkillCommands(
      skillsTemplateDir,
      skillsInstallDir,
      commandsDir,
      existingCommandNames,
      skipCategories,
    )

    if (generated.length > 0) {
      ctx.result.installedCommands.push(...generated)
      ctx.result.installedSkillCommands = generated.length
    }
  }
  catch (error) {
    ctx.result.errors.push(`Skill Registry command generation warning: ${error}`)
  }
}

async function installRuleFiles(ctx: InstallContext): Promise<void> {
  try {
    const installed = await copyMdTemplates(
      ctx,
      join(ctx.templateDir, 'rules'),
      join(ctx.installDir, 'rules'),
    )
    for (const legacyRuleFile of ALL_RULE_FILES.filter(ruleFile => !CANONICAL_RULE_FILES.includes(ruleFile as typeof CANONICAL_RULE_FILES[number]))) {
      const legacyRulePath = join(ctx.installDir, 'rules', legacyRuleFile)
      if (await fs.pathExists(legacyRulePath))
        await fs.remove(legacyRulePath)
    }
    if (installed.length > 0)
      ctx.result.installedRules = true
  }
  catch (error) {
    ctx.result.errors.push(`Failed to install rules: ${error}`)
    ctx.result.success = false
  }
}

export async function installWorkflows(
  workflowIds: string[],
  installDir: string,
  force = false,
  config?: {
    routing?: {
      mode?: string
      frontend?: { models?: string[], primary?: string }
      backend?: { models?: string[], primary?: string }
      review?: { models?: string[] }
    }
    mcpProvider?: string
    skipImpeccable?: boolean
    codexHomeDir?: string
  },
): Promise<InstallResult> {
  const ctx: InstallContext = {
    installDir,
    codexHomeDir: config?.codexHomeDir || join(homedir(), '.codex'),
    force,
    config: {
      routing: config?.routing as InstallConfig['routing'] || {
        mode: 'smart',
        frontend: { models: ['codex'], primary: 'codex' },
        backend: { models: ['codex'], primary: 'codex' },
        review: { models: ['codex'] },
      },
      mcpProvider: config?.mcpProvider || 'ace-tool',
      skipImpeccable: config?.skipImpeccable || false,
    },
    templateDir: join(PACKAGE_ROOT, 'templates'),
    result: {
      success: true,
      installedCommands: [],
      installedPrompts: [],
      installedCodexSkills: [],
      errors: [],
      configPath: '',
    },
  }

  if (!(await fs.pathExists(ctx.templateDir))) {
    ctx.result.errors.push(
      `Template directory not found: ${ctx.templateDir} (PACKAGE_ROOT=${PACKAGE_ROOT})`,
    )
    ctx.result.success = false
    return ctx.result
  }

  await fs.ensureDir(join(installDir, 'commands', CANONICAL_NAMESPACE))
  await fs.ensureDir(join(installDir, CANONICAL_RUNTIME_DIRNAME, 'prompts'))

  await installCommandFiles(ctx, workflowIds)
  await installAgentFiles(ctx)
  await installPromptFiles(ctx)
  await installSkillFiles(ctx)
  await installCodexWorkflowSkills(ctx)
  await installSkillGeneratedCommands(ctx)
  await installRuleFiles(ctx)

  try {
    ctx.result.monitorPath = await installBundledMonitor(installDir)
    ctx.result.monitorInstalled = true
  }
  catch (error) {
    ctx.result.errors.push(`Failed to install Claude monitor assets: ${error}`)
    ctx.result.success = false
  }

  if (ctx.result.installedCommands.length === 0 && ctx.result.errors.length === 0) {
    ctx.result.errors.push(`No commands were installed (expected ${workflowIds.length})`)
    ctx.result.success = false
  }

  ctx.result.configPath = join(installDir, 'commands', CANONICAL_NAMESPACE)
  return ctx.result
}

export interface UninstallResult {
  success: boolean
  removedCommands: string[]
  removedPrompts: string[]
  removedAgents: string[]
  removedSkills: string[]
  removedCodexSkills: string[]
  removedRules: boolean
  errors: string[]
}

export async function uninstallWorkflows(
  installDir: string,
  options?: { codexHomeDir?: string },
): Promise<UninstallResult> {
  const result: UninstallResult = {
    success: true,
    removedCommands: [],
    removedPrompts: [],
    removedAgents: [],
    removedSkills: [],
    removedCodexSkills: [],
    removedRules: false,
    errors: [],
  }

  const commandsDirs = [
    join(installDir, 'commands', CANONICAL_NAMESPACE),
    join(installDir, 'commands', LEGACY_NAMESPACE),
  ]
  const agentsDirs = [
    join(installDir, 'agents', CANONICAL_NAMESPACE),
    join(installDir, 'agents', LEGACY_NAMESPACE),
  ]
  const skillsDirs = [
    join(installDir, 'skills', CANONICAL_NAMESPACE),
    join(installDir, 'skills', LEGACY_NAMESPACE),
  ]
  const rulesDir = join(installDir, 'rules')
  const runtimeDirs = [
    join(installDir, CANONICAL_RUNTIME_DIRNAME),
    join(installDir, LEGACY_RUNTIME_DIRNAME),
  ]
  const codexSkillsDir = join(options?.codexHomeDir || join(homedir(), '.codex'), 'skills')

  for (const commandsDir of commandsDirs) {
    try {
      result.removedCommands.push(...await removeDirCollectMdNames(commandsDir))
    }
    catch (error) {
      result.errors.push(`Failed to remove commands directory ${commandsDir}: ${error}`)
      result.success = false
    }
  }

  for (const agentsDir of agentsDirs) {
    try {
      result.removedAgents.push(...await removeDirCollectMdNames(agentsDir))
    }
    catch (error) {
      result.errors.push(`Failed to remove agents directory ${agentsDir}: ${error}`)
      result.success = false
    }
  }

  for (const skillsDir of skillsDirs) {
    if (await fs.pathExists(skillsDir)) {
      try {
        result.removedSkills.push(...await collectSkillNames(skillsDir))
        await fs.remove(skillsDir)
      }
      catch (error) {
        result.errors.push(`Failed to remove skills ${skillsDir}: ${error}`)
        result.success = false
      }
    }
  }

  for (const skillName of ALL_CODEX_SKILL_NAMES) {
    const skillDir = join(codexSkillsDir, skillName)
    try {
      if (await fs.pathExists(skillDir)) {
        await fs.remove(skillDir)
        result.removedCodexSkills.push(skillName)
      }
    }
    catch (error) {
      result.errors.push(`Failed to remove Codex workflow skill ${skillName}: ${error}`)
      result.success = false
    }
  }

  if (await fs.pathExists(rulesDir)) {
    try {
      for (const ruleFile of ALL_RULE_FILES) {
        const rulePath = join(rulesDir, ruleFile)
        if (await fs.pathExists(rulePath)) {
          await fs.remove(rulePath)
          result.removedRules = true
        }
      }
    }
    catch (error) {
      result.errors.push(`Failed to remove rules: ${error}`)
      result.success = false
    }
  }

  for (const runtimeDir of runtimeDirs) {
    if (await fs.pathExists(runtimeDir)) {
      try {
        await fs.remove(runtimeDir)
        result.removedPrompts.push(basename(runtimeDir))
      }
      catch (error) {
        result.errors.push(`Failed to remove runtime directory ${runtimeDir}: ${error}`)
        result.success = false
      }
    }
  }

  try {
    await removeClaudeMonitorHooks(installDir)
  }
  catch (error) {
    result.errors.push(`Failed to remove Claude monitor hooks: ${error}`)
    result.success = false
  }

  return result
}
