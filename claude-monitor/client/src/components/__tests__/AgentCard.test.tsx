/**
 * @file AgentCard.test.tsx
 * @description Unit tests for the AgentCard component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AgentCard } from "../AgentCard";
import type { Agent } from "../../lib/types";

function renderCard(element: JSX.Element) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent-1",
    session_id: "sess-1",
    name: "Main Agent",
    type: "main",
    subagent_type: null,
    status: "connected",
    task: null,
    current_tool: null,
    started_at: "2026-03-05T10:00:00.000Z",
    ended_at: null,
    updated_at: "2026-03-05T10:00:00.000Z",
    parent_agent_id: null,
    metadata: null,
    ...overrides,
  };
}

describe("AgentCard", () => {
  it("should render agent name", () => {
    renderCard(<AgentCard agent={makeAgent({ name: "Test Agent" })} />);
    expect(screen.getByText("Test Agent")).toBeInTheDocument();
  });

  it("should render status badge", () => {
    renderCard(<AgentCard agent={makeAgent({ status: "working" })} />);
    expect(screen.getByText("Working")).toBeInTheDocument();
  });

  it("should render subagent_type when present", () => {
    renderCard(
      <AgentCard
        agent={makeAgent({
          type: "subagent",
          subagent_type: "Explore",
        })}
      />
    );
    expect(screen.getByText("Explore")).toBeInTheDocument();
  });

  it("should render current_tool when present", () => {
    renderCard(<AgentCard agent={makeAgent({ current_tool: "Bash", status: "working" })} />);
    expect(screen.getByText("Bash")).toBeInTheDocument();
  });

  it("should not render current_tool when null", () => {
    renderCard(<AgentCard agent={makeAgent({ current_tool: null })} />);
    expect(screen.queryByText("Bash")).not.toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const onClick = vi.fn();
    renderCard(<AgentCard agent={makeAgent()} onClick={onClick} />);
    fireEvent.click(screen.getByText("Main Agent"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should show duration for completed agents with ended_at", () => {
    renderCard(
      <AgentCard
        agent={makeAgent({
          status: "completed",
          started_at: "2026-03-05T10:00:00.000Z",
          ended_at: "2026-03-05T10:05:30.000Z",
        })}
      />
    );
    expect(screen.getByText(/5m 30s/)).toBeInTheDocument();
  });
});
