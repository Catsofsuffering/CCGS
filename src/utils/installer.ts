import type { InstallResult } from '../types'
import fs from 'fs-extra'
import { join } from 'pathe'
import { getWorkflowById } from './installer-data'
import { PACKAGE_ROOT, injectConfigVariables, replaceHomePathsInTemplate } from './installer-template'
import { isWindows } from './platform'

// ═══════════════════════════════════════════════════════
// Re-exports — all consumers import from './installer'
// These re-exports preserve backward compatibility.
// ═══════════════════════════════════════════════════════

export {
  getAllCommandIds,
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
  syncMcpToGemini,
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

// ═══════════════════════════════════════════════════════
// Binary download
// ═══════════════════════════════════════════════════════

// GitHub Release download config
const GITHUB_REPO = 'fengshao1227/ccg-workflow'
const RELEASE_TAG = 'preset'
const BINARY_DOWNLOAD_URL = `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_TAG}`

/**
 * Download codeagent-wrapper binary from GitHub Release.
 * Uses the fixed `preset` tag release for pre-compiled binaries.
 * Supports redirect-following (GitHub releases redirect to CDN).
 *
 * Retry: 3 attempts with exponential backoff (2s, 4s, 6s).
 * Timeout: 60s per attempt via AbortController.
 */
async function downloadBinaryFromRelease(binaryName: string, destPath: string): Promise<boolean> {
  const url = `${BINARY_DOWNLOAD_URL}/${binaryName}`
  const MAX_ATTEMPTS = 3
  const TIMEOUT_MS = 60_000 // 60s per attempt

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

      const response = await fetch(url, { redirect: 'follow', signal: controller.signal })
      if (!response.ok) {
        clearTimeout(timer)
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2000))
          continue
        }
        return false
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      clearTimeout(timer)

      await fs.writeFile(destPath, buffer)

      // Set executable permission on Unix-like systems
      if (process.platform !== 'win32') {
        await fs.chmod(destPath, 0o755)
      }

      return true
    }
    catch {
      if (attempt < MAX_ATTEMPTS) {
        // Exponential backoff before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 2000))
        continue
      }
      return false
    }
  }

  return false
}

// ═══════════════════════════════════════════════════════
// Skills counter
// ═══════════════════════════════════════════════════════

/**
 * Count installed SKILL.md files in the skills directory (recursive).
 * Excludes root-level SKILL.md (which is the index/manifest, not a skill itself).
 */
async function countInstalledSkills(skillsDir: string, depth = 0): Promise<number> {
  let count = 0
  try {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(skillsDir, entry.name)
      if (entry.isDirectory()) {
        count += await countInstalledSkills(fullPath, depth + 1)
      }
      else if (entry.name === 'SKILL.md' && depth > 0) {
        count++
      }
    }
  }
  catch {
    // Directory doesn't exist or can't be read
  }
  return count
}

