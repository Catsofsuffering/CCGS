import ansis from 'ansis'
import inquirer from 'inquirer'
import ora from 'ora'
import { exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'pathe'
import fs from 'fs-extra'
import { parse as parseTOML } from 'smol-toml'
import { version } from '../../package.json'
import { configMcp } from './config-mcp'
import { i18n } from '../i18n'
import { uninstallWorkflows } from '../utils/installer'
import { CANONICAL_NAMESPACE, CANONICAL_PACKAGE_NAME, DEPRECATED_PACKAGE_NAMES, getCanonicalGlobalUninstallCommand, getCanonicalNpxCommand } from '../utils/identity'
import { getConfigPath, getDefaultInstallDir, readCcgConfig, writeCcgConfig } from '../utils/config'
import { init } from './init'
import { update } from './update'
import { isWindows } from '../utils/platform'

const execAsync = promisify(exec)

// ═══════════════════════════════════════════════════════
// UI Helpers
// ═══════════════════════════════════════════════════════

/**
 * Get visual display width of a string (CJK = 2, ASCII = 1)
 */
function visWidth(s: string): number {
  const stripped = s.replace(/\x1B\[[0-9;]*m/g, '')
  let w = 0
  for (const ch of stripped) {
    const code = ch.codePointAt(0) || 0
    // CJK Unified Ideographs + common fullwidth ranges
    if (
      (code >= 0x2E80 && code <= 0x9FFF)
      || (code >= 0xF900 && code <= 0xFAFF)
      || (code >= 0xFE30 && code <= 0xFE4F)
      || (code >= 0xFF00 && code <= 0xFF60)
      || (code >= 0xFFE0 && code <= 0xFFE6)
      || (code >= 0x1F300 && code <= 0x1F9FF) // Emojis
      || (code >= 0x20000 && code <= 0x2FA1F) // CJK Extension B+
    ) {
      w += 2
    }
    else {
      w += 1
    }
  }
  return w
}

/**
 * Pad a string to a fixed visible width (ANSI + CJK aware)
 */
function pad(s: string, w: number): string {
  const diff = w - visWidth(s)
  return diff > 0 ? s + ' '.repeat(diff) : s
}

const INNER_W = 60

/**
 * Center a string (with ANSI) inside a fixed-width area
 */
function centerLine(s: string, w: number): string {
  const vis = visWidth(s)
  const left = Math.max(0, Math.floor((w - vis) / 2))
  const right = Math.max(0, w - vis - left)
  return ' '.repeat(left) + s + ' '.repeat(right)
}

/**
 * Draw a boxed row: ║ <content padded to INNER_W> ║
 */
function boxRow(content: string): string {
  const vis = visWidth(content)
  const gap = Math.max(0, INNER_W - vis)
  return ansis.cyan('║') + content + ' '.repeat(gap) + ansis.cyan('║')
}

function drawHeader(statusParts: string[]): void {
  const top = ansis.cyan('╔' + '═'.repeat(INNER_W) + '╗')
  const bot = ansis.cyan('╚' + '═'.repeat(INNER_W) + '╝')
  const empty = boxRow(' '.repeat(INNER_W))

  console.log()
  console.log(top)
  console.log(empty)
  console.log(boxRow(centerLine(ansis.bold.white('CCSM'), INNER_W)))
  console.log(empty)
  console.log(boxRow(centerLine(ansis.gray('Codex Orchestrates, Claude Executes'), INNER_W)))
  console.log(boxRow(centerLine(ansis.gray('Primary Workflow Owner: Codex'), INNER_W)))
  console.log(empty)
  if (statusParts.length > 0) {
    const statusLine = statusParts.join(ansis.gray('  |  '))
    console.log(boxRow(centerLine(statusLine, INNER_W)))
    console.log(empty)
  }
  console.log(bot)
  console.log()
}

function groupSep(label: string): InstanceType<typeof inquirer.Separator> {
  const w = 42
  const labelW = visWidth(label)
  const remaining = Math.max(0, w - labelW - 2)
  const left = Math.floor(remaining / 2)
  const right = remaining - left
  return new inquirer.Separator(ansis.gray(`${'─'.repeat(left)} ${label} ${'─'.repeat(right)}`))
}

// ═══════════════════════════════════════════════════════
// Main Menu
// ═══════════════════════════════════════════════════════

export async function showMainMenu(): Promise<void> {
  while (true) {
    // Read config for status display
    const config = await readCcgConfig()
    const cmdCount = config?.workflows?.installed?.length || 0
    const lang = config?.general?.language || 'zh-CN'
    const mcpProvider = config?.mcp?.provider || '—'

    // Build status parts
    const statusParts = [
      ansis.green(`v${version}`),
      ansis.white(`${cmdCount} commands`),
      ansis.yellow(lang),
    ]
    if (mcpProvider && mcpProvider !== '—' && mcpProvider !== 'skip') {
      statusParts.push(ansis.magenta(mcpProvider))
    }

    drawHeader(statusParts)

    const isZh = lang === 'zh-CN'

    // Build menu item helper: "  N. Label  - description"
    const item = (key: string, label: string, desc: string) => ({
      name: `  ${ansis.green(key + '.')} ${pad(label, 20)} ${ansis.gray('- ' + desc)}`,
      value: key,
    })

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: i18n.t('menu:title'),
      pageSize: 20,
      choices: [
        groupSep(isZh ? 'Claude Code' : 'Claude Code'),
        item('1', i18n.t('menu:options.init'), isZh ? '安装 CCSM 工作流' : 'Install CCSM workflows'),
        item('2', i18n.t('menu:options.update'), isZh ? '更新到最新版本' : 'Update to latest version'),
        item('3', i18n.t('menu:options.configMcp'), isZh ? '代码检索 MCP 工具' : 'Code retrieval MCP tool'),
        item('4', i18n.t('menu:options.configApi'), isZh ? '自定义 API 端点' : 'Custom API endpoint'),
        item('5', i18n.t('menu:options.configStyle'), isZh ? '选择输出人格' : 'Choose output personality'),
        item('6', i18n.t('menu:options.configModel'), isZh ? '前端/后端模型切换' : 'Switch frontend/backend models'),

        groupSep(isZh ? '其他工具' : 'Tools'),
        item('T', i18n.t('menu:options.tools'), 'ccusage, CCometixLine'),
        item('C', i18n.t('menu:options.installClaude'), isZh ? '安装/重装 CLI' : 'Install/reinstall CLI'),

        groupSep('CCSM'),
        item('H', i18n.t('menu:options.help'), isZh ? '查看全部斜杠命令' : 'View all slash commands'),
        item('-', i18n.t('menu:options.uninstall'), isZh ? '移除 CCSM 配置' : 'Remove CCSM config'),

        new inquirer.Separator(ansis.gray('─'.repeat(42))),
        { name: `  ${ansis.red('Q.')} ${i18n.t('menu:options.exit')}`, value: 'Q' },
      ],
    }])

    switch (action) {
      case '1':
        await init()
        break
      case '2':
        await update()
        break
      case '3':
        await configMcp()
        break
      case '4':
        await configApi()
        break
      case '5':
        await configOutputStyle()
        break
      case '6':
        await configModelRouting()
        break
      case 'T':
        await handleTools()
        break
      case 'C':
        await handleInstallClaude()
        break
      case '-':
        await uninstall()
        break
      case 'H':
        showHelp()
        break
      case 'Q':
        console.log()
        console.log(ansis.gray(`  ${i18n.t('common:goodbye')}`))
        console.log()
        return
    }

    // Pause after action so user can see results
    console.log()
    await inquirer.prompt([{
      type: 'input',
      name: 'continue',
      message: ansis.gray(i18n.t('common:pressEnterToReturn')),
    }])
  }
}

