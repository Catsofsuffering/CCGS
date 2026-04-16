import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SessionDetail } from "../SessionDetail";
import type {
  Agent,
  DashboardEvent,
  Session,
  SessionOutputs,
} from "../../lib/types";

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

const mockSession: Session = {
  id: "sess-1",
  name: "Test Session",
  status: "active",
  cwd: "/test",
  model: "claude-opus-4-6",
  started_at: "2026-03-05T10:00:00.000Z",
  ended_at: null,
  metadata: null,
};

let mockAgents: Agent[] = [];
let mockEvents: DashboardEvent[] = [];
let mockOutputs: SessionOutputs = { agents: [], latest_output_agent_id: null };

vi.mock("../../lib/api", () => ({
  api: {
    sessions: {
      get: vi.fn(() =>
        Promise.resolve({
          session: mockSession,
          agents: mockAgents,
          events: mockEvents,
          outputs: mockOutputs,
        })
      ),
    },
    pricing: {
      sessionCost: vi.fn(() => Promise.resolve({ total_cost: 0, breakdown: [] })),
    },
  },
}));

vi.mock("../../lib/eventBus", () => ({
  eventBus: {
    subscribe: vi.fn(() => () => {}),
  },
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/sessions/sess-1"]}>
      <Routes>
        <Route path="/sessions/:id" element={<SessionDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SessionDetail nested agent tree and output reader", () => {
  beforeEach(() => {
    mockAgents = [];
    mockEvents = [];
    mockOutputs = { agents: [], latest_output_agent_id: null };
  });

  it("renders a flat main to subagent hierarchy", async () => {
    mockAgents = [
      makeAgent({ id: "main-1", name: "Main Agent", type: "main", status: "working" }),
      makeAgent({
        id: "sub-1",
        name: "Explorer",
        type: "subagent",
        subagent_type: "Explore",
        status: "working",
        parent_agent_id: "main-1",
      }),
    ];

    renderPage();

    expect((await screen.findAllByText("Main Agent")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Explorer")).length).toBeGreaterThan(0);
  });

  it("renders deeply nested agents", async () => {
    mockAgents = [
      makeAgent({ id: "main-1", name: "Main", type: "main", status: "idle" }),
      makeAgent({ id: "l1", name: "Level-1", type: "subagent", status: "working", parent_agent_id: "main-1" }),
      makeAgent({ id: "l2", name: "Level-2", type: "subagent", status: "working", parent_agent_id: "l1" }),
      makeAgent({ id: "l3", name: "Level-3", type: "subagent", status: "working", parent_agent_id: "l2" }),
    ];

    renderPage();

    expect((await screen.findAllByText("Main")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Level-1")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Level-2")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Level-3")).length).toBeGreaterThan(0);
  });

  it("shows descendant count in the collapsed badge", async () => {
    mockAgents = [
      makeAgent({ id: "main-1", name: "Main", type: "main", status: "idle" }),
      makeAgent({ id: "l1", name: "Level-1", type: "subagent", status: "completed", parent_agent_id: "main-1" }),
      makeAgent({ id: "l2", name: "Level-2", type: "subagent", status: "completed", parent_agent_id: "l1" }),
      makeAgent({ id: "l3a", name: "Level-3a", type: "subagent", status: "completed", parent_agent_id: "l2" }),
      makeAgent({ id: "l3b", name: "Level-3b", type: "subagent", status: "completed", parent_agent_id: "l2" }),
    ];

    renderPage();

    expect(await screen.findByText("4 subagents")).toBeInTheDocument();
  });

  it("expands and collapses nested agent groups", async () => {
    mockAgents = [
      makeAgent({ id: "main-1", name: "Main", type: "main", status: "idle" }),
      makeAgent({ id: "l1", name: "Level-1", type: "subagent", status: "completed", parent_agent_id: "main-1" }),
      makeAgent({ id: "l2", name: "Level-2", type: "subagent", status: "completed", parent_agent_id: "l1" }),
    ];

    renderPage();

    expect(await screen.findByText("2 subagents")).toBeInTheDocument();
    expect(screen.queryByText("1 subagent")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("2 subagents"));
    expect(await screen.findByText("1 subagent")).toBeInTheDocument();

    fireEvent.click(screen.getByText("1 subagent"));
    expect(screen.queryByText("1 subagent")).not.toBeInTheDocument();
  });

  it("renders orphaned subagents in a dedicated section", async () => {
    mockAgents = [
      makeAgent({ id: "main-1", name: "Main", type: "main", status: "idle" }),
      makeAgent({
        id: "orphan-1",
        name: "Orphan Agent",
        type: "subagent",
        status: "working",
        parent_agent_id: "missing-parent",
      }),
    ];

    renderPage();

    expect((await screen.findAllByText("Main")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Orphan Agent")).length).toBeGreaterThan(0);
    expect(await screen.findByText("Unparented Subagents")).toBeInTheDocument();
  });

  it("renders markdown output for the newest agent feed", async () => {
    mockAgents = [
      makeAgent({ id: "main-1", name: "Main", type: "main", status: "idle" }),
      makeAgent({
        id: "sub-1",
        name: "Researcher",
        type: "subagent",
        status: "completed",
        parent_agent_id: "main-1",
      }),
    ];
    mockOutputs = {
      latest_output_agent_id: "sub-1",
      agents: [
        {
          agent_id: "sub-1",
          transcript_path: "/tmp/subagent.jsonl",
          latest_timestamp: "2026-03-05T11:00:00.000Z",
          output_count: 2,
          latest_output: {
            id: "msg-2",
            agent_id: "sub-1",
            timestamp: "2026-03-05T11:00:00.000Z",
            markdown: "# Summary\n\n- latest finding",
            source: "transcript",
          },
          outputs: [
            {
              id: "msg-2",
              agent_id: "sub-1",
              timestamp: "2026-03-05T11:00:00.000Z",
              markdown: "# Summary\n\n- latest finding",
              source: "transcript",
            },
            {
              id: "msg-1",
              agent_id: "sub-1",
              timestamp: "2026-03-05T10:30:00.000Z",
              markdown: "Earlier paragraph",
              source: "transcript",
            },
          ],
        },
      ],
    };

    renderPage();

    expect(await screen.findByText("Latest Output")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Summary" })).toBeInTheDocument();
    expect(await screen.findByText("latest finding")).toBeInTheDocument();
    expect((await screen.findAllByText("Researcher")).length).toBeGreaterThan(0);
    expect(await screen.findByText("Earlier paragraph")).toBeInTheDocument();
  });
});
