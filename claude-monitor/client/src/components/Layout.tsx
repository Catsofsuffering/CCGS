/**
 * @file Layout.tsx
 * @description Main layout with collapsible sidebar. Sidebar state persists via localStorage.
 */

import { useEffect, useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, SIDEBAR_STORAGE_KEY, loadCollapsed } from "./Sidebar";
import { applyTheme, loadTheme, THEME_STORAGE_KEY, type Theme } from "../lib/theme";

interface LayoutProps {
  wsConnected: boolean;
}

export function Layout({ wsConnected }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(loadCollapsed);
  const [theme, setTheme] = useState<Theme>(loadTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <div className="min-h-screen bg-surface-0">
      <Sidebar
        wsConnected={wsConnected}
        collapsed={collapsed}
        onToggle={toggle}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <main
        className="min-h-screen min-w-0 transition-[margin-left] duration-200"
        style={{
          marginLeft: collapsed ? "4.25rem" : "15rem",
        }}
      >
        <div className="px-10 py-8 max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