// ═══════════════════════════════════════════════════════
// Core install / uninstall
// ═══════════════════════════════════════════════════════

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
    liteMode?: boolean
    mcpProvider?: string
  },
): Promise<InstallResult> {
  // Default config
  const installConfig = {
    routing: config?.routing || {
      mode: 'smart',
      frontend: { models: ['gemini'], primary: 'gemini' },
      backend: { models: ['codex'], primary: 'codex' },
      review: { models: ['codex', 'gemini'] },
    },
    liteMode: config?.liteMode || false,
    mcpProvider: config?.mcpProvider || 'ace-tool',
  }
  const result: InstallResult = {
    success: true,
    installedCommands: [],
    installedPrompts: [],
    errors: [],
    configPath: '',
  }

  const commandsDir = join(installDir, 'commands', 'ccg')
  const ccgConfigDir = join(installDir, '.ccg') // v1.4.0: 配置目录
  const promptsDir = join(ccgConfigDir, 'prompts') // v1.4.0: prompts 移到配置目录

  await fs.ensureDir(commandsDir)
  await fs.ensureDir(ccgConfigDir)
  await fs.ensureDir(promptsDir)

  // Get template source directory (relative to this package)
  const templateDir = join(PACKAGE_ROOT, 'templates')

  // Install commands
  for (const workflowId of workflowIds) {
    const workflow = getWorkflowById(workflowId)
    if (!workflow) {
      result.errors.push(`Unknown workflow: ${workflowId}`)
      continue
    }

    for (const cmd of workflow.commands) {
      const srcFile = join(templateDir, 'commands', `${cmd}.md`)
      const destFile = join(commandsDir, `${cmd}.md`)

      try {
        if (await fs.pathExists(srcFile)) {
          if (force || !(await fs.pathExists(destFile))) {
            // Read template content, inject config variables, replace ~ paths, then write
            let templateContent = await fs.readFile(srcFile, 'utf-8')
            templateContent = injectConfigVariables(templateContent, installConfig)
            const processedContent = replaceHomePathsInTemplate(templateContent, installDir)
            await fs.writeFile(destFile, processedContent, 'utf-8')
            result.installedCommands.push(cmd)
          }
        }
        else {
          // If template doesn't exist, create placeholder
          const placeholder = `---
description: "${workflow.descriptionEn}"
---

# /ccg:${cmd}

${workflow.description}

> This command is part of CCG multi-model collaboration system.
`
          await fs.writeFile(destFile, placeholder, 'utf-8')
          result.installedCommands.push(cmd)
        }
      }
      catch (error) {
        result.errors.push(`Failed to install ${cmd}: ${error}`)
        result.success = false
      }
    }
  }

  // Install agents directory (subagents - should go to ~/.claude/agents/ccg/)
  const agentsSrcDir = join(templateDir, 'commands', 'agents')
  const agentsDestDir = join(installDir, 'agents', 'ccg')
  if (await fs.pathExists(agentsSrcDir)) {
    try {
      await fs.ensureDir(agentsDestDir)
      const agentFiles = await fs.readdir(agentsSrcDir)
      for (const file of agentFiles) {
        if (file.endsWith('.md')) {
          const srcFile = join(agentsSrcDir, file)
          const destFile = join(agentsDestDir, file)
          if (force || !(await fs.pathExists(destFile))) {
            // Read template content, inject config variables, replace ~ paths, then write
            let templateContent = await fs.readFile(srcFile, 'utf-8')
            templateContent = injectConfigVariables(templateContent, installConfig)
            const processedContent = replaceHomePathsInTemplate(templateContent, installDir)
            await fs.writeFile(destFile, processedContent, 'utf-8')
          }
        }
      }
    }
    catch (error) {
      result.errors.push(`Failed to install agents: ${error}`)
      result.success = false
    }
  }

  // Install prompts (codex, gemini, claude role definitions)
  const promptsTemplateDir = join(templateDir, 'prompts')
  if (await fs.pathExists(promptsTemplateDir)) {
    const modelDirs = ['codex', 'gemini', 'claude']
    for (const model of modelDirs) {
      const srcModelDir = join(promptsTemplateDir, model)
      const destModelDir = join(promptsDir, model)

      if (await fs.pathExists(srcModelDir)) {
        try {
          await fs.ensureDir(destModelDir)
          const files = await fs.readdir(srcModelDir)
          for (const file of files) {
            if (file.endsWith('.md')) {
              const srcFile = join(srcModelDir, file)
              const destFile = join(destModelDir, file)
              if (force || !(await fs.pathExists(destFile))) {
                // Read template content, replace ~ paths, then write
                const templateContent = await fs.readFile(srcFile, 'utf-8')
                const processedContent = replaceHomePathsInTemplate(templateContent, installDir)
                await fs.writeFile(destFile, processedContent, 'utf-8')
                result.installedPrompts.push(`${model}/${file.replace('.md', '')}`)
              }
            }
          }
        }
        catch (error) {
          result.errors.push(`Failed to install ${model} prompts: ${error}`)
          result.success = false
        }
      }
    }
  }

  // Install skills (quality gates, multi-agent orchestration, etc. → ~/.claude/skills/ccg/)
  // Uses 'ccg' namespace to avoid clobbering user's own skills on uninstall
  const skillsTemplateDir = join(templateDir, 'skills')
  const skillsDestDir = join(installDir, 'skills', 'ccg')
  if (await fs.pathExists(skillsTemplateDir)) {
    try {
      // Migration: move old v1.7.73 layout (skills/{tools,orchestration,SKILL.md,run_skill.js})
      // into skills/ccg/ namespace, preserving user's own skills in skills/
      const oldSkillsRoot = join(installDir, 'skills')
      const ccgLegacyItems = ['tools', 'orchestration', 'SKILL.md', 'run_skill.js']
      const needsMigration = !await fs.pathExists(skillsDestDir)
        && await fs.pathExists(join(oldSkillsRoot, 'tools'))
      if (needsMigration) {
        await fs.ensureDir(skillsDestDir)
        for (const item of ccgLegacyItems) {
          const oldPath = join(oldSkillsRoot, item)
          const newPath = join(skillsDestDir, item)
          if (await fs.pathExists(oldPath)) {
            await fs.move(oldPath, newPath, { overwrite: true })
          }
        }
      }

      // Recursive copy: preserves full directory tree (tools/lib, tools/*/scripts/, orchestration/*)
      await fs.copy(skillsTemplateDir, skillsDestDir, {
        overwrite: force,
        errorOnExist: false,
      })

      // Post-copy: apply template variable replacement to .md files
      // (handles custom installDir where ~/.claude paths need substitution)
      const replacePathsInDir = async (dir: string): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = join(dir, entry.name)
          if (entry.isDirectory()) {
            await replacePathsInDir(fullPath)
          }
          else if (entry.name.endsWith('.md')) {
            const content = await fs.readFile(fullPath, 'utf-8')
            const processed = replaceHomePathsInTemplate(content, installDir)
            if (processed !== content) {
              await fs.writeFile(fullPath, processed, 'utf-8')
            }
          }
        }
      }
      await replacePathsInDir(skillsDestDir)

      result.installedSkills = await countInstalledSkills(skillsDestDir)
    }
    catch (error) {
      result.errors.push(`Failed to install skills: ${error}`)
      result.success = false
    }
  }

  // Install rules (quality gate auto-trigger → ~/.claude/rules/ccg-skills.md)
  const rulesTemplateDir = join(templateDir, 'rules')
  const rulesDestDir = join(installDir, 'rules')
  if (await fs.pathExists(rulesTemplateDir)) {
    try {
      await fs.ensureDir(rulesDestDir)
      const rulesFiles = await fs.readdir(rulesTemplateDir)
      for (const file of rulesFiles) {
        if (file.endsWith('.md')) {
          const srcFile = join(rulesTemplateDir, file)
          const destFile = join(rulesDestDir, file)
          if (force || !(await fs.pathExists(destFile))) {
            const templateContent = await fs.readFile(srcFile, 'utf-8')
            const processedContent = replaceHomePathsInTemplate(templateContent, installDir)
            await fs.writeFile(destFile, processedContent, 'utf-8')
          }
        }
      }
      result.installedRules = true
    }
    catch (error) {
      result.errors.push(`Failed to install rules: ${error}`)
    }
  }

  // Install codeagent-wrapper binary
  try {
    const binDir = join(installDir, 'bin')
    await fs.ensureDir(binDir)

    // Detect platform and select appropriate binary
    const platform = process.platform
    const arch = process.arch
    let binaryName: string

    if (platform === 'darwin') {
      binaryName = arch === 'arm64' ? 'codeagent-wrapper-darwin-arm64' : 'codeagent-wrapper-darwin-amd64'
    }
    else if (platform === 'linux') {
      binaryName = arch === 'arm64' ? 'codeagent-wrapper-linux-arm64' : 'codeagent-wrapper-linux-amd64'
    }
    else if (platform === 'win32') {
      binaryName = arch === 'arm64' ? 'codeagent-wrapper-windows-arm64.exe' : 'codeagent-wrapper-windows-amd64.exe'
    }
    else {
      result.errors.push(`Unsupported platform: ${platform}`)
      result.success = false
      result.configPath = commandsDir
      return result
    }

    const destBinary = join(binDir, platform === 'win32' ? 'codeagent-wrapper.exe' : 'codeagent-wrapper')

    // Download from GitHub Release (3 attempts with retry)
    const installed = await downloadBinaryFromRelease(binaryName, destBinary)

    if (installed) {
      // Verify installation by running --version
      try {
        const { execSync } = await import('node:child_process')
        execSync(`"${destBinary}" --version`, { stdio: 'pipe' })
        result.binPath = binDir
        result.binInstalled = true
      }
      catch (verifyError) {
        // Binary downloaded but verification failed — warning, not blocking
        result.errors.push(`Binary verification failed (non-blocking): ${verifyError}`)
      }
    }
    else {
      // Binary download failed — warning, not blocking (commands + skills still work)
      result.errors.push(`Failed to download binary: ${binaryName} from GitHub Release (after 3 attempts). Check network or visit https://github.com/${GITHUB_REPO}/releases/tag/${RELEASE_TAG}`)
    }
  }
  catch (error) {
    // Binary install exception — warning, not blocking
    result.errors.push(`Failed to install codeagent-wrapper (non-blocking): ${error}`)
  }

  result.configPath = commandsDir
  return result
}

