import ansis from 'ansis'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import inquirer from 'inquirer'
import ora from 'ora'
import { homedir } from 'node:os'
import { join } from 'pathe'
import { checkForUpdates } from '../utils/version'
import { installWorkflows } from '../utils/installer'
import { readCcgConfig, writeCcgConfig } from '../utils/config'

const execAsync = promisify(exec)

/**
 * Main update command - checks for updates and installs if available
 */
export async function update(): Promise<void> {
  console.log()
  console.log(ansis.cyan.bold('🔄 检查更新...'))
  console.log()

  const spinner = ora('正在检查最新版本...').start()

  try {
    const { hasUpdate, currentVersion, latestVersion } = await checkForUpdates()

    spinner.stop()

    if (!latestVersion) {
      console.log(ansis.red('❌ 无法连接到 npm registry，请检查网络连接'))
      return
    }

    console.log(`当前版本: ${ansis.yellow(`v${currentVersion}`)}`)
    console.log(`最新版本: ${ansis.green(`v${latestVersion}`)}`)
    console.log()

    if (!hasUpdate) {
      console.log(ansis.green('✅ 已是最新版本！'))

      // Ask if user wants to force reinstall
      const { forceReinstall } = await inquirer.prompt([{
        type: 'confirm',
        name: 'forceReinstall',
        message: '要强制重新安装当前版本吗？（可修复损坏的文件）',
        default: false,
      }])

      if (!forceReinstall) {
        return
      }
    }
    else {
      // Confirm update
      const { confirmUpdate } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmUpdate',
        message: `确认要更新到 v${latestVersion} 吗？`,
        default: true,
      }])

      if (!confirmUpdate) {
        console.log(ansis.gray('已取消更新'))
        return
      }
    }

    await performUpdate(currentVersion, latestVersion || currentVersion)
  }
  catch (error) {
    spinner.stop()
    console.log(ansis.red(`❌ 更新失败: ${error}`))
  }
}

/**
 * Perform the actual update process
 */
async function performUpdate(fromVersion: string, toVersion: string): Promise<void> {
  console.log()
  console.log(ansis.yellow.bold('⚙️  开始更新...'))
  console.log()

  // We don't need to install globally - just use the templates from current package
  // The templates are always bundled with the package when user runs npx ccg-workflow
  const spinner = ora('更新命令模板和提示词...').start()

  try {
    const config = await readCcgConfig()
    const workflows = config?.workflows?.installed || []

    const installDir = join(homedir(), '.claude')
    const result = await installWorkflows(workflows, installDir, true, {
      mcpProvider: config?.mcp?.provider || 'auggie',
      routing: config?.routing,
    }) // force = true

    if (result.success) {
      spinner.succeed('命令模板和提示词更新成功')

      console.log()
      console.log(ansis.cyan(`已更新 ${result.installedCommands.length} 个命令:`))
      for (const cmd of result.installedCommands) {
        console.log(`  ${ansis.gray('•')} /ccg:${cmd}`)
      }

      // Update config version
      if (config) {
        config.general.version = toVersion
        await writeCcgConfig(config)
      }
    }
    else {
      spinner.fail('更新失败')
      console.log(ansis.red('部分文件更新失败:'))
      for (const error of result.errors) {
        console.log(ansis.red(`  • ${error}`))
      }
      return
    }
  }
  catch (error) {
    spinner.fail('更新失败')
    console.log(ansis.red(`错误: ${error}`))
    return
  }

  console.log()
  console.log(ansis.green.bold('✅ 更新完成！'))
  console.log()
  console.log(ansis.gray(`从 v${fromVersion} 升级到 v${toVersion}`))
  console.log()
}
