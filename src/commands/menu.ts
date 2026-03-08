import ansis from 'ansis'
import inquirer from 'inquirer'
import { exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'pathe'
import fs from 'fs-extra'
import { configMcp } from './config-mcp'
import { i18n } from '../i18n'
import { uninstallWorkflows } from '../utils/installer'
import { init } from './init'
import { update } from './update'
import { isWindows } from '../utils/platform'

const execAsync = promisify(exec)

export async function showMainMenu(): Promise<void> {
  while (true) {
    console.log()
    console.log(ansis.cyan.bold(`  CCG - Claude + Codex + Gemini`))
    console.log(ansis.gray('  Multi-Model Collaboration System'))
    console.log()

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: i18n.t('menu:title'),
      choices: [
        { name: `${ansis.green('➜')} ${i18n.t('menu:options.init')}`, value: 'init' },
        { name: `${ansis.blue('➜')} ${i18n.t('menu:options.update')}`, value: 'update' },
        { name: `${ansis.cyan('⚙')} ${i18n.t('menu:options.configMcp')}`, value: 'config-mcp' },
        { name: `${ansis.cyan('🔑')} ${i18n.t('menu:options.configApi')}`, value: 'config-api' },
        { name: `${ansis.magenta('🎭')} ${i18n.t('menu:options.configStyle')}`, value: 'config-style' },
        { name: `${ansis.yellow('🔧')} ${i18n.t('menu:options.tools')}`, value: 'tools' },
        { name: `${ansis.blue('📦')} ${i18n.t('menu:options.installClaude')}`, value: 'install-claude' },
        { name: `${ansis.magenta('➜')} ${i18n.t('menu:options.uninstall')}`, value: 'uninstall' },
        { name: `${ansis.yellow('?')} ${i18n.t('menu:options.help')}`, value: 'help' },
        new inquirer.Separator(),
        { name: `${ansis.red('✕')} ${i18n.t('menu:options.exit')}`, value: 'exit' },
      ],
    }])

    switch (action) {
      case 'init':
        await init()
        break
      case 'update':
        await update()
        break
      case 'config-mcp':
        await configMcp()
        break
      case 'config-api':
        await configApi()
        break
      case 'config-style':
        await configOutputStyle()
        break
      case 'tools':
        await handleTools()
        break
      case 'install-claude':
        await handleInstallClaude()
        break
      case 'uninstall':
        await uninstall()
        break
      case 'help':
        showHelp()
        break
      case 'exit':
        console.log(ansis.gray(i18n.t('common:goodbye')))
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

function showHelp(): void {
  console.log()
  console.log(ansis.cyan.bold(i18n.t('menu:help.title')))
  console.log()

  // Development Workflows
  console.log(ansis.yellow.bold(`  ${i18n.t('menu:help.sections.devWorkflow')}`))
  console.log(`  ${ansis.green('/ccg:workflow')}    ${i18n.t('menu:help.descriptions.workflow')}`)
  console.log(`  ${ansis.green('/ccg:plan')}        ${i18n.t('menu:help.descriptions.plan')}`)
  console.log(`  ${ansis.green('/ccg:execute')}     ${i18n.t('menu:help.descriptions.execute')}`)
  console.log(`  ${ansis.green('/ccg:frontend')}    ${i18n.t('menu:help.descriptions.frontend')}`)
  console.log(`  ${ansis.green('/ccg:backend')}     ${i18n.t('menu:help.descriptions.backend')}`)
  console.log(`  ${ansis.green('/ccg:feat')}        ${i18n.t('menu:help.descriptions.feat')}`)
  console.log(`  ${ansis.green('/ccg:analyze')}     ${i18n.t('menu:help.descriptions.analyze')}`)
  console.log(`  ${ansis.green('/ccg:debug')}       ${i18n.t('menu:help.descriptions.debug')}`)
  console.log(`  ${ansis.green('/ccg:optimize')}    ${i18n.t('menu:help.descriptions.optimize')}`)
  console.log(`  ${ansis.green('/ccg:test')}        ${i18n.t('menu:help.descriptions.test')}`)
  console.log(`  ${ansis.green('/ccg:review')}      ${i18n.t('menu:help.descriptions.review')}`)
  console.log()

  // OpenSpec Workflows
  console.log(ansis.yellow.bold(`  ${i18n.t('menu:help.sections.opsx')}`))
  console.log(`  ${ansis.green('/ccg:spec-init')}      ${i18n.t('menu:help.descriptions.specInit')}`)
  console.log(`  ${ansis.green('/ccg:spec-research')} ${i18n.t('menu:help.descriptions.specResearch')}`)
  console.log(`  ${ansis.green('/ccg:spec-plan')}     ${i18n.t('menu:help.descriptions.specPlan')}`)
  console.log(`  ${ansis.green('/ccg:spec-impl')}     ${i18n.t('menu:help.descriptions.specImpl')}`)
  console.log(`  ${ansis.green('/ccg:spec-review')}   ${i18n.t('menu:help.descriptions.specReview')}`)
  console.log()

  // Git Tools
  console.log(ansis.yellow.bold(`  ${i18n.t('menu:help.sections.gitTools')}`))
  console.log(`  ${ansis.green('/ccg:commit')}      ${i18n.t('menu:help.descriptions.commit')}`)
  console.log(`  ${ansis.green('/ccg:rollback')}    ${i18n.t('menu:help.descriptions.rollback')}`)
  console.log(`  ${ansis.green('/ccg:clean-branches')} ${i18n.t('menu:help.descriptions.cleanBranches')}`)
  console.log(`  ${ansis.green('/ccg:worktree')}    ${i18n.t('menu:help.descriptions.worktree')}`)
  console.log()

  // Project Init
  console.log(ansis.yellow.bold(`  ${i18n.t('menu:help.sections.projectMgmt')}`))
  console.log(`  ${ansis.green('/ccg:init')}        ${i18n.t('menu:help.descriptions.init')}`)
  console.log()

  console.log(ansis.gray(i18n.t('menu:help.hint')))
  console.log()
}

// ============ API Configuration ============

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
  const currentKey = settings.env?.ANTHROPIC_API_KEY || settings.env?.ANTHROPIC_AUTH_TOKEN
  if (currentUrl || currentKey) {
    console.log(ansis.gray(`  ${i18n.t('menu:api.currentConfig')}`))
    if (currentUrl)
      console.log(ansis.gray(`    URL: ${currentUrl}`))
    if (currentKey)
      console.log(ansis.gray(`    Key: ${currentKey.slice(0, 8)}...${currentKey.slice(-4)}`))
    console.log()
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: `${i18n.t('menu:api.urlPrompt')} ${ansis.gray(`(${i18n.t('menu:api.leaveEmptyOfficial')})`)}`,
      default: currentUrl || '',
    },
    {
      type: 'password',
      name: 'key',
      message: `${i18n.t('menu:api.keyPrompt')} ${ansis.gray(`(${i18n.t('menu:api.leaveEmptySkip')})`)}`,
      mask: '*',
    },
  ])

  if (!answers.url && !answers.key) {
    console.log(ansis.gray(i18n.t('common:configNotModified')))
    return
  }

  // Update settings
  if (!settings.env)
    settings.env = {}

  if (answers.url?.trim()) {
    settings.env.ANTHROPIC_BASE_URL = answers.url.trim()
  }

  if (answers.key?.trim()) {
    settings.env.ANTHROPIC_API_KEY = answers.key.trim()
    delete settings.env.ANTHROPIC_AUTH_TOKEN
  }

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

  await fs.ensureDir(join(homedir(), '.claude'))
  await fs.writeJson(settingsPath, settings, { spaces: 2 })

  console.log()
  console.log(ansis.green(`✓ ${i18n.t('menu:api.saved')}`))
  console.log(ansis.gray(`  ${i18n.t('common:configFile')}: ${settingsPath}`))
}