// (visWidth and pad are defined in UI Helpers section above)

// ═══════════════════════════════════════════════════════
// Help
// ═══════════════════════════════════════════════════════

function showHelp(): void {
  const config = readCcgConfigSync()
  const isZh = (config?.general?.language || 'zh-CN') === 'zh-CN'

  console.log()
  console.log(ansis.cyan.bold(`  ${i18n.t('menu:help.title')}`))
  console.log()

  const col1 = 22 // command column width
  const section = (title: string) => console.log(ansis.yellow.bold(`  ${title}`))
  const cmd = (name: string, desc: string) => console.log(`  ${ansis.green(name.padEnd(col1))} ${ansis.gray(desc)}`)

  // Development Workflows
  section(i18n.t('menu:help.sections.devWorkflow'))
  cmd(`/${CANONICAL_NAMESPACE}:context`, isZh ? '项目上下文管理' : 'Project context management')
  cmd(`/${CANONICAL_NAMESPACE}:enhance`, isZh ? 'Prompt 增强' : 'Prompt enhancement')
  console.log()

  // Agent Teams
  section(isZh ? 'Agent Teams 并行实施:' : 'Agent Teams Parallel:')
  cmd(`/${CANONICAL_NAMESPACE}:team-plan`, isZh ? '约束 → 并行计划' : 'Constraints → Parallel plan')
  cmd(`/${CANONICAL_NAMESPACE}:team-exec`, isZh ? '并行实施' : 'Parallel execution')
  cmd(`/${CANONICAL_NAMESPACE}:team-review`, isZh ? '双模型审查' : 'Dual-model review')
  console.log()

  // OpenSpec Workflows
  section(i18n.t('menu:help.sections.opsx'))
  cmd(`/${CANONICAL_NAMESPACE}:spec-init`, i18n.t('menu:help.descriptions.specInit'))
  cmd(`/${CANONICAL_NAMESPACE}:spec-research`, i18n.t('menu:help.descriptions.specResearch'))
  cmd(`/${CANONICAL_NAMESPACE}:spec-plan`, isZh ? 'Codex 收敛 proposal 并生成执行交接契约' : 'Codex refines proposal and creates the execution handoff')
  cmd(`/${CANONICAL_NAMESPACE}:spec-impl`, isZh ? 'Codex 调度 Claude 执行并决定验收/归档' : 'Codex dispatches Claude execution and decides acceptance/archive')
  cmd(`/${CANONICAL_NAMESPACE}:spec-review`, isZh ? 'Codex 最终验收门禁' : 'Codex final acceptance gate')
  console.log()

  // Git Tools
  section(i18n.t('menu:help.sections.gitTools'))
  cmd(`/${CANONICAL_NAMESPACE}:commit`, i18n.t('menu:help.descriptions.commit'))
  cmd(`/${CANONICAL_NAMESPACE}:rollback`, i18n.t('menu:help.descriptions.rollback'))
  cmd(`/${CANONICAL_NAMESPACE}:clean-branches`, i18n.t('menu:help.descriptions.cleanBranches'))
  cmd(`/${CANONICAL_NAMESPACE}:worktree`, i18n.t('menu:help.descriptions.worktree'))
  console.log()

  // Project Init
  section(i18n.t('menu:help.sections.projectMgmt'))
  cmd(`/${CANONICAL_NAMESPACE}:init`, i18n.t('menu:help.descriptions.init'))
  cmd(`/${CANONICAL_NAMESPACE}:enhance`, isZh ? 'Prompt 增强' : 'Prompt enhancement')
  console.log()

  console.log(ansis.gray(`  ${i18n.t('menu:help.hint')}`))
  console.log()
}

