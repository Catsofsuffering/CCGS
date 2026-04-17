import type { CAC } from 'cac'
import type { CliOptions } from './types'
import ansis from 'ansis'
import { doctorClaude, execClaude } from './commands/claude'
import { version } from '../package.json'
import { configMcp } from './commands/config-mcp'
import { diagnoseMcp, fixMcp } from './commands/diagnose-mcp'
import { init } from './commands/init'
import { installMonitorHooks, installMonitorRuntime, startMonitor } from './commands/monitor'
import { showMainMenu } from './commands/menu'
import { i18n, initI18n } from './i18n'
import { readCcgConfig } from './utils/config'
import { CANONICAL_BINARY_NAME, CANONICAL_PACKAGE_NAME, PRODUCT_NAME } from './utils/identity'

function customizeHelp(sections: any[]): any[] {
  sections.unshift({
    title: '',
    body: ansis.cyan.bold(`${PRODUCT_NAME} - Codex Orchestrates, Claude Executes v${version}`),
  })

  sections.push({
    title: ansis.yellow(i18n.t('cli:help.commands')),
    body: [
      `  ${ansis.cyan(CANONICAL_BINARY_NAME)}              ${i18n.t('cli:help.commandDescriptions.showMenu')}`,
      `  ${ansis.cyan(`${CANONICAL_BINARY_NAME} init`)} | ${ansis.cyan('i')}     ${i18n.t('cli:help.commandDescriptions.initConfig')}`,
      `  ${ansis.cyan(`${CANONICAL_BINARY_NAME} monitor`)}      Start the Claude monitor`,
      `  ${ansis.cyan(`${CANONICAL_BINARY_NAME} claude`)}       Stable Claude launcher for Codex handoff`,
      `  ${ansis.cyan(`${CANONICAL_BINARY_NAME} config mcp`)}   ${i18n.t('cli:help.commandDescriptions.configMcp')}`,
      `  ${ansis.cyan(`${CANONICAL_BINARY_NAME} diagnose-mcp`)} ${i18n.t('cli:help.commandDescriptions.diagnoseMcp')}`,
      `  ${ansis.cyan(`${CANONICAL_BINARY_NAME} fix-mcp`)}      ${i18n.t('cli:help.commandDescriptions.fixMcp')}`,
      '',
      ansis.gray(`  ${i18n.t('cli:help.shortcuts')}`),
      `  ${ansis.cyan(`${CANONICAL_BINARY_NAME} i`)}            ${i18n.t('cli:help.shortcutDescriptions.quickInit')}`,
    ].join('\n'),
  })

  sections.push({
    title: ansis.yellow(i18n.t('cli:help.options')),
    body: [
      `  ${ansis.green('--lang, -l')} <lang>         ${i18n.t('cli:help.optionDescriptions.displayLanguage')} (zh-CN, en)`,
      `  ${ansis.green('--force, -f')}               ${i18n.t('cli:help.optionDescriptions.forceOverwrite')}`,
      `  ${ansis.green('--help, -h')}                ${i18n.t('cli:help.optionDescriptions.displayHelp')}`,
      `  ${ansis.green('--version, -v')}             ${i18n.t('cli:help.optionDescriptions.displayVersion')}`,
      '',
      ansis.gray(`  ${i18n.t('cli:help.nonInteractiveMode')}`),
      `  ${ansis.green('--skip-prompt, -s')}         ${i18n.t('cli:help.optionDescriptions.skipAllPrompts')}`,
      `  ${ansis.green('--frontend, -F')} <models>   ${i18n.t('cli:help.optionDescriptions.frontendModels')}`,
      `  ${ansis.green('--backend, -B')} <models>    ${i18n.t('cli:help.optionDescriptions.backendModels')}`,
      `  ${ansis.green('--mode, -m')} <mode>         ${i18n.t('cli:help.optionDescriptions.collaborationMode')}`,
      `  ${ansis.green('--workflows, -w')} <list>    ${i18n.t('cli:help.optionDescriptions.workflows')}`,
      `  ${ansis.green('--install-dir, -d')} <path>  ${i18n.t('cli:help.optionDescriptions.installDir')}`,
    ].join('\n'),
  })

  sections.push({
    title: ansis.yellow(i18n.t('cli:help.examples')),
    body: [
      ansis.gray(`  # ${i18n.t('cli:help.exampleDescriptions.showInteractiveMenu')}`),
      `  ${ansis.cyan(`npx ${CANONICAL_PACKAGE_NAME}`)}`,
      '',
      ansis.gray(`  # ${i18n.t('cli:help.exampleDescriptions.runFullInitialization')}`),
      `  ${ansis.cyan(`npx ${CANONICAL_PACKAGE_NAME} init`)}`,
      `  ${ansis.cyan(`npx ${CANONICAL_PACKAGE_NAME} i`)}`,
      '',
      ansis.gray(`  # ${i18n.t('cli:help.exampleDescriptions.customModels')}`),
      `  ${ansis.cyan(`npx ${CANONICAL_PACKAGE_NAME} i --frontend gemini,codex --backend codex,gemini`)}`,
      '',
      ansis.gray(`  # ${i18n.t('cli:help.exampleDescriptions.parallelMode')}`),
      `  ${ansis.cyan(`npx ${CANONICAL_PACKAGE_NAME} i --mode parallel`)}`,
      '',
    ].join('\n'),
  })

  return sections
}

