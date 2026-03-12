import type { AceToolConfig, FastContextConfig } from '../types'
import { homedir } from 'node:os'
import fs from 'fs-extra'
import { join } from 'pathe'
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml'
import { backupClaudeCodeConfig, buildMcpServerConfig, fixWindowsMcpConfig, mergeMcpServers, readClaudeCodeConfig, writeClaudeCodeConfig } from './mcp'
import { isWindows } from './platform'

// ═══════════════════════════════════════════════════════
// ace-tool MCP
// ═══════════════════════════════════════════════════════

/**
 * Uninstall ace-tool MCP configuration from ~/.claude.json
 */
export async function uninstallAceTool(): Promise<{ success: boolean, message: string }> {
  try {
    const existingConfig = await readClaudeCodeConfig()

    if (!existingConfig) {
      return {
        success: true,
        message: 'No ~/.claude.json found, nothing to remove',
      }
    }

    // Check if ace-tool exists
    if (!existingConfig.mcpServers || !existingConfig.mcpServers['ace-tool']) {
      return {
        success: true,
        message: 'ace-tool MCP not found in config',
      }
    }

    // Backup before modifying
    await backupClaudeCodeConfig()

    // Remove ace-tool from mcpServers
    delete existingConfig.mcpServers['ace-tool']

    // Write back
    await writeClaudeCodeConfig(existingConfig)

    return {
      success: true,
      message: 'ace-tool MCP removed from ~/.claude.json',
    }
  }
  catch (error) {
    return {
      success: false,
      message: `Failed to uninstall ace-tool: ${error}`,
    }
  }
}

/**
 * Install and configure ace-tool MCP for Claude Code.
 * Writes to ~/.claude.json (the correct config file for Claude Code CLI).
 */
export async function installAceTool(config: AceToolConfig): Promise<{ success: boolean, message: string, configPath?: string }> {
  const { baseUrl, token } = config

  try {
    // Read existing config or create new one
    let existingConfig = await readClaudeCodeConfig()

    if (!existingConfig) {
      existingConfig = { mcpServers: {} }
    }

    // Backup before modifying (if config exists)
    if (existingConfig.mcpServers && Object.keys(existingConfig.mcpServers).length > 0) {
      const backupPath = await backupClaudeCodeConfig()
      if (backupPath) {
        console.log(`  ✓ Backup created: ${backupPath}`)
      }
    }

    // Build args array (with -y flag for npx auto-confirm)
    const args = ['-y', 'ace-tool@latest']
    if (baseUrl) {
      args.push('--base-url', baseUrl)
    }
    if (token) {
      args.push('--token', token)
    }

    // Create base ace-tool MCP server config
    const aceToolConfig = buildMcpServerConfig({
      type: 'stdio' as const,
      command: 'npx',
      args,
    })

    // Merge new server into existing config
    let mergedConfig = mergeMcpServers(existingConfig, {
      'ace-tool': aceToolConfig,
    })

    // Apply Windows fixes if needed
    if (isWindows()) {
      mergedConfig = fixWindowsMcpConfig(mergedConfig)
      console.log('  ✓ Applied Windows MCP configuration fixes')
    }

    // Write config back (preserve all other fields)
    await writeClaudeCodeConfig(mergedConfig)

    return {
      success: true,
      message: isWindows()
        ? 'ace-tool MCP configured successfully with Windows compatibility'
        : 'ace-tool MCP configured successfully',
      configPath: join(homedir(), '.claude.json'),
    }
  }
  catch (error) {
    return {
      success: false,
      message: `Failed to configure ace-tool: ${error}`,
    }
  }
}

/**
 * Install and configure ace-tool-rs MCP for Claude Code.
 * ace-tool-rs is a Rust implementation of ace-tool, more lightweight and faster.
 */