/**
 * Synchronous config read for non-async contexts (help display)
 */
function readCcgConfigSync(): any {
  try {
    const configPath = getConfigPath()
    if (fs.pathExistsSync(configPath)) {
      return parseTOML(fs.readFileSync(configPath, 'utf-8'))
    }
  }
  catch { /* ignore */ }
  return null
}

// ═══════════════════════════════════════════════════════
// API Configuration
// ═══════════════════════════════════════════════════════

async function configApi(): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold(`  ${i18n.t('menu:api.title')}`))
  console.log()

  const settingsPath = join(homedir(), '.claude', 'settings.json')
  let settings: Record<string, any> = {}

  if (await fs.pathExists(settingsPath)) {
    settings = await fs.readJson(settingsPath)
  }

  // Show current config
  const currentUrl = settings.env?.ANTHROPIC_BASE_URL
  const currentKey = settings.env?.ANTHROPIC_AUTH_TOKEN || settings.env?.ANTHROPIC_API_KEY
  if (currentUrl || currentKey) {
    console.log(ansis.gray(`  ${i18n.t('menu:api.currentConfig')}`))
    if (currentUrl)
      console.log(ansis.gray(`    URL: ${currentUrl}`))
    if (currentKey)
      console.log(ansis.gray(`    Key: ${currentKey.slice(0, 8)}...${currentKey.slice(-4)}`))
    console.log()
  }

  const { apiProvider } = await inquirer.prompt([{
    type: 'list',
    name: 'apiProvider',
    message: i18n.t('menu:api.providerPrompt'),
    choices: [
      { name: `${ansis.green('●')} ${i18n.t('menu:api.officialOption')}`, value: 'official' },
      { name: `${ansis.cyan('●')} ${i18n.t('menu:api.thirdPartyOption')}`, value: 'thirdparty' },
      { name: ansis.gray(`○ ${i18n.t('menu:api.sponsorSlot')}`), value: 'sponsor', disabled: i18n.t('menu:api.sponsorDisabled') },
    ],
  }])

  if (apiProvider === 'official') {
    // Clear third-party config, let Claude Code use official auth
    if (!settings.env)
      settings.env = {}
    delete settings.env.ANTHROPIC_BASE_URL
    delete settings.env.ANTHROPIC_AUTH_TOKEN
    delete settings.env.ANTHROPIC_API_KEY
  }
  else {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: `API URL ${ansis.gray(`(${i18n.t('menu:api.urlRequired')})`)}`,
        default: currentUrl || '',
        validate: (v: string) => v.trim() !== '' || i18n.t('menu:api.enterUrl'),
      },
      {
        type: 'password',
        name: 'key',
        message: `API Key ${ansis.gray(`(${i18n.t('menu:api.keyRequired')})`)}`,
        mask: '*',
        validate: (v: string) => v.trim() !== '' || i18n.t('menu:api.enterKey'),
      },
    ])

    if (!settings.env)
      settings.env = {}
    settings.env.ANTHROPIC_BASE_URL = answers.url.trim()
    settings.env.ANTHROPIC_AUTH_TOKEN = answers.key.trim()
    delete settings.env.ANTHROPIC_API_KEY
  }

  // Default optimization config
  settings.env.DISABLE_TELEMETRY = '1'
  settings.env.DISABLE_ERROR_REPORTING = '1'
  settings.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = '1'
  settings.env.CLAUDE_CODE_ATTRIBUTION_HEADER = '0'
  settings.env.MCP_TIMEOUT = '60000'

  await fs.ensureDir(join(homedir(), '.claude'))
  await fs.writeJson(settingsPath, settings, { spaces: 2 })

  console.log()
  console.log(ansis.green(`  ✓ ${i18n.t('menu:api.saved')}`))
  console.log(ansis.gray(`    ${i18n.t('common:configFile')}: ${settingsPath}`))
}