// ============ Output Style Configuration ============

const OUTPUT_STYLES = [
  { id: 'default', nameKey: 'menu:style.default', descKey: 'menu:style.defaultDesc' },
  { id: 'engineer-professional', nameKey: 'menu:style.engineerPro', descKey: 'menu:style.engineerProDesc' },
  { id: 'nekomata-engineer', nameKey: 'menu:style.nekomata', descKey: 'menu:style.nekomataDesc' },
  { id: 'laowang-engineer', nameKey: 'menu:style.laowang', descKey: 'menu:style.laowangDesc' },
  { id: 'ojousama-engineer', nameKey: 'menu:style.ojousama', descKey: 'menu:style.ojousamaDesc' },
  { id: 'abyss-cultivator', nameKey: 'menu:style.abyss', descKey: 'menu:style.abyssDesc' },
]

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
      console.log(ansis.green(`✓ ${i18n.t('menu:style.installed', { style })}`))
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
  console.log(ansis.green(`✓ ${i18n.t('menu:style.set', { style })}`))
  console.log(ansis.gray(`  ${i18n.t('common:restartToApply')}`))
}

// ============ Install Claude Code ============

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
    console.log(ansis.yellow(`⚠ ${i18n.t('menu:claude.alreadyInstalled')}`))
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: i18n.t('menu:claude.reinstallPrompt'),
      default: false,
    }])

    if (!confirm) {
      console.log(ansis.gray(i18n.t('common:cancelled')))
      return
    }

    // Uninstall
    console.log()
    console.log(ansis.yellow(`⏳ ${i18n.t('menu:claude.uninstalling')}`))
    try {
      const uninstallCmd = isWindows() ? 'npm uninstall -g @anthropic-ai/claude-code' : 'sudo npm uninstall -g @anthropic-ai/claude-code'
      await execAsync(uninstallCmd, { timeout: 60000 })
      console.log(ansis.green(`✓ ${i18n.t('menu:claude.uninstallSuccess')}`))
    }
    catch (e) {
      console.log(ansis.red(`✗ ${i18n.t('menu:claude.uninstallFailed', { error: String(e) })}`))
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
      { name: `npm ${ansis.green(`(${i18n.t('menu:claude.npmRecommended')})`)} ${ansis.gray('- npm install -g')}`, value: 'npm' },
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
  console.log(ansis.yellow(`⏳ ${i18n.t('menu:claude.installing')}`))

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

    console.log(ansis.green(`✓ ${i18n.t('menu:claude.installSuccess')}`))
    console.log()
    console.log(ansis.cyan(`💡 ${i18n.t('menu:claude.runHint')}`))
  }
  catch (e) {
    console.log(ansis.red(`✗ ${i18n.t('menu:claude.installFailed', { error: String(e) })}`))
  }
}

