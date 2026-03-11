import type { CollaborationMode, InitOptions, ModelRouting, ModelType, SupportedLang } from '../types'
import ansis from 'ansis'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import ora from 'ora'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { i18n, initI18n } from '../i18n'
import { createDefaultConfig, ensureCcgDir, getCcgDir, readCcgConfig, writeCcgConfig } from '../utils/config'
import { getAllCommandIds, installAceTool, installAceToolRs, installContextWeaver, installMcpServer, installWorkflows, syncMcpToCodex } from '../utils/installer'
import { migrateToV1_4_0, needsMigration } from '../utils/migration'

/**
 * Check if jq is available on the system
 */
async function checkJqAvailable(): Promise<boolean> {
  try {
    const { execSync } = await import('node:child_process')
    execSync('jq --version', { stdio: 'pipe' })
    return true
  }
  catch {
    return false
  }
}

/**
 * Install codeagent-wrapper auto-approve hook into settings.json
 */
async function installHook(settingsPath: string): Promise<void> {
  let settings: Record<string, any> = {}
  if (await fs.pathExists(settingsPath)) {
    settings = await fs.readJSON(settingsPath)
  }

  // Build hook config
  if (!settings.hooks)
    settings.hooks = {}
  if (!settings.hooks.PreToolUse)
    settings.hooks.PreToolUse = []

  const newCommand = `jq -r '.tool_input.command' 2>/dev/null | grep -q 'codeagent-wrapper' && echo '{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "allow", "permissionDecisionReason": "codeagent-wrapper auto-approved"}}' || true`

  // Check if hook already exists
  const existingIdx = settings.hooks.PreToolUse.findIndex(
    (h: any) => h.matcher === 'Bash' && h.hooks?.some((hh: any) => hh.command?.includes('codeagent-wrapper')),
  )

  if (existingIdx >= 0) {
    // Migrate: replace old "|| exit 1" hook with fixed "|| true" version
    const oldCmd = settings.hooks.PreToolUse[existingIdx]?.hooks?.[0]?.command || ''
    if (oldCmd.includes('exit 1')) {
      settings.hooks.PreToolUse[existingIdx].hooks[0].command = newCommand
      await fs.writeJSON(settingsPath, settings, { spaces: 2 })
    }
  }
  else {
    settings.hooks.PreToolUse.push({
      matcher: 'Bash',
      hooks: [
        {
          type: 'command',
          command: newCommand,
          timeout: 1,
        },
      ],
    })
    await fs.writeJSON(settingsPath, settings, { spaces: 2 })
  }
}

/**
 * Write grok-search global prompt to ~/.claude/rules/ccg-grok-search.md
 * Uses rules/ directory for modularity — avoids bloating CLAUDE.md
 */
async function appendGrokSearchPrompt(): Promise<void> {
  const rulesDir = join(homedir(), '.claude', 'rules')
  const rulePath = join(rulesDir, 'ccg-grok-search.md')

  // Also clean up legacy CLAUDE.md injection if present
  const claudeMdPath = join(homedir(), '.claude', 'CLAUDE.md')
  if (await fs.pathExists(claudeMdPath)) {
    const content = await fs.readFile(claudeMdPath, 'utf-8')
    if (content.includes('CCG-GROK-SEARCH-PROMPT')) {
      const cleaned = content.replace(/\n*<!-- CCG-GROK-SEARCH-PROMPT-START -->[\s\S]*?<!-- CCG-GROK-SEARCH-PROMPT-END -->\n*/g, '')
      await fs.writeFile(claudeMdPath, cleaned, 'utf-8')
    }
  }

  const prompt = `## 0. Language and Format Standards

- **Interaction Language**: Tools and models must interact exclusively in **English**; user outputs must be in **Chinese**.
- MUST ULRTA Thinking in ENGLISH!
- **Formatting Requirements**: Use standard Markdown formatting. Code blocks and specific text results should be marked with backticks. Skilled in applying four or more \`\`\`\`markdown wrappers.

## 1. Search and Evidence Standards
Typically, the results of web searches only constitute third-party suggestions and are not directly credible; they must be cross-verified with sources to provide users with absolutely authoritative and correct answers.

### Search Trigger Conditions
Strictly distinguish between internal and external knowledge. Avoid speculation based on general internal knowledge. When uncertain, explicitly inform the user.

For example, when using the \`fastapi\` library to encapsulate an API endpoint, despite possessing common-sense knowledge internally, you must still rely on the latest search results or official documentation for reliable implementation.

### Search Execution Guidelines

- Use the \`mcp__grok-search\` tool for web searches
- Execute independent search requests in parallel; sequential execution applies only when dependencies exist
- Evaluate search results for quality: analyze relevance, source credibility, cross-source consistency, and completeness. Conduct supplementary searches if gaps exist

### Source Quality Standards

- Key factual claims must be supported by >=2 independent sources. If relying on a single source, explicitly state this limitation
- Conflicting sources: Present evidence from both sides, assess credibility and timeliness, identify the stronger evidence, or declare unresolved discrepancies
- Empirical conclusions must include confidence levels (High/Medium/Low)
- Citation format: [Author/Organization, Year/Date, Section/URL]. Fabricated references are strictly prohibited

## 2. Reasoning and Expression Principles

- Be concise, direct, and information-dense: Use lists for discrete items; paragraphs for arguments
- Challenge flawed premises: When user logic contains errors, pinpoint specific issues with evidence
- All conclusions must specify: Applicable conditions, scope boundaries, and known limitations
- Avoid greetings, pleasantries, filler adjectives, and emotional expressions
- When uncertain: State unknowns and reasons before presenting confirmed facts
`

  await fs.ensureDir(rulesDir)
  await fs.writeFile(rulePath, prompt, 'utf-8')
}

