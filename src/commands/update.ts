import type { ModelRouting, ModelType } from '../types'
import ansis from 'ansis'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import inquirer from 'inquirer'
import ora from 'ora'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { checkForUpdates, compareVersions } from '../utils/version'
import { uninstallWorkflows } from '../utils/installer'
import { readCcgConfig, writeCcgConfig } from '../utils/config'
import { migrateToV1_4_0, needsMigration } from '../utils/migration'
import { i18n } from '../i18n'

const execAsync = promisify(exec)

/**
 * Main update command - checks for updates and installs if available
 */
export async function update(): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold(`🔄 ${i18n.t('update:checking')}`))
  console.log()

  const spinner = ora(i18n.t('update:checkingLatest')).start()

  try {
    const { hasUpdate, currentVersion, latestVersion } = await checkForUpdates()

    // Check if local workflow version differs from running version
    const config = await readCcgConfig()
    const localVersion = config?.general?.version || '0.0.0'
    const needsWorkflowUpdate = compareVersions(currentVersion, localVersion) > 0

    spinner.stop()

    if (!latestVersion) {
      console.log(ansis.red(`❌ ${i18n.t('update:cannotConnect')}`))
      return
    }

    console.log(`${i18n.t('update:currentVersion')}: ${ansis.yellow(`v${currentVersion}`)}`)
    console.log(`${i18n.t('update:latestVersion')}: ${ansis.green(`v${latestVersion}`)}`)
    if (localVersion !== '0.0.0') {
      console.log(`${i18n.t('update:localWorkflow')}: ${ansis.gray(`v${localVersion}`)}`)
    }
    console.log()

    // Determine effective update status
    const effectiveNeedsUpdate = hasUpdate || needsWorkflowUpdate
    let defaultConfirm = effectiveNeedsUpdate

    let message: string
    if (hasUpdate) {
      message = i18n.t('update:newVersionFound', { latest: latestVersion, current: currentVersion })
      defaultConfirm = true
    }
    else if (needsWorkflowUpdate) {
      message = i18n.t('update:localOutdated', { local: localVersion, current: currentVersion })
      defaultConfirm = true
    }
    else {
      message = i18n.t('update:alreadyLatest', { current: currentVersion })
      defaultConfirm = false
    }

    const { confirmUpdate } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmUpdate',
      message,
      default: defaultConfirm,
    }])

    if (!confirmUpdate) {
      console.log(ansis.gray(i18n.t('update:cancelled')))
      return
    }

    // Pass localVersion as fromVersion for accurate display
    const fromVersion = needsWorkflowUpdate ? localVersion : currentVersion
    await performUpdate(fromVersion, latestVersion || currentVersion, hasUpdate)
  }
  catch (error) {
    spinner.stop()
    console.log(ansis.red(`❌ ${i18n.t('update:error', { error: String(error) })}`))
  }
}

/**
 * Ask user if they want to reconfigure model routing
 */