/**
 * Check if CCG is installed globally via npm
 */
async function checkIfGlobalInstall(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('npm list -g ccg-workflow --depth=0', { timeout: 5000 })
    return stdout.includes('ccg-workflow@')
  }
  catch {
    return false
  }
}

async function uninstall(): Promise<void> {
  console.log()

  // Check if installed globally via npm
  const isGlobalInstall = await checkIfGlobalInstall()

  if (isGlobalInstall) {
    console.log(ansis.yellow(`⚠️  ${i18n.t('menu:uninstall.globalDetected')}`))
    console.log()
    console.log(i18n.t('menu:uninstall.twoSteps'))
    console.log(`  ${ansis.cyan(`1. ${i18n.t('menu:uninstall.step1')}`)} (${i18n.t('menu:uninstall.step1Hint')})`)
    console.log(`  ${ansis.cyan(`2. ${i18n.t('menu:uninstall.step2')}`)} (${i18n.t('menu:uninstall.step2Hint')})`)
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
    console.log(ansis.gray(i18n.t('menu:uninstall.cancelled')))
    return
  }

  console.log()
  console.log(ansis.yellow(i18n.t('menu:uninstall.uninstalling')))

  // Uninstall workflows
  const installDir = join(homedir(), '.claude')
  const result = await uninstallWorkflows(installDir)

  if (result.success) {
    console.log(ansis.green(`✅ ${i18n.t('menu:uninstall.success')}`))

    if (result.removedCommands.length > 0) {
      console.log()
      console.log(ansis.cyan(i18n.t('menu:uninstall.removedCommands')))
      for (const cmd of result.removedCommands) {
        console.log(`  ${ansis.gray('•')} /ccg:${cmd}`)
      }
    }

    if (result.removedAgents.length > 0) {
      console.log()
      console.log(ansis.cyan(i18n.t('menu:uninstall.removedAgents')))
      for (const agent of result.removedAgents) {
        console.log(`  ${ansis.gray('•')} ${agent}`)
      }
    }

    if (result.removedSkills.length > 0) {
      console.log()
      console.log(ansis.cyan(i18n.t('menu:uninstall.removedSkills')))
      console.log(`  ${ansis.gray('•')} multi-model-collaboration`)
    }

    if (result.removedBin) {
      console.log()
      console.log(ansis.cyan(i18n.t('menu:uninstall.removedBin')))
      console.log(`  ${ansis.gray('•')} codeagent-wrapper`)
    }

    // If globally installed, show instructions to uninstall npm package
    if (isGlobalInstall) {
      console.log()
      console.log(ansis.yellow.bold(`🔸 ${i18n.t('menu:uninstall.lastStep')}`))
      console.log()
      console.log(i18n.t('menu:uninstall.runInNewTerminal'))
      console.log()
      console.log(ansis.cyan.bold('  npm uninstall -g ccg-workflow'))
      console.log()
      console.log(ansis.gray(`(${i18n.t('menu:uninstall.afterDone')})`))
    }
  }
  else {
    console.log(ansis.red(i18n.t('menu:uninstall.failed')))
    for (const error of result.errors) {
      console.log(ansis.red(`  ${error}`))
    }
  }

  console.log()
}

