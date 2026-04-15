/**
 * @file KanbanBoard.tsx
 * @description Displays a Kanban board of agents grouped by their status with real-time updates.
 */

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Columns3, ChevronDown } from "lucide-react";
import { api } from "../lib/api";
import { eventBus } from "../lib/eventBus";
import { AgentCard } from "../components/AgentCard";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { STATUS_CONFIG } from "../lib/types";
import type { Agent, AgentStatus } from "../lib/types";

const COLUMNS: AgentStatus[] = ["idle", "connected", "working", "completed", "error"];
const COLUMN_PAGE_SIZE = 10;

export function KanbanBoard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    try {
      const results = await Promise.all(COLUMNS.map((status) => api.agents.list({ status })));
      setAgents(results.flatMap((r) => r.agents));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return eventBus.subscribe((msg) => {
      if (msg.type === "agent_created" || msg.type === "agent_updated") {
        load();
      }
    });
  }, [load]);

  const grouped = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = agents.filter((a) => a.status === status);
      return acc;
    },
    {} as Record<AgentStatus, Agent[]>
  );

  if (!loading && agents.length === 0) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-muted border border-accent/30 flex items-center justify-center">
            <Columns3 className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-100">Agent Board</h1>
            <p className="text-xs text-gray-500">Kanban view of all agents by status</p>
          </div>
        </div>
        <EmptyState
          icon={Columns3}
          title="No agents tracked yet"
          description="Start a Claude Code session with hooks installed to see agents appear here."
          action={
            <Button variant="primary" onClick={load}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-muted border border-accent/30 flex items-center justify-center">
            <Columns3 className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-100">Agent Board</h1>
            <p className="text-xs text-gray-500">{agents.length} agents</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <div className="flex gap-4 min-h-[600px] overflow-x-auto pb-4 -mx-8 px-8">
        {COLUMNS.map((status) => {
          const config = STATUS_CONFIG[status];
          const items = grouped[status];
          return (
            <div
              key={status}
              className="bg-surface-1 rounded-lg border border-border p-3 flex flex-col flex-shrink-0 w-72"
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
                    status === "working" ? "animate-live-pulse" : ""
                  }`}
                />
                <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                  {config.label}
                </span>
                <span className="ml-auto text-[11px] text-gray-600 bg-surface-2 px-2 py-0.5 rounded-full">
                  {items?.length ?? 0}
                </span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {items && items.length > 0 ? (
                  <>
                    {items.slice(0, expanded[status] || COLUMN_PAGE_SIZE).map((agent) => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                    {items.length > (expanded[status] || COLUMN_PAGE_SIZE) && (
                      <button
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [status]: (prev[status] || COLUMN_PAGE_SIZE) + COLUMN_PAGE_SIZE,
                          }))
                        }
                        className="w-full py-2 text-[11px] text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1 transition-colors"
                      >
                        <ChevronDown className="w-3 h-3" />
                        More ({items.length - (expanded[status] || COLUMN_PAGE_SIZE)})
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-20 text-xs text-gray-600">
                    No agents
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
