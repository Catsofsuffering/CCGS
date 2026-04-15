/**
 * @file Dashboard.tsx
 * @description Main dashboard — one dominant visual anchor: the live agent tree.
 * Stats are typographic. Activity feed is secondary.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Bot,
} from "lucide-react";
import { api } from "../lib/api";
import { eventBus } from "../lib/eventBus";
import { AgentCard } from "../components/AgentCard";
import { AgentStatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { timeAgo, fmt, fmtCost } from "../lib/format";
import type { Stats, Agent, DashboardEvent, WSMessage } from "../lib/types";

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeAgents, setActiveAgents] = useState<Agent[]>([]);
  const [recentEvents, setRecentEvents] = useState<DashboardEvent[]>([]);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [allSubagents, setAllSubagents] = useState<Agent[]>([]);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [statsRes, workingRes, connectedRes, idleRes, eventsRes, costRes] = await Promise.all([
        api.stats.get(),
        api.agents.list({ status: "working", limit: 20 }),
        api.agents.list({ status: "connected", limit: 20 }),
        api.agents.list({ status: "idle", limit: 20 }),
        api.events.list({ limit: 15 }),
        api.pricing.totalCost(),
      ]);
      setStats(statsRes);
      const active = [...workingRes.agents, ...connectedRes.agents, ...idleRes.agents];
      setActiveAgents(active);
      setRecentEvents(eventsRes.events);
      setTotalCost(costRes.total_cost);
      setError(null);

      const activeSessionIds = [
        ...new Set(active.filter((a) => a.type === "main").map((a) => a.session_id)),
      ];
      const subagentResults = await Promise.all(
        activeSessionIds.map((sid) => api.agents.list({ session_id: sid, limit: 100 }))
      );
      const subs = subagentResults.flatMap((r) => r.agents).filter((a) => a.type === "subagent");
      setAllSubagents(subs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const parentsWithActive = new Set<string>();
    for (const a of allSubagents) {
      if (a.parent_agent_id && (a.status === "working" || a.status === "connected")) {
        parentsWithActive.add(a.parent_agent_id);
      }
    }
    if (parentsWithActive.size > 0) {
      const subMap = new Map(allSubagents.map((a) => [a.id, a]));
      const toExpand = new Set<string>();
      for (const pid of parentsWithActive) {
        let cur = pid;
        while (cur) {
          toExpand.add(cur);
          const parent = subMap.get(cur);
          cur = parent?.parent_agent_id ?? "";
        }
      }
      setExpandedAgents((prev) => new Set([...prev, ...toExpand]));
    }
  }, [allSubagents]);

  useEffect(() => {
    return eventBus.subscribe((msg: WSMessage) => {
      if (
        msg.type === "agent_created" ||
        msg.type === "agent_updated" ||
        msg.type === "session_created" ||
        msg.type === "session_updated"
      ) {
        load();
      }
      if (msg.type === "new_event") {
        setRecentEvents((prev) => [msg.data as DashboardEvent, ...prev.slice(0, 14)]);
      }
    });
  }, [load]);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-200 mb-2">Failed to connect to server</p>
        <p className="text-sm text-gray-500">{error}</p>
        <Button variant="primary" onClick={load} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // ── Build agent tree ─────────────────────────────────────────────────────────
  const childrenByParent = new Map<string, Agent[]>();
  for (const a of allSubagents) {
    if (a.parent_agent_id) {
      const list = childrenByParent.get(a.parent_agent_id) || [];
      list.push(a);
      childrenByParent.set(a.parent_agent_id, list);
    }
  }

  function countDescendants(id: string): number {
    const kids = childrenByParent.get(id) || [];
    return kids.reduce((sum, k) => sum + 1 + countDescendants(k.id), 0);
  }

  function countActiveDescendants(id: string): number {
    const kids = childrenByParent.get(id) || [];
    return kids.reduce(
      (sum, k) =>
        sum +
        (k.status === "working" || k.status === "connected" ? 1 : 0) +
        countActiveDescendants(k.id),
      0
    );
  }

  function renderAgentNode(agent: Agent, depth: number): React.ReactNode {
    const children = childrenByParent.get(agent.id) || [];
    const isExpanded = expandedAgents.has(agent.id);
    const hasChildren = children.length > 0;
    const isSubagent = depth > 0;
    const totalDesc = hasChildren ? countDescendants(agent.id) : 0;
    const activeDesc = hasChildren ? countActiveDescendants(agent.id) : 0;

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
            {activeDesc > 0 && (
              <span className="text-accent ml-1">({activeDesc} active)</span>
            )}
          </button>
        )}
      </div>
    );
  }

  const mainAgents = activeAgents.filter((a) => a.type === "main").slice(0, 5);
  const orphanSubagents = activeAgents.filter((a) => a.type === "subagent");
  const hasAgents = mainAgents.length > 0 || orphanSubagents.length > 0;

  return (
    <div className="animate-fade-in space-y-8">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-muted border border-accent/30 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-100">Dashboard</h1>
            <p className="text-xs text-gray-500">
              {stats ? `${fmt(stats.active_sessions)} active session${stats.active_sessions !== 1 ? "s" : ""}` : "Loading…"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* ── Stat strip — typographic, no cards ──────────────────────────── */}
      {stats && (
        <div className="flex flex-wrap gap-x-8 gap-y-3 py-4 border-y border-border">
          <div>
            <div className="text-2xl font-semibold text-gray-100">{fmt(stats.total_sessions)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-100">{fmt(stats.events_today)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Events Today</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-100">{fmt(stats.total_events)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Events</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-accent">{totalCost !== null ? fmtCost(totalCost) : "—"}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Cost</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-100">{stats.active_agents}</div>
            <div className="text-xs text-gray-500 mt-0.5">Active Agents</div>
          </div>
        </div>
      )}

      {/* ── Dominant visual anchor: live agent tree ──────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-gray-500" />
            <h2 className="text-sm font-medium text-gray-300">Live Agents</h2>
            {hasAgents && (
              <span className="text-[11px] text-gray-600">
                {activeAgents.length} total
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/kanban")}>
            View board →
          </Button>
        </div>

        {!hasAgents ? (
          <EmptyState
            icon={Bot}
            title="No active agents"
            description="Agents will appear here when a Claude Code session is running."
          />
        ) : (
          <div className="space-y-2">
            {mainAgents.map((main) => renderAgentNode(main, 0))}
            {orphanSubagents.map((agent) => (
              <div key={agent.id}>
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Secondary: recent activity strip ─────────────────────────────── */}
      {recentEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-live-pulse" />
              <h2 className="text-sm font-medium text-gray-300">Recent Activity</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/activity")}>
              View all →
            </Button>
          </div>
          <div className="space-y-px">
            {recentEvents.slice(0, 6).map((event, i) => (
              <div
                key={event.id ?? i}
                onClick={() => navigate(`/sessions/${event.session_id}`)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 rounded transition-colors cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <AgentStatusBadge
                  status={
                    event.event_type === "Stop"
                      ? "completed"
                      : event.event_type === "PreToolUse"
                        ? "working"
                        : "connected"
                  }
                  pulse
                />
                <span className="text-sm text-gray-300 truncate flex-1">
                  {event.summary || event.event_type}
                </span>
                {event.tool_name && (
                  <span className="text-[11px] text-gray-600 font-mono">{event.tool_name}</span>
                )}
                <span className="text-[11px] text-gray-600 flex-shrink-0 w-14 text-right">
                  {timeAgo(event.created_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
