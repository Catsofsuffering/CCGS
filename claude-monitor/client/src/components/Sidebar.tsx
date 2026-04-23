/**
 * @file Sidebar.tsx
 * @description Defines the Sidebar component that provides navigation links to different sections of the application, displays the connection status, and includes a toggle button for collapsing or expanding the sidebar. The component uses React Router's NavLink for navigation and Lucide icons for visual representation. The collapsed state of the sidebar is stored in localStorage to persist user preferences across sessions.
 * @author Son Nguyen <hoangson091104@gmail.com>
 */

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutPanelTop,
  FolderOpen,
  Activity,
  BarChart3,
  Workflow,
  Settings,
  Wifi,
  WifiOff,
  Github,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  SunMedium,
  MoonStar,
} from "lucide-react";
import { api } from "../lib/api";
import type { Theme } from "../lib/theme";
import type { OpenSpecWorkspaceInfo } from "../lib/types";

const NAV_ITEMS = [
  { to: "/board", icon: LayoutPanelTop, label: "Board" },
  { to: "/sessions", icon: FolderOpen, label: "Sessions" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/workflows", icon: Workflow, label: "Workflows" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

const STORAGE_KEY = "sidebar-collapsed";
const AUTHOR_GITHUB_URL = "https://github.com/Catsofsuffering";
const REPOSITORY_URL = "https://github.com/Catsofsuffering/ccsm";
const REPOSITORY_LABEL = "Catsofsuffering/ccsm";

function workspaceLabel(workspaceRoot: string | null): string | null {
  if (!workspaceRoot) return null;
  const normalized = workspaceRoot.replace(/[\\/]+$/, "");
  const parts = normalized.split(/[\\/]/).filter(Boolean);
  const label = parts.length > 0 ? parts[parts.length - 1] : normalized;
  return label ?? null;
}

function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

interface SidebarProps {
  wsConnected: boolean;
  collapsed: boolean;
  onToggle: () => void;
  theme: Theme;
  onThemeToggle: () => void;
}

const SIDEBAR_VERSION = `v${__CCGS_VERSION__}`;

export function Sidebar({ wsConnected, collapsed, onToggle, theme, onThemeToggle }: SidebarProps) {
  const nextThemeLabel = theme === "dark" ? "Day mode" : "Night mode";
  const [workspaceInfo, setWorkspaceInfo] = useState<OpenSpecWorkspaceInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      try {
        const info = await api.settings.info();
        if (!cancelled) {
          setWorkspaceInfo(info.openspec);
        }
      } catch {
        if (!cancelled) {
          setWorkspaceInfo(null);
        }
      }
    };

    loadWorkspace();
    const interval = setInterval(loadWorkspace, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const currentWorkspace = workspaceInfo?.workspaceRoot ?? null;
  const currentWorkspaceLabel = workspaceLabel(currentWorkspace);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-surface-1 border-r border-border flex flex-col z-30 overflow-y-auto overflow-x-hidden transition-[width] duration-200 ${
        collapsed ? "w-[4.25rem]" : "w-60"
      }`}
    >
      {/* Brand */}
      <div className="px-3 py-4 border-b border-border">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
          <div className="w-8 h-8 rounded-md bg-accent-muted border border-accent/30 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-accent" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-100 truncate">Agent Monitor</h1>
              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {currentWorkspaceLabel
                  ? `Project: ${currentWorkspaceLabel}`
                  : "Project: workspace not resolved"}
              </p>
              {currentWorkspace && (
                <p className="truncate text-[10px] text-gray-600">{currentWorkspace}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md text-sm font-medium transition-colors duration-150 ${
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-accent-muted text-accent border border-accent/30"
                  : "text-gray-400 hover:text-gray-200 hover:bg-surface-3 border border-transparent"
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-2 space-y-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-surface-3 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 flex-shrink-0 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
        <button
          onClick={onThemeToggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-surface-3 transition-colors"
          title={nextThemeLabel}
        >
          {theme === "dark" ? (
            <>
              <SunMedium className={`w-4 h-4 flex-shrink-0 ${collapsed ? "mx-auto" : ""}`} />
              {!collapsed && <span>{nextThemeLabel}</span>}
            </>
          ) : (
            <>
              <MoonStar className={`w-4 h-4 flex-shrink-0 ${collapsed ? "mx-auto" : ""}`} />
              {!collapsed && <span>{nextThemeLabel}</span>}
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div
        className={`px-3 py-3 border-t border-border space-y-2 ${collapsed ? "items-center" : ""}`}
      >
        <div className={`flex items-center text-xs ${collapsed ? "justify-center" : "gap-2"}`}>
          {wsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              {!collapsed && <span className="text-accent">Live</span>}
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
              {!collapsed && <span className="text-gray-600">Disconnected</span>}
            </>
          )}
          {!collapsed && <span className="ml-auto text-gray-600">{SIDEBAR_VERSION}</span>}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <a
              href={AUTHOR_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="Catsofsuffering"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 text-[11px]"
              title={REPOSITORY_LABEL}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{REPOSITORY_LABEL}</span>
            </a>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center gap-2">
            <a
              href={AUTHOR_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="Catsofsuffering"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title={REPOSITORY_LABEL}
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

export { STORAGE_KEY as SIDEBAR_STORAGE_KEY, loadCollapsed };
