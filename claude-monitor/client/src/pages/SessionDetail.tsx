/**
 * @file Session detail with agent tree on the left and a live output reader on the right.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Clock,
  Cpu,
  DollarSign,
  FileText,
  FolderOpen,
  GitBranch,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { api } from "../lib/api";
import { eventBus } from "../lib/eventBus";
import { AgentCard } from "../components/AgentCard";
import { MarkdownOutput } from "../components/MarkdownOutput";
import { AgentStatusBadge, SessionStatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/Button";
import {
  formatDateTime,
  formatDuration,
  fmtCostFull,
  timeAgo,
  truncate,
} from "../lib/format";
import type {
  Agent,
  CostResult,
  DashboardEvent,
  Session,
  SessionOutputs,
  SessionStatus,
} from "../lib/types";

function toTime(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function countDescendants(agentId: string, childrenByParent: Map<string, Agent[]>): number {
  const children = childrenByParent.get(agentId) || [];
  return children.reduce((count, child) => count + 1 + countDescendants(child.id, childrenByParent), 0);
}

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [outputs, setOutputs] = useState<SessionOutputs>({ agents: [], latest_output_agent_id: null });
  const [cost, setCost] = useState<CostResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const outputScrollRef = useRef<HTMLDivElement | null>(null);
  const previousLatestRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [data, costData] = await Promise.all([
        api.sessions.get(id),
        api.pricing.sessionCost(id).catch(() => null),
      ]);
      setSession(data.session);
      setAgents(data.agents);
      setEvents(data.events);
      setOutputs(data.outputs);
      setCost(costData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const parentsWithActiveChildren = new Set<string>();
    for (const agent of agents) {
      if (agent.parent_agent_id && (agent.status === "working" || agent.status === "connected")) {
        parentsWithActiveChildren.add(agent.parent_agent_id);
      }
    }

    if (parentsWithActiveChildren.size > 0) {
      const agentMap = new Map(agents.map((agent) => [agent.id, agent]));
      const toExpand = new Set<string>();
      for (const parentId of parentsWithActiveChildren) {
        let current = parentId;
        while (current) {
          toExpand.add(current);
          const parent = agentMap.get(current);
          current = parent?.parent_agent_id ?? "";
        }
      }
      setExpandedAgents((previous) => new Set([...previous, ...toExpand]));
    }
  }, [agents]);

  useEffect(() => {
    return eventBus.subscribe((msg) => {
      if (
        msg.type === "agent_created" ||
        msg.type === "agent_updated" ||
        msg.type === "session_updated" ||
        msg.type === "new_event"
      ) {
        load();
      }
    });
  }, [load]);

  const agentMap = useMemo(() => new Map(agents.map((agent) => [agent.id, agent])), [agents]);
  const outputMap = useMemo(
    () => new Map(outputs.agents.map((output) => [output.agent_id, output])),
    [outputs.agents]
  );

  const orderedAgents = useMemo(
    () =>
      [...agents].sort((a, b) => {
        const aOutput = outputMap.get(a.id);
        const bOutput = outputMap.get(b.id);
        const timestampDiff =
          toTime(bOutput?.latest_timestamp || b.updated_at) -
          toTime(aOutput?.latest_timestamp || a.updated_at);
        if (timestampDiff !== 0) return timestampDiff;
        return a.name.localeCompare(b.name);
      }),
    [agents, outputMap]
  );

  useEffect(() => {
    if (orderedAgents.length === 0) {
      setSelectedAgentId(null);
      return;
    }

    const latestAgentId = outputs.latest_output_agent_id || orderedAgents[0]?.id || null;
    const latestFeed = latestAgentId ? outputMap.get(latestAgentId) : null;
    const latestSignature = latestFeed?.latest_output
      ? `${latestFeed.agent_id}:${latestFeed.latest_output.id}`
      : null;

    setSelectedAgentId((current) => {
      if (!current) return latestAgentId;
      if (!agentMap.has(current)) return latestAgentId;
      return current;
    });

    if (latestAgentId && latestSignature && previousLatestRef.current !== latestSignature) {
      previousLatestRef.current = latestSignature;
      setSelectedAgentId(latestAgentId);
      setRefreshKey((value) => value + 1);
      if (typeof outputScrollRef.current?.scrollTo === "function") {
        outputScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [orderedAgents, outputs.latest_output_agent_id, outputMap, agentMap]);

  const selectedAgent = selectedAgentId ? agentMap.get(selectedAgentId) || null : null;
  const selectedOutput = selectedAgentId ? outputMap.get(selectedAgentId) || null : null;
  const latestOutputAgent = outputs.latest_output_agent_id
    ? agentMap.get(outputs.latest_output_agent_id) || null
    : null;

  const childrenByParent = useMemo(() => {
    const grouped = new Map<string, Agent[]>();
    for (const agent of agents) {
      if (agent.parent_agent_id && agentMap.has(agent.parent_agent_id)) {
        const bucket = grouped.get(agent.parent_agent_id) || [];
        bucket.push(agent);
        grouped.set(agent.parent_agent_id, bucket);
      }
    }
    return grouped;
  }, [agents, agentMap]);

  const rootAgents = useMemo(
    () =>
      agents.filter(
        (agent) => !agent.parent_agent_id || !agentMap.has(agent.parent_agent_id)
      ),
    [agents, agentMap]
  );

  const orphanedAgents = useMemo(
    () =>
      rootAgents.filter(
        (agent) => agent.type === "subagent" && agent.parent_agent_id && !agentMap.has(agent.parent_agent_id)
      ),
    [rootAgents, agentMap]
  );

  const rootTreeAgents = useMemo(
    () =>
      rootAgents.filter(
        (agent) => !(agent.type === "subagent" && agent.parent_agent_id && !agentMap.has(agent.parent_agent_id))
      ),
    [rootAgents, agentMap]
  );

  const renderAgentNode = (agent: Agent, depth: number): React.ReactNode => {
    const children = childrenByParent.get(agent.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedAgents.has(agent.id);
    const totalDescendants = hasChildren ? countDescendants(agent.id, childrenByParent) : 0;
    const hasOutput = (outputMap.get(agent.id)?.output_count || 0) > 0;

    return (
      <div key={agent.id}>
        <div className="flex items-center gap-1 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={() =>
                setExpandedAgents((previous) => {
                  const next = new Set(previous);
                  if (next.has(agent.id)) next.delete(agent.id);
                  else next.add(agent.id);
                  return next;
                })
              }
              className="p-1 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-5 flex-shrink-0" />
          )}

          {depth > 0 && <GitBranch className="w-3 h-3 text-gray-600 flex-shrink-0" />}

          <div className="flex-1 min-w-0">
            <AgentCard agent={agent} onClick={() => setSelectedAgentId(agent.id)} />
          </div>

          {hasOutput && (
            <button
              type="button"
              onClick={() => setSelectedAgentId(agent.id)}
              className={`ml-2 inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] transition-colors ${
                selectedAgentId === agent.id
                  ? "border-accent/50 bg-accent-dim text-accent"
                  : "border-border text-gray-500 hover:text-gray-300"
              }`}
            >
              <FileText className="w-3 h-3" />
              {outputMap.get(agent.id)?.output_count}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-5 mt-1 space-y-1 border-l border-border pl-3">
            {children.map((child) => renderAgentNode(child, depth + 1))}
          </div>
        )}

        {hasChildren && !isExpanded && (
          <button
            type="button"
            onClick={() => setExpandedAgents((previous) => new Set([...previous, agent.id]))}
            className="ml-6 mt-0.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            {totalDescendants} subagent{totalDescendants !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 animate-fade-in">
        Loading session...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <p className="text-gray-200 mb-2">{error || "Session not found"}</p>
        <Button variant="ghost" onClick={() => navigate("/sessions")} className="mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Sessions
        </Button>
      </div>
    );
  }

  const firstEvent = events.length > 0 ? events[0] : null;
  const historyOutputs = selectedOutput?.outputs.slice(1) || [];

  return (
    <div className="animate-fade-in space-y-10">
      <div className="flex items-start gap-4">
        <Button variant="ghost" onClick={() => navigate("/sessions")} className="mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-semibold text-gray-100">
              {session.name || `Session ${session.id.slice(0, 8)}`}
            </h2>
            <SessionStatusBadge status={session.status as SessionStatus} />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-surface-2 px-2 py-1 rounded">
              {session.id.slice(0, 16)}
            </span>
            {session.model && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-surface-2 px-2 py-1 rounded">
                <Cpu className="w-3 h-3 text-gray-500" />
                {session.model}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-surface-2 px-2 py-1 rounded">
              <Clock className="w-3 h-3 text-gray-500" />
              {firstEvent ? formatDateTime(firstEvent.created_at) : formatDateTime(session.started_at)}
              {session.ended_at && (
                <span className="text-gray-500 ml-1">
                  ({formatDuration(session.started_at, session.ended_at)})
                </span>
              )}
            </span>
            {session.cwd && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <FolderOpen className="w-3 h-3 flex-shrink-0" />
                <span className="font-mono truncate max-w-xs">{session.cwd}</span>
              </span>
            )}
            {cost && cost.total_cost > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent-dim px-2 py-1 rounded">
                <DollarSign className="w-3 h-3" />
                {fmtCostFull(cost.total_cost).slice(1)}
              </span>
            )}
          </div>
        </div>

        <Button variant="ghost" onClick={load}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-3.5 h-3.5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-300">Agents ({agents.length})</h3>
            </div>

            {agents.length === 0 ? (
              <p className="text-sm text-gray-500">No agents recorded.</p>
            ) : (
              <div className="space-y-2">
                {rootTreeAgents.map((agent) => renderAgentNode(agent, 0))}
                {orphanedAgents.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[11px] text-gray-600 mb-2 uppercase tracking-wider">
                      Unparented Subagents
                    </p>
                    <div className="space-y-1">
                      {orphanedAgents.map((agent) => renderAgentNode(agent, 1))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {cost && cost.breakdown.length > 0 && cost.total_cost > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-300">Cost Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">
                        Input
                      </th>
                      <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">
                        Output
                      </th>
                      <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">
                        Cache Read
                      </th>
                      <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">
                        Cache Write
                      </th>
                      <th className="pb-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider text-right">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cost.breakdown.map((row) => (
                      <tr key={row.model} className="hover:bg-surface-2 transition-colors">
                        <td className="py-2.5 pr-4 text-sm font-mono text-gray-300">{row.model}</td>
                        <td className="py-2.5 pr-4 text-sm text-gray-400 text-right font-mono">
                          {row.input_tokens.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-4 text-sm text-gray-400 text-right font-mono">
                          {row.output_tokens.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-4 text-sm text-gray-400 text-right font-mono">
                          {row.cache_read_tokens.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-4 text-sm text-gray-400 text-right font-mono">
                          {row.cache_write_tokens.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-sm text-accent text-right font-mono font-medium">
                          {fmtCostFull(row.cost, 4)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-surface-2">
                      <td className="py-2.5 pr-4 text-sm font-medium text-gray-200" colSpan={5}>
                        Total
                      </td>
                      <td className="py-2.5 text-sm text-accent text-right font-mono font-semibold">
                        {fmtCostFull(cost.total_cost, 4)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
              <h3 className="text-sm font-medium text-gray-300">Event Timeline ({events.length})</h3>
            </div>

            {events.length === 0 ? (
              <p className="text-sm text-gray-500">No events recorded.</p>
            ) : (
              <div className="space-y-px">
                {events.map((event, index) => (
                  <div
                    key={event.id ?? index}
                    className="flex items-center gap-4 px-3 py-2.5 hover:bg-surface-2 rounded transition-colors min-w-0 animate-slide-up"
                    style={{ animationDelay: `${index * 15}ms` }}
                  >
                    <div className="w-14 text-[11px] text-gray-600 font-mono flex-shrink-0">
                      {timeAgo(event.created_at)}
                    </div>
                    <AgentStatusBadge
                      status={
                        event.event_type === "Stop" || event.event_type === "Compaction"
                          ? "completed"
                          : event.event_type === "PreToolUse"
                            ? "working"
                            : event.event_type === "error"
                              ? "error"
                              : "connected"
                      }
                      pulse
                    />
                    <span className="text-sm text-gray-300 flex-1 truncate">
                      {event.summary || event.event_type}
                    </span>
                    {event.tool_name && (
                      <span className="text-[11px] px-2 py-0.5 bg-surface-2 rounded text-gray-500 font-mono flex-shrink-0">
                        {event.tool_name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="xl:sticky xl:top-6 self-start">
          <section className="border border-border rounded-xl bg-surface-1/80 backdrop-blur-sm">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Live Reader</p>
                  <h3 className="mt-2 text-base font-semibold text-gray-100">Agent Output</h3>
                </div>
                {latestOutputAgent && (
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Newest</p>
                    <p className="mt-1 text-sm text-accent">{truncate(latestOutputAgent.name, 20)}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {orderedAgents.map((agent) => {
                  const feed = outputMap.get(agent.id);
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`rounded-md border px-3 py-2 text-left transition-colors ${
                        isSelected
                          ? "border-accent/50 bg-accent-dim text-gray-100"
                          : "border-border bg-surface-2 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {agent.type === "main" ? (
                          <Bot className="w-3.5 h-3.5" />
                        ) : (
                          <GitBranch className="w-3.5 h-3.5" />
                        )}
                        <span className="text-sm font-medium">{truncate(agent.name, 22)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                        <span>{feed?.output_count || 0} entries</span>
                        <span>|</span>
                        <span>{feed?.latest_timestamp ? timeAgo(feed.latest_timestamp) : "No output yet"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={outputScrollRef} className="max-h-[74vh] overflow-y-auto px-5 py-5">
              {selectedAgent && selectedOutput?.latest_output ? (
                <div className="space-y-6">
                  <div key={refreshKey} className="animate-slide-up rounded-xl border border-accent/20 bg-accent-dim/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Latest Output</p>
                        <h4 className="mt-2 text-base font-semibold text-gray-100">{selectedAgent.name}</h4>
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedOutput.latest_output.timestamp
                            ? formatDateTime(selectedOutput.latest_output.timestamp)
                            : "Timestamp unavailable"}
                        </p>
                      </div>
                      <AgentStatusBadge status={selectedAgent.status} pulse />
                    </div>

                    {selectedOutput.transcript_path && (
                      <p className="mt-4 text-[11px] font-mono text-gray-600">
                        {truncate(selectedOutput.transcript_path, 56)}
                      </p>
                    )}

                    <div className="mt-5 border-t border-border/70 pt-5">
                      <MarkdownOutput markdown={selectedOutput.latest_output.markdown} />
                    </div>
                  </div>

                  {historyOutputs.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Output History</p>
                          <p className="mt-1 text-sm text-gray-400">
                            {historyOutputs.length} earlier message{historyOutputs.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>

                      {historyOutputs.map((message) => (
                        <article key={message.id} className="rounded-lg border border-border bg-surface-2 px-4 py-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                              {message.source === "transcript" ? "Transcript" : "Hook snapshot"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {message.timestamp ? formatDateTime(message.timestamp) : "Timestamp unavailable"}
                            </p>
                          </div>
                          <div className="mt-4">
                            <MarkdownOutput markdown={message.markdown} />
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              ) : selectedAgent ? (
                <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
                  <p className="text-sm font-medium text-gray-300">{selectedAgent.name}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    No assistant output has been captured for this agent yet.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
                  <p className="text-sm text-gray-500">Select an agent to inspect its output.</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
