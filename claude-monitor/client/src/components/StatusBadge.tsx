/**
 * @file StatusBadge.tsx
 * @description Defines reusable React components for displaying the status of agents and sessions.
 * Uses deep-green accent for active states; red reserved for errors; gray neutrals for others.
 */

import { STATUS_CONFIG, SESSION_STATUS_CONFIG } from "../lib/types";
import type { AgentStatus, SessionStatus } from "../lib/types";

interface AgentStatusBadgeProps {
  status: AgentStatus;
  pulse?: boolean;
}

export function AgentStatusBadge({ status, pulse }: AgentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const shouldPulse = pulse ?? (status === "working" || status === "connected");

  return (
    <span className={`badge ${config.bg} ${config.color}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
          shouldPulse ? "animate-live-pulse" : ""
        }`}
      />
      {config.label}
    </span>
  );
}

interface SessionStatusBadgeProps {
  status: SessionStatus;
}

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  const config = SESSION_STATUS_CONFIG[status];
  return <span className={`badge ${config.bg} ${config.color}`}>{config.label}</span>;
}
