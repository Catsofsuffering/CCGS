const { transcriptCache } = require("../routes/hooks");

function safeParse(data) {
  if (!data) return null;
  if (typeof data === "object") return data;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function toTime(value) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareNewest(a, b) {
  return toTime(b) - toTime(a);
}

function dedupeMessages(messages) {
  const seen = new Set();
  const deduped = [];
  for (const message of messages) {
    const key = `${message.timestamp || ""}:${message.markdown}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(message);
  }
  return deduped;
}

function buildFallbackMessage(agentId, event) {
  if (!event) return null;
  const data = event._parsed;
  if (!data?.last_assistant_message) return null;
  return {
    id: `hook-${event.id}`,
    agent_id: agentId,
    timestamp: event.created_at,
    markdown: data.last_assistant_message,
    source: "hook",
  };
}

function buildTranscriptMessages(agentId, transcriptPath) {
  if (!transcriptPath) return [];
  const extracted = transcriptCache.extract(transcriptPath);
  if (!extracted?.assistantMessages?.length) return [];

  return extracted.assistantMessages.map((message) => ({
    id: `transcript-${agentId}-${message.id}`,
    agent_id: agentId,
    timestamp: message.timestamp,
    markdown: message.markdown,
    source: "transcript",
  }));
}

function buildAgentOutput(agent, eventsForAgent, mainTranscriptPath) {
  const transcriptPath =
    agent.type === "main"
      ? mainTranscriptPath
      : eventsForAgent.find((event) => event._parsed?.agent_transcript_path)?._parsed
          ?.agent_transcript_path || null;

  let messages = buildTranscriptMessages(agent.id, transcriptPath);
  if (messages.length === 0) {
    const fallback = buildFallbackMessage(
      agent.id,
      eventsForAgent.find((event) => event._parsed?.last_assistant_message)
    );
    if (fallback) messages = [fallback];
  }

  messages = dedupeMessages(messages).sort((a, b) => compareNewest(a.timestamp, b.timestamp));
  const latest = messages[0] || null;

  return {
    agent_id: agent.id,
    transcript_path: transcriptPath,
    latest_output: latest,
    latest_timestamp: latest?.timestamp || null,
    output_count: messages.length,
    outputs: messages,
  };
}

function getSessionOutputs(session, agents, events) {
  const enrichedEvents = events.map((event) => ({
    ...event,
    _parsed: safeParse(event.data),
  }));

  const mainTranscriptPath =
    enrichedEvents.find((event) => event._parsed?.transcript_path)?._parsed?.transcript_path || null;

  const eventsByAgent = new Map();
  for (const event of enrichedEvents) {
    if (!event.agent_id) continue;
    if (!eventsByAgent.has(event.agent_id)) {
      eventsByAgent.set(event.agent_id, []);
    }
    eventsByAgent.get(event.agent_id).push(event);
  }

  const agentsWithOutputs = agents
    .map((agent) => buildAgentOutput(agent, eventsByAgent.get(agent.id) || [], mainTranscriptPath))
    .sort((a, b) => {
      const timestampDiff = compareNewest(a.latest_timestamp, b.latest_timestamp);
      if (timestampDiff !== 0) return timestampDiff;
      const aAgent = agents.find((agent) => agent.id === a.agent_id);
      const bAgent = agents.find((agent) => agent.id === b.agent_id);
      return compareNewest(aAgent?.updated_at || session.updated_at, bAgent?.updated_at || session.updated_at);
    });

  return {
    agents: agentsWithOutputs,
    latest_output_agent_id: agentsWithOutputs.find((agent) => agent.latest_output)?.agent_id || null,
  };
}

module.exports = { getSessionOutputs };