export async function installAceToolRs(config: AceToolConfig): Promise<{ success: boolean, message: string, configPath?: string }> {
  const { baseUrl, token } = config

  try {
    // Read existing config or create new one
    let existingConfig = await readClaudeCodeConfig()

    if (!existingConfig) {
      existingConfig = { mcpServers: {} }
    }

    // Backup before modifying (if config exists)
    if (existingConfig.mcpServers && Object.keys(existingConfig.mcpServers).length > 0) {
      const backupPath = await backupClaudeCodeConfig()
      if (backupPath) {
        console.log(`  ✓ Backup created: ${backupPath}`)
      }
    }

    // Build args array for ace-tool-rs
    const args = ['ace-tool-rs']
    if (baseUrl) {
      args.push('--base-url', baseUrl)
    }
    if (token) {
      args.push('--token', token)
    }

    // Create base ace-tool-rs MCP server config
    const aceToolRsConfig = buildMcpServerConfig({
      type: 'stdio' as const,
      command: 'npx',
      args,
      env: {
        RUST_LOG: 'info',
      },
    })

    // Merge new server into existing config
    let mergedConfig = mergeMcpServers(existingConfig, {
      'ace-tool': aceToolRsConfig,
    })

    // Apply Windows fixes if needed
    if (isWindows()) {
      mergedConfig = fixWindowsMcpConfig(mergedConfig)
      console.log('  ✓ Applied Windows MCP configuration fixes')
    }

    // Write config back (preserve all other fields)
    await writeClaudeCodeConfig(mergedConfig)

    return {
      success: true,
      message: isWindows()
        ? 'ace-tool-rs MCP configured successfully with Windows compatibility'
        : 'ace-tool-rs MCP configured successfully',
      configPath: join(homedir(), '.claude.json'),
    }
  }
  catch (error) {
    return {
      success: false,
      message: `Failed to configure ace-tool-rs: ${error}`,
    }
  }
}

// ═══════════════════════════════════════════════════════
// ContextWeaver MCP
// ═══════════════════════════════════════════════════════

/**
 * ContextWeaver MCP configuration
 */
export interface ContextWeaverConfig {
  siliconflowApiKey: string
}

/**
 * Install and configure ContextWeaver MCP for Claude Code.
 * ContextWeaver is a local-first semantic code search engine with hybrid search + rerank.
 */
export async function installContextWeaver(config: ContextWeaverConfig): Promise<{ success: boolean, message: string, configPath?: string }> {
  const { siliconflowApiKey } = config

  try {
    // 0. Install contextweaver CLI globally
    console.log('  ⏳ 正在安装 ContextWeaver CLI...')
    const { execSync } = await import('node:child_process')
    try {
      execSync('npm install -g @hsingjui/contextweaver', { stdio: 'pipe' })
      console.log('  ✓ ContextWeaver CLI 安装成功')
    }
    catch {
      // Try with sudo on Unix systems
      if (process.platform !== 'win32') {
        try {
          execSync('sudo npm install -g @hsingjui/contextweaver', { stdio: 'pipe' })
          console.log('  ✓ ContextWeaver CLI 安装成功 (sudo)')
        }
        catch {
          console.log('  ⚠ ContextWeaver CLI 安装失败，请手动运行: npm install -g @hsingjui/contextweaver')
        }
      }
      else {
        console.log('  ⚠ ContextWeaver CLI 安装失败，请手动运行: npm install -g @hsingjui/contextweaver')
      }
    }

    // 1. Create ContextWeaver config directory and .env file
    const contextWeaverDir = join(homedir(), '.contextweaver')
    await fs.ensureDir(contextWeaverDir)

    const envContent = `# ContextWeaver 配置 (由 CCG 自动生成)

# Embedding API - 硅基流动
EMBEDDINGS_API_KEY=${siliconflowApiKey}
EMBEDDINGS_BASE_URL=https://api.siliconflow.cn/v1/embeddings
EMBEDDINGS_MODEL=Qwen/Qwen3-Embedding-8B
EMBEDDINGS_MAX_CONCURRENCY=10
EMBEDDINGS_DIMENSIONS=1024

# Reranker - 硅基流动
RERANK_API_KEY=${siliconflowApiKey}
RERANK_BASE_URL=https://api.siliconflow.cn/v1/rerank
RERANK_MODEL=Qwen/Qwen3-Reranker-8B
RERANK_TOP_N=20
`
    await fs.writeFile(join(contextWeaverDir, '.env'), envContent, 'utf-8')

    // 2. Read existing Claude Code config
    let existingConfig = await readClaudeCodeConfig()
    if (!existingConfig) {
      existingConfig = { mcpServers: {} }
    }

    // Backup before modifying
    if (existingConfig.mcpServers && Object.keys(existingConfig.mcpServers).length > 0) {
      const backupPath = await backupClaudeCodeConfig()
      if (backupPath) {
        console.log(`  ✓ Backup created: ${backupPath}`)
      }
    }

    // 3. Build ContextWeaver MCP server config
    const contextWeaverMcpConfig = buildMcpServerConfig({
      type: 'stdio' as const,
      command: 'contextweaver',
      args: ['mcp'],
    })

    // 4. Merge into existing config
    let mergedConfig = mergeMcpServers(existingConfig, {
      contextweaver: contextWeaverMcpConfig,
    })

    // Apply Windows fixes if needed
    if (isWindows()) {
      mergedConfig = fixWindowsMcpConfig(mergedConfig)
    }

    // 5. Write config back
    await writeClaudeCodeConfig(mergedConfig)

    return {
      success: true,
      message: 'ContextWeaver MCP configured successfully',
      configPath: join(homedir(), '.claude.json'),
    }
  }
  catch (error) {
    return {
      success: false,
      message: `Failed to configure ContextWeaver: ${error}`,
    }
  }
}

