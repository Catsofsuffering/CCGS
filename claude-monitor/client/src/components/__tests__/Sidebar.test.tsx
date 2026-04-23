/**
 * @file Sidebar.test.tsx
 * @description Unit tests for the Sidebar component, which is responsible for rendering the application's sidebar navigation. The tests cover rendering of the brand name, navigation links, WebSocket connection status, and version number. The tests use React Testing Library and Vitest for assertions and mocking.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { api } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  api: {
    settings: {
      info: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.mocked(api.settings.info).mockResolvedValue({
    db: { path: "", size: 0, counts: {} },
    hooks: { installed: false, path: "", hooks: {} },
    server: { uptime: 0, node_version: "v22.0.0", platform: "win32", ws_connections: 0 },
    openspec: {
      workspaceRoot: "B:\\project\\DataBeacon",
      source: "active",
      activeWorkspaceRoot: "B:\\project\\DataBeacon",
      detectedWorkspaceRoots: ["B:\\project\\DataBeacon"],
    },
  });
});

function renderSidebar(wsConnected: boolean, collapsed = false) {
  return render(
    <MemoryRouter>
      <Sidebar
        wsConnected={wsConnected}
        collapsed={collapsed}
        onToggle={() => {}}
        theme="dark"
        onThemeToggle={() => {}}
      />
    </MemoryRouter>
  );
}

describe("Sidebar", () => {
  it("should render the brand name", () => {
    renderSidebar(true);
    expect(screen.getByText("Agent Monitor")).toBeInTheDocument();
  });

  it("should render the current workspace", async () => {
    renderSidebar(true);
    expect(await screen.findByText("Project: DataBeacon")).toBeInTheDocument();
    expect(screen.getByText("B:\\project\\DataBeacon")).toBeInTheDocument();
  });

  it("should render all navigation links", () => {
    renderSidebar(true);
    expect(screen.getByText("Board")).toBeInTheDocument();
    expect(screen.getByText("Sessions")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Workflows")).toBeInTheDocument();
  });

  it('should show "Live" when WebSocket is connected', () => {
    renderSidebar(true);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it('should show "Disconnected" when WebSocket is not connected', () => {
    renderSidebar(false);
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  it("should show version number", () => {
    renderSidebar(true);
    expect(screen.getByText(`v${__CCGS_VERSION__}`)).toBeInTheDocument();
  });

  it("should have correct navigation hrefs", () => {
    renderSidebar(true);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("/board");
    expect(hrefs).toContain("/sessions");
    expect(hrefs).toContain("/analytics");
    expect(hrefs).toContain("/workflows");
    expect(hrefs).toContain("https://github.com/Catsofsuffering");
    expect(hrefs).toContain("https://github.com/Catsofsuffering/ccsm");
  });
});