async function askReconfigureRouting(currentRouting?: ModelRouting): Promise<ModelRouting | null> {
  console.log()
  console.log(ansis.cyan.bold(`🔧 ${i18n.t('init:summary.modelRouting')}`))
  console.log()

  if (currentRouting) {
    console.log(ansis.gray(`${i18n.t('menu:api.currentConfig')}`))
    console.log(`  ${ansis.cyan('Frontend:')} ${currentRouting.frontend.models.map(m => ansis.green(m)).join(', ')}`)
    console.log(`  ${ansis.cyan('Backend:')} ${currentRouting.backend.models.map(m => ansis.blue(m)).join(', ')}`)
    console.log()
  }

  const { reconfigure } = await inquirer.prompt([{
    type: 'confirm',
    name: 'reconfigure',
    message: i18n.t('init:selectFrontendModels'),
    default: false,
  }])

  if (!reconfigure) {
    return null
  }

  console.log()

  // Frontend models selection
  const { selectedFrontend } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selectedFrontend',
    message: i18n.t('init:selectFrontendModels'),
    choices: [
      { name: 'Gemini', value: 'gemini' as ModelType, checked: currentRouting?.frontend.models.includes('gemini') ?? true },
      { name: 'Claude', value: 'claude' as ModelType, checked: currentRouting?.frontend.models.includes('claude') ?? false },
      { name: 'Codex', value: 'codex' as ModelType, checked: currentRouting?.frontend.models.includes('codex') ?? false },
    ],
    validate: (answer: string[]) => answer.length > 0 || i18n.t('init:validation.selectAtLeastOne'),
  }])

  // Backend models selection
  const { selectedBackend } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selectedBackend',
    message: i18n.t('init:selectBackendModels'),
    choices: [
      { name: 'Codex', value: 'codex' as ModelType, checked: currentRouting?.backend.models.includes('codex') ?? true },
      { name: 'Gemini', value: 'gemini' as ModelType, checked: currentRouting?.backend.models.includes('gemini') ?? false },
      { name: 'Claude', value: 'claude' as ModelType, checked: currentRouting?.backend.models.includes('claude') ?? false },
    ],
    validate: (answer: string[]) => answer.length > 0 || i18n.t('init:validation.selectAtLeastOne'),
  }])

  const frontendModels = selectedFrontend as ModelType[]
  const backendModels = selectedBackend as ModelType[]

  // Build new routing config
  const newRouting: ModelRouting = {
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
    mode: currentRouting?.mode || 'smart',
  }

  console.log()
  console.log(ansis.green('✓ New config:'))
  console.log(`  ${ansis.cyan('Frontend:')} ${frontendModels.map(m => ansis.green(m)).join(', ')}`)
  console.log(`  ${ansis.cyan('Backend:')} ${backendModels.map(m => ansis.blue(m)).join(', ')}`)
  console.log()

  return newRouting
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

/**
 * Perform the actual update process
 */
