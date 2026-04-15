import { join } from 'pathe'
import { tmpdir } from 'node:os'
import { afterAll, describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import {
  configureClaudeMonitorHooks,
  getInstalledMonitorDir,
  installBundledMonitor,
  removeClaudeMonitorHooks,
} from '../claude-monitor'

describe('claude monitor integration helpers', () => {
  const tempRoot = join(tmpdir(), `ccg-monitor-test-${Date.now()}`)

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
    const settingsPath = join(tempRoot, 'settings.json')
    await fs.ensureDir(tempRoot)
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

    const result = await configureClaudeMonitorHooks({ installDir: tempRoot, port: 4901 })
    const configured = await fs.readJson(settingsPath)

    expect(result.settingsPath).toBe(settingsPath)
    expect(configured.env.KEEP_ME).toBe('1')
    expect(configured.env.CLAUDE_DASHBOARD_PORT).toBe('4901')
    expect(configured.hooks.SessionStart.length).toBeGreaterThan(1)
    expect(configured.hooks.PreToolUse[0].matcher).toBe('*')

    await removeClaudeMonitorHooks(tempRoot)
    const cleaned = await fs.readJson(settingsPath)
    expect(cleaned.env.KEEP_ME).toBe('1')
    expect(cleaned.env.CLAUDE_DASHBOARD_PORT).toBeUndefined()
    expect(cleaned.hooks.SessionStart).toHaveLength(1)
    expect(cleaned.hooks.PreToolUse).toBeUndefined()
  })
})