// ═══════════════════════════════════════════════════════
// Output Style Configuration
// ═══════════════════════════════════════════════════════

const OUTPUT_STYLES = [
  { id: 'default', nameKey: 'menu:style.default', descKey: 'menu:style.defaultDesc' },
  { id: 'engineer-professional', nameKey: 'menu:style.engineerPro', descKey: 'menu:style.engineerProDesc' },
  { id: 'nekomata-engineer', nameKey: 'menu:style.nekomata', descKey: 'menu:style.nekomataDesc' },
  { id: 'laowang-engineer', nameKey: 'menu:style.laowang', descKey: 'menu:style.laowangDesc' },
  { id: 'ojousama-engineer', nameKey: 'menu:style.ojousama', descKey: 'menu:style.ojousamaDesc' },
  { id: 'abyss-cultivator', nameKey: 'menu:style.abyss', descKey: 'menu:style.abyssDesc' },
  { id: 'abyss-concise', nameKey: 'menu:style.abyssConcise', descKey: 'menu:style.abyssConciseDesc' },
  { id: 'abyss-command', nameKey: 'menu:style.abyssCommand', descKey: 'menu:style.abyssCommandDesc' },
  { id: 'abyss-ritual', nameKey: 'menu:style.abyssRitual', descKey: 'menu:style.abyssRitualDesc' },
]

// ═══════════════════════════════════════════════════════
// Model Routing Configuration
// ═══════════════════════════════════════════════════════

