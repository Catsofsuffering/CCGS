import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { extractClaudeExecArgs } from '../../commands/claude'
import {
  buildClaudeExecArgs,
  buildClaudeLaunchEnv,
  getDefaultClaudePermissionMode,
  mergeNoProxyValue,
  resolveClaudeLaunchSpec,
  resolveWindowsCmdShimTarget,
} from '../claude-cli'

function findPackageRoot(): string {
  let dir = import.meta.dirname
  for (let i = 0; i < 10; i++) {
    try {
      readFileSync(join(dir, 'package.json'))
      return dir
    }
    catch {
      dir = join(dir, '..')
    }
  }
  throw new Error('Could not find package root')
}

describe('mergeNoProxyValue', () => {
  it('adds localhost bypass entries once', () => {
    expect(mergeNoProxyValue('example.com,localhost')).toBe('example.com,localhost,127.0.0.1')
  })

  it('creates a local-only bypass when env is empty', () => {
    expect(mergeNoProxyValue('')).toBe('127.0.0.1,localhost')
  })
})

describe('buildClaudeLaunchEnv', () => {
  it('injects Agent Teams flags by default without mutating proxy bypass', () => {
    const env = buildClaudeLaunchEnv({ NO_PROXY: 'example.com' })
    expect(env.NO_PROXY).toBe('example.com')
    expect(env.no_proxy).toBeUndefined()
    expect(env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS).toBe('1')
    expect(env.CLAUDE_CODE_ENABLE_TASKS).toBe('1')
  })

  it('can append local NO_PROXY only when explicitly requested', () => {
    const env = buildClaudeLaunchEnv({
      NO_PROXY: 'example.com',
      CCSM_CLAUDE_APPEND_LOCAL_NO_PROXY: '1',
    })
    expect(env.NO_PROXY).toBe('example.com,127.0.0.1,localhost')
    expect(env.no_proxy).toBe('example.com,127.0.0.1,localhost')
  })

  it('can skip Agent Teams flags', () => {
    const env = buildClaudeLaunchEnv({}, false)
    expect(env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS).toBeUndefined()
    expect(env.CLAUDE_CODE_ENABLE_TASKS).toBeUndefined()
  })
})

describe('Claude permission defaults', () => {
  it('defaults Agent Teams launches to bypassPermissions', () => {
    expect(getDefaultClaudePermissionMode({})).toBe('bypassPermissions')
    expect(buildClaudeExecArgs(['--verbose'])).toEqual(['--permission-mode=bypassPermissions', '--verbose'])
  })

  it('does not inject a default permission mode when Agent Teams are disabled', () => {
    expect(getDefaultClaudePermissionMode({}, false)).toBeNull()
    expect(buildClaudeExecArgs(['--verbose'], {}, false)).toEqual(['--verbose'])
  })

  it('allows explicit environment override and opt-out', () => {
    expect(getDefaultClaudePermissionMode({ CCSM_CLAUDE_PERMISSION_MODE: 'acceptEdits' })).toBe('acceptEdits')
    expect(buildClaudeExecArgs([], { CCSM_CLAUDE_PERMISSION_MODE: 'acceptEdits' })).toEqual(['--permission-mode=acceptEdits'])
    expect(getDefaultClaudePermissionMode({ CCSM_CLAUDE_PERMISSION_MODE: 'inherit' })).toBeNull()
    expect(buildClaudeExecArgs([], { CCSM_CLAUDE_PERMISSION_MODE: 'inherit' })).toEqual([])
  })

  it('preserves explicit user permission flags', () => {
    expect(buildClaudeExecArgs(['--permission-mode', 'default', '--verbose'])).toEqual(['--permission-mode', 'default', '--verbose'])
    expect(buildClaudeExecArgs(['--dangerously-skip-permissions'])).toEqual(['--dangerously-skip-permissions'])
  })
})

describe('resolveWindowsCmdShimTarget', () => {
  it('extracts the JS entrypoint from an npm-generated cmd shim', () => {
    const shimPath = 'C:\\Users\\me\\AppData\\Roaming\\npm\\claude.cmd'
    const shimContent = `@ECHO off
SETLOCAL
IF EXIST "%dp0%\\node.exe" (
  SET "_prog=%dp0%\\node.exe"
) ELSE (
  SET "_prog=node"
)
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.js" %*
`

    expect(resolveWindowsCmdShimTarget(shimPath, shimContent)).toBe(
      'C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.js',
    )
  })
})

describe('resolveClaudeLaunchSpec', () => {
  it('prefers PATH over CCSM_CLAUDE_PATH when a standard install is available', async () => {
    const fixtureDir = mkdtempSync(join(tmpdir(), 'ccsm-claude-path-'))
    const env: NodeJS.ProcessEnv = { ...process.env, PATH: fixtureDir, CCSM_CLAUDE_PATH: join(fixtureDir, 'override.js') }

    if (process.platform === 'win32') {
      const shimPath = join(fixtureDir, 'claude.cmd')
      writeFileSync(
        shimPath,
        `@ECHO off
endLocal & goto #_undefined_# 2>NUL || "%dp0%\\node.exe"  "%dp0%\\node_modules\\@anthropic-ai\\claude-code\\bin\\claude.js" %*
`,
      )
      writeFileSync(join(fixtureDir, 'override.js'), 'console.log("override")\n')

      const spec = await resolveClaudeLaunchSpec({ env, platform: 'win32' })
      expect(spec.source).toBe('cmd-shim')
    }
    else {
      writeFileSync(join(fixtureDir, 'claude'), '#!/usr/bin/env node\n')
      writeFileSync(join(fixtureDir, 'override.js'), 'console.log("override")\n')

      const spec = await resolveClaudeLaunchSpec({ env, platform: process.platform })
      expect(spec.source).toBe('path')
      expect(spec.command).toBe(join(fixtureDir, 'claude'))
    }
  })

  it('uses CCSM_CLAUDE_PATH as a fallback override for non-standard installs', async () => {
    const fixtureDir = mkdtempSync(join(tmpdir(), 'ccsm-claude-override-'))
    const overridePath = join(fixtureDir, 'claude-entry.mjs')
    writeFileSync(overridePath, 'console.log("claude")\n')

    const spec = await resolveClaudeLaunchSpec({
      env: { ...process.env, PATH: '', CCSM_CLAUDE_PATH: overridePath },
      platform: process.platform,
    })

    expect(spec.source).toBe('override')
    expect(spec.command).toBe(process.execPath)
    expect(spec.args).toEqual([overridePath])
  })
})

describe('extractClaudeExecArgs', () => {
  it('extracts raw args after an explicit passthrough marker', () => {
    expect(extractClaudeExecArgs(['node', 'ccsm', 'claude', 'exec', '--', '--version']))
      .toEqual(['--version'])
  })

  it('filters known wrapper options and keeps Claude flags', () => {
    expect(extractClaudeExecArgs([
      'node',
      'ccsm',
      'claude',
      'exec',
      '--cwd',
      'B:\\project\\ccs',
      '--disable-agent-teams',
      '--version',
      '--verbose',
    ])).toEqual(['--version', '--verbose'])
  })
})

describe('ccsm-spec-impl skill', () => {
  it('uses the stable ccsm claude launcher instead of a PowerShell snippet', () => {
    const packageRoot = findPackageRoot()
    const content = readFileSync(join(packageRoot, 'templates', 'codex-skills', 'ccsm-spec-impl', 'SKILL.md'), 'utf-8')

    expect(content).toContain('ccsm claude exec --prompt-file')
    expect(content).not.toContain('```powershell')
    expect(content).not.toContain('claude -p $prompt')
  })
})