/**
 * Uninstall ContextWeaver MCP from Claude Code
 */
export async function uninstallContextWeaver(): Promise<{ success: boolean, message: string }> {
  try {
    // 1. Remove from claude.json
    const existingConfig = await readClaudeCodeConfig()
    if (existingConfig?.mcpServers?.contextweaver) {
      delete existingConfig.mcpServers.contextweaver
      await writeClaudeCodeConfig(existingConfig)
    }

    // 2. Optionally remove ~/.contextweaver directory (keep it for now, user might want to keep config)
    // const contextWeaverDir = join(homedir(), '.contextweaver')
    // await fs.remove(contextWeaverDir)

    return {
      success: true,
      message: 'ContextWeaver MCP uninstalled successfully',
    }
  }
  catch (error) {
    return {
      success: false,
      message: `Failed to uninstall ContextWeaver: ${error}`,
    }
  }
}

// ═══════════════════════════════════════════════════════
// Fast Context (Windsurf) MCP
// ═══════════════════════════════════════════════════════

/**
 * Install and configure Fast Context (Windsurf) MCP for Claude Code.
 * Fast Context uses Windsurf's AI-powered code search — no full-repo indexing needed.
 */
export async function installFastContext(config: FastContextConfig): Promise<{ success: boolean, message: string, configPath?: string }> {
  const { apiKey, includeSnippets } = config

  try {
    let existingConfig = await readClaudeCodeConfig()
    if (!existingConfig) {
      existingConfig = { mcpServers: {} }
    }

    // Backup before modifying
    if (existingConfig.mcpServers && Object.keys(existingConfig.mcpServers).length > 0) {
      const backupPath = await backupClaudeCodeConfig()
      if (backupPath) {
        console.log(`  ✓ Backup created: ${backupPath}`)
      }
    }

    // Build env
    const env: Record<string, string> = {}
    if (apiKey) {
      env.WINDSURF_API_KEY = apiKey
    }
    if (includeSnippets) {
      env.FC_INCLUDE_SNIPPETS = 'true'
    }

    // Build fast-context MCP server config
    const fastContextConfig = buildMcpServerConfig({
      type: 'stdio' as const,
      command: 'npx',
      args: ['-y', '--prefer-online', 'fast-context-mcp@latest'],
      ...(Object.keys(env).length > 0 ? { env } : {}),
    })

    // Merge into existing config
    let mergedConfig = mergeMcpServers(existingConfig, {
      'fast-context': fastContextConfig,
    })

    if (isWindows()) {
      mergedConfig = fixWindowsMcpConfig(mergedConfig)
      console.log('  ✓ Applied Windows MCP configuration fixes')
    }

    await writeClaudeCodeConfig(mergedConfig)

    return {
      success: true,
      message: isWindows()
        ? 'fast-context MCP configured successfully with Windows compatibility'
        : 'fast-context MCP configured successfully',
      configPath: join(homedir(), '.claude.json'),
    }
  }
  catch (error) {
    return {
      success: false,
      message: `Failed to configure fast-context: ${error}`,
    }
  }
}

/**
 * Uninstall Fast Context MCP from Claude Code
 */
