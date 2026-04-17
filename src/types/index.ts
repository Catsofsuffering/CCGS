export type SupportedLang = 'zh-CN' | 'en'

export type ModelType = 'codex' | 'claude'

export type HostRuntime = 'codex' | 'claude'

export type CollaborationMode = 'parallel' | 'smart' | 'sequential'

export type RoutingStrategy = 'parallel' | 'fallback' | 'round-robin'

export interface ModelRouting {
  frontend: {
    models: ModelType[]
    primary: ModelType
    strategy: RoutingStrategy
  }
  backend: {
    models: ModelType[]
    primary: ModelType
    strategy: RoutingStrategy
  }
  review: {
    models: ModelType[]
    strategy: 'parallel'
  }
  mode: CollaborationMode
}

export interface CcgConfig {
  general: {
    version: string
    language: SupportedLang
    createdAt: string
  }
  ownership?: {
    orchestrator: ModelType
    executionHost: HostRuntime
    acceptance: ModelType
  }
  routing: ModelRouting
  workflows: {
    installed: string[]
  }
  paths: {
    hostHome: string
    commands: string
    prompts: string
    backup: string
  }
  mcp: {
    provider: string
    setup_url: string
  }
  performance?: {
    skipImpeccable?: boolean
  }
}

export interface WorkflowConfig {
  id: string
  name: string
  nameEn: string
  category: string
  commands: string[]
  defaultSelected: boolean
  order: number
  description?: string
  descriptionEn?: string
}

export interface InitOptions {
  lang?: SupportedLang
  skipPrompt?: boolean
  skipMcp?: boolean
  force?: boolean
  orchestrator?: ModelType
  frontend?: string
  backend?: string
  mode?: CollaborationMode
  workflows?: string
  installDir?: string
}

export interface InstallResult {
  success: boolean
  installedCommands: string[]
  installedPrompts: string[]
  installedSkills?: number
  installedCodexSkills?: string[]
  installedSkillCommands?: number
  installedRules?: boolean
  errors: string[]
  configPath: string
  monitorPath?: string
  monitorInstalled?: boolean
}

export interface AceToolConfig {
  baseUrl: string
  token: string
}

export interface FastContextConfig {
  apiKey?: string
  includeSnippets?: boolean
}

export * from './cli'
