import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

function readVersion(): string {
  const candidates = [
    new URL("../../package.json", import.meta.url),
    new URL("../package.json", import.meta.url),
  ];

  for (const candidate of candidates) {
    try {
      const pkg = JSON.parse(readFileSync(candidate, "utf8"));
      if (typeof pkg.version === "string" && pkg.version.length > 0) {
        return pkg.version;
      }
    } catch {
      // Try the next package.json candidate.
    }
  }

  return "0.0.0";
}

export default defineConfig({
  plugins: [react()],
  define: {
    __CCGS_VERSION__: JSON.stringify(readVersion()),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4820",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:4820",
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
