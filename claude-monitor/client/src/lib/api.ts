/**
 * @file api.ts
 * @description Defines a set of functions for interacting with the backend API of the agent dashboard application. It includes methods for fetching statistics, managing sessions and agents, retrieving analytics data, handling settings, and managing model pricing. The module abstracts away the details of making HTTP requests and provides a clean interface for the rest of the application to use when communicating with the server.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

import type {
  Agent,
  Analytics,
  ControlPlaneAction,
  ControlPlaneDispatchIntent,
  ControlPlaneOverviewData,
  ControlPlaneProjectData,
  CostResult,
  DashboardEvent,
  ModelPricing,
  OpenSpecBoardData,
  OpenSpecWorkspaceInfo,
  Session,
  SessionOutputs,
  SessionDrillIn,
  SettingsInfo,
  Stats,
  WorkflowData,
} from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  stats: {
    get: () => request<Stats>("/stats"),
  },

  sessions: {
    list: (params?: { status?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.offset) qs.set("offset", String(params.offset));
      const q = qs.toString();
      return request<{ sessions: Session[] }>(`/sessions${q ? `?${q}` : ""}`);
    },
    get: (id: string) =>
      request<{ session: Session; agents: Agent[]; events: DashboardEvent[]; outputs: SessionOutputs }>(
        `/sessions/${encodeURIComponent(id)}`
      ),
    outputs: (id: string) =>
      request<{ outputs: SessionOutputs }>(
        `/sessions/${encodeURIComponent(id)}/outputs`
      ),
  },

  agents: {
    list: (params?: { status?: string; session_id?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.session_id) qs.set("session_id", params.session_id);
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.offset) qs.set("offset", String(params.offset));
      const q = qs.toString();
      return request<{ agents: Agent[] }>(`/agents${q ? `?${q}` : ""}`);
    },
  },

  events: {
    list: (params?: { session_id?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.session_id) qs.set("session_id", params.session_id);
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.offset) qs.set("offset", String(params.offset));
      const q = qs.toString();
      return request<{ events: DashboardEvent[] }>(`/events${q ? `?${q}` : ""}`);
    },
  },

  analytics: {
    get: () => request<Analytics>("/analytics"),
  },

  settings: {
    info: () => request<SettingsInfo>("/settings/info"),
    updateOpenSpecWorkspace: (workspaceRoot?: string | null) =>
      request<{ ok: boolean; openspec: OpenSpecWorkspaceInfo }>("/settings/openspec-workspace", {
        method: "POST",
        body: JSON.stringify({ workspaceRoot: workspaceRoot ?? "" }),
      }),
    clearData: () =>
      request<{ ok: boolean; cleared: Record<string, number> }>("/settings/clear-data", {
        method: "POST",
      }),
    reimport: () =>
      request<{ ok: boolean; imported: number; skipped: number; errors: number }>(
        "/settings/reimport",
        { method: "POST" }
      ),
    reinstallHooks: () =>
      request<{ ok: boolean; hooks: { installed: boolean; hooks: Record<string, boolean> } }>(
        "/settings/reinstall-hooks",
        { method: "POST" }
      ),
    resetPricing: () =>
      request<{ ok: boolean; pricing: ModelPricing[] }>("/settings/reset-pricing", {
        method: "POST",
      }),
    exportData: () => `${BASE}/settings/export`,
    cleanup: (params: { abandon_hours?: number; purge_days?: number }) =>
      request<{
        ok: boolean;
        abandoned: number;
        purged_sessions: number;
        purged_events: number;
        purged_agents: number;
      }>("/settings/cleanup", { method: "POST", body: JSON.stringify(params) }),
  },

  workflows: {
    get: (status?: string) =>
      request<WorkflowData>(`/workflows${status && status !== "all" ? `?status=${status}` : ""}`),
    session: (id: string) =>
      request<SessionDrillIn>(`/workflows/session/${encodeURIComponent(id)}`),
  },

  openspec: {
    list: () => request<OpenSpecBoardData>("/openspec/changes"),
  },

  controlPlane: {
    overview: () => request<ControlPlaneOverviewData>("/control-plane/overview"),
    project: (name: string) =>
      request<ControlPlaneProjectData>(`/control-plane/projects/${encodeURIComponent(name)}`),
    action: (name: string, data: { nodeId: string; actionType: "replay" | "reopen"; notes?: string }) =>
      request<{ action: ControlPlaneAction; intent: ControlPlaneDispatchIntent; dispatch: ControlPlaneProjectData["dispatch"] }>(
        `/control-plane/projects/${encodeURIComponent(name)}/actions`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
  },

  pricing: {
    list: () => request<{ pricing: ModelPricing[] }>("/pricing"),
    upsert: (data: Omit<ModelPricing, "updated_at">) =>
      request<{ pricing: ModelPricing }>("/pricing", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (pattern: string) =>
      request<{ ok: boolean }>(`/pricing/${encodeURIComponent(pattern)}`, {
        method: "DELETE",
      }),
    totalCost: () => request<CostResult>("/pricing/cost"),
    sessionCost: (sessionId: string) =>
      request<CostResult>(`/pricing/cost/${encodeURIComponent(sessionId)}`),
  },
};