export async function uninstallFastContext(): Promise<{ success: boolean, message: string }> {
  try {
    const existingConfig = await readClaudeCodeConfig()
    if (existingConfig?.mcpServers?.['fast-context']) {
      delete existingConfig.mcpServers['fast-context']
      await writeClaudeCodeConfig(existingConfig)
    }

    return {
      success: true,
      message: 'fast-context MCP uninstalled successfully',
    }
  }
  catch (error) {
    return {
      success: false,
      message: `Failed to uninstall fast-context: ${error}`,
    }
  }
}

// ═══════════════════════════════════════════════════════
// Generic MCP server install/uninstall
// ═══════════════════════════════════════════════════════

/**
 * Install a generic MCP server to Claude Code
 */
export async function installMcpServer(
  id: string,
  command: string,
  args: string[],
  env: Record<string, string> = {},
): Promise<{ success: boolean, message: string }> {
  try {
    await backupClaudeCodeConfig()
    const existingConfig = await readClaudeCodeConfig()

    const serverConfig = buildMcpServerConfig({ type: 'stdio', command, args, env })

    let mergedConfig = mergeMcpServers(existingConfig, { [id]: serverConfig })
    if (isWindows()) {
      mergedConfig = fixWindowsMcpConfig(mergedConfig)
    }

    await writeClaudeCodeConfig(mergedConfig)

    return { success: true, message: `${id} MCP installed successfully` }
  }
  catch (error) {
    return { success: false, message: `Failed to install ${id}: ${error}` }
  }
}

/**
 * Uninstall a generic MCP server from Claude Code
 */
export async function uninstallMcpServer(id: string): Promise<{ success: boolean, message: string }> {
  try {
    const existingConfig = await readClaudeCodeConfig()
    if (existingConfig?.mcpServers?.[id]) {
      delete existingConfig.mcpServers[id]
      await writeClaudeCodeConfig(existingConfig)
    }

    return { success: true, message: `${id} MCP uninstalled successfully` }
  }
  catch (error) {
    return { success: false, message: `Failed to uninstall ${id}: ${error}` }
  }
}

// ═══════════════════════════════════════════════════════
// MCP Sync — Mirror CCG-relevant MCP servers
// to Codex (~/.codex/config.toml) and Gemini (~/.gemini/settings.json)
// ═══════════════════════════════════════════════════════

/** MCP server IDs that CCG manages and should sync to Codex/Gemini */
const CCG_MCP_IDS = new Set([
  'grok-search',
  'context7',
  'ace-tool',
  'ace-tool-rs',
  'contextweaver',
  'fast-context',
])

/**
 * Read Claude's MCP config and filter to CCG-managed servers.
 * Shared helper for syncMcpToCodex and syncMcpToGemini.
 */
async function getCcgMcpServersFromClaude(): Promise<Record<string, any>> {
  const claudeConfig = await readClaudeCodeConfig()
  const claudeMcpServers = claudeConfig?.mcpServers || {}

  const serversToSync: Record<string, any> = {}
  for (const [id, config] of Object.entries(claudeMcpServers)) {
    if (CCG_MCP_IDS.has(id) && config) {
      serversToSync[id] = config
    }
  }
  return serversToSync
}

/**
 * Sync (mirror) CCG-managed MCP servers from Claude's ~/.claude.json
 * to Codex's ~/.codex/config.toml
 *
 * - Only touches servers in CCG_MCP_IDS — user's custom MCP servers are untouched.
 * - Servers present in Claude are added/updated with ALL fields (not just command/args/env).
 * - Servers absent from Claude but present in Codex (within CCG_MCP_IDS) are REMOVED.
 * - Preserves all existing Codex config (model_provider, model, etc.)
 * - Uses atomic write (temp file + rename) to prevent corruption.
 */
