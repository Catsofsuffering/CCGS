const path = require("node:path");
const { spawn } = require("node:child_process");
const { stmts } = require("../db");

function nowIso() {
  return new Date().toISOString();
}

function buildControlPlanePrompt({ change, nodeId, actionType, workspaceRoot, dispatch }) {
  const projectDir = path.join(workspaceRoot, change.changePath);
  const modeLabel = actionType === "replay" ? "replay execution" : "reopen and reconcile";

  return [
    `You are the ${dispatch.preferredAdapterId || "worker"} for CCSM control-plane execution.`,
    `Project: ${change.name}`,
    `Node: ${nodeId}`,
    `Requested action: ${actionType}`,
    `Goal: perform a bounded ${modeLabel} for this OpenSpec-backed project.`,
    `Workspace root: ${workspaceRoot}`,
    `Change path: ${projectDir}`,
    `Current stage: ${change.stageLabel}`,
    change.nextArtifact ? `Next OpenSpec artifact: ${change.nextArtifact}` : "No next artifact is currently pending.",
    change.readyToApply
      ? "OpenSpec artifacts are ready for implementation/review dispatch."
      : "OpenSpec state still needs reconciliation before full execution.",
    "Constraints:",
    "- Treat OpenSpec as the durable source of truth.",
    "- Do not rewrite unrelated files or unrelated changes.",
    "- Keep the response structured and suitable for operator review.",
    "Return packet:",
    "- summary",
    "- files changed (if any)",
    "- checks run",
    "- follow-up recommendation",
  ].join("\n");
}

function normalizeDispatchRecord(row) {
  return {
    id: row.id,
    projectName: row.project_name,
    nodeId: row.node_id,
    actionType: row.action_type,
    adapterId: row.adapter_id,
    runtime: row.runtime,
    status: row.status,
    source: row.source,
    actionId: row.action_id,
    command: row.command,
    prompt: row.prompt,
    payload: row.payload ? JSON.parse(row.payload) : null,
    pid: row.pid,
    error: row.error,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createDispatchIntent({
  change,
  nodeId,
  actionType,
  actionId,
  dispatch,
  workspaceRoot,
}) {
  const prompt = buildControlPlanePrompt({
    change,
    nodeId,
    actionType,
    workspaceRoot,
    dispatch,
  });

  const adapterAvailable = Boolean(
    dispatch.preferredAdapterId && dispatch.availableAdapters.includes(dispatch.preferredAdapterId)
  );
  const initialStatus = adapterAvailable
    ? dispatch.preferredAdapterId === "claude-cli"
      ? "queued"
      : "blocked"
    : "blocked";

  const result = stmts.insertControlPlaneDispatch.run(
    change.name,
    nodeId,
    actionType,
    dispatch.preferredAdapterId,
    dispatch.preferredRuntime,
    initialStatus,
    "human",
    actionId,
    dispatch.command,
    prompt,
    JSON.stringify({
      dispatch,
      reason: adapterAvailable && dispatch.preferredAdapterId === "claude-cli"
        ? "Queued for Claude CLI launch."
        : dispatch.preferredAdapterId === "codex-cli"
          ? "Codex adapter scaffolded; execution launch is not wired yet."
          : "No compatible adapter is currently available.",
    }),
    null,
    initialStatus === "blocked"
      ? dispatch.preferredAdapterId === "codex-cli" && adapterAvailable
        ? "Codex dispatch is scaffolded but not executable yet."
        : "No executable adapter is currently available."
      : null,
    null,
    null
  );

  return stmts.getControlPlaneDispatchById.get(result.lastInsertRowid);
}

function createDispatchIntentAndFetch(args) {
  return createDispatchIntent(args);
}

function launchClaudeDispatch({ intent, workspaceRoot }) {
  const cliEntry = path.join(workspaceRoot, "bin", "ccsm.mjs");
  const args = ["claude", "exec", "--cwd", workspaceRoot, "--prompt", intent.prompt];
  const startedAt = nowIso();
  const child = spawn(process.execPath, [cliEntry, ...args], {
    cwd: workspaceRoot,
    env: process.env,
    stdio: "ignore",
    shell: false,
  });

  stmts.updateControlPlaneDispatchState.run(
    "running",
    child.pid || null,
    null,
    startedAt,
    null,
    intent.id
  );

  child.on("error", (error) => {
    stmts.updateControlPlaneDispatchState.run(
      "failed",
      child.pid || null,
      error instanceof Error ? error.message : String(error),
      startedAt,
      nowIso(),
      intent.id
    );
  });

  child.on("close", (code, signal) => {
    const failed = Boolean(signal) || code !== 0;
    stmts.updateControlPlaneDispatchState.run(
      failed ? "failed" : "completed",
      child.pid || null,
      failed
        ? signal
          ? `Process terminated by signal ${signal}`
          : `Process exited with code ${code}`
        : null,
      startedAt,
      nowIso(),
      intent.id
    );
  });

  return stmts.getControlPlaneDispatchById.get(intent.id);
}

function maybeLaunchDispatch({ intent, workspaceRoot }) {
  if (!intent || intent.adapter_id !== "claude-cli" || intent.status !== "queued") {
    return intent;
  }

  return launchClaudeDispatch({
    intent: normalizeDispatchRecord(intent),
    workspaceRoot,
  });
}

function listProjectDispatches(projectName, limit = 20) {
  return stmts.listControlPlaneDispatchesByProject
    .all(projectName, limit)
    .map(normalizeDispatchRecord);
}

module.exports = {
  buildControlPlanePrompt,
  normalizeDispatchRecord,
  createDispatchIntentAndFetch,
  maybeLaunchDispatch,
  listProjectDispatches,
};