async function performUpdate(fromVersion: string, toVersion: string, isNewVersion: boolean): Promise<void> {
  console.log()
  console.log(ansis.yellow.bold(`⚙️  ${i18n.t('update:starting')}`))
  console.log()

  // Check if installed globally via npm
  const isGlobalInstall = await checkIfGlobalInstall()

  // If globally installed and only workflow needs update (package is already latest)
  if (isGlobalInstall && !isNewVersion) {
    console.log(ansis.cyan(`ℹ️  ${i18n.t('update:globalDetected')}`))
    console.log()
    console.log(ansis.green(`✓ ${i18n.t('update:packageLatest')} (v${toVersion})`))
    console.log(ansis.yellow(`⚙️  ${i18n.t('update:workflowOnly')}`))
    console.log()
  }
  else if (isGlobalInstall && isNewVersion) {
    console.log(ansis.yellow(`⚠️  ${i18n.t('update:globalDetected')}`))
    console.log()
    console.log(`${i18n.t('update:recommendNpm')}`)
    console.log()
    console.log(ansis.cyan('  npm install -g ccg-workflow@latest'))
    console.log()
    console.log(ansis.gray(i18n.t('update:willUpdateBoth')))
    console.log()

    const { useNpmUpdate } = await inquirer.prompt([{
      type: 'confirm',
      name: 'useNpmUpdate',
      message: i18n.t('update:useNpmUpdate'),
      default: true,
    }])

    if (useNpmUpdate) {
      console.log()
      console.log(ansis.cyan(i18n.t('update:runInNewTerminal')))
      console.log()
      console.log(ansis.cyan.bold('  npm install -g ccg-workflow@latest'))
      console.log()
      console.log(ansis.gray(`(${i18n.t('update:autoUpdateAfter')})`))
      console.log()
      return
    }

    console.log()
    console.log(ansis.yellow(`⚠️  ${i18n.t('update:continueBuiltin')}`))
    console.log(ansis.gray(i18n.t('update:willNotUpdateCli')))
    console.log()
  }

  // Step 1: Download latest package
  let spinner = ora(i18n.t('update:downloading')).start()

  try {
    if (process.platform === 'win32') {
      spinner.text = i18n.t('update:clearingCache')
      try {
        await execAsync('npx clear-npx-cache', { timeout: 10000 })
      }
      catch {
        const npxCachePath = join(homedir(), '.npm', '_npx')
        try {
          const fs = await import('fs-extra')
          await fs.remove(npxCachePath)
        }
        catch {
          // Cache clearing failed, but continue anyway
        }
      }
    }

    spinner.text = i18n.t('update:downloading')
    await execAsync(`npx --yes ccg-workflow@latest --version`, { timeout: 60000 })
    spinner.succeed(i18n.t('update:downloadDone'))
  }
  catch (error) {
    spinner.fail(i18n.t('update:downloadFailed'))
    console.log(ansis.red(`${i18n.t('common:error')}: ${error}`))
    return
  }

  // Step 2: Auto-migrate from old directory structure (if needed)
  if (await needsMigration()) {
    spinner = ora(i18n.t('update:migrating')).start()
    const migrationResult = await migrateToV1_4_0()

    if (migrationResult.migratedFiles.length > 0) {
      spinner.info(ansis.cyan(i18n.t('update:migrationDone')))
      console.log()
      for (const file of migrationResult.migratedFiles) {
        console.log(`  ${ansis.green('✓')} ${file}`)
      }
      if (migrationResult.skipped.length > 0) {
        console.log()
        console.log(ansis.gray(`  ${i18n.t('update:migrationSkipped')}`))
        for (const file of migrationResult.skipped) {
          console.log(`  ${ansis.gray('○')} ${file}`)
        }
      }
      console.log()
    }

    if (migrationResult.errors.length > 0) {
      spinner.warn(ansis.yellow(i18n.t('update:migrationErrors')))
      for (const error of migrationResult.errors) {
        console.log(`  ${ansis.red('✗')} ${error}`)
      }
      console.log()
    }
  }

  // Step 3: Delete old workflows first
  spinner = ora(i18n.t('update:removingOld')).start()

  try {
    const installDir = join(homedir(), '.claude')
    const uninstallResult = await uninstallWorkflows(installDir)

    if (uninstallResult.success) {
      spinner.succeed(i18n.t('update:oldRemoved'))
    }
    else {
      spinner.warn(i18n.t('update:partialRemoveFailed'))
      for (const error of uninstallResult.errors) {
        console.log(ansis.yellow(`  • ${error}`))
      }
    }
  }
  catch (error) {
    spinner.warn(i18n.t('update:removeFailed', { error: String(error) }))
  }

  // Step 4: Install new workflows using the latest version via npx
  spinner = ora(i18n.t('update:installingNew')).start()

  try {
    await execAsync(`npx --yes ccg-workflow@latest init --force --skip-mcp --skip-prompt`, {
      timeout: 120000,
      env: {
        ...process.env,
        CCG_UPDATE_MODE: 'true',
      },
    })
    spinner.succeed(i18n.t('update:installDone'))

    // Read updated config to display installed commands
    const config = await readCcgConfig()
    if (config?.workflows?.installed) {
      console.log()
      console.log(ansis.cyan(i18n.t('update:installed', { count: config.workflows.installed.length })))
      for (const cmd of config.workflows.installed) {
        console.log(`  ${ansis.gray('•')} /ccg:${cmd}`)
      }
    }
  }
  catch (error) {
    spinner.fail(i18n.t('update:installFailed'))
    console.log(ansis.red(`${i18n.t('common:error')}: ${error}`))
    console.log()
    console.log(ansis.yellow(i18n.t('update:manualRetry')))
    console.log(ansis.cyan('  npx ccg-workflow@latest'))
    return
  }

  console.log()
  console.log(ansis.green.bold(`✅ ${i18n.t('update:updateDone')}`))
  console.log()
  if (isNewVersion) {
    console.log(ansis.gray(i18n.t('update:upgradedFromTo', { from: fromVersion, to: toVersion })))
  }
  else {
    console.log(ansis.gray(i18n.t('update:reinstalled', { version: toVersion })))
  }
  console.log()
}