export async function syncMcpToCodex(): Promise<{
  success: boolean
  message: string
  synced: string[]
  removed: string[]
}> {
  const synced: string[] = []
  const removed: string[] = []

  try {
    // 1. Read Claude's CCG-managed MCP config
    const serversToSync = await getCcgMcpServersFromClaude()

    // 2. Read or create Codex config
    const codexConfigDir = join(homedir(), '.codex')
    const codexConfigPath = join(codexConfigDir, 'config.toml')
    await fs.ensureDir(codexConfigDir)

    let codexConfig: Record<string, any> = {}
    if (await fs.pathExists(codexConfigPath)) {
      const content = await fs.readFile(codexConfigPath, 'utf-8')
      codexConfig = parseToml(content) as Record<string, any>
    }

    // 3. Ensure mcp_servers table exists
    if (!codexConfig.mcp_servers) {
      codexConfig.mcp_servers = {}
    }

    // 4. Mirror: add/update CCG servers (pass through ALL fields)
    for (const [id, claudeServer] of Object.entries(serversToSync)) {
      const server = claudeServer as Record<string, any>
      const codexEntry: Record<string, any> = {}

      // Pass through all TOML-compatible fields from Claude config
      for (const [key, value] of Object.entries(server)) {
        if (value !== null && value !== undefined) {
          codexEntry[key] = value
        }
      }

      codexConfig.mcp_servers[id] = codexEntry
      synced.push(id)
    }

    // 5. Mirror: remove CCG servers that no longer exist in Claude
    for (const id of CCG_MCP_IDS) {
      if (!serversToSync[id] && codexConfig.mcp_servers[id]) {
        delete codexConfig.mcp_servers[id]
        removed.push(id)
      }
    }

    // Skip write if no changes needed
    if (synced.length === 0 && removed.length === 0) {
      return {
        success: true,
        message: 'No CCG MCP servers to sync or remove',
        synced: [],
        removed: [],
      }
    }

    // 6. Atomic write: temp file + rename to prevent corruption
    const tmpPath = `${codexConfigPath}.tmp`
    await fs.writeFile(tmpPath, stringifyToml(codexConfig), 'utf-8')
    await fs.rename(tmpPath, codexConfigPath)

    const parts: string[] = []
    if (synced.length > 0) parts.push(`synced: ${synced.join(', ')}`)
    if (removed.length > 0) parts.push(`removed: ${removed.join(', ')}`)

    return {
      success: true,
      message: `Codex MCP mirror complete (${parts.join('; ')})`,
      synced,
      removed,
    }
  }
  catch (error) {
    return {
      success: false,
      message: `Failed to sync MCP to Codex: ${error}`,
      synced,
      removed,
    }
  }
}

/**
 * Sync (mirror) CCG-managed MCP servers from Claude's ~/.claude.json
 * to Gemini CLI's ~/.gemini/settings.json
 *
 * Same logic as syncMcpToCodex but targets Gemini's JSON config format.
 */
export async function syncMcpToGemini(): Promise<{
  success: boolean
  message: string
  synced: string[]
  removed: string[]
}> {
  const synced: string[] = []
  const removed: string[] = []

  try {
    // 1. Read Claude's CCG-managed MCP config
    const serversToSync = await getCcgMcpServersFromClaude()

    // 2. Read or create Gemini settings
    const geminiDir = join(homedir(), '.gemini')
    const geminiSettingsPath = join(geminiDir, 'settings.json')
    await fs.ensureDir(geminiDir)

    let geminiSettings: Record<string, any> = {}
    if (await fs.pathExists(geminiSettingsPath)) {
      geminiSettings = await fs.readJSON(geminiSettingsPath)
    }

    // 3. Ensure mcpServers exists
    if (!geminiSettings.mcpServers) {
      geminiSettings.mcpServers = {}
    }

    // 4. Mirror: add/update CCG servers
    for (const [id, claudeServer] of Object.entries(serversToSync)) {
      geminiSettings.mcpServers[id] = claudeServer
      synced.push(id)
    }

    // 5. Mirror: remove CCG servers that no longer exist in Claude
    for (const id of CCG_MCP_IDS) {
      if (!serversToSync[id] && geminiSettings.mcpServers[id]) {
        delete geminiSettings.mcpServers[id]
        removed.push(id)
      }
    }

    if (synced.length === 0 && removed.length === 0) {
      return { success: true, message: 'No CCG MCP servers to sync to Gemini', synced: [], removed: [] }
    }

    // 6. Write back (preserve all other Gemini settings)
    await fs.writeJSON(geminiSettingsPath, geminiSettings, { spaces: 2 })

    const parts: string[] = []
    if (synced.length > 0) parts.push(`synced: ${synced.join(', ')}`)
    if (removed.length > 0) parts.push(`removed: ${removed.join(', ')}`)

    return { success: true, message: `Gemini MCP mirror complete (${parts.join('; ')})`, synced, removed }
  }
  catch (error) {
    return { success: false, message: `Failed to sync MCP to Gemini: ${error}`, synced, removed }
  }
}