export async function setupCommands(cli: CAC): Promise<void> {
  try {
    const config = await readCcgConfig()
    const defaultLang = config?.general?.language || 'zh-CN'
    await initI18n(defaultLang)
  }
  catch {
    await initI18n('zh-CN')
  }

  // Default command - show menu
  cli
    .command('', i18n.t('cli:help.commandDescriptions.showMenu'))
    .option('--lang, -l <lang>', `${i18n.t('cli:help.optionDescriptions.displayLanguage')} (zh-CN, en)`)
    .action(async (options: CliOptions) => {
      if (options.lang) {
        await initI18n(options.lang)
      }
      await showMainMenu()
    })

  // Init command
  cli
    .command('init', i18n.t('cli:help.commandDescriptions.initConfig'))
    .alias('i')
    .option('--lang, -l <lang>', `${i18n.t('cli:help.optionDescriptions.displayLanguage')} (zh-CN, en)`)
    .option('--force, -f', i18n.t('cli:help.optionDescriptions.forceOverwrite'))
    .option('--skip-prompt, -s', i18n.t('cli:help.optionDescriptions.skipAllPrompts'))
    .option('--skip-mcp', 'Skip MCP configuration (used during update)')
    .option('--frontend, -F <models>', i18n.t('cli:help.optionDescriptions.frontendModels'))
    .option('--backend, -B <models>', i18n.t('cli:help.optionDescriptions.backendModels'))
    .option('--mode, -m <mode>', i18n.t('cli:help.optionDescriptions.collaborationMode'))
    .option('--workflows, -w <workflows>', i18n.t('cli:help.optionDescriptions.workflows'))
    .option('--install-dir, -d <path>', i18n.t('cli:help.optionDescriptions.installDir'))
    .action(async (options: CliOptions) => {
      if (options.lang) {
        await initI18n(options.lang)
      }
      await init(options)
    })

  // Diagnose MCP command
  cli
    .command('diagnose-mcp', i18n.t('cli:help.commandDescriptions.diagnoseMcp'))
    .action(async () => {
      await diagnoseMcp()
    })

  // Fix MCP command (Windows only)
  cli
    .command('fix-mcp', i18n.t('cli:help.commandDescriptions.fixMcp'))
    .action(async () => {
      await fixMcp()
    })

  // Config MCP command
  cli
    .command('config <subcommand>', i18n.t('cli:help.commandDescriptions.configMcp'))
    .action(async (subcommand: string) => {
      if (subcommand === 'mcp') {
        await configMcp()
      }
      else {
        console.log(ansis.red(i18n.t('common:unknownSubcommand', { subcommand })))
        console.log(ansis.gray(i18n.t('common:availableSubcommands', { list: 'mcp' })))
      }
    })

  cli
    .command('monitor [action]', 'Manage the Claude hook monitor')
    .option('--detach', 'Start monitor in detached mode')
    .action(async (action: string | undefined, options: { detach?: boolean }) => {
      if (!action || action === 'start') {
        await startMonitor(Boolean(options.detach))
        return
      }

      if (action === 'install') {
        await installMonitorRuntime()
        return
      }

      if (action === 'hooks') {
        await installMonitorHooks()
        return
      }

      console.log(ansis.red(`Unknown monitor action: ${action}`))
      console.log(ansis.gray('Available actions: start, install, hooks'))
    })

  cli
    .command('claude <action> [...claudeArgs]', 'Launch Claude through the CCGS dispatcher')
    .option('--prompt <text>', 'Prompt content passed to claude -p')
    .option('--prompt-file <path>', 'Read prompt content from a file and pass it to claude -p')
    .option('--cwd <path>', 'Working directory for the Claude process')
    .option('--disable-agent-teams', 'Do not inject Agent Teams environment variables')
    .allowUnknownOptions()
    .action(async (
      action: string,
      claudeArgs: string[],
      options: {
        cwd?: string
        prompt?: string
        promptFile?: string
        disableAgentTeams?: boolean
      },
    ) => {
      if (action === 'exec') {
        await execClaude(claudeArgs, options)
        return
      }

      if (action === 'doctor') {
        await doctorClaude(options)
        return
      }

      console.log(ansis.red(`Unknown claude action: ${action}`))
      console.log(ansis.gray('Available actions: exec, doctor'))
    })

  cli.help(sections => customizeHelp(sections))
  cli.version(version)
}