async function configModelRouting(): Promise<void> {
  const config = await readCcgConfig()
  const isZh = (config?.general?.language || 'zh-CN') === 'zh-CN'

  console.log()
  console.log(ansis.cyan.bold(`  ${i18n.t('init:model.title')}`))
  console.log()

  // Show current routing
  const currentFrontend = config?.routing?.frontend?.primary || 'codex'
  const currentBackend = config?.routing?.backend?.primary || 'codex'

  console.log(ansis.gray(`  ${i18n.t('init:model.currentRouting')}:`))
  console.log(`  ${ansis.cyan('Frontend:')} ${ansis.green(currentFrontend)}`)
  console.log(`  ${ansis.cyan('Backend:')}  ${ansis.blue(currentBackend)}`)
  console.log()

  // Frontend model selection
  const { selectedFrontend } = await inquirer.prompt([{
    type: 'list',
    name: 'selectedFrontend',
    message: i18n.t('init:model.selectFrontend'),
    choices: [
      { name: `Codex ${ansis.green(`(${i18n.t('init:model.recommended')})`)}`, value: 'codex' },
      { name: 'Claude', value: 'claude' },
    ],
    default: currentFrontend,
  }])

  // Backend model selection
  const { selectedBackend } = await inquirer.prompt([{
    type: 'list',
    name: 'selectedBackend',
    message: i18n.t('init:model.selectBackend'),
    choices: [
      { name: `Codex ${ansis.green(`(${i18n.t('init:model.recommended')})`)}`, value: 'codex' },
      { name: 'Claude', value: 'claude' },
    ],
    default: currentBackend,
  }])

  // Check if anything changed
  if (selectedFrontend === currentFrontend && selectedBackend === currentBackend) {
    console.log(ansis.gray(`  ${i18n.t('common:configNotModified')}`))
    return
  }

  // Update config.toml
  if (config) {
    config.routing.frontend = {
      models: [selectedFrontend as any],
      primary: selectedFrontend as any,
      strategy: 'fallback',
    }
    config.routing.backend = {
      models: [selectedBackend as any],
      primary: selectedBackend as any,
      strategy: 'fallback',
    }
    config.routing.review = {
      models: [...new Set([selectedFrontend, selectedBackend])] as any,
      strategy: 'parallel',
    }
    await writeCcgConfig(config)
  }

  console.log()
  console.log(ansis.green(`  ✓ ${i18n.t('init:model.routingUpdated')}`))

  // Reinstall templates with new config
  const spinner = ora(i18n.t('init:model.reinstalling')).start()
  try {
    const { execSync } = await import('node:child_process')
    execSync(getCanonicalNpxCommand(['init', '--force', '--skip-prompt', '--skip-mcp']), {
      timeout: 300000,
      stdio: 'pipe',
      env: { ...process.env, CCG_UPDATE_MODE: 'true' },
    })
    spinner.succeed(i18n.t('init:model.reinstallDone'))
  }
  catch {
    spinner.fail(i18n.t('init:model.reinstallFailed'))
  }

  console.log(ansis.gray(`  ${i18n.t('common:restartToApply')}`))
}

async function configOutputStyle(): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold(`  ${i18n.t('menu:style.title')}`))
  console.log()

  const settingsPath = join(homedir(), '.claude', 'settings.json')
  let settings: Record<string, any> = {}
  if (await fs.pathExists(settingsPath)) {
    settings = await fs.readJson(settingsPath)
  }

  const currentStyle = settings.outputStyle || 'default'
  console.log(ansis.gray(`  ${i18n.t('menu:style.currentStyle')}: ${currentStyle}`))
  console.log()

  const { style } = await inquirer.prompt([{
    type: 'list',
    name: 'style',
    message: i18n.t('menu:style.selectStyle'),
    choices: OUTPUT_STYLES.map(s => ({
      name: `${i18n.t(s.nameKey)} ${ansis.gray(`- ${i18n.t(s.descKey)}`)}`,
      value: s.id,
    })),
    default: currentStyle,
  }])

  if (style === currentStyle) {
    console.log(ansis.gray(i18n.t('menu:style.notChanged')))
    return
  }

  // Copy style file if not default
  if (style !== 'default') {
    const outputStylesDir = join(homedir(), '.claude', 'output-styles')
    await fs.ensureDir(outputStylesDir)

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    let pkgRoot = dirname(dirname(__dirname))
    if (!await fs.pathExists(join(pkgRoot, 'templates'))) {
      pkgRoot = dirname(pkgRoot)
    }
    const templatePath = join(pkgRoot, 'templates', 'output-styles', `${style}.md`)
    const destPath = join(outputStylesDir, `${style}.md`)

    if (await fs.pathExists(templatePath)) {
      await fs.copy(templatePath, destPath)
      console.log(ansis.green(`  ✓ ${i18n.t('menu:style.installed', { style })}`))
    }
  }

  // Update settings.json
  if (style === 'default') {
    delete settings.outputStyle
  }
  else {
    settings.outputStyle = style
  }

  await fs.writeJson(settingsPath, settings, { spaces: 2 })

  console.log()
  console.log(ansis.green(`  ✓ ${i18n.t('menu:style.set', { style })}`))
  console.log(ansis.gray(`    ${i18n.t('common:restartToApply')}`))
}

