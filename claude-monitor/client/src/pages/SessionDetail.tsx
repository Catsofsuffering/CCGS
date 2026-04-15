/**
 * @file SessionDetail.tsx
 * @description Session detail — one dominant visual anchor: the agent tree.
 * Cost and events are secondary sections.
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Clock,
  FolderOpen,
  Cpu,
  RefreshCw,
  DollarSign,
  ChevronDown,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import { api } from "../lib/api";
import { eventBus } from "../lib/eventBus";
import { AgentCard } from "../components/AgentCard";
import { SessionStatusBadge, AgentStatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/Button";
import { formatDateTime, formatDuration, fmtCostFull, timeAgo } from "../lib/format";
import type { Session, Agent, DashboardEvent, SessionStatus, CostResult } from "../lib/types";

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [cost, setCost] = useState<CostResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

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
    for (const a of agents) {
      if (a.parent_agent_id && (a.status === "working" || a.status === "connected")) {
        parentsWithActiveChildren.add(a.parent_agent_id);
      }
    }
    if (parentsWithActiveChildren.size > 0) {
      const agentMap = new Map(agents.map((a) => [a.id, a]));
      const toExpand = new Set<string>();
      for (const pid of parentsWithActiveChildren) {
        let cur = pid;
        while (cur) {
          toExpand.add(cur);
          const parent = agentMap.get(cur);
          cur = parent?.parent_agent_id ?? "";
        }
      }
      setExpandedAgents((prev) => new Set([...prev, ...toExpand]));
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

  // ── Agent tree ───────────────────────────────────────────────────────────────
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const childrenByParent = new Map<string, Agent[]>();
  const rootAgents: Agent[] = [];
  for (const a of agents) {
    if (a.parent_agent_id && agentMap.has(a.parent_agent_id)) {
      const list = childrenByParent.get(a.parent_agent_id) || [];
      list.push(a);
      childrenByParent.set(a.parent_agent_id, list);
    } else if (!a.parent_agent_id || !agentMap.has(a.parent_agent_id)) {
      rootAgents.push(a);
    }
  }

  function countDescendants(id: string): number {
    const kids = childrenByParent.get(id) || [];
    return kids.reduce((sum, k) => sum + 1 + countDescendants(k.id), 0);
  }

  function renderAgentNode(agent: Agent, depth: number): React.ReactNode {
    const children = childrenByParent.get(agent.id) || [];
    const isExpanded = expandedAgents.has(agent.id);
    const hasChildren = children.length > 0;
    const isSubagent = depth > 0;
    const totalDesc = hasChildren ? countDescendants(agent.id) : 0;

    return (
      <div key={agent.id}>
        <div className="flex items-center gap-1 min-w-0">
          {hasChildren && (
            <button
              onClick={() =>
                setExpandedAgents((prev) => {
                  const next = new Set(prev);
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
          )}
          {isSubagent && !hasChildren && <span className="w-5 flex-shrink-0" />}
          {isSubagent && (
            <GitBranch className="w-3 h-3 text-gray-600 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <AgentCard agent={agent} />
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-5 mt-1 space-y-1 border-l border-border pl-3">
            {children.map((child) => renderAgentNode(child, depth + 1))}
          </div>
        )}

        {hasChildren && !isExpanded && (
          <button
            onClick={() => setExpandedAgents((prev) => new Set([...prev, agent.id]))}
            className="ml-6 mt-0.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            {totalDesc} subagent{totalDesc !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    );
  }

  const firstEvent = events.length > 0 ? events[0] : null;

  const orphans = rootAgents.filter(
    (a) =>
      a.type === "subagent" && a.parent_agent_id && !agentMap.has(a.parent_agent_id)
  );
  const roots = rootAgents.filter(
    (a) =>
      !(a.type === "subagent" && a.parent_agent_id && !agentMap.has(a.parent_agent_id))
  );

  return (
    <div className="animate-fade-in space-y-10">
      {/* ── Session header — one dominant visual anchor ──────────────────── */}
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
          {/* Metadata strip */}
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
              {firstEvent
                ? formatDateTime(firstEvent.created_at)
                : formatDateTime(session.started_at)}
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

      {/* ── Agent tree — dominant visual anchor ──────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-3.5 h-3.5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-300">Agents ({agents.length})</h3>
        </div>
        {agents.length === 0 ? (
          <p className="text-sm text-gray-500">No agents recorded.</p>
        ) : (
          <div className="space-y-2">
            {roots.map((agent) => renderAgentNode(agent, 0))}
            {orphans.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] text-gray-600 mb-2 uppercase tracking-wider">
                  Unparented Subagents
                </p>
                <div className="space-y-1">
                  {orphans.map((agent) => renderAgentNode(agent, 1))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Cost breakdown ───────────────────────────────────────────────── */}
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

      {/* ── Event timeline ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
          <h3 className="text-sm font-medium text-gray-300">
            Event Timeline ({events.length})
          </h3>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No events recorded.</p>
        ) : (
          <div className="space-y-px">
            {events.map((event, i) => (
              <div
                key={event.id ?? i}
                className="flex items-center gap-4 px-3 py-2.5 hover:bg-surface-2 rounded transition-colors min-w-0 animate-slide-up"
                style={{ animationDelay: `${i * 15}ms` }}
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
  );
}
