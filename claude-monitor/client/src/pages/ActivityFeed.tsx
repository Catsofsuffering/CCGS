/**
 * @file ActivityFeed.tsx
 * @description Real-time event stream — one section, one responsibility.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Pause, Play, RefreshCw } from "lucide-react";
import { api } from "../lib/api";
import { eventBus } from "../lib/eventBus";
import { AgentStatusBadge } from "../components/StatusBadge";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { formatTime, timeAgo } from "../lib/format";
import type { DashboardEvent, AgentStatus } from "../lib/types";

const PAGE_SIZE = 10;

export function ActivityFeed() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [bufferCount, setBufferCount] = useState(0);
  const bufferRef = useRef<DashboardEvent[]>([]);
  const pausedRef = useRef(paused);

  pausedRef.current = paused;

  const load = useCallback(async () => {
    try {
      const { events: data } = await api.events.list({ limit: 100 });
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return eventBus.subscribe((msg) => {
      if (msg.type === "new_event") {
        const event = msg.data as DashboardEvent;
        if (pausedRef.current) {
          bufferRef.current = [event, ...bufferRef.current];
          setBufferCount(bufferRef.current.length);
        } else {
          setEvents((prev) => [event, ...prev.slice(0, 199)]);
        }
      }
    });
  }, []);

  function resume() {
    pausedRef.current = false;
    const buffered = bufferRef.current;
    bufferRef.current = [];
    setBufferCount(0);
    setEvents((prev) => [...buffered, ...prev].slice(0, 200));
    setPaused(false);
  }

  function statusFromEventType(type: string): AgentStatus {
    switch (type) {
      case "PreToolUse":
        return "working";
      case "PostToolUse":
        return "connected";
      case "Stop":
      case "SubagentStop":
      case "Compaction":
        return "completed";
      default:
        return "idle";
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-muted border border-accent/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-100">Activity Feed</h1>
            <p className="text-xs text-gray-500">
              {paused ? (
                <span className="text-gray-300">Paused — {bufferCount} buffered</span>
              ) : (
                "Live stream"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (paused ? resume() : setPaused(true))}
          >
            {paused ? (
              <><Play className="w-3.5 h-3.5" /> Resume</>
            ) : (
              <><Pause className="w-3.5 h-3.5" /> Pause</>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {!loading && events.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Events will stream here in real-time as Claude Code agents work."
        />
      ) : (
        <>
          {/* Event list — no card wrapper */}
          <div className="space-y-px">
            {events.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((event, i) => (
              <div
                key={event.id ?? i}
                onClick={() => navigate(`/sessions/${event.session_id}`)}
                className="flex items-center gap-4 px-3 py-2.5 hover:bg-surface-2 rounded transition-colors cursor-pointer animate-slide-up"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div className="w-14 text-[11px] text-gray-600 font-mono flex-shrink-0 text-right">
                  {formatTime(event.created_at)}
                </div>

                <AgentStatusBadge status={statusFromEventType(event.event_type)} pulse />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">
                    {event.summary || event.event_type}
                  </p>
                </div>

                {event.tool_name && (
                  <span className="text-[11px] px-2 py-0.5 bg-surface-2 rounded text-gray-500 font-mono flex-shrink-0">
                    {event.tool_name}
                  </span>
                )}

                <span className="text-[11px] text-gray-600 flex-shrink-0 w-14 text-right">
                  {timeAgo(event.created_at)}
                </span>
              </div>
            ))}
          </div>

          {events.length > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, events.length)} of{" "}
                {events.length}
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
                  {page + 1} / {Math.ceil(events.length / PAGE_SIZE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(Math.ceil(events.length / PAGE_SIZE) - 1, p + 1))
                  }
                  disabled={page >= Math.ceil(events.length / PAGE_SIZE) - 1}
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