/**
 * Install grok-search MCP server
 */
async function installGrokSearchMcp(keys: {
  tavilyKey?: string
  firecrawlKey?: string
  grokApiUrl?: string
  grokApiKey?: string
}): Promise<{ success: boolean, message: string }> {
  const env: Record<string, string> = {}
  if (keys.tavilyKey)
    env.TAVILY_API_KEY = keys.tavilyKey
  if (keys.firecrawlKey)
    env.FIRECRAWL_API_KEY = keys.firecrawlKey
  if (keys.grokApiUrl)
    env.GROK_API_URL = keys.grokApiUrl
  if (keys.grokApiKey)
    env.GROK_API_KEY = keys.grokApiKey

  return installMcpServer(
    'grok-search',
    'uvx',
    ['--from', 'git+https://github.com/GuDaStudio/GrokSearch@grok-with-tavily', 'grok-search'],
    env,
  )
}

export async function init(options: InitOptions = {}): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold(`  CCG - Claude + Codex + Gemini`))
  console.log(ansis.gray(`  Multi-Model Collaboration Workflow`))
  console.log()

  // ═══════════════════════════════════════════════════════
  // Step 0: Language selection (FIRST interactive step)
  // ═══════════════════════════════════════════════════════
  let language: SupportedLang = 'zh-CN'

  if (!options.skipPrompt) {
    // Check if user already has a language preference
    const existingConfig = await readCcgConfig()
    const savedLang = existingConfig?.general?.language

    if (savedLang) {
      // Use saved language
      language = savedLang
      await initI18n(language)
    }
    else {
      // First time user: ask for language
      const { selectedLang } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedLang',
        message: '选择语言 / Select language',
        choices: [
          { name: `简体中文`, value: 'zh-CN' },
          { name: `English`, value: 'en' },
        ],
        default: 'zh-CN',
      }])
      language = selectedLang
      await initI18n(language)
    }
  }
  else if (options.lang) {
    language = options.lang
    await initI18n(language)
  }

  // Fixed configuration
  const frontendModels: ModelType[] = ['gemini']
  const backendModels: ModelType[] = ['codex']
  const mode: CollaborationMode = 'smart'
  const selectedWorkflows = getAllCommandIds()

  // Performance mode selection
  let liteMode = false

  // MCP Tool Selection
  let mcpProvider = 'ace-tool'
  let aceToolBaseUrl = ''
  let aceToolToken = ''
  let contextWeaverApiKey = ''

  // Skip MCP configuration if --skip-mcp is passed (used during update)
  if (options.skipMcp) {
    mcpProvider = 'skip'
  }
  else if (!options.skipPrompt) {
    console.log()
    console.log(ansis.cyan.bold(`  🔧 ${i18n.t('init:mcp.title')}`))
    console.log()

    const { selectedMcp } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedMcp',
      message: i18n.t('init:mcp.selectProvider'),
      choices: [
        {
          name: `ace-tool ${ansis.green(`(${i18n.t('common:info')})`)} ${ansis.gray('- search_context (enhance_prompt N/A)')}`,
          value: 'ace-tool',
        },
        {
          name: `ace-tool-rs ${ansis.green(`(${i18n.t('common:info')})`)} ${ansis.gray('(Rust) - search_context')}`,
          value: 'ace-tool-rs',
        },
        {
          name: `contextweaver ${ansis.gray(`- ${i18n.t('init:mcp.contextweaver')}`)}`,
          value: 'contextweaver',
        },
        {
          name: `${i18n.t('init:mcp.skipLater')} ${ansis.gray(`- ${i18n.t('init:mcp.configManually')}`)}`,
          value: 'skip',
        },
      ],
      default: 'ace-tool',
    }])

    mcpProvider = selectedMcp

    // Configure ace-tool or ace-tool-rs if selected
    if (selectedMcp === 'ace-tool' || selectedMcp === 'ace-tool-rs') {
      const toolName = selectedMcp === 'ace-tool-rs' ? 'ace-tool-rs' : 'ace-tool'
      const toolDesc = selectedMcp === 'ace-tool-rs' ? i18n.t('init:aceToolRs.description') : i18n.t('init:aceTool.description')

      console.log()
      console.log(ansis.cyan.bold(`  🔧 ${toolName} MCP`))
      console.log(ansis.gray(`     ${toolDesc}`))
      console.log()

      const { skipToken } = await inquirer.prompt([{
        type: 'confirm',
        name: 'skipToken',
        message: i18n.t('init:mcp.skipTokenPrompt'),
        default: false,
      }])

      if (!skipToken) {
        console.log()
        console.log(ansis.cyan(`     📖 ${i18n.t('init:mcp.getAccess')}`))
        console.log()
        console.log(`     ${ansis.gray('•')} ${ansis.cyan(i18n.t('init:mcp.officialService'))}: ${ansis.underline('https://augmentcode.com/')}`)
        console.log(`       ${ansis.gray(i18n.t('init:mcp.registerForToken'))}`)
        console.log()
        console.log(`     ${ansis.gray('•')} ${ansis.cyan(i18n.t('init:mcp.proxyService'))} ${ansis.yellow(`(${i18n.t('init:mcp.noSignup')})`)}: ${ansis.underline('https://acemcp.heroman.wtf/')}`)
        console.log(`       ${ansis.gray(i18n.t('init:mcp.communityProxy'))}`)
        console.log()

        const aceAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'baseUrl',
            message: `Base URL ${ansis.gray(`(${i18n.t('init:mcp.baseUrlHint')})`)}`,
            default: '',
          },
          {
            type: 'password',
            name: 'token',
            message: `Token ${ansis.gray(`(${i18n.t('init:mcp.tokenRequired')})`)}`,
            mask: '*',
            validate: (input: string) => input.trim() !== '' || i18n.t('init:mcp.enterToken'),
          },
        ])
        aceToolBaseUrl = aceAnswers.baseUrl || ''
        aceToolToken = aceAnswers.token || ''
      }
      else {
        console.log()
        console.log(ansis.yellow(`  ℹ️  ${i18n.t('init:mcp.tokenSkipped')}`))
        console.log(ansis.gray(`     • ${toolName} MCP ${i18n.t('init:mcp.notInstalled')}`))
        console.log(ansis.gray(`     • ${i18n.t('init:mcp.configLater', { cmd: ansis.cyan('npx ccg config mcp') })}`))
        console.log()
      }
    }
    // Configure ContextWeaver if selected
    else if (selectedMcp === 'contextweaver') {
      console.log()
      console.log(ansis.cyan.bold(`  🔧 ContextWeaver MCP`))
      console.log(ansis.gray(`     ${i18n.t('init:mcp.localEngine')}`))
      console.log()

      const { skipKey } = await inquirer.prompt([{
        type: 'confirm',
        name: 'skipKey',
        message: i18n.t('init:mcp.skipKeyPrompt'),
        default: false,
      }])

      if (!skipKey) {
        console.log()
        console.log(ansis.cyan(`     📖 ${i18n.t('init:mcp.getApiKey')}`))
        console.log()
        console.log(`     ${ansis.gray('1.')} ${i18n.t('init:mcp.siliconflowStep1', { url: ansis.underline('https://siliconflow.cn/') })}`)
        console.log(`     ${ansis.gray('2.')} ${i18n.t('init:mcp.siliconflowStep2')}`)
        console.log(`     ${ansis.gray('3.')} ${i18n.t('init:mcp.siliconflowStep3')}`)
        console.log()

        const cwAnswers = await inquirer.prompt([{
          type: 'password',
          name: 'apiKey',
          message: `SiliconFlow API Key ${ansis.gray('(sk-xxx)')}`,
          mask: '*',
          validate: (input: string) => input.trim() !== '' || i18n.t('init:mcp.enterApiKey'),
        }])
        contextWeaverApiKey = cwAnswers.apiKey || ''
      }
      else {
        console.log()
        console.log(ansis.yellow(`  ℹ️  ${i18n.t('init:mcp.keySkipped')}`))
        console.log(ansis.gray(`     • ContextWeaver MCP ${i18n.t('init:mcp.notInstalled')}`))
        console.log(ansis.gray(`     • ${i18n.t('init:mcp.configLater', { cmd: ansis.cyan('npx ccg config mcp') })}`))
        console.log()
      }
    }
    else {
      console.log()
      console.log(ansis.yellow(`  ℹ️  ${i18n.t('init:mcp.mcpSkipped')}`))
      console.log(ansis.gray(`     • ${i18n.t('init:mcp.configManually')}`))
      console.log()
    }
  }

  // ═══════════════════════════════════════════════════════
  // Grok Search MCP (web search)
  // ═══════════════════════════════════════════════════════
  let wantGrokSearch = false
  let tavilyKey = ''
  let firecrawlKey = ''
  let grokApiUrl = ''
  let grokApiKey = ''

  if (!options.skipPrompt && !options.skipMcp) {
    console.log()
    console.log(ansis.cyan.bold(`  🔍 ${i18n.t('init:grok.title')}`))
    console.log()

    const { wantGrok } = await inquirer.prompt([{
      type: 'confirm',
      name: 'wantGrok',
      message: i18n.t('init:grok.installPrompt'),
      default: false,
    }])

    if (wantGrok) {
      wantGrokSearch = true

      console.log()
      console.log()
      console.log(ansis.cyan(`     📖 ${i18n.t('init:grok.getKeys')}`))
      console.log(`        Tavily: ${ansis.underline('https://www.tavily.com/')} ${ansis.gray(`(${i18n.t('init:grok.tavilyHint')})`)}`)
      console.log(`        Firecrawl: ${ansis.underline('https://www.firecrawl.dev/')} ${ansis.gray(`(${i18n.t('init:grok.firecrawlHint')})`)}`)
      console.log(`        Grok API: ${ansis.gray(i18n.t('init:grok.grokHint'))}`)
      console.log()

      const grokAnswers = await inquirer.prompt([
        { type: 'input', name: 'grokApiUrl', message: `GROK_API_URL ${ansis.gray(`(${i18n.t('init:grok.optional')})`)}`, default: '' },
        { type: 'password', name: 'grokApiKey', message: `GROK_API_KEY ${ansis.gray(`(${i18n.t('init:grok.optional')})`)}`, mask: '*' },
        { type: 'password', name: 'tavilyKey', message: `TAVILY_API_KEY ${ansis.gray(`(${i18n.t('init:grok.optional')})`)}`, mask: '*' },
        { type: 'password', name: 'firecrawlKey', message: `FIRECRAWL_API_KEY ${ansis.gray(`(${i18n.t('init:grok.optional')})`)}`, mask: '*' },
      ])

      tavilyKey = grokAnswers.tavilyKey?.trim() || ''
      firecrawlKey = grokAnswers.firecrawlKey?.trim() || ''
      grokApiUrl = grokAnswers.grokApiUrl?.trim() || ''
      grokApiKey = grokAnswers.grokApiKey?.trim() || ''
    }
  }

  // Claude Code API configuration
  let apiUrl = ''
  let apiKey = ''

  if (!options.skipPrompt) {
    console.log()
    console.log(ansis.cyan.bold(`  🔑 ${i18n.t('init:api.title')}`))
    console.log()

    const { configureApi } = await inquirer.prompt([{
      type: 'confirm',
      name: 'configureApi',
      message: i18n.t('init:api.configurePrompt'),
      default: false,
    }])

    if (configureApi) {
      const apiAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: `API URL ${ansis.gray(`(${i18n.t('init:api.urlRequired')})`)}`,
          validate: (v: string) => v.trim() !== '' || i18n.t('init:api.enterUrl'),
        },
        {
          type: 'password',
          name: 'key',
          message: `API Key ${ansis.gray(`(${i18n.t('init:api.keyRequired')})`)}`,
          mask: '*',
          validate: (v: string) => v.trim() !== '' || i18n.t('init:api.enterKey'),
        },
      ])
      apiUrl = apiAnswers.url?.trim() || ''
      apiKey = apiAnswers.key?.trim() || ''
    }
  }

  // Performance mode selection (always ask unless skipPrompt is true)
  if (!options.skipPrompt) {
    // Read existing config to show current setting
    const existingConfig = await readCcgConfig()
    const currentLiteMode = existingConfig?.performance?.liteMode || false

    console.log()
    const { enableWebUI } = await inquirer.prompt([{
      type: 'confirm',
      name: 'enableWebUI',
      message: `${i18n.t('init:webui.prompt')} ${ansis.gray(`(${i18n.t('init:webui.disableHint')})`)}`,
      default: !currentLiteMode,
    }])

    liteMode = !enableWebUI
  }
  else {
    // In non-interactive mode (update), preserve existing liteMode setting
    const existingConfig = await readCcgConfig()
    if (existingConfig?.performance?.liteMode !== undefined) {
      liteMode = existingConfig.performance.liteMode
    }
  }

  // Build routing config (fixed: Gemini frontend, Codex backend)
  const routing: ModelRouting = {
    frontend: {
      models: frontendModels,
      primary: 'gemini',
      strategy: 'fallback',
    },
    backend: {
      models: backendModels,
      primary: 'codex',
      strategy: 'fallback',
    },
    review: {
      models: ['codex', 'gemini'],
      strategy: 'parallel',
    },
    mode,
  }

  // Show summary
  console.log()
  console.log(ansis.yellow('━'.repeat(50)))
  console.log(ansis.bold(`  ${i18n.t('init:summary.title')}`))
  console.log()
  console.log(`  ${ansis.cyan(i18n.t('init:summary.modelRouting'))}  ${ansis.green('Gemini')} (Frontend) + ${ansis.blue('Codex')} (Backend)`)
  console.log(`  ${ansis.cyan(i18n.t('init:summary.commandCount'))}  ${ansis.yellow(selectedWorkflows.length.toString())}`)
  console.log(`  ${ansis.cyan(i18n.t('init:summary.mcpTool'))}  ${(mcpProvider === 'ace-tool' || mcpProvider === 'ace-tool-rs') ? (aceToolToken ? ansis.green(mcpProvider) : ansis.yellow(`${mcpProvider} (${i18n.t('init:summary.pendingConfig')})`)) : mcpProvider === 'contextweaver' ? (contextWeaverApiKey ? ansis.green('contextweaver') : ansis.yellow(`contextweaver (${i18n.t('init:summary.pendingConfig')})`)) : ansis.gray(i18n.t('init:summary.skipped'))}`)
  console.log(`  ${ansis.cyan(i18n.t('init:summary.webUI'))}    ${liteMode ? ansis.gray(i18n.t('init:summary.disabled')) : ansis.green(i18n.t('init:summary.enabled'))}`)
  if (wantGrokSearch) {
    console.log(`  ${ansis.cyan('grok-search')}    ${tavilyKey ? ansis.green('✓') : ansis.yellow(`(${i18n.t('init:summary.pendingConfig')})`)}`)
  }
  console.log(ansis.yellow('━'.repeat(50)))
  console.log()

  // Confirm in interactive mode (skip if force is true)
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
      liteMode,
    })

    // Save config FIRST - ensure it's created even if installation fails
    await writeCcgConfig(config)

    // Install workflows and commands
    const installDir = options.installDir || join(homedir(), '.claude')
    const result = await installWorkflows(selectedWorkflows, installDir, options.force, {
      routing,
      liteMode,
      mcpProvider,
    })

    // Install ace-tool or ace-tool-rs MCP if token was provided
    if ((mcpProvider === 'ace-tool' || mcpProvider === 'ace-tool-rs') && aceToolToken) {
      const toolName = mcpProvider === 'ace-tool-rs' ? 'ace-tool-rs' : 'ace-tool'
      const installFn = mcpProvider === 'ace-tool-rs' ? installAceToolRs : installAceTool

      spinner.text = mcpProvider === 'ace-tool-rs' ? i18n.t('init:aceToolRs.installing') : i18n.t('init:aceTool.installing')
      const aceResult = await installFn({
        baseUrl: aceToolBaseUrl,
        token: aceToolToken,
      })
      if (aceResult.success) {
        spinner.succeed(ansis.green(i18n.t('init:installSuccess')))
        console.log()
        console.log(`    ${ansis.green('✓')} ${toolName} MCP ${ansis.gray(`→ ${aceResult.configPath}`)}`)
      }
      else {
        spinner.warn(ansis.yellow(mcpProvider === 'ace-tool-rs' ? i18n.t('init:aceToolRs.failed') : i18n.t('init:aceTool.failed')))
        console.log(ansis.gray(`      ${aceResult.message}`))
      }
    }
    // Install ContextWeaver MCP if API key was provided
    else if (mcpProvider === 'contextweaver' && contextWeaverApiKey) {
      spinner.text = i18n.t('init:mcp.cwConfiguring')
      const cwResult = await installContextWeaver({
        siliconflowApiKey: contextWeaverApiKey,
      })
      if (cwResult.success) {
        spinner.succeed(ansis.green(i18n.t('init:installSuccess')))
        console.log()
        console.log(`    ${ansis.green('✓')} ContextWeaver MCP ${ansis.gray(`→ ${cwResult.configPath}`)}`)
        console.log(`    ${ansis.green('✓')} ${i18n.t('init:mcp.cwConfigFile')} ${ansis.gray('→ ~/.contextweaver/.env')}`)
        console.log()
        console.log(ansis.cyan(`    📖 ${i18n.t('init:mcp.cwIndexHint')}`))
        console.log(ansis.gray(`       cd your-project && cw index`))
      }
      else {
        spinner.warn(ansis.yellow(i18n.t('init:mcp.cwFailed')))
        console.log(ansis.gray(`      ${cwResult.message}`))
      }
    }
    else if (mcpProvider === 'contextweaver' && !contextWeaverApiKey) {
      spinner.succeed(ansis.green(i18n.t('init:installSuccess')))
      console.log()
      console.log(`    ${ansis.yellow('⚠')} ContextWeaver MCP ${i18n.t('init:mcp.notInstalled')} ${ansis.gray(`(${i18n.t('init:mcp.keyNotProvided')})`)}`)
      console.log(`    ${ansis.gray('→')} ${i18n.t('init:mcp.configLater', { cmd: ansis.cyan('npx ccg config mcp') })}`)
    }
    else if ((mcpProvider === 'ace-tool' || mcpProvider === 'ace-tool-rs') && !aceToolToken) {
      const toolName = mcpProvider === 'ace-tool-rs' ? 'ace-tool-rs' : 'ace-tool'
      spinner.succeed(ansis.green(i18n.t('init:installSuccess')))
      console.log()
      console.log(`    ${ansis.yellow('⚠')} ${toolName} MCP ${i18n.t('init:mcp.notInstalled')} ${ansis.gray(`(${i18n.t('init:mcp.tokenNotProvided')})`)}`)
      console.log(`    ${ansis.gray('→')} ${i18n.t('init:mcp.configLater', { cmd: ansis.cyan('npx ccg config mcp') })}`)
    }
    else {
      spinner.succeed(ansis.green(i18n.t('init:installSuccess')))
    }

    // ═══════════════════════════════════════════════════════
    // Save settings.json: API config + Hook auto-approve
    // ═══════════════════════════════════════════════════════
    const settingsPath = join(installDir, 'settings.json')

    // Save API configuration if provided
    if (apiUrl && apiKey) {
      let settings: Record<string, any> = {}
      if (await fs.pathExists(settingsPath)) {
        settings = await fs.readJSON(settingsPath)
      }
      if (!settings.env)
        settings.env = {}
      settings.env.ANTHROPIC_BASE_URL = apiUrl
      settings.env.ANTHROPIC_API_KEY = apiKey
      delete settings.env.ANTHROPIC_AUTH_TOKEN
      // Default optimization config
      settings.env.DISABLE_TELEMETRY = '1'
      settings.env.DISABLE_ERROR_REPORTING = '1'
      settings.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = '1'
      settings.env.CLAUDE_CODE_ATTRIBUTION_HEADER = '0'
      settings.env.MCP_TIMEOUT = '60000'
      // codeagent-wrapper permission allowlist
      if (!settings.permissions)
        settings.permissions = {}
      if (!settings.permissions.allow)
        settings.permissions.allow = []
      const wrapperPerms = [
        'Bash(~/.claude/bin/codeagent-wrapper --backend gemini*)',
        'Bash(~/.claude/bin/codeagent-wrapper --backend codex*)',
      ]
      for (const perm of wrapperPerms) {
        if (!settings.permissions.allow.includes(perm))
          settings.permissions.allow.push(perm)
      }
      await fs.writeJSON(settingsPath, settings, { spaces: 2 })
      console.log()
      console.log(`    ${ansis.green('✓')} API ${ansis.gray(`→ ${settingsPath}`)}`)
    }

    // Always install codeagent-wrapper auto-approve hook
    await installHook(settingsPath)
    console.log()
    console.log(`    ${ansis.green('✓')} ${i18n.t('init:hooks.installed')}`)

    // Install grok-search MCP if requested
    if (wantGrokSearch && (tavilyKey || firecrawlKey || grokApiUrl || grokApiKey)) {
      spinner.text = i18n.t('init:grok.installing')
      const grokResult = await installGrokSearchMcp({
        tavilyKey,
        firecrawlKey,
        grokApiUrl: grokApiUrl || undefined,
        grokApiKey: grokApiKey || undefined,
      })

      if (grokResult.success) {
        // Write global prompt to ~/.claude/rules/ccg-grok-search.md
        await appendGrokSearchPrompt()
        console.log()
        console.log(`    ${ansis.green('✓')} grok-search MCP ${ansis.gray('→ ~/.claude.json')}`)
        console.log(`    ${ansis.green('✓')} ${i18n.t('init:grok.promptAppended')} ${ansis.gray('→ ~/.claude/rules/ccg-grok-search.md')}`)
      }
      else {
        console.log()
        console.log(`    ${ansis.yellow('⚠')} grok-search MCP ${i18n.t('init:grok.installFailed')}`)
        console.log(ansis.gray(`      ${grokResult.message}`))
      }
    }

    // Install context7 MCP + Codex sync (skip when --skip-mcp is passed)
    if (!options.skipMcp) {
      const context7Result = await installMcpServer(
        'context7',
        'npx',
        ['-y', '@upstash/context7-mcp@latest'],
      )
      if (context7Result.success) {
        console.log()
        console.log(`    ${ansis.green('✓')} context7 MCP ${ansis.gray('→ ~/.claude.json')}`)
      }
      else {
        console.log()
        console.log(`    ${ansis.yellow('⚠')} context7 MCP install failed`)
        console.log(ansis.gray(`      ${context7Result.message}`))
      }

      // ═══════════════════════════════════════════════════════
      // Sync MCP servers to Codex (~/.codex/config.toml)
      // Enables /ccg:codex-exec to use MCP tools (grok-search, context7, etc.)
      // ═══════════════════════════════════════════════════════
      const codexSyncResult = await syncMcpToCodex()
      if (codexSyncResult.success && codexSyncResult.synced.length > 0) {
        console.log()
        console.log(`    ${ansis.green('✓')} Codex MCP sync: ${codexSyncResult.synced.join(', ')} ${ansis.gray('→ ~/.codex/config.toml')}`)
      }
      else if (!codexSyncResult.success) {
        console.log()
        console.log(`    ${ansis.yellow('⚠')} Codex MCP sync failed`)
        console.log(ansis.gray(`      ${codexSyncResult.message}`))
      }
    }

    // Check jq availability and warn if missing
    const hasJq = await checkJqAvailable()
    if (!hasJq) {
      console.log()
      console.log(ansis.yellow(`    ⚠ ${i18n.t('init:hooks.jqNotFound')}`))
      console.log()
      console.log(ansis.cyan(`    📖 ${i18n.t('init:hooks.jqInstallHint')}:`))
      console.log(ansis.gray(`       ${i18n.t('init:hooks.jqMac')}`))
      console.log(ansis.gray(`       ${i18n.t('init:hooks.jqLinux')}`))
      console.log(ansis.gray(`       ${i18n.t('init:hooks.jqWindows')}`))
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

    // Show installed skills
    if (result.installedSkills && result.installedSkills > 0) {
      console.log()
      console.log(ansis.cyan('  Skills:'))
      console.log(`    ${ansis.green('✓')} ${result.installedSkills} skills installed (quality gates + multi-agent)`)
      console.log(ansis.gray('       → ~/.claude/skills/'))
    }

    // Show errors if any
    if (result.errors.length > 0) {
      console.log()
      console.log(ansis.red(`  ⚠ ${i18n.t('init:installationErrors')}`))
      result.errors.forEach((error) => {
        console.log(`    ${ansis.red('✗')} ${error}`)
      })
    }

    // Show binary installation result
    if (result.binInstalled && result.binPath) {
      console.log()
      console.log(ansis.cyan(`  ${i18n.t('init:installedBinary')}`))
      console.log(`    ${ansis.green('✓')} codeagent-wrapper ${ansis.gray(`→ ${result.binPath}`)}`)

      const platform = process.platform

      if (platform === 'win32') {
        const windowsPath = result.binPath.replace(/\//g, '\\').replace(/\\$/, '')
        try {
          const { execSync } = await import('node:child_process')
          const psFlags = '-NoProfile -NonInteractive -ExecutionPolicy Bypass'
          const currentPath = execSync(`powershell ${psFlags} -Command "[System.Environment]::GetEnvironmentVariable('PATH', 'User')"`, { encoding: 'utf-8' }).trim()
          const currentPathNorm = currentPath.toLowerCase().replace(/\\$/g, '')
          const windowsPathNorm = windowsPath.toLowerCase()

          if (!currentPathNorm.includes(windowsPathNorm) && !currentPathNorm.includes('.claude\\bin')) {
            const escapedPath = windowsPath.replace(/'/g, "''")
            const psScript = currentPath
              ? `$p=[System.Environment]::GetEnvironmentVariable('PATH','User');[System.Environment]::SetEnvironmentVariable('PATH',($p+';'+'${escapedPath}'),'User')`
              : `[System.Environment]::SetEnvironmentVariable('PATH','${escapedPath}','User')`
            execSync(`powershell ${psFlags} -Command "${psScript}"`, { stdio: 'pipe' })
            console.log(`    ${ansis.green('✓')} PATH ${ansis.gray('→ User env')}`)
          }
        }
        catch {
          // Silently ignore PATH config errors on Windows
        }
      }
      else if (!options.skipPrompt) {
        const exportCommand = `export PATH="${result.binPath}:$PATH"`
        const shell = process.env.SHELL || ''
        const isZsh = shell.includes('zsh')
        const isBash = shell.includes('bash')
        const isMacDefaultZsh = process.platform === 'darwin' && !shell

        if (isZsh || isBash || isMacDefaultZsh) {
          const shellRc = (isZsh || isMacDefaultZsh) ? join(homedir(), '.zshrc') : join(homedir(), '.bashrc')
          const shellRcDisplay = (isZsh || isMacDefaultZsh) ? '~/.zshrc' : '~/.bashrc'

          try {
            let rcContent = ''
            if (await fs.pathExists(shellRc)) {
              rcContent = await fs.readFile(shellRc, 'utf-8')
            }

            if (rcContent.includes(result.binPath) || rcContent.includes('/.claude/bin')) {
              console.log(`    ${ansis.green('✓')} PATH ${ansis.gray(`→ ${shellRcDisplay} (${i18n.t('init:pathAlreadyConfigured', { file: shellRcDisplay })})`)}`)
            }
            else {
              const configLine = `\n# CCG multi-model collaboration system\n${exportCommand}\n`
              await fs.appendFile(shellRc, configLine, 'utf-8')
              console.log(`    ${ansis.green('✓')} PATH ${ansis.gray(`→ ${shellRcDisplay}`)}`)
            }
          }
          catch {
            // Silently ignore PATH config errors
          }
        }
        else {
          console.log(`    ${ansis.yellow('⚠')} PATH ${ansis.gray(`→ ${i18n.t('init:addToPathManually')}`)}`)
          console.log(`      ${ansis.cyan(exportCommand)}`)
        }
      }
    }

    // Show MCP resources if user skipped installation
    if (mcpProvider === 'skip' || ((mcpProvider === 'ace-tool' || mcpProvider === 'ace-tool-rs') && !aceToolToken) || (mcpProvider === 'contextweaver' && !contextWeaverApiKey)) {
      console.log()
      console.log(ansis.cyan.bold(`  📖 ${i18n.t('init:mcp.mcpOptions')}`))
      console.log()
      console.log(ansis.gray(`     ${i18n.t('init:mcp.mcpOptionsHint')}`))
      console.log()
      console.log(`     ${ansis.green('1.')} ${ansis.cyan('ace-tool / ace-tool-rs')}: ${ansis.underline('https://augmentcode.com/')}`)
      console.log(`        ${ansis.gray(i18n.t('init:mcp.promptEnhancement'))}`)
      console.log()
      console.log(`     ${ansis.green('2.')} ${ansis.cyan('ace-tool ' + i18n.t('init:mcp.proxyService'))} ${ansis.yellow(`(${i18n.t('init:mcp.noSignup')})`)}: ${ansis.underline('https://acemcp.heroman.wtf/')}`)
      console.log(`        ${ansis.gray(i18n.t('init:mcp.communityProxy'))}`)
      console.log()
      console.log(`     ${ansis.green('3.')} ${ansis.cyan('ContextWeaver')} ${ansis.yellow(`(${i18n.t('init:mcp.freeQuota')})`)}: ${ansis.underline('https://siliconflow.cn/')}`)
      console.log(`        ${ansis.gray(i18n.t('init:mcp.localEngine'))}`)
      console.log()
    }

    console.log()
  }
  catch (error) {
    spinner.fail(ansis.red(i18n.t('init:installFailed')))
    console.error(error)
  }
}