// ============ Tools ============

async function handleTools(): Promise<void> {
  console.log()

  const { tool } = await inquirer.prompt([{
    type: 'list',
    name: 'tool',
    message: i18n.t('menu:tools.title'),
    choices: [
      { name: `${ansis.green('📊')} ccusage ${ansis.gray(`- ${i18n.t('menu:tools.ccusage')}`)}`, value: 'ccusage' },
      { name: `${ansis.blue('📟')} CCometixLine ${ansis.gray(`- ${i18n.t('menu:tools.ccline')}`)}`, value: 'ccline' },
      new inquirer.Separator(),
      { name: `${ansis.gray(i18n.t('common:back'))}`, value: 'cancel' },
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
  console.log(ansis.cyan(`📊 ${i18n.t('menu:tools.runningCcusage')}`))
  console.log(ansis.gray('$ npx ccusage@latest'))
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
      { name: `${ansis.gray(i18n.t('common:back'))}`, value: 'cancel' },
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
  console.log(ansis.yellow(`⏳ ${i18n.t('menu:tools.cclineInstalling')}`))

  try {
    // 1. Install npm package globally
    const installCmd = isWindows() ? 'npm install -g @cometix/ccline' : 'sudo npm install -g @cometix/ccline'
    await execAsync(installCmd, { timeout: 120000 })
    console.log(ansis.green(`✓ ${i18n.t('menu:tools.cclineInstallSuccess')}`))

    // 2. Configure Claude Code statusLine
    const settingsPath = join(homedir(), '.claude', 'settings.json')
    let settings: Record<string, any> = {}

    if (await fs.pathExists(settingsPath)) {
      settings = await fs.readJson(settingsPath)
    }

    settings.statusLine = {
      type: 'command',
      command: isWindows()
        ? '%USERPROFILE%\\.claude\\ccline\\ccline.exe'
        : '~/.claude/ccline/ccline',
      padding: 0,
    }

    await fs.ensureDir(join(homedir(), '.claude'))
    await fs.writeJson(settingsPath, settings, { spaces: 2 })
    console.log(ansis.green(`✓ ${i18n.t('menu:tools.cclineConfigured')}`))

    console.log()
    console.log(ansis.cyan(`💡 ${i18n.t('common:restartToApply')}`))
  }
  catch (error) {
    console.log(ansis.red(`✗ ${i18n.t('menu:tools.cclineInstallFailed', { error: String(error) })}`))
  }
}

async function uninstallCCometixLine(): Promise<void> {
  console.log()
  console.log(ansis.yellow(`⏳ ${i18n.t('menu:tools.cclineUninstalling')}`))

  try {
    // 1. Remove statusLine config
    const settingsPath = join(homedir(), '.claude', 'settings.json')
    if (await fs.pathExists(settingsPath)) {
      const settings = await fs.readJson(settingsPath)
      delete settings.statusLine
      await fs.writeJson(settingsPath, settings, { spaces: 2 })
      console.log(ansis.green(`✓ ${i18n.t('menu:tools.cclineConfigRemoved')}`))
    }

    // 2. Uninstall npm package
    const uninstallCmd = isWindows() ? 'npm uninstall -g @cometix/ccline' : 'sudo npm uninstall -g @cometix/ccline'
    await execAsync(uninstallCmd, { timeout: 60000 })
    console.log(ansis.green(`✓ ${i18n.t('menu:tools.cclineUninstalled')}`))
  }
  catch (error) {
    console.log(ansis.red(`✗ ${i18n.t('menu:tools.cclineUninstallFailed', { error: String(error) })}`))
  }
}