// ═══════════════════════════════════════════════════════
// Install Claude Code
// ═══════════════════════════════════════════════════════

async function handleInstallClaude(): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold(`  ${i18n.t('menu:claude.title')}`))
  console.log()

  // Check if already installed
  let isInstalled = false
  try {
    await execAsync('claude --version', { timeout: 5000 })
    isInstalled = true
  }
  catch {
    isInstalled = false
  }

  if (isInstalled) {
    console.log(ansis.yellow(`  ⚠ ${i18n.t('menu:claude.alreadyInstalled')}`))
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: i18n.t('menu:claude.reinstallPrompt'),
      default: false,
    }])

    if (!confirm) {
      console.log(ansis.gray(`  ${i18n.t('common:cancelled')}`))
      return
    }

    // Uninstall
    console.log()
    console.log(ansis.yellow(`  ⏳ ${i18n.t('menu:claude.uninstalling')}`))
    try {
      const uninstallCmd = isWindows() ? 'npm uninstall -g @anthropic-ai/claude-code' : 'sudo npm uninstall -g @anthropic-ai/claude-code'
      await execAsync(uninstallCmd, { timeout: 60000 })
      console.log(ansis.green(`  ✓ ${i18n.t('menu:claude.uninstallSuccess')}`))
    }
    catch (e) {
      console.log(ansis.red(`  ✗ ${i18n.t('menu:claude.uninstallFailed', { error: String(e) })}`))
      return
    }
  }

  // Select installation method
  const isMac = process.platform === 'darwin'
  const isLinux = process.platform === 'linux'

  const { method } = await inquirer.prompt([{
    type: 'list',
    name: 'method',
    message: i18n.t('menu:claude.selectMethod'),
    choices: [
      { name: `npm ${ansis.green('(⭐)')} ${ansis.gray('- npm install -g')}`, value: 'npm' },
      ...((isMac || isLinux) ? [{ name: `homebrew ${ansis.gray('- brew install')}`, value: 'homebrew' }] : []),
      ...((isMac || isLinux) ? [{ name: `curl ${ansis.gray('- official script')}`, value: 'curl' }] : []),
      ...(isWindows() ? [
        { name: `powershell ${ansis.gray('- Windows official')}`, value: 'powershell' },
        { name: `cmd ${ansis.gray('- Command Prompt')}`, value: 'cmd' },
      ] : []),
      new inquirer.Separator(),
      { name: `${ansis.gray(i18n.t('common:cancel'))}`, value: 'cancel' },
    ],
  }])

  if (method === 'cancel')
    return

  console.log()
  console.log(ansis.yellow(`  ⏳ ${i18n.t('menu:claude.installing')}`))

  try {
    if (method === 'npm') {
      const installCmd = isWindows() ? 'npm install -g @anthropic-ai/claude-code' : 'sudo npm install -g @anthropic-ai/claude-code'
      await execAsync(installCmd, { timeout: 300000 })
    }
    else if (method === 'homebrew') {
      await execAsync('brew install --cask claude-code', { timeout: 300000 })
    }
    else if (method === 'curl') {
      await execAsync('curl -fsSL https://claude.ai/install.sh | bash', { timeout: 300000 })
    }
    else if (method === 'powershell') {
      await execAsync('powershell -Command "irm https://claude.ai/install.ps1 | iex"', { timeout: 300000 })
    }
    else if (method === 'cmd') {
      await execAsync('cmd /c "curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd"', { timeout: 300000 })
    }

    console.log(ansis.green(`  ✓ ${i18n.t('menu:claude.installSuccess')}`))
    console.log()
    console.log(ansis.cyan(`  💡 ${i18n.t('menu:claude.runHint')}`))
  }
  catch (e) {
    console.log(ansis.red(`  ✗ ${i18n.t('menu:claude.installFailed', { error: String(e) })}`))
  }
}

