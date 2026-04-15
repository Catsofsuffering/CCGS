/**
 * @file AgentCard.tsx
 * @description Minimal agent summary card. Deep-green accent for main agents; gray for subagents.
 */

import { Bot, GitBranch, Clock, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AgentStatusBadge } from "./StatusBadge";
import type { Agent } from "../lib/types";
import { formatDuration, timeAgo } from "../lib/format";

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const navigate = useNavigate();

  function handleClick() {
    if (onClick) {
      onClick();
    } else {
      navigate(`/sessions/${agent.session_id}`);
    }
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-surface-2 transition-colors cursor-pointer group"
    >
      {/* Icon */}
      <div
        className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
          agent.type === "main"
            ? "bg-accent-dim text-accent"
            : "bg-surface-3 text-gray-500"
        }`}
      >
        {agent.type === "main" ? (
          <Bot className="w-3.5 h-3.5" />
        ) : (
          <GitBranch className="w-3.5 h-3.5" />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-200 truncate">{agent.name}</p>
          <AgentStatusBadge status={agent.status} pulse />
        </div>
        <div className="flex items-center gap-3 mt-1">
          {agent.subagent_type && (
            <span className="text-[11px] text-gray-500">{agent.subagent_type}</span>
          )}
          {agent.current_tool && (
            <span className="flex items-center gap-1 text-[11px] text-gray-600">
              <Wrench className="w-2.5 h-2.5" />
              {agent.current_tool}
            </span>
          )}
          {agent.ended_at ? (
            <span className="flex items-center gap-1 text-[11px] text-gray-600">
              <Clock className="w-2.5 h-2.5" />
              {formatDuration(agent.started_at, agent.ended_at)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-gray-600">
              <Clock className="w-2.5 h-2.5" />
              {timeAgo(agent.updated_at || agent.started_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
