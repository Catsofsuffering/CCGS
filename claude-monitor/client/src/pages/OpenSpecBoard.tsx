import { useCallback, useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { api } from "../lib/api";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/ui/Button";
import { timeAgo } from "../lib/format";
import type { OpenSpecBoardData, OpenSpecChange, OpenSpecStage } from "../lib/types";

const STAGE_DESCRIPTIONS: Record<OpenSpecStage, string> = {
  proposal: "Problem framing, scope shaping, and change intent",
  design: "Design boundaries and execution contract definition",
  specs: "Capability scenarios and requirement shaping",
  tasks: "Execution slice planning and verification setup",
  implementing: "Artifacts complete and execution in progress",
  complete: "Finished or archived changes",
};

function humanizeChangeName(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusLabel(change: OpenSpecChange): string {
  if (change.stage === "complete") return "Completed";
  if (change.stage === "implementing") return change.readyToApply ? "Ready for execution" : "Executing";
  return change.stageLabel;
}

function summaryLine(change: OpenSpecChange): string {
  if (change.stage === "complete") return "Change marked complete in OpenSpec";
  if (change.stage === "implementing") {
    return change.readyToApply
      ? "Artifacts are complete; execution is the next step"
      : "Execution work is active";
  }
  return change.nextArtifact
    ? `Next artifact: ${change.nextArtifact}`
    : "Waiting for the next artifact step";
}

export function OpenSpecBoard() {
  const [data, setData] = useState<OpenSpecBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyStages, setShowEmptyStages] = useState(false);

  const load = useCallback(async () => {
    try {
      const next = await api.openspec.list();
      setData(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load OpenSpec board");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const changes = data?.changes ?? [];
  const stages = data?.stages ?? [];
  const activeChanges = changes.filter((change) => change.stage !== "complete").length;
  const readyChanges = changes.filter(
    (change) => change.stage === "implementing" && change.readyToApply
  ).length;
  const completedChanges = changes.filter((change) => change.stage === "complete").length;
  const emptyStageCount = stages.filter((stage) => stage.count === 0).length;

  const grouped = changes.reduce(
    (acc, change) => {
      acc[change.stage].push(change);
      return acc;
    },
    {
      proposal: [],
      design: [],
      specs: [],
      tasks: [],
      implementing: [],
      complete: [],
    } as Record<OpenSpecStage, OpenSpecChange[]>
  );
  const visibleStages =
    showEmptyStages || stages.every((stage) => stage.count === 0)
      ? stages
      : stages.filter((stage) => stage.count > 0);

  if (!loading && error && !data) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-accent-muted border border-accent/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-100">OpenSpec Board</h1>
              <p className="text-xs text-gray-500">Workflow-stage view of local changes</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        <EmptyState
          icon={FileText}
          title="OpenSpec state is unavailable"
          description={error}
          action={
            <Button variant="primary" onClick={load}>
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!loading && changes.length === 0) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-accent-muted border border-accent/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-100">OpenSpec Board</h1>
              <p className="text-xs text-gray-500">Workflow-stage view of local changes</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        <EmptyState
          icon={FileText}
          title="No OpenSpec changes found"
          description="Create or resume a change under openspec/changes to populate this board."
          action={
            <Button variant="primary" onClick={load}>
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-muted border border-accent/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-100">OpenSpec Board</h1>
            <p className="text-xs text-gray-500">
              {data?.workspaceRoot ? `Workspace: ${data.workspaceRoot}` : "Workflow-stage view of local changes"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {emptyStageCount > 0 && (
        <div className="flex items-center justify-between gap-3 border border-border rounded-md px-4 py-3 bg-surface-1">
          <p className="text-sm text-gray-400">
            {showEmptyStages
              ? "Showing empty workflow stages as well."
              : `${emptyStageCount} empty stages are hidden so active columns stay in view.`}
          </p>
          <Button variant="outline" size="sm" onClick={() => setShowEmptyStages((prev) => !prev)}>
            {showEmptyStages ? "Hide empty stages" : "Show empty stages"}
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-x-8 gap-y-3 py-4 border-y border-border">
        <div>
          <div className="text-2xl font-semibold text-gray-100">{changes.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Tracked Changes</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-gray-100">{activeChanges}</div>
          <div className="text-xs text-gray-500 mt-0.5">Active</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-accent">{readyChanges}</div>
          <div className="text-xs text-gray-500 mt-0.5">Ready To Apply</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-gray-100">{completedChanges}</div>
          <div className="text-xs text-gray-500 mt-0.5">Completed</div>
        </div>
      </div>

      {error && (
        <div className="border border-border rounded-md px-4 py-3 text-sm text-gray-400 bg-surface-1">
          {error}
        </div>
      )}

      <div className="flex gap-4 min-h-[620px] overflow-x-auto pb-4 -mx-8 px-8">
        {visibleStages.map((stage) => {
          const items = grouped[stage.id];

          return (
            <section
              key={stage.id}
              className="bg-surface-1 rounded-lg border border-border p-3 flex flex-col flex-shrink-0 w-80"
            >
              <div className="px-1 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      stage.id === "implementing" ? "bg-accent animate-live-pulse" : "bg-gray-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      stage.id === "implementing" || stage.id === "complete"
                        ? "text-accent"
                        : "text-gray-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="ml-auto text-[11px] text-gray-600 bg-surface-2 px-2 py-0.5 rounded-full">
                    {stage.count}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-gray-500">{STAGE_DESCRIPTIONS[stage.id]}</p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex items-center justify-center h-24 border border-dashed border-border rounded-md text-xs text-gray-600">
                    No changes
                  </div>
                ) : (
                  items.map((change) => (
                    <article
                      key={change.name}
                      className="rounded-md border border-border bg-surface-2 px-3 py-3 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-sm font-medium text-gray-100 break-words">
                            {humanizeChangeName(change.name)}
                          </h2>
                          <p className="text-[11px] text-gray-500 mt-1 break-all">{change.name}</p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] border ${
                            change.stage === "implementing" || change.stage === "complete"
                              ? "border-accent/30 bg-accent-muted text-accent"
                              : "border-border text-gray-400"
                          }`}
                        >
                          {statusLabel(change)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="border border-border rounded-md px-2 py-2">
                          <div className="text-gray-500 uppercase tracking-wider">Artifacts</div>
                          <div className="mt-1 text-sm text-gray-100">
                            {change.artifactSummary.done}/{change.artifactSummary.total}
                          </div>
                        </div>
                        <div className="border border-border rounded-md px-2 py-2">
                          <div className="text-gray-500 uppercase tracking-wider">Tasks</div>
                          <div className="mt-1 text-sm text-gray-100">
                            {change.taskProgress.completed}/{change.taskProgress.total}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {change.artifacts.map((artifact) => (
                          <div
                            key={`${change.name}-${artifact.id}`}
                            className="flex items-center justify-between gap-3 text-[11px]"
                          >
                            <span className="text-gray-400 uppercase tracking-wider">
                              {artifact.id}
                            </span>
                            <span
                              className={
                                artifact.done ? "text-accent" : "text-gray-500"
                              }
                            >
                              {artifact.done ? "done" : artifact.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 border-t border-border pt-2">
                        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                          <div
                            className="h-full bg-accent transition-[width] duration-200"
                            style={{ width: `${change.taskProgress.percent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>{summaryLine(change)}</span>
                          <span>{change.taskProgress.percent}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-[11px] text-gray-600">
                        <span className="truncate">{change.changePath}</span>
                        <span className="shrink-0">
                          {change.lastModified ? timeAgo(change.lastModified) : "unknown"}
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