// ═══════════════════════════════════════════════════════
// Uninstall
// ═══════════════════════════════════════════════════════

/**
 * Check if CCSM or a deprecated package name is installed globally via npm
 */
async function checkIfGlobalInstall(): Promise<boolean> {
  for (const packageName of [CANONICAL_PACKAGE_NAME, ...DEPRECATED_PACKAGE_NAMES]) {
    try {
      const { stdout } = await execAsync(`npm list -g ${packageName} --depth=0`, { timeout: 5000 })
      if (stdout.includes(`${packageName}@`)) {
        return true
      }
    }
    catch {
      continue
    }
  }

  return false
}

async function uninstall(): Promise<void> {
  console.log()

  // Check if installed globally via npm
  const isGlobalInstall = await checkIfGlobalInstall()

  if (isGlobalInstall) {
    console.log(ansis.yellow(`  ⚠️  ${i18n.t('menu:uninstall.globalDetected')}`))
    console.log()
    console.log(`  ${i18n.t('menu:uninstall.twoSteps')}`)
    console.log(`    ${ansis.cyan(`1. ${i18n.t('menu:uninstall.step1')}`)} ${ansis.gray(`(${i18n.t('menu:uninstall.step1Hint')})`)}`)
    console.log(`    ${ansis.cyan(`2. ${i18n.t('menu:uninstall.step2')}`)} ${ansis.gray(`(${i18n.t('menu:uninstall.step2Hint')})`)}`)
    console.log()
  }

  // Confirm uninstall
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: isGlobalInstall ? i18n.t('menu:uninstall.continuePrompt') : i18n.t('menu:uninstall.confirm'),
    default: false,
  }])

  if (!confirm) {
    console.log(ansis.gray(`  ${i18n.t('menu:uninstall.cancelled')}`))
    return
  }

  console.log()
  console.log(ansis.yellow(`  ${i18n.t('menu:uninstall.uninstalling')}`))

  // Uninstall workflows
  const installDir = getDefaultInstallDir()
  const result = await uninstallWorkflows(installDir)

  if (result.success) {
    console.log(ansis.green(`  ✅ ${i18n.t('menu:uninstall.success')}`))

    if (result.removedCommands.length > 0) {
      console.log()
      console.log(ansis.cyan(`  ${i18n.t('menu:uninstall.removedCommands')}`))
      for (const cmd of result.removedCommands) {
        console.log(`    ${ansis.gray('•')} /${CANONICAL_NAMESPACE}:${cmd}`)
      }
    }

    if (result.removedAgents.length > 0) {
      console.log()
      console.log(ansis.cyan(`  ${i18n.t('menu:uninstall.removedAgents')}`))
      for (const agent of result.removedAgents) {
        console.log(`    ${ansis.gray('•')} ${agent}`)
      }
    }

    if (result.removedSkills.length > 0) {
      console.log()
      console.log(ansis.cyan(`  ${i18n.t('menu:uninstall.removedSkills')}`))
      console.log(`    ${ansis.gray('•')} multi-model-collaboration`)
    }

    // If globally installed, show instructions to uninstall npm package
    if (isGlobalInstall) {
      console.log()
      console.log(ansis.yellow.bold(`  🔸 ${i18n.t('menu:uninstall.lastStep')}`))
      console.log()
      console.log(`  ${i18n.t('menu:uninstall.runInNewTerminal')}`)
      console.log()
      console.log(ansis.cyan.bold(`    ${getCanonicalGlobalUninstallCommand()}`))
      console.log()
      console.log(ansis.gray(`  (${i18n.t('menu:uninstall.afterDone')})`))
    }
  }
  else {
    console.log(ansis.red(`  ${i18n.t('menu:uninstall.failed')}`))
    for (const error of result.errors) {
      console.log(ansis.red(`    ${error}`))
    }
  }

  console.log()
}

// ═══════════════════════════════════════════════════════
// Tools
// ═══════════════════════════════════════════════════════

