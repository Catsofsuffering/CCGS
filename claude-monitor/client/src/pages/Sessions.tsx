/**
 * @file Sessions.tsx
 * @description Sessions list — editorial table with minimal styling.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Search, ChevronRight, RefreshCw } from "lucide-react";
import { api } from "../lib/api";
import { eventBus } from "../lib/eventBus";
import { SessionStatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { formatDateTime, formatDuration, truncate, fmtCost } from "../lib/format";
import type { Session, SessionStatus, DashboardEvent } from "../lib/types";

const FILTER_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Error", value: "error" },
  { label: "Abandoned", value: "abandoned" },
];

const PAGE_SIZE = 10;

export function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    try {
      const params: { status?: string; limit?: number } = { limit: 500 };
      if (filter) params.status = filter;
      const sessionsRes = await api.sessions.list(params);
      setSessions(sessionsRes.sessions);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return eventBus.subscribe((msg) => {
      if (msg.type === "session_created" || msg.type === "session_updated") {
        load();
      }
      if (msg.type === "new_event") {
        const ev = msg.data as DashboardEvent;
        if (ev.event_type === "Stop" || ev.event_type === "SessionEnd") {
          load();
        }
      }
    });
  }, [load]);

  const filtered = search
    ? sessions.filter(
        (s) =>
          s.id.toLowerCase().includes(search.toLowerCase()) ||
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.cwd?.toLowerCase().includes(search.toLowerCase())
      )
    : sessions;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [filter, search]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-muted border border-accent/30 flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-100">Sessions</h1>
            <p className="text-xs text-gray-500">
              {loading ? "—" : `${filtered.length}${filter ? ` ${filter}` : ""}`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="text"
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-3.5 h-3.5" />}
          className="max-w-xs"
        />
        <div className="flex gap-1 bg-surface-2 rounded-md p-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                filter === opt.value
                  ? "bg-surface-4 text-gray-200"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No sessions found"
          description={
            search || filter
              ? "Try adjusting your search or filters."
              : "Start a Claude Code session with hooks installed to begin tracking."
          }
        />
      ) : (
        <>
          {/* Editorial table — no card border, just clean rows */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Agents
                  </th>
                  <th className="pb-3 pr-4 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="pb-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Directory
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => navigate(`/sessions/${session.id}`)}
                    className="hover:bg-surface-2 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-gray-200">
                        {session.name || `Session ${session.id.slice(0, 8)}`}
                      </p>
                      <p className="text-[11px] text-gray-600 font-mono mt-0.5">
                        {session.id.slice(0, 12)}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <SessionStatusBadge status={session.status as SessionStatus} />
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-400">
                      {formatDateTime(session.last_activity || session.started_at)}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-400 font-mono">
                      {session.ended_at
                        ? formatDuration(session.started_at, session.ended_at)
                        : "running"}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-400">
                      {session.agent_count ?? "-"}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-400 font-mono">
                      {session.cost != null && session.cost > 0 ? fmtCost(session.cost) : "-"}
                    </td>
                    <td className="py-3 text-[11px] text-gray-500 font-mono">
                      {session.cwd ? truncate(session.cwd, 28) : "-"}
                    </td>
                    <td className="py-3">
                      <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-xs text-gray-500">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
