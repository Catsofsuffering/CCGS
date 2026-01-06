import type { CollaborationMode, InitOptions, ModelRouting, ModelType, SupportedLang, WorkflowConfig } from '../types'
import ansis from 'ansis'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import ora from 'ora'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { i18n } from '../i18n'
import { createDefaultConfig, ensureCcgDir, getCcgDir, writeCcgConfig } from '../utils/config'
import { getWorkflowConfigs, installAceTool, installWorkflows } from '../utils/installer'
import { migrateToV1_4_0, needsMigration } from '../utils/migration'

export async function init(options: InitOptions = {}): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold(`  CCG - Claude + Codex + Gemini`))
  console.log(ansis.gray(`  ${i18n.t('init:welcome')}`))
  console.log()

  // Language selection (if not provided)
  let language: SupportedLang = options.lang || 'en'
  if (!options.skipPrompt && !options.lang) {
    const { selectedLang } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedLang',
      message: i18n.t('init:selectLanguage'),
      choices: [
        { name: '中文 (Chinese)', value: 'zh-CN' },
        { name: 'English', value: 'en' },
      ],
      default: 'zh-CN',
    }])
    language = selectedLang
    // Switch i18n language immediately after selection
    await i18n.changeLanguage(language)
  }

  // Frontend models selection (multi-select)
  let frontendModels: ModelType[] = ['gemini']
  if (options.frontend) {
    frontendModels = options.frontend.split(',').map(m => m.trim() as ModelType)
  }
  else if (!options.skipPrompt) {
    const { selectedFrontend } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedFrontend',
      message: i18n.t('init:selectFrontendModels'),
      choices: [
        { name: i18n.t('init:models.gemini'), value: 'gemini', checked: true },
        { name: i18n.t('init:models.codex'), value: 'codex' },
        { name: i18n.t('init:models.claude'), value: 'claude' },
      ],
      validate: (answer: string[]) => answer.length > 0 || i18n.t('init:validation.selectAtLeastOne'),
    }])
    frontendModels = selectedFrontend
  }

  // Backend models selection (multi-select)
  let backendModels: ModelType[] = ['codex']
  if (options.backend) {
    backendModels = options.backend.split(',').map(m => m.trim() as ModelType)
  }
  else if (!options.skipPrompt) {
    const { selectedBackend } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedBackend',
      message: i18n.t('init:selectBackendModels'),
      choices: [
        { name: i18n.t('init:models.codex'), value: 'codex', checked: true },
        { name: i18n.t('init:models.gemini'), value: 'gemini' },
        { name: i18n.t('init:models.claude'), value: 'claude' },
      ],
      validate: (answer: string[]) => answer.length > 0 || i18n.t('init:validation.selectAtLeastOne'),
    }])
    backendModels = selectedBackend
  }

  // Collaboration mode selection
  let mode: CollaborationMode = 'smart'
  if (options.mode) {
    mode = options.mode as CollaborationMode
  }
  else if (!options.skipPrompt) {
    const { selectedMode } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedMode',
      message: i18n.t('init:selectMode'),
      choices: [
        { name: i18n.t('init:modes.smart'), value: 'smart' },
        { name: i18n.t('init:modes.parallel'), value: 'parallel' },
        { name: i18n.t('init:modes.sequential'), value: 'sequential' },
      ],
      default: 'smart',
    }])
    mode = selectedMode
  }

  // Workflow selection
  const allWorkflows = getWorkflowConfigs()
  let selectedWorkflows: string[] = allWorkflows.filter(w => w.defaultSelected).map(w => w.id)

  if (options.workflows) {
    if (options.workflows === 'all') {
      selectedWorkflows = allWorkflows.map(w => w.id)
    }
    else if (options.workflows !== 'skip') {
      selectedWorkflows = options.workflows.split(',').map(w => w.trim())
    }
  }
  else if (!options.skipPrompt) {
    const { selected } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selected',
      message: i18n.t('init:selectWorkflows'),
      choices: allWorkflows.map(w => ({
        name: `${language === 'zh-CN' ? w.name : w.nameEn} ${ansis.gray(`— ${language === 'zh-CN' ? w.description : w.descriptionEn}`)}`,
        value: w.id,
        checked: w.defaultSelected,
      })),
    }])
    selectedWorkflows = selected
  }

  // MCP Tool Selection
  let mcpProvider = 'ace-tool'
  let aceToolBaseUrl = ''
  let aceToolToken = ''

  if (!options.skipPrompt) {
    console.log()
    console.log(ansis.cyan.bold(`  🔧 MCP 工具选择`))
    console.log()

    const { selectedMcp } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedMcp',
      message: '选择 MCP 代码检索工具',
      choices: [
        {
          name: `ace-tool ${ansis.gray('(推荐) - 开箱即用，含 Prompt 增强 + 代码检索')}`,
          value: 'ace-tool',
        },
        {
          name: `auggie ${ansis.gray('(官方) - 代码检索 + 可选 Prompt 增强（需额外配置）')}`,
          value: 'auggie',
        },
        {
          name: `跳过 ${ansis.gray('- 稍后手动配置')}`,
          value: 'skip',
        },
      ],
      default: 'ace-tool',
    }])

    mcpProvider = selectedMcp

    // Configure ace-tool if selected
    if (selectedMcp === 'ace-tool') {
      console.log()
      console.log(ansis.cyan.bold(`  🔧 ace-tool MCP 配置`))
      console.log(ansis.gray(`     ${i18n.t('init:aceTool.description')}`))
      console.log(ansis.gray(`     ${i18n.t('init:aceTool.getToken')}: https://augmentcode.com/`))
      console.log()

      const aceAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'baseUrl',
          message: `${i18n.t('init:aceTool.baseUrl')} ${ansis.gray('(Enter to skip)')}`,
          default: '',
        },
        {
          type: 'password',
          name: 'token',
          message: `${i18n.t('init:aceTool.token')} ${ansis.gray('(Enter to skip)')}`,
          mask: '*',
        },
      ])
      aceToolBaseUrl = aceAnswers.baseUrl || ''
      aceToolToken = aceAnswers.token || ''
    }
    else if (selectedMcp === 'auggie') {
      console.log()
      console.log(ansis.yellow(`  ℹ️  auggie 已选择`))
      console.log(ansis.gray(`     代码检索功能开箱即用`))
      console.log(ansis.gray(`     Prompt 增强需额外配置: https://linux.do/t/topic/1280612`))
      console.log()
    }
    else {
      console.log()
      console.log(ansis.yellow(`  ℹ️  已跳过 MCP 配置，可稍后手动配置`))
      console.log()
    }
  }

  // Build routing config
  const routing: ModelRouting = {
    frontend: {
      models: frontendModels,
      primary: frontendModels[0],
      strategy: frontendModels.length > 1 ? 'parallel' : 'fallback',
    },
    backend: {
      models: backendModels,
      primary: backendModels[0],
      strategy: backendModels.length > 1 ? 'parallel' : 'fallback',
    },
    review: {
      models: [...new Set([...frontendModels, ...backendModels])],
      strategy: 'parallel',
    },
    mode,
  }

  // Show summary
  console.log()
  console.log(ansis.yellow('━'.repeat(50)))
  console.log(ansis.bold(`  ${i18n.t('init:summary.title')}`))
  console.log()
  console.log(`  ${ansis.cyan(i18n.t('init:summary.frontendModels'))} ${frontendModels.map(m => ansis.green(m)).join(', ')}`)
  console.log(`  ${ansis.cyan(i18n.t('init:summary.backendModels'))}  ${backendModels.map(m => ansis.blue(m)).join(', ')}`)
  console.log(`  ${ansis.cyan(i18n.t('init:summary.collaboration'))}   ${ansis.yellow(mode)}`)
  console.log(`  ${ansis.cyan(i18n.t('init:summary.workflows'))}       ${selectedWorkflows.length} ${i18n.t('init:summary.selected')}`)
  console.log(ansis.yellow('━'.repeat(50)))
  console.log()

  // Confirm in interactive mode
  if (!options.skipPrompt) {
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

  // Install
  const spinner = ora(i18n.t('init:installing')).start()

  try {
    // v1.4.0: Auto-migrate from old directory structure
    if (await needsMigration()) {
      spinner.text = 'Migrating from v1.3.x to v1.4.0...'
      const migrationResult = await migrateToV1_4_0()

      if (migrationResult.migratedFiles.length > 0) {
        spinner.info(ansis.cyan('Migration completed:'))
        console.log()
        for (const file of migrationResult.migratedFiles) {
          console.log(`  ${ansis.green('✓')} ${file}`)
        }
        if (migrationResult.skipped.length > 0) {
          console.log()
          console.log(ansis.gray('  Skipped:'))
          for (const file of migrationResult.skipped) {
            console.log(`  ${ansis.gray('○')} ${file}`)
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

    await ensureCcgDir()

    // Create config
    const config = createDefaultConfig({
      language,
      routing,
      installedWorkflows: selectedWorkflows,
      mcpProvider,
    })

    // Save config FIRST - ensure it's created even if installation fails
    await writeCcgConfig(config)

    // Install workflows and commands
    const installDir = options.installDir || join(homedir(), '.claude')
    const result = await installWorkflows(selectedWorkflows, installDir, options.force)

    // Install ace-tool MCP if baseUrl or token was provided
    if (aceToolBaseUrl || aceToolToken) {
      spinner.text = i18n.t('init:aceTool.installing')
      const aceResult = await installAceTool({
        baseUrl: aceToolBaseUrl,
        token: aceToolToken,
      })
      if (aceResult.success) {
        spinner.succeed(ansis.green(i18n.t('init:installSuccess')))
        console.log()
        console.log(`    ${ansis.green('✓')} ace-tool MCP ${ansis.gray(`→ ${aceResult.configPath}`)}`)
      }
      else {
        spinner.warn(ansis.yellow(i18n.t('init:aceTool.failed')))
        console.log(ansis.gray(`      ${aceResult.message}`))
      }
    }
    else {
      spinner.succeed(ansis.green(i18n.t('init:installSuccess')))
    }

    // Show result summary
    console.log()
    console.log(ansis.cyan(`  ${i18n.t('init:installedCommands')}`))
    result.installedCommands.forEach((cmd) => {
      console.log(`    ${ansis.green('✓')} /ccg:${cmd}`)
    })

    // Show installed prompts
    if (result.installedPrompts.length > 0) {
      console.log()
      console.log(ansis.cyan(`  ${i18n.t('init:installedPrompts')}`))
      // Group by model
      const grouped: Record<string, string[]> = {}
      result.installedPrompts.forEach((p) => {
        const [model, role] = p.split('/')
        if (!grouped[model])
          grouped[model] = []
        grouped[model].push(role)
      })
      Object.entries(grouped).forEach(([model, roles]) => {
        console.log(`    ${ansis.green('✓')} ${model}: ${roles.join(', ')}`)
      })
    }

    // Show errors if any
    if (result.errors.length > 0) {
      console.log()
      console.log(ansis.red(`  ⚠ ${i18n.t('init:installationErrors')}`))
      result.errors.forEach((error) => {
        console.log(`    ${ansis.red('✗')} ${error}`)
      })
    }

    // Show binary installation result and configure PATH
    if (result.binInstalled && result.binPath) {
      console.log()
      console.log(ansis.cyan(`  ${i18n.t('init:installedBinary')}`))
      console.log(`    ${ansis.green('✓')} codeagent-wrapper ${ansis.gray(`→ ${result.binPath}`)}`)
      console.log()

      const platform = process.platform
      const exportCommand = `export PATH="${result.binPath}:$PATH"`

      if (platform === 'win32') {
        // Windows: Show manual instructions
        console.log(ansis.yellow(`  ⚠ ${i18n.t('init:pathWarning')}`))
        console.log()
        console.log(ansis.cyan(`  ${i18n.t('init:windowsPathInstructions')}`))
        console.log(ansis.gray(`     1. ${i18n.t('init:windowsStep1')}`))
        console.log(ansis.gray(`     2. ${i18n.t('init:windowsStep2')}`))
        console.log(ansis.gray(`     3. ${i18n.t('init:windowsStep3')}`))
        console.log(ansis.gray(`        ${result.binPath.replace(/\//g, '\\')}`))
        console.log(ansis.gray(`     4. ${i18n.t('init:windowsStep4')}`))
        console.log()
        console.log(ansis.cyan(`  ${i18n.t('init:orUsePowerShell')}`))
        const windowsPath = result.binPath.replace(/\//g, '\\')
        console.log(ansis.gray(`     $currentPath = [System.Environment]::GetEnvironmentVariable('PATH', 'User')`))
        console.log(ansis.gray(`     $newPath = '${windowsPath}'`))
        console.log(ansis.gray(`     if ($currentPath -notlike "*$newPath*") {`))
        console.log(ansis.gray(`         [System.Environment]::SetEnvironmentVariable('PATH', "$currentPath;$newPath", 'User')`))
        console.log(ansis.gray(`     }`))
      }
      else {
        // macOS/Linux: Offer auto-configuration
        console.log(ansis.yellow(`  ⚠ ${i18n.t('init:pathWarning')}`))

        if (!options.skipPrompt) {
          console.log()
          const { autoConfigurePath } = await inquirer.prompt([{
            type: 'confirm',
            name: 'autoConfigurePath',
            message: i18n.t('init:autoConfigurePathPrompt'),
            default: true,
          }])

          if (autoConfigurePath) {
            const shellRc = process.env.SHELL?.includes('zsh') ? join(homedir(), '.zshrc') : join(homedir(), '.bashrc')
            const shellRcDisplay = process.env.SHELL?.includes('zsh') ? '~/.zshrc' : '~/.bashrc'

            try {
              // Check if already configured
              let rcContent = ''
              if (await fs.pathExists(shellRc)) {
                rcContent = await fs.readFile(shellRc, 'utf-8')
              }

              if (rcContent.includes(result.binPath) || rcContent.includes('/.claude/bin')) {
                console.log(ansis.green(`  ✓ ${i18n.t('init:pathAlreadyConfigured', { file: shellRcDisplay })}`))
              }
              else {
                // Append to shell config
                const configLine = `\n# CCG multi-model collaboration system\n${exportCommand}\n`
                await fs.appendFile(shellRc, configLine, 'utf-8')
                console.log(ansis.green(`  ✓ ${i18n.t('init:pathConfigured', { file: shellRcDisplay })}`))
                console.log()
                console.log(ansis.cyan(`  ${i18n.t('init:restartShellPrompt')}`))
                console.log(ansis.gray(`     source ${shellRcDisplay}`))
              }
            }
            catch (error) {
              console.log(ansis.red(`  ✗ ${i18n.t('init:pathConfigFailed')}`))
              console.log(ansis.gray(`     ${i18n.t('init:manualConfigInstructions', { file: shellRcDisplay })}`))
              console.log(ansis.gray(`     ${exportCommand}`))
            }
          }
          else {
            const shellRc = process.env.SHELL?.includes('zsh') ? '~/.zshrc' : '~/.bashrc'
            console.log()
            console.log(ansis.cyan(`  ${i18n.t('init:manualConfigInstructions', { file: shellRc })}`))
            console.log(ansis.gray(`     ${exportCommand}`))
            console.log(ansis.gray(`     source ${shellRc}`))
          }
        }
        else {
          // Non-interactive mode: just show instructions
          const shellRc = process.env.SHELL?.includes('zsh') ? '~/.zshrc' : '~/.bashrc'
          console.log()
          console.log(ansis.cyan(`  ${i18n.t('init:manualConfigInstructions', { file: shellRc })}`))
          console.log(ansis.gray(`     ${exportCommand}`))
          console.log(ansis.gray(`     source ${shellRc}`))
        }
      }
    }

    console.log()
    console.log(ansis.gray(`  ${i18n.t('init:configSavedTo')} ${getCcgDir()}/config.toml`))
    console.log()
  }
  catch (error) {
    spinner.fail(ansis.red(i18n.t('init:installFailed')))
    console.error(error)
  }
}
