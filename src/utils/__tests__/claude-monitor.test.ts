import { join } from 'pathe'
import { tmpdir } from 'node:os'
import { afterAll, describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import {
  CLAUDE_CCSM_PERMISSION_ALLOW,
  configureClaudeMonitorHooks,
  getInstalledMonitorDir,
  installBundledMonitor,
  removeClaudeMonitorHooks,
} from '../claude-monitor'

describe('claude monitor integration helpers', () => {
  const tempRoot = join(tmpdir(), `ccsm-monitor-test-${Date.now()}`)
  const settingsRoot = join(tempRoot, 'host-claude')
  const canonicalRoot = join(tempRoot, 'canonical-ccsm')

  afterAll(async () => {
    await fs.remove(tempRoot)
  })

  it('copies bundled monitor assets into the managed install directory', { timeout: 60_000 }, async () => {
    const monitorDir = await installBundledMonitor(tempRoot)

    expect(monitorDir).toBe(getInstalledMonitorDir(tempRoot))
    expect(await fs.pathExists(join(monitorDir, 'server', 'index.js'))).toBe(true)
    expect(await fs.pathExists(join(monitorDir, 'client', 'src', 'App.tsx'))).toBe(true)
    expect(await fs.pathExists(join(monitorDir, 'scripts', 'hook-handler.js'))).toBe(true)
  })

  it('writes and removes Claude hook entries without deleting unrelated settings', async () => {
    const settingsPath = join(settingsRoot, 'settings.json')
    await fs.ensureDir(settingsRoot)
    await installBundledMonitor(canonicalRoot)
    await fs.writeJson(settingsPath, {
      env: {
        KEEP_ME: '1',
      },
      hooks: {
        SessionStart: [
          {
            hooks: [
              {
                type: 'command',
                command: 'node "C:/other-handler.js"',
              },
            ],
          },
        ],
      },
    }, { spaces: 2 })

    const result = await configureClaudeMonitorHooks({
      installDir: settingsRoot,
      canonicalHomeDir: canonicalRoot,
      port: 4901,
    })
    const configured = await fs.readJson(settingsPath)

    expect(result.settingsPath).toBe(settingsPath)
    expect(result.permissionsInstalled).toEqual([CLAUDE_CCSM_PERMISSION_ALLOW])
    expect(configured.env.KEEP_ME).toBe('1')
    expect(configured.env.CLAUDE_DASHBOARD_PORT).toBe('4901')
    expect(configured.permissions.allow).toContain(CLAUDE_CCSM_PERMISSION_ALLOW)
    expect(configured.hooks.SessionStart.length).toBeGreaterThan(1)
    expect(configured.hooks.PreToolUse[0].matcher).toBe('*')
    expect(configured.hooks.PreToolUse[0].hooks[0].command).toContain('canonical-ccsm/claude-monitor/scripts/hook-handler.js')

    await removeClaudeMonitorHooks(settingsRoot)
    const cleaned = await fs.readJson(settingsPath)
    expect(cleaned.env.KEEP_ME).toBe('1')
    expect(cleaned.env.CLAUDE_DASHBOARD_PORT).toBeUndefined()
    expect(cleaned.permissions.allow).toContain(CLAUDE_CCSM_PERMISSION_ALLOW)
    expect(cleaned.hooks.SessionStart).toHaveLength(1)
    expect(cleaned.hooks.PreToolUse).toBeUndefined()
  })
})