async function handleTools(): Promise<void> {
  console.log()

  const { tool } = await inquirer.prompt([{
    type: 'list',
    name: 'tool',
    message: i18n.t('menu:tools.title'),
    choices: [
      { name: `${ansis.green('📊')} ccusage        ${ansis.gray(`${i18n.t('menu:tools.ccusage')}`)}`, value: 'ccusage' },
      { name: `${ansis.blue('📟')} CCometixLine   ${ansis.gray(`${i18n.t('menu:tools.ccline')}`)}`, value: 'ccline' },
      new inquirer.Separator(),
      { name: `${ansis.gray(`← ${i18n.t('common:back')}`)}`, value: 'cancel' },
    ],
  }])

  if (tool === 'cancel')
    return

  if (tool === 'ccusage') {
    await runCcusage()
  }
  else if (tool === 'ccline') {
    await handleCCometixLine()
  }
}

async function runCcusage(): Promise<void> {
  console.log()
  console.log(ansis.cyan(`  📊 ${i18n.t('menu:tools.runningCcusage')}`))
  console.log(ansis.gray('  $ npx ccusage@latest'))
  console.log()

  return new Promise((resolve) => {
    const child = spawn('npx', ['ccusage@latest'], {
      stdio: 'inherit',
      shell: true,
    })
    child.on('close', () => resolve())
    child.on('error', () => resolve())
  })
}

async function handleCCometixLine(): Promise<void> {
  console.log()

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: i18n.t('menu:tools.cclineAction'),
    choices: [
      { name: `${ansis.green('➜')} ${i18n.t('menu:tools.cclineInstall')}`, value: 'install' },
      { name: `${ansis.red('✕')} ${i18n.t('menu:tools.cclineUninstall')}`, value: 'uninstall' },
      new inquirer.Separator(),
      { name: `${ansis.gray(`← ${i18n.t('common:back')}`)}`, value: 'cancel' },
    ],
  }])

  if (action === 'cancel')
    return

  if (action === 'install') {
    await installCCometixLine()
  }
  else if (action === 'uninstall') {
    await uninstallCCometixLine()
  }
}

async function installCCometixLine(): Promise<void> {
  console.log()
  console.log(ansis.yellow(`  ⏳ ${i18n.t('menu:tools.cclineInstalling')}`))

  try {
    const installCmd = isWindows() ? 'npm install -g @cometix/ccline' : 'sudo npm install -g @cometix/ccline'
    await execAsync(installCmd, { timeout: 120000 })
    console.log(ansis.green(`  ✓ ${i18n.t('menu:tools.cclineInstallSuccess')}`))

    const settingsPath = join(homedir(), '.claude', 'settings.json')
    let settings: Record<string, any> = {}

    if (await fs.pathExists(settingsPath)) {
      settings = await fs.readJson(settingsPath)
    }

    settings.statusLine = {
      type: 'command',
      command: isWindows()
        ? '~/.claude/ccline/ccline.exe'
        : '~/.claude/ccline/ccline',
      padding: 0,
    }

    await fs.ensureDir(join(homedir(), '.claude'))
    await fs.writeJson(settingsPath, settings, { spaces: 2 })
    console.log(ansis.green(`  ✓ ${i18n.t('menu:tools.cclineConfigured')}`))

    console.log()
    console.log(ansis.cyan(`  💡 ${i18n.t('common:restartToApply')}`))
  }
  catch (error) {
    console.log(ansis.red(`  ✗ ${i18n.t('menu:tools.cclineInstallFailed', { error: String(error) })}`))
  }
}

async function uninstallCCometixLine(): Promise<void> {
  console.log()
  console.log(ansis.yellow(`  ⏳ ${i18n.t('menu:tools.cclineUninstalling')}`))

  try {
    const settingsPath = join(homedir(), '.claude', 'settings.json')
    if (await fs.pathExists(settingsPath)) {
      const settings = await fs.readJson(settingsPath)
      delete settings.statusLine
      await fs.writeJson(settingsPath, settings, { spaces: 2 })
      console.log(ansis.green(`  ✓ ${i18n.t('menu:tools.cclineConfigRemoved')}`))
    }

    const uninstallCmd = isWindows() ? 'npm uninstall -g @cometix/ccline' : 'sudo npm uninstall -g @cometix/ccline'
    await execAsync(uninstallCmd, { timeout: 60000 })
    console.log(ansis.green(`  ✓ ${i18n.t('menu:tools.cclineUninstalled')}`))
  }
  catch (error) {
    console.log(ansis.red(`  ✗ ${i18n.t('menu:tools.cclineUninstallFailed', { error: String(error) })}`))
  }
}
