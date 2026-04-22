import type { CollaborationMode, HostRuntime, InitOptions, ModelRouting, ModelType, SupportedLang } from '../types'
import ansis from 'ansis'
import inquirer from 'inquirer'
import ora from 'ora'
import { i18n, initI18n } from '../i18n'
import { createDefaultConfig, ensureCcgDir, readCcgConfig, writeCcgConfig } from '../utils/config'
import { prepareClaudeMonitorRuntime, prepareCodexMonitorRuntime } from '../utils/claude-monitor'
import { ensureCodexWorkspaceTrust } from '../utils/codex-config'
import { CANONICAL_NAMESPACE, PRODUCT_NAME, getCanonicalNpxLatestCommand } from '../utils/identity'
import { getDefaultCommandIds, installWorkflows } from '../utils/installer'
import { migrateToV1_4_0, needsMigration } from '../utils/migration'
import { readClaudeCodeConfig } from '../utils/mcp'
import { getCanonicalHomeDir, getHostHomeDir } from '../utils/host'

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

async function resolveInstalledMcpProvider(preferredProvider?: string): Promise<string> {
  const claudeConfig = await readClaudeCodeConfig()
  const mcpServers = claudeConfig?.mcpServers || {}

  if (mcpServers['ace-tool']) {
    return preferredProvider === 'ace-tool-rs' ? 'ace-tool-rs' : 'ace-tool'
  }
  if (mcpServers['fast-context']) {
    return 'fast-context'
  }
  if (mcpServers.contextweaver) {
    return 'contextweaver'
  }

  return 'skip'
}

