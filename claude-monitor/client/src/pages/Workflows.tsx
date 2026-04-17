/**
 * @file Workflows.tsx
 * @description Displays workflow analytics plus a real session team map derived from captured agent hierarchy.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Workflow, RefreshCw, Download, AlertCircle, Info } from "lucide-react";
import { api } from "../lib/api";
import { eventBus } from "../lib/eventBus";
import type {
  ConcurrencyData,
  ErrorPropagationData,
  ModelDelegationData,
  SessionDrillIn as SessionDrillInData,
  SubagentEffectivenessItem,
  ToolFlowData,
  WorkflowData,
  WorkflowPatternsData,
  WSMessage,
} from "../lib/types";

import { WorkflowStats } from "../components/workflows/WorkflowStats";
import { OrchestrationDAG } from "../components/workflows/OrchestrationDAG";
import { ToolExecutionFlow } from "../components/workflows/ToolExecutionFlow";
import { AgentCollaborationNetwork } from "../components/workflows/AgentCollaborationNetwork";
import { SubagentEffectiveness } from "../components/workflows/SubagentEffectiveness";
import { WorkflowPatterns } from "../components/workflows/WorkflowPatterns";
import { ModelDelegationFlow } from "../components/workflows/ModelDelegationFlow";
import { ErrorPropagationMap } from "../components/workflows/ErrorPropagationMap";
import { ConcurrencyTimeline } from "../components/workflows/ConcurrencyTimeline";
import { SessionComplexityScatter } from "../components/workflows/SessionComplexityScatter";
import { CompactionImpact } from "../components/workflows/CompactionImpact";
import { SessionDrillIn } from "../components/workflows/SessionDrillIn";

type StatusFilter = "all" | "active" | "completed";

function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const normalized = /[Zz]$|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
  const time = new Date(normalized).getTime();
  return Number.isFinite(time) ? time : null;
}

function deriveToolFlow(session: SessionDrillInData): ToolFlowData {
  const transitions = new Map<string, number>();
  const toolCounts = new Map<string, number>();
  const timeline = session.toolTimeline.filter((item) => item.tool_name);

  for (let i = 0; i < timeline.length; i++) {
    const current = timeline[i]!.tool_name!;
    toolCounts.set(current, (toolCounts.get(current) ?? 0) + 1);
    const next = timeline[i + 1]?.tool_name;
    if (next) {
      const key = `${current}>>>${next}`;
      transitions.set(key, (transitions.get(key) ?? 0) + 1);
    }
  }

  return {
    transitions: [...transitions.entries()].map(([key, value]) => {
      const parts = key.split(">>>");
      const source = parts[0];
      const target = parts[1];
      if (!source || !target) return null;
      return { source, target, value };
    }).filter((item): item is { source: string; target: string; value: number } => Boolean(item)),
    toolCounts: [...toolCounts.entries()].map(([tool_name, count]) => ({ tool_name, count })),
  };
}

function deriveEffectiveness(session: SessionDrillInData): SubagentEffectivenessItem[] {
  const grouped = new Map<
    string,
    { total: number; completed: number; errors: number; durations: number[] }
  >();

  for (const lane of session.swimLanes) {
    if (lane.type !== "subagent" || !lane.subagent_type) continue;
    const entry =
      grouped.get(lane.subagent_type) ?? { total: 0, completed: 0, errors: 0, durations: [] };
    entry.total += 1;
    if (lane.status === "completed") entry.completed += 1;
    if (lane.status === "error") entry.errors += 1;
    const start = parseTimestamp(lane.started_at);
    const end = parseTimestamp(lane.ended_at);
    if (start !== null && end !== null && end >= start) {
      entry.durations.push(Math.round((end - start) / 1000));
    }
    grouped.set(lane.subagent_type, entry);
  }

  return [...grouped.entries()]
    .map(([subagent_type, entry]) => {
      const finished = entry.completed + entry.errors;
      return {
        subagent_type,
        total: entry.total,
        completed: entry.completed,
        errors: entry.errors,
        sessions: entry.total > 0 ? 1 : 0,
        successRate: finished > 0 ? +((entry.completed / finished) * 100).toFixed(1) : 100,
        avgDuration:
          entry.durations.length > 0
            ? Math.round(entry.durations.reduce((sum, value) => sum + value, 0) / entry.durations.length)
            : null,
        trend: [0, 0, 0, 0, 0, 0, entry.total],
      };
    })
    .sort((a, b) => b.total - a.total);
}

function derivePatterns(session: SessionDrillInData): WorkflowPatternsData {
  const steps = session.swimLanes
    .filter((lane) => lane.type === "subagent" && lane.subagent_type)
    .sort((a, b) => (parseTimestamp(a.started_at) ?? 0) - (parseTimestamp(b.started_at) ?? 0))
    .map((lane) => lane.subagent_type!);

  if (steps.length === 0) {
    return {
      patterns: [],
      soloSessionCount: 1,
      soloPercentage: 100,
    };
  }

  return {
    patterns: [
      {
        steps,
        count: 1,
        percentage: 100,
      },
    ],
    soloSessionCount: 0,
    soloPercentage: 0,
  };
}

function deriveModelDelegation(session: SessionDrillInData): ModelDelegationData {
  const sessionModel = session.session.model || "unknown";
  const subagentCount = session.swimLanes.filter((lane) => lane.type === "subagent").length;

  return {
    mainModels: [{ model: sessionModel, agent_count: 1, session_count: 1 }],
    subagentModels:
      subagentCount > 0 ? [{ model: sessionModel, agent_count: subagentCount }] : [],
    tokensByModel: [],
  };
}

function walkTree(
  nodes: SessionDrillInData["tree"],
  visit: (node: SessionDrillInData["tree"][number], depth: number) => void,
  depth = 0
) {
  for (const node of nodes) {
    visit(node, depth);
    walkTree(node.children, visit, depth + 1);
  }
}

function deriveErrorPropagation(session: SessionDrillInData): ErrorPropagationData {
  const byDepth = new Map<number, number>();
  const byType = new Map<string, number>();

  walkTree(session.tree, (node, depth) => {
    if (node.status !== "error") return;
    byDepth.set(depth, (byDepth.get(depth) ?? 0) + 1);
    if (node.subagent_type) {
      byType.set(node.subagent_type, (byType.get(node.subagent_type) ?? 0) + 1);
    }
  });

  const eventErrors = session.events
    .filter(
      (event) =>
        event.event_type === "APIError" ||
        (event.event_type === "Stop" && typeof event.summary === "string" && event.summary.includes("Error"))
    )
    .reduce<Array<{ summary: string; count: number }>>((acc, event) => {
      const summary = event.summary || event.event_type;
      const existing = acc.find((item) => item.summary === summary);
      if (existing) existing.count += 1;
      else acc.push({ summary, count: 1 });
      return acc;
    }, []);

  if (session.session.status === "error" && !byDepth.has(0)) {
    byDepth.set(0, 1);
  }

  const sessionsWithErrors = byDepth.size > 0 || eventErrors.length > 0 || session.session.status === "error" ? 1 : 0;

  return {
    byDepth: [...byDepth.entries()].map(([depth, count]) => ({ depth, count })),
    byType: [...byType.entries()].map(([subagent_type, count]) => ({ subagent_type, count })),
    eventErrors,
    sessionsWithErrors,
    totalSessions: 1,
    errorRate: sessionsWithErrors ? 100 : 0,
  };
}

function deriveConcurrency(session: SessionDrillInData): ConcurrencyData {
  const laneBuckets = new Map<string, { starts: number[]; ends: number[]; count: number }>();
  const sessionStart =
    parseTimestamp(session.session.started_at) ??
    Math.min(...session.swimLanes.map((lane) => parseTimestamp(lane.started_at) ?? Date.now()));
  const sessionEndCandidate = session.session.ended_at
    ? parseTimestamp(session.session.ended_at)
    : Math.max(
        ...session.swimLanes.map(
          (lane) => parseTimestamp(lane.ended_at) ?? parseTimestamp(lane.started_at) ?? Date.now()
        ),
        Date.now()
      );
  const sessionDuration = Math.max(1, (sessionEndCandidate ?? Date.now()) - sessionStart);

  for (const lane of session.swimLanes) {
    const name = lane.type === "main" ? "Main Agent" : lane.subagent_type || "unknown";
    const start = parseTimestamp(lane.started_at) ?? sessionStart;
    const end = parseTimestamp(lane.ended_at) ?? (sessionEndCandidate ?? start);
    const bucket = laneBuckets.get(name) ?? { starts: [], ends: [], count: 0 };
    bucket.starts.push(Math.max(0, Math.min(1, (start - sessionStart) / sessionDuration)));
    bucket.ends.push(Math.max(0, Math.min(1, (end - sessionStart) / sessionDuration)));
    bucket.count += 1;
    laneBuckets.set(name, bucket);
  }

  return {
    aggregateLanes: [...laneBuckets.entries()].map(([name, bucket]) => ({
      name,
      avgStart: +(bucket.starts.reduce((sum, value) => sum + value, 0) / bucket.starts.length).toFixed(3),
      avgEnd: +(bucket.ends.reduce((sum, value) => sum + value, 0) / bucket.ends.length).toFixed(3),
      count: bucket.count,
    })),
  };
}

function deriveCooccurrence(session: SessionDrillInData) {
  const ordered = session.swimLanes
    .filter((lane) => lane.type === "subagent" && lane.subagent_type)
    .sort((a, b) => (parseTimestamp(a.started_at) ?? 0) - (parseTimestamp(b.started_at) ?? 0));
  const edges = new Map<string, number>();

  for (let i = 0; i < ordered.length - 1; i++) {
    const source = ordered[i]!.subagent_type!;
    const target = ordered[i + 1]!.subagent_type!;
    if (source === target) continue;
    const key = `${source}>>>${target}`;
    edges.set(key, (edges.get(key) ?? 0) + 1);
  }

  return [...edges.entries()].map(([key, weight]) => {
    const parts = key.split(">>>");
    const source = parts[0];
    const target = parts[1];
    if (!source || !target) return null;
    return { source, target, weight };
  }).filter((item): item is { source: string; target: string; weight: number } => Boolean(item));
}

export function Workflows() {
  const [data, setData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [autoSelectedSession, setAutoSelectedSession] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [teamSession, setTeamSession] = useState<Awaited<
    ReturnType<typeof api.workflows.session>
  > | null>(null);
  const [teamSessionLoading, setTeamSessionLoading] = useState(false);
  const [teamSessionError, setTeamSessionError] = useState<string | null>(null);

  const effectiveToolFlow = useMemo<ToolFlowData>(
    () => (teamSession ? deriveToolFlow(teamSession) : data?.toolFlow ?? { transitions: [], toolCounts: [] }),
    [data?.toolFlow, teamSession]
  );
  const effectiveEffectiveness = useMemo<SubagentEffectivenessItem[]>(
    () => (teamSession ? deriveEffectiveness(teamSession) : data?.effectiveness ?? []),
    [data?.effectiveness, teamSession]
  );
  const effectivePatterns = useMemo<WorkflowPatternsData>(
    () =>
      teamSession
        ? derivePatterns(teamSession)
        : data?.patterns ?? { patterns: [], soloSessionCount: 0, soloPercentage: 0 },
    [data?.patterns, teamSession]
  );
  const effectiveModelDelegation = useMemo<ModelDelegationData>(
    () =>
      teamSession
        ? deriveModelDelegation(teamSession)
        : data?.modelDelegation ?? { mainModels: [], subagentModels: [], tokensByModel: [] },
    [data?.modelDelegation, teamSession]
  );
  const effectiveErrorPropagation = useMemo<ErrorPropagationData>(
    () =>
      teamSession
        ? deriveErrorPropagation(teamSession)
        : data?.errorPropagation ?? {
            byDepth: [],
            byType: [],
            eventErrors: [],
            sessionsWithErrors: 0,
            totalSessions: 0,
            errorRate: 0,
          },
    [data?.errorPropagation, teamSession]
  );
  const effectiveConcurrency = useMemo<ConcurrencyData>(
    () => (teamSession ? deriveConcurrency(teamSession) : data?.concurrency ?? { aggregateLanes: [] }),
    [data?.concurrency, teamSession]
  );
  const effectiveCooccurrence = useMemo(
    () => (teamSession ? deriveCooccurrence(teamSession) : data?.cooccurrence ?? []),
    [data?.cooccurrence, teamSession]
  );

  const orchestrationSubtitle = teamSessionLoading
    ? "Loading focused session topology."
    : teamSessionError
      ? `Focused session topology unavailable: ${teamSessionError}. Falling back to aggregate relationships.`
      : teamSession
        ? "Focused session shows real agent-team parent-child links. Click a node to filter by agent type."
        : "No focused session selected. Showing aggregate spawning relationships by agent type.";
  const toolFlowSubtitle = teamSession
    ? "Focused session tool flow derived from the selected session timeline."
    : "How tools chain together in aggregate.";
  const pipelineSubtitle = teamSession
    ? "Focused session pipeline based on actual subagent start order."
    : "Aggregate workflow by agent type, showing which categories tend to run after which.";
  const effectivenessSubtitle = teamSession
    ? "Focused session performance metrics for the selected session."
    : "Performance metrics per agent type";
  const patternsSubtitle = teamSession
    ? "Focused session orchestration path for the selected session."
    : "Common agent orchestration sequences";
  const modelSubtitle = teamSession
    ? "Focused session model routing. Subagent model granularity is limited to what the monitor captures."
    : "How models route through agent hierarchies";
  const errorSubtitle = teamSession
    ? "Focused session error distribution across the selected agent hierarchy."
    : "Where errors cluster in agent hierarchy depth";
  const concurrencySubtitle = teamSession
    ? "Focused session timeline using actual agent start and end timestamps."
    : "Parallel agent execution patterns and overlap in time";

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await api.workflows.get(statusFilter);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow data");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const initialSessionId = data?.complexity?.[0]?.id;
    if (!autoSelectedSession && !selectedSessionId && initialSessionId) {
      setSelectedSessionId(initialSessionId);
      setAutoSelectedSession(true);
    }
  }, [autoSelectedSession, data, selectedSessionId]);

  useEffect(() => {
    if (!selectedSessionId) {
      setTeamSession(null);
      setTeamSessionError(null);
      setTeamSessionLoading(false);
      return;
    }

    let cancelled = false;
    setTeamSessionLoading(true);
    setTeamSessionError(null);

    api.workflows
      .session(selectedSessionId)
      .then((result) => {
        if (!cancelled) {
          setTeamSession(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTeamSession(null);
          setTeamSessionError(err instanceof Error ? err.message : "Failed to load session");
        }
      })
      .finally(() => {
        if (!cancelled) setTeamSessionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSessionId]);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    const handler = (_msg: WSMessage) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fetchData, 3000);
    };
    const unsub = eventBus.subscribe(handler);
    return () => {
      unsub();
      clearTimeout(debounceTimer);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  const handleExport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflows-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onRefresh={handleRefresh}
          onExport={handleExport}
          lastUpdated={null}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-surface-2" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card h-64 animate-pulse bg-surface-2" />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onRefresh={handleRefresh}
          onExport={handleExport}
          lastUpdated={null}
        />
        <div className="card flex flex-col items-center justify-center gap-4 py-16">
          <AlertCircle className="h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-300">{error}</p>
          <button onClick={handleRefresh} className="btn-primary text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={handleRefresh}
        onExport={handleExport}
        lastUpdated={lastUpdated}
      />

      <WorkflowStats stats={data.stats} />

      <Section
        number={1}
        title="Agent Orchestration Graph"
        subtitle={orchestrationSubtitle}
      >
        <OrchestrationDAG
          data={data.orchestration}
          focusedSession={teamSession}
          onNodeClick={setSelectedNode}
          selectedNode={selectedNode}
        />
        {selectedNode && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Filtered by:</span>
            <span className="badge border border-accent/20 bg-accent/15 text-xs text-accent">
              {selectedNode}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-gray-500 underline hover:text-gray-300"
            >
              Clear filter
            </button>
          </div>
        )}
      </Section>

      <Section
        number={2}
        title="Tool Execution Flow"
        subtitle={toolFlowSubtitle}
      >
        <ToolExecutionFlow data={effectiveToolFlow} filterAgentType={selectedNode} />
      </Section>

      <Section
        number={3}
        title="Agent Type Pipeline Graph"
        subtitle={pipelineSubtitle}
      >
        <AgentCollaborationNetwork
          effectiveness={effectiveEffectiveness}
          edges={effectiveCooccurrence}
        />
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section
          number={4}
          title="Subagent Effectiveness"
          subtitle={effectivenessSubtitle}
        >
          <SubagentEffectiveness data={effectiveEffectiveness} />
        </Section>

        <Section
          number={5}
          title="Detected Workflow Patterns"
          subtitle={patternsSubtitle}
        >
          <WorkflowPatterns data={effectivePatterns} onPatternClick={() => {}} />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section
          number={6}
          title="Model Delegation Flow"
          subtitle={modelSubtitle}
        >
          <ModelDelegationFlow data={effectiveModelDelegation} />
        </Section>

        <Section
          number={7}
          title="Error Propagation Map"
          subtitle={errorSubtitle}
        >
          <ErrorPropagationMap data={effectiveErrorPropagation} />
        </Section>
      </div>

      <Section
        number={8}
        title="Agent Concurrency Timeline"
        subtitle={concurrencySubtitle}
      >
        <ConcurrencyTimeline data={effectiveConcurrency} />
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section
          number={9}
          title="Session Complexity Scatter"
          subtitle="Duration vs agent count vs tokens. Bubble size = token usage."
        >
          <SessionComplexityScatter data={data.complexity} onSessionClick={setSelectedSessionId} />
        </Section>

        <Section
          number={10}
          title="Compaction Impact Analysis"
          subtitle="Context compression events and token recovery"
        >
          <CompactionImpact data={data.compaction} />
        </Section>
      </div>

      <Section
        number={11}
        title="Session Drill-In"
        subtitle="Select a session from the scatter plot or use the dropdown to explore"
      >
        <SessionDrillIn
          sessionId={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
          onSelectSession={(id) => setSelectedSessionId(id)}
        />
      </Section>
    </div>
  );
}

function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-[11px] font-bold text-accent">
            {number}
          </span>
          <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              className="flex items-center justify-center"
            >
              <Info className="h-3.5 w-3.5 text-gray-600 transition-colors hover:text-gray-400" />
            </button>
            {showTip && (
              <div className="tooltip-panel absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-2 text-[11px]">
                {subtitle}
                <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[rgb(var(--tooltip-border))]" />
              </div>
            )}
          </div>
        </div>
        <span className="hidden text-[11px] text-gray-600 lg:block">{subtitle}</span>
      </div>
      <div className="card p-4">{children}</div>
    </div>
  );
}

function PageHeader({
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onExport,
  lastUpdated,
}: {
  statusFilter: StatusFilter;
  onStatusFilterChange: (f: StatusFilter) => void;
  onRefresh: () => void;
  onExport: () => void;
  lastUpdated: Date | null;
}) {
  const filters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All Sessions" },
    { value: "active", label: "Active Only" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/30 bg-accent-muted">
          <Workflow className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-100">Workflows</h1>
          <p className="text-xs text-gray-500">Agent orchestration intelligence</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onStatusFilterChange(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-accent/15 text-accent"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-surface-3 hover:text-gray-300"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={onExport}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-surface-3 hover:text-gray-300"
          title="Export as JSON"
        >
          <Download className="h-4 w-4" />
        </button>

        {lastUpdated && (
          <span className="ml-1 text-[10px] text-gray-600">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