// ═══════════════════════════════════════════════════════
// Uninstall
// ═══════════════════════════════════════════════════════

export interface UninstallResult {
  success: boolean
  removedCommands: string[]
  removedPrompts: string[]
  removedAgents: string[]
  removedSkills: string[]
  removedRules: boolean
  removedBin: boolean
  errors: string[]
}

/**
 * Uninstall workflows by removing their command files
 */
export async function uninstallWorkflows(installDir: string): Promise<UninstallResult> {
  const result: UninstallResult = {
    success: true,
    removedCommands: [],
    removedPrompts: [],
    removedAgents: [],
    removedSkills: [],
    removedRules: false,
    removedBin: false,
    errors: [],
  }

  const commandsDir = join(installDir, 'commands', 'ccg')
  const promptsDir = join(installDir, '.ccg', 'prompts')
  const agentsDir = join(installDir, 'agents', 'ccg')
  const skillsDir = join(installDir, 'skills', 'ccg')
  const rulesDir = join(installDir, 'rules')
  const binDir = join(installDir, 'bin')
  const ccgConfigDir = join(installDir, '.ccg')

  // Remove CCG commands directory
  if (await fs.pathExists(commandsDir)) {
    try {
      // Get list for reporting
      const files = await fs.readdir(commandsDir)
      for (const file of files) {
        if (file.endsWith('.md')) {
          result.removedCommands.push(file.replace('.md', ''))
        }
      }

      // Force remove the entire directory
      await fs.remove(commandsDir)
    }
    catch (error) {
      result.errors.push(`Failed to remove commands directory: ${error}`)
      result.success = false
    }
  }

  // Remove CCG agents directory
  if (await fs.pathExists(agentsDir)) {
    try {
      // Get list for reporting
      const files = await fs.readdir(agentsDir)
      for (const file of files) {
        result.removedAgents.push(file.replace('.md', ''))
      }

      // Force remove the entire directory
      await fs.remove(agentsDir)
    }
    catch (error) {
      result.errors.push(`Failed to remove agents directory: ${error}`)
      result.success = false
    }
  }

  // Remove CCG skills directory only (skills/ccg/) — preserves user's own skills in skills/
  if (await fs.pathExists(skillsDir)) {
    try {
      // Collect skill names for reporting (SKILL.md files, excluding root)
      const collectSkillNames = async (dir: string, depth: number): Promise<string[]> => {
        const names: string[] = []
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.isDirectory()) {
            names.push(...await collectSkillNames(join(dir, entry.name), depth + 1))
          }
          else if (entry.name === 'SKILL.md' && depth > 0) {
            // Use parent directory name as skill name
            const parts = dir.split('/')
            names.push(parts[parts.length - 1])
          }
        }
        return names
      }
      result.removedSkills = await collectSkillNames(skillsDir, 0)

      // Remove entire skills directory
      await fs.remove(skillsDir)
    }
    catch (error) {
      result.errors.push(`Failed to remove skills: ${error}`)
      result.success = false
    }
  }

  // Remove CCG rules files (rules/ccg-skills.md, rules/ccg-grok-search.md)
  if (await fs.pathExists(rulesDir)) {
    try {
      const ccgRuleFiles = ['ccg-skills.md', 'ccg-grok-search.md']
      for (const ruleFile of ccgRuleFiles) {
        const rulePath = join(rulesDir, ruleFile)
        if (await fs.pathExists(rulePath)) {
          await fs.remove(rulePath)
          result.removedRules = true
        }
      }
    }
    catch (error) {
      result.errors.push(`Failed to remove rules: ${error}`)
    }
  }

  // Remove CCG prompts directory (in .ccg/) - handled by removing .ccg dir below

  // Remove codeagent-wrapper binary
  if (await fs.pathExists(binDir)) {
    try {
      const wrapperName = process.platform === 'win32' ? 'codeagent-wrapper.exe' : 'codeagent-wrapper'
      const wrapperPath = join(binDir, wrapperName)
      if (await fs.pathExists(wrapperPath)) {
        await fs.remove(wrapperPath)
        result.removedBin = true
      }
    }
    catch (error) {
      result.errors.push(`Failed to remove binary: ${error}`)
      result.success = false
    }
  }

  // Remove .ccg config directory (Force remove)
  if (await fs.pathExists(ccgConfigDir)) {
    try {
      await fs.remove(ccgConfigDir)
      result.removedPrompts.push('ALL_PROMPTS_AND_CONFIGS')
    }
    catch (error) {
      result.errors.push(`Failed to remove .ccg directory: ${error}`)
      // Don't mark as failure just for config, but good to know
    }
  }

  return result
}