export async function init(options: InitOptions = {}): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold(`  ${PRODUCT_NAME} - Codex Orchestrated Workflow`))
  console.log(ansis.gray('  Codex plans and accepts, Claude executes'))
  console.log()

  const persistedConfig = await readCcgConfig()

  let language: SupportedLang = options.lang || persistedConfig?.general?.language || 'zh-CN'
  if (!options.skipPrompt && !persistedConfig?.general?.language) {
    const { selectedLang } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedLang',
      message: '选择语言 / Select language',
      choices: [
        { name: '简体中文', value: 'zh-CN' },
        { name: 'English', value: 'en' },
      ],
      default: language,
    }])
    language = selectedLang
  }
  await initI18n(language)

  let orchestrator: ModelType = options.orchestrator || persistedConfig?.ownership?.orchestrator || 'codex'
  let executionHost: HostRuntime = persistedConfig?.ownership?.executionHost || (orchestrator === 'codex' ? 'claude' : 'codex')
  let acceptanceModel: ModelType = persistedConfig?.ownership?.acceptance || (orchestrator === 'codex' ? 'codex' : 'claude')
  let frontendModels: ModelType[] = persistedConfig?.routing?.frontend?.models || ['codex']
  let backendModels: ModelType[] = persistedConfig?.routing?.backend?.models || ['codex']
  const mode: CollaborationMode = 'smart'
  const selectedWorkflows = getDefaultCommandIds()
  const mcpProvider = await resolveInstalledMcpProvider(persistedConfig?.mcp?.provider)

  if (!options.skipPrompt) {
    console.log()
    console.log(ansis.cyan.bold(`  🧠 Step 1/2 - ${i18n.t('init:model.title')}`))
    console.log()

    const { selectedOrchestrator } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedOrchestrator',
      message: i18n.t('init:model.selectOrchestrator'),
      choices: [
        { name: `Codex ${ansis.green(`(${i18n.t('init:model.recommended')})`)}`, value: 'codex' as ModelType },
        { name: 'Claude', value: 'claude' as ModelType },
      ],
      default: orchestrator,
    }])

    orchestrator = selectedOrchestrator
    executionHost = selectedOrchestrator === 'codex' ? 'claude' : 'codex'
    acceptanceModel = selectedOrchestrator === 'codex' ? 'codex' : 'claude'

    const { selectedFrontend } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedFrontend',
      message: i18n.t('init:model.selectFrontend'),
      choices: [
        { name: `Codex ${ansis.green(`(${i18n.t('init:model.recommended')})`)}`, value: 'codex' as ModelType },
        { name: 'Claude', value: 'claude' as ModelType },
      ],
      default: persistedConfig?.routing?.frontend?.primary || frontendModels[0] || 'codex',
    }])

    const { selectedBackend } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedBackend',
      message: i18n.t('init:model.selectBackend'),
      choices: [
        { name: `Codex ${ansis.green(`(${i18n.t('init:model.recommended')})`)}`, value: 'codex' as ModelType },
        { name: 'Claude', value: 'claude' as ModelType },
      ],
      default: persistedConfig?.routing?.backend?.primary || backendModels[0] || 'codex',
    }])

    frontendModels = [selectedFrontend]
    backendModels = [selectedBackend]
  }

  let skipImpeccable = persistedConfig?.performance?.skipImpeccable || false
  if (!options.skipPrompt) {
    console.log()
    console.log(ansis.cyan.bold(`  🔧 Step 2/2 - ${i18n.t('init:commands.title')}`))
    console.log()

    const { includeImpeccable } = await inquirer.prompt([{
      type: 'confirm',
      name: 'includeImpeccable',
      message: i18n.t('init:commands.includeImpeccable'),
      default: !skipImpeccable,
    }])

    skipImpeccable = !includeImpeccable
  }

  const routing: ModelRouting = {
    frontend: {
      models: frontendModels,
      primary: frontendModels[0],
      strategy: 'fallback',
    },
    backend: {
      models: backendModels,
      primary: backendModels[0],
      strategy: 'fallback',
    },
    review: {
      models: [...new Set([...frontendModels, ...backendModels])],
      strategy: 'parallel',
    },
    mode,
  }

  const installDir = options.installDir || getHostHomeDir(orchestrator)
  const canonicalHomeDir = getCanonicalHomeDir()

  console.log()
  console.log(ansis.yellow('━'.repeat(50)))
  console.log(ansis.bold(`  ${i18n.t('init:summary.title')}`))
  console.log()
  console.log(`  ${ansis.cyan(i18n.t('init:summary.orchestrator'))}  ${ansis.green(capitalize(orchestrator))} ${ansis.gray('→')} ${ansis.blue(capitalize(executionHost))}`)
  console.log(`  ${ansis.cyan(i18n.t('init:summary.modelRouting'))}  ${ansis.green(capitalize(frontendModels[0]))} (Frontend) + ${ansis.blue(capitalize(backendModels[0]))} (Backend)`)
  console.log(`  ${ansis.cyan(i18n.t('init:summary.commandCount'))}  ${ansis.yellow(selectedWorkflows.length.toString())}`)
  console.log(ansis.yellow('━'.repeat(50)))
  console.log()

  if (!options.skipPrompt && !options.force) {
    const { confirmed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmed',
      message: i18n.t('init:confirmInstall'),
      default: true,
    }])

    if (!confirmed) {
      console.log(ansis.yellow(i18n.t('init:installCancelled')))
      return
    }
  }

  const spinner = ora(i18n.t('init:installing')).start()

  try {
    if (await needsMigration()) {
      spinner.text = 'Migrating previous runtime layout...'
      const migrationResult = await migrateToV1_4_0()

      if (migrationResult.migratedFiles.length > 0) {
        spinner.info(ansis.cyan('Migration completed:'))
        console.log()
        for (const file of migrationResult.migratedFiles) {
          console.log(`  ${ansis.green('✓')} ${file}`)
        }
        if (migrationResult.skipped.length > 0) {
          console.log()
          console.log(ansis.yellow('  Deferred cleanup:'))
          for (const file of migrationResult.skipped) {
            console.log(`  ${ansis.yellow('○')} ${file}`)
          }
        }
        console.log()
        spinner.start(i18n.t('init:installing'))
      }

      if (migrationResult.errors.length > 0) {
        spinner.warn(ansis.yellow('Migration completed with errors:'))
        for (const error of migrationResult.errors) {
          console.log(`  ${ansis.red('✗')} ${error}`)
        }
        console.log()
        spinner.start(i18n.t('init:installing'))
      }
    }

    await ensureCcgDir(canonicalHomeDir)

    const config = createDefaultConfig({
      language,
      routing,
      installedWorkflows: selectedWorkflows,
      mcpProvider,
      skipImpeccable,
      installDir,
      canonicalHome: canonicalHomeDir,
      ownership: {
        orchestrator,
        executionHost,
        acceptance: acceptanceModel,
      },
    })

    await writeCcgConfig(config)

    const result = await installWorkflows(selectedWorkflows, installDir, options.force, {
      routing,
      mcpProvider,
      skipImpeccable,
      codexHomeDir: getHostHomeDir('codex'),
      canonicalHomeDir,
    })

    const monitorRuntime = await prepareCodexMonitorRuntime({ canonicalHomeDir })
    console.log()
    if (executionHost === 'claude') {
      const claudeMonitorRuntime = await prepareClaudeMonitorRuntime({ canonicalHomeDir })
      console.log(`    ${ansis.green('✓')} Claude monitor ${ansis.gray(claudeMonitorRuntime.monitorDir)}`)
      console.log(`    ${ansis.green('✓')} Claude hooks ${ansis.gray(claudeMonitorRuntime.settingsPath)}`)
    }
    console.log(`    ${ansis.green('✓')} Codex monitor ${ansis.gray(monitorRuntime.monitorDir)}`)
    console.log(`    ${ansis.green('✓')} Codex monitor state ${ansis.gray(monitorRuntime.settingsPath)}`)

    if (executionHost === 'claude') {
      console.log(`    ${ansis.green('✓')} Claude exec allowlist ${ansis.gray('→ ~/.claude/settings.json')}`)
    }

    const codexTrustResult = await ensureCodexWorkspaceTrust(process.cwd())
    console.log()
    console.log(`    ${ansis.green('✓')} Codex workspace trust ${ansis.gray(`→ ${codexTrustResult.configPath}`)}`)

    spinner.succeed(ansis.green(i18n.t('init:installSuccess')))

    console.log()
    console.log(ansis.cyan(`  ${i18n.t('init:installedCommands')}`))
    result.installedCommands.forEach((cmd) => {
      console.log(`    ${ansis.green('✓')} /${CANONICAL_NAMESPACE}:${cmd}`)
    })

    if (result.installedPrompts.length > 0) {
      console.log()
      console.log(ansis.cyan(`  ${i18n.t('init:installedPrompts')}`))
      const grouped: Record<string, string[]> = {}
      result.installedPrompts.forEach((prompt) => {
        const [model, role] = prompt.split('/')
        grouped[model] ||= []
        grouped[model].push(role)
      })
      Object.entries(grouped).forEach(([model, roles]) => {
        console.log(`    ${ansis.green('✓')} ${model}: ${roles.join(', ')}`)
      })
    }

    if (result.installedSkills && result.installedSkills > 0) {
      console.log()
      console.log(ansis.cyan('  Skills:'))
      console.log(`    ${ansis.green('✓')} ${result.installedSkills} skills installed`)
      console.log(ansis.gray('       → ~/.ccsm/skills/ccsm/'))
    }

    if (result.installedCodexSkills && result.installedCodexSkills.length > 0) {
      console.log()
      console.log(ansis.cyan('  Codex workflow skills:'))
      for (const skill of result.installedCodexSkills) {
        console.log(`    ${ansis.green('✓')} ${skill}`)
      }
      console.log(ansis.gray('       → ~/.codex/skills/'))
    }

    if (result.installedRules) {
      console.log()
      console.log(ansis.cyan('  Rules:'))
      console.log(`    ${ansis.green('✓')} quality gate auto-trigger rules`)
    }

    console.log()
    console.log(ansis.gray(`  MCP setup is optional. Run ${getCanonicalNpxLatestCommand(['config', 'mcp'])} if you want to add code-retrieval tools later.`))

    if (result.errors.length > 0) {
      console.log()
      if (!result.success) {
        console.log(ansis.red.bold('  Installation errors detected'))
      }
      else {
        console.log(ansis.yellow(`  ${i18n.t('init:installationErrors')}`))
      }

      result.errors.forEach((error) => {
        console.log(`    ${ansis.red('✗')} ${error}`)
      })

      if (!result.success) {
        console.log()
        console.log(ansis.yellow('  Try to fix:'))
        console.log(ansis.cyan(`    ${getCanonicalNpxLatestCommand(['init', '--force'])}`))
      }
    }

    console.log()
  }
  catch (error) {
    spinner.fail(ansis.red(i18n.t('init:installFailed')))
    console.error(error)
  }
}
