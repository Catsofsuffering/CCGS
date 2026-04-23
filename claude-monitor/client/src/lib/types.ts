/**
 * @file types.ts
 * @description Defines TypeScript types and interfaces for the agent dashboard application, including data structures for sessions, agents, events, statistics, analytics, model pricing, cost breakdowns, WebSocket messages, and workflow-related data. These types provide a clear contract for the shape of data used throughout the application and facilitate type safety when interacting with the backend API and managing state within the frontend components.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

export type SessionStatus = "active" | "completed" | "error" | "abandoned";
export type AgentStatus = "idle" | "connected" | "working" | "completed" | "error";
export type AgentType = "main" | "subagent";

export interface Session {
  id: string;
  name: string | null;
  status: SessionStatus;
  cwd: string | null;
  model: string | null;
  started_at: string;
  ended_at: string | null;
  metadata: string | null;
  agent_count?: number;
  last_activity?: string;
  cost?: number;
}

export interface Agent {
  id: string;
  session_id: string;
  name: string;
  type: AgentType;
  subagent_type: string | null;
  status: AgentStatus;
  task: string | null;
  current_tool: string | null;
  started_at: string;
  ended_at: string | null;
  updated_at: string;
  parent_agent_id: string | null;
  metadata: string | null;
}

export interface DashboardEvent {
  id: number;
  session_id: string;
  agent_id: string | null;
  event_type: string;
  tool_name: string | null;
  summary: string | null;
  data: string | null;
  created_at: string;
}

export interface AgentOutputMessage {
  id: string;
  agent_id: string;
  timestamp: string | null;
  markdown: string;
  source: "transcript" | "hook";
}

export interface AgentOutputFeed {
  agent_id: string;
  transcript_path: string | null;
  latest_output: AgentOutputMessage | null;
  latest_timestamp: string | null;
  output_count: number;
  outputs: AgentOutputMessage[];
}

export interface SessionOutputs {
  agents: AgentOutputFeed[];
  latest_output_agent_id: string | null;
}

export interface Stats {
  total_sessions: number;
  active_sessions: number;
  active_agents: number;
  total_agents: number;
  total_events: number;
  events_today: number;
  ws_connections: number;
  agents_by_status: Record<string, number>;
  sessions_by_status: Record<string, number>;
}

export interface Analytics {
  tokens: {
    total_input: number;
    total_output: number;
    total_cache_read: number;
    total_cache_write: number;
  };
  tool_usage: Array<{ tool_name: string; count: number }>;
  daily_events: Array<{ date: string; count: number }>;
  daily_sessions: Array<{ date: string; count: number }>;
  agent_types: Array<{ subagent_type: string; count: number }>;
  event_types: Array<{ event_type: string; count: number }>;
  avg_events_per_session: number;
  total_subagents: number;
  overview: {
    total_sessions: number;
    active_sessions: number;
    active_agents: number;
    total_agents: number;
    total_events: number;
  };
  agents_by_status: Record<string, number>;
  sessions_by_status: Record<string, number>;
}

export interface ModelPricing {
  model_pattern: string;
  display_name: string;
  input_per_mtok: number;
  output_per_mtok: number;
  cache_read_per_mtok: number;
  cache_write_per_mtok: number;
  updated_at: string;
}

export interface CostBreakdown {
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost: number;
  matched_rule: string | null;
}

export interface CostResult {
  total_cost: number;
  breakdown: CostBreakdown[];
}

export interface OpenSpecWorkspaceInfo {
  workspaceRoot: string | null;
  source: string | null;
  activeWorkspaceRoot: string | null;
  detectedWorkspaceRoots: string[];
}

export interface SettingsInfo {
  db: { path: string; size: number; counts: Record<string, number> };
  hooks: { installed: boolean; path: string; hooks: Record<string, boolean> };
  server: { uptime: number; node_version: string; platform: string; ws_connections: number };
  openspec: OpenSpecWorkspaceInfo;
  transcript_cache?: {
    entries: number;
    paths: string[];
  };
}

export interface WSMessage {
  type: "session_created" | "session_updated" | "agent_created" | "agent_updated" | "new_event";
  data: Session | Agent | DashboardEvent;
  timestamp: string;
}

export type OpenSpecStage =
  | "proposal"
  | "design"
  | "specs"
  | "tasks"
  | "implementing"
  | "complete";

export interface OpenSpecArtifact {
  id: string;
  outputPath: string;
  status: string;
  done: boolean;
}

export interface OpenSpecTaskProgress {
  completed: number;
  total: number;
  remaining: number;
  percent: number;
}

export interface OpenSpecTaskItem {
  id: string;
  text: string;
  done: boolean;
  line: number;
  sectionId: string;
  sectionTitle: string;
}

export interface OpenSpecTaskSection {
  id: string;
  title: string;
  line: number;
  completed: number;
  total: number;
  tasks: OpenSpecTaskItem[];
}

export interface OpenSpecControlPlaneLifecycle {
  state:
    | "idle"
    | "active"
    | "ready"
    | "reopened"
    | "replaying"
    | "dispatching"
    | "executing"
    | "blocked"
    | "completed";
  label: string;
  summary: string;
  latestAction: {
    id: number;
    nodeId: string;
    actionType: "replay" | "reopen";
    status: string;
    source: string;
    notes: string | null;
    payload: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  latestDispatch: {
    id: number;
    nodeId: string;
    actionType: "replay" | "reopen";
    adapterId: string | null;
    runtime: string | null;
    status: "queued" | "running" | "completed" | "failed" | "blocked";
    source: string;
    actionId: number | null;
    command: string | null;
    prompt: string | null;
    payload: Record<string, unknown> | null;
    pid: number | null;
    error: string | null;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  updatedAt: string | null;
}

export interface OpenSpecChange {
  name: string;
  status: string;
  stage: OpenSpecStage;
  stageLabel: string;
  lastModified: string | null;
  nextArtifact: string | null;
  readyToApply: boolean;
  applyRequires: string[];
  artifactSummary: {
    done: number;
    total: number;
  };
  taskProgress: OpenSpecTaskProgress;
  completedTasks: number;
  totalTasks: number;
  tasks: OpenSpecTaskItem[];
  taskSections: OpenSpecTaskSection[];
  changePath: string;
  artifacts: OpenSpecArtifact[];
  controlPlane: OpenSpecControlPlaneLifecycle;
}

export interface OpenSpecStageSummary {
  id: OpenSpecStage;
  label: string;
  count: number;
}

export interface OpenSpecBoardData {
  workspaceRoot: string;
  stages: OpenSpecStageSummary[];
  changes: OpenSpecChange[];
}

export interface ControlPlaneWorkerSummary {
  id: string;
  runtime: string;
  label: string;
  activeSessions: number;
  totalSessions: number;
  runningAgents: number;
  lastActivity: string | null;
}

export type ControlPlaneWorkerHealthStatus =
  | "active"
  | "idle"
  | "degraded"
  | "offline"
  | "blocked";

export interface ControlPlaneWorkerHealth {
  id: string;
  runtime: string;
  label: string;
  adapterId: string;
  adapterAvailable: boolean;
  transport: "cli";
  source: "env" | "path" | "unresolved";
  command: string;
  launchReady: boolean;
  health: ControlPlaneWorkerHealthStatus;
  summary: string;
  observedModels: string[];
  activeSessions: number;
  totalSessions: number;
  runningAgents: number;
  queuedDispatches: number;
  runningDispatches: number;
  blockedDispatches: number;
  failedDispatches: number;
  completedDispatches: number;
  lastActivity: string | null;
  lastError: string | null;
}

export interface ControlPlaneAdapter {
  id: string;
  runtime: string;
  transport: "cli";
  available: boolean;
  command: string;
  source: "env" | "path" | "unresolved";
  envKey: string;
  capabilities: {
    stages: string[];
    actions: string[];
  };
}

export interface ControlPlaneDispatch {
  preferredAdapterId: string | null;
  preferredRuntime: string | null;
  command: string | null;
  availableAdapters: string[];
  reason: string;
}

export type ControlPlaneActionType = "replay" | "reopen";

export type ControlPlaneDispatcherPhase =
  | "bootstrap"
  | "reason"
  | "dispatch"
  | "observe"
  | "reconcile"
  | "complete-or-reopen";

export interface ControlPlaneNodeRouting {
  defaultActionType: ControlPlaneActionType | null;
  availableActions: ControlPlaneActionType[];
  byAction: Partial<Record<ControlPlaneActionType, ControlPlaneDispatch>>;
}

export interface ControlPlaneNodeIntervention {
  actionType: ControlPlaneActionType;
  status: "requested" | "acknowledged" | "completed" | "rejected";
  createdAt: string;
  notes: string | null;
}

export interface ControlPlaneProjectSummary {
  name: string;
  title: string;
  stage: OpenSpecStage;
  stageLabel: string;
  updatedAt: string | null;
  readyToApply: boolean;
  nextArtifact: string | null;
  changePath: string;
  artifactSummary: {
    done: number;
    total: number;
  };
  taskProgress: OpenSpecTaskProgress;
  sessionCount: number;
  activeRunCount: number;
  workerRuntimes: string[];
  actionCount?: number;
  latestActionAt?: string | null;
  dispatchCount?: number;
  latestDispatchAt?: string | null;
  dispatch?: ControlPlaneDispatch;
  graphSummary: {
    totalNodes: number;
    totalEdges: number;
    runningNodes: number;
    completedNodes: number;
  };
}

export interface ControlPlaneOverviewData {
  workspaceRoot: string;
  generatedAt: string;
  summary: {
    totalProjects: number;
    activeProjects: number;
    readyProjects: number;
    activeWorkers: number;
    runningSessions: number;
    availableAdapters: number;
  };
  adapters: ControlPlaneAdapter[];
  workers: ControlPlaneWorkerSummary[];
  projects: ControlPlaneProjectSummary[];
}

export interface ControlPlaneBlackboardEntry {
  id: string;
  label: string;
  kind?: string;
  status?: string;
  value?: string;
}

export interface ControlPlaneBlackboard {
  facts: ControlPlaneBlackboardEntry[];
  intents: ControlPlaneBlackboardEntry[];
  hints: ControlPlaneBlackboardEntry[];
  settings: ControlPlaneBlackboardEntry[];
}

export interface ControlPlaneSessionSummary {
  id: string;
  name: string | null;
  status: SessionStatus;
  cwd: string | null;
  model: string | null;
  updatedAt: string | null;
  startedAt: string;
  endedAt: string | null;
  agentCount: number;
  runningAgents: number;
  runtime: string;
}

export interface ControlPlaneGraphNode {
  id: string;
  label: string;
  subtitle: string;
  kind: "project" | "artifact" | "task" | "session" | "worker";
  status: string;
  column: number;
  dispatcherPhase: ControlPlaneDispatcherPhase;
  routing: ControlPlaneNodeRouting;
  intervention: ControlPlaneNodeIntervention | null;
}

export interface ControlPlaneGraphEdge {
  id: string;
  source: string;
  target: string;
  kind: string;
}

export interface ControlPlaneAction {
  id: number;
  projectName: string;
  nodeId: string;
  actionType: ControlPlaneActionType;
  status: "requested" | "acknowledged" | "completed" | "rejected";
  source: string;
  notes: string | null;
  payload: (Record<string, unknown> & { dispatch?: ControlPlaneDispatch }) | null;
  createdAt: string;
  updatedAt: string;
}

export interface ControlPlaneDispatchIntent {
  id: number;
  projectName: string;
  nodeId: string;
  actionType: ControlPlaneActionType;
  adapterId: string | null;
  runtime: string | null;
  status: "queued" | "running" | "completed" | "failed" | "blocked";
  source: string;
  actionId: number | null;
  command: string | null;
  prompt: string | null;
  payload: (Record<string, unknown> & { dispatch?: ControlPlaneDispatch }) | null;
  pid: number | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ControlPlaneActivityItem {
  id: string;
  type: "event" | "action" | "dispatch";
  timestamp: string;
  title: string;
  detail: string | null;
  status: string | null;
  source: string | null;
  sessionId: string | null;
  nodeId: string | null;
  runtime: string | null;
  toolName: string | null;
  relatedNodeIds: string[];
}

export interface ControlPlaneProjectData {
  workspaceRoot: string;
  generatedAt: string;
  project: OpenSpecChange & {
    title: string;
    changeDir: string;
  };
  blackboard: ControlPlaneBlackboard;
  actions: ControlPlaneAction[];
  dispatches: ControlPlaneDispatchIntent[];
  adapters: ControlPlaneAdapter[];
  dispatch: ControlPlaneDispatch;
  workers: ControlPlaneWorkerSummary[];
  workerHealth: ControlPlaneWorkerHealth[];
  sessions: ControlPlaneSessionSummary[];
  activity: ControlPlaneActivityItem[];
  graph: {
    nodes: ControlPlaneGraphNode[];
    edges: ControlPlaneGraphEdge[];
    stats: {
      totalNodes: number;
      totalEdges: number;
      runningNodes: number;
      completedNodes: number;
    };
  };
}

// ── Workflow types ──

export interface WorkflowStats {
  totalSessions: number;
  totalAgents: number;
  totalSubagents: number;
  avgSubagents: number;
  successRate: number;
  avgDepth: number;
  avgDurationSec: number;
  totalCompactions: number;
  avgCompactions: number;
  topFlow: { source: string; target: string; count: number } | null;
}

export interface OrchestrationEdge {
  source: string;
  target: string;
  weight: number;
}

export interface OrchestrationData {
  sessionCount: number;
  mainCount: number;
  subagentTypes: Array<{ subagent_type: string; count: number; completed: number; errors: number }>;
  edges: OrchestrationEdge[];
  outcomes: Array<{ status: string; count: number }>;
  compactions: { total: number; sessions: number };
}

export interface ToolFlowTransition {
  source: string;
  target: string;
  value: number;
}

export interface ToolFlowData {
  transitions: ToolFlowTransition[];
  toolCounts: Array<{ tool_name: string; count: number }>;
}

export interface SubagentEffectivenessItem {
  subagent_type: string;
  total: number;
  completed: number;
  errors: number;
  sessions: number;
  successRate: number;
  avgDuration: number | null;
  trend: number[];
}

export interface WorkflowPattern {
  steps: string[];
  count: number;
  percentage: number;
}

export interface WorkflowPatternsData {
  patterns: WorkflowPattern[];
  soloSessionCount: number;
  soloPercentage: number;
}

export interface ModelDelegationData {
  mainModels: Array<{ model: string; agent_count: number; session_count: number }>;
  subagentModels: Array<{ model: string; agent_count: number }>;
  tokensByModel: Array<{
    model: string;
    input_tokens: number;
    output_tokens: number;
    cache_read_tokens: number;
    cache_write_tokens: number;
  }>;
}

export interface ErrorPropagationData {
  byDepth: Array<{ depth: number; count: number }>;
  byType: Array<{ subagent_type: string; count: number }>;
  eventErrors: Array<{ summary: string; count: number }>;
  sessionsWithErrors: number;
  totalSessions: number;
  errorRate: number;
}

export interface ConcurrencyLane {
  name: string;
  avgStart: number;
  avgEnd: number;
  count: number;
}

export interface ConcurrencyData {
  aggregateLanes: ConcurrencyLane[];
}

export interface SessionComplexityItem {
  id: string;
  name: string | null;
  status: string;
  duration: number;
  agentCount: number;
  subagentCount: number;
  totalTokens: number;
  model: string | null;
}

export interface CompactionImpactData {
  totalCompactions: number;
  tokensRecovered: number;
  perSession: Array<{ session_id: string; compactions: number }>;
  sessionsWithCompactions: number;
  totalSessions: number;
}

export interface WorkflowData {
  stats: WorkflowStats;
  orchestration: OrchestrationData;
  toolFlow: ToolFlowData;
  effectiveness: SubagentEffectivenessItem[];
  patterns: WorkflowPatternsData;
  modelDelegation: ModelDelegationData;
  errorPropagation: ErrorPropagationData;
  concurrency: ConcurrencyData;
  complexity: SessionComplexityItem[];
  compaction: CompactionImpactData;
  cooccurrence: Array<{ source: string; target: string; weight: number }>;
}

export interface SessionDrillIn {
  session: Session;
  tree: Array<{
    id: string;
    name: string;
    type: string;
    subagent_type: string | null;
    status: string;
    task: string | null;
    started_at: string;
    ended_at: string | null;
    children: SessionDrillIn["tree"];
  }>;
  toolTimeline: Array<{
    id: number;
    tool_name: string;
    event_type: string;
    agent_id: string | null;
    created_at: string;
    summary: string | null;
  }>;
  swimLanes: Array<{
    id: string;
    name: string;
    type: string;
    subagent_type: string | null;
    status: string;
    started_at: string;
    ended_at: string | null;
    parent_agent_id: string | null;
  }>;
  events: DashboardEvent[];
}

export const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  idle: {
    label: "Idle",
    color: "text-gray-500",
    bg: "bg-transparent border-border",
    dot: "bg-gray-500",
  },
  connected: {
    label: "Connected",
    color: "text-accent",
    bg: "bg-accent-muted border-accent/30",
    dot: "bg-accent",
  },
  working: {
    label: "Working",
    color: "text-accent",
    bg: "bg-accent-muted border-accent/30",
    dot: "bg-accent",
  },
  completed: {
    label: "Completed",
    color: "text-gray-400",
    bg: "bg-transparent border-border",
    dot: "bg-gray-500",
  },
  error: {
    label: "Error",
    color: "text-gray-200",
    bg: "bg-gray-500/10 border-gray-400/30",
    dot: "bg-gray-400",
  },
};

export const SESSION_STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; color: string; bg: string }
> = {
  active: {
    label: "Active",
    color: "text-accent",
    bg: "bg-accent-muted border-accent/30",
  },
  completed: {
    label: "Completed",
    color: "text-gray-400",
    bg: "bg-transparent border-border",
  },
  error: { label: "Error", color: "text-gray-200", bg: "bg-gray-500/10 border-gray-400/30" },
  abandoned: {
    label: "Abandoned",
    color: "text-gray-300",
    bg: "bg-gray-500/10 border-gray-400/30",
  },
};
