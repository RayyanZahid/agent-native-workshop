import agentConfig from "@/agent.config";
import { agentGate, hasScope } from "@/lib/auth";
import { resolveOrigin } from "@/lib/origin";
import { getStep } from "@/lib/curriculum";
import { checkTarget } from "@/lib/checkTarget";
import * as ws from "@/lib/workshop";

/**
 * ONE A2A handler, mounted twice: at /api/a2a (the address the agent card
 * advertises) and at /api/a2a/<agentId> (one address per agent in the room).
 *
 * Which skill runs is chosen by `params.message.metadata.skill`. The permission
 * each skill needs comes from `agentConfig.a2a.skills`, the same list the agent
 * card prints, so the card cannot promise a login the endpoint does not ask for.
 *
 *   guide-build      no token   text part = a step number, returns that step
 *   check-readiness  no token   text part = an https URL, returns the findings
 *   (anything else)  token      leave-note: recorded on the sender's board row
 */
const CORS = { "access-control-allow-origin": "*" };

function rpc(id: unknown, error: { code: number; message: string } | null, status = 200, result?: unknown) {
  return Response.json(
    error ? { jsonrpc: "2.0", id: id ?? null, error } : { jsonrpc: "2.0", id: id ?? null, result },
    { status: error ? status : 200, headers: CORS },
  );
}

function reply(id: unknown, text: string, data?: unknown) {
  return rpc(id, null, 200, {
    kind: "message",
    role: "agent",
    messageId: `m_${Date.now().toString(36)}`,
    parts: [
      { kind: "text", text },
      ...(data === undefined ? [] : [{ kind: "data", data }]),
    ],
  });
}

export async function handleA2A(req: Request, targetId: string | null): Promise<Response> {
  const origin = resolveOrigin(req);
  const body = await req.json().catch(() => null) as { method?: string; params?: any; id?: unknown } | null;
  if (!body) return rpc(null, { code: -32700, message: "Parse error" });

  const { method, id } = body;

  if (method === "agent/getCard") {
    const card = targetId
      ? `${origin}/api/a2a/${targetId}/.well-known/agent-card.json`
      : `${origin}/.well-known/agent-card.json`;
    return Response.redirect(card, 307);
  }

  if (method !== "message/send") {
    return rpc(id, { code: -32601, message: `Method not found: ${method}. This endpoint supports message/send and agent/getCard.` });
  }

  const parts = body.params?.message?.parts ?? [];
  const text = parts.map((p: any) => p?.text ?? "").join(" ").trim().slice(0, 500);
  const skill = String(body.params?.message?.metadata?.skill ?? body.params?.metadata?.skill ?? "");
  if (!text) {
    return rpc(id, { code: -32602, message: 'Empty message. Send params.message.parts = [{kind:"text", text:"..."}]' });
  }

  if (skill === "guide-build") {
    const step = getStep(Number(text.match(/\d+/)?.[0] ?? 1));
    if (!step) return rpc(id, { code: -32602, message: "No such step. Send a number from 1 to 7." });
    return reply(id, `Step ${step.n}: ${step.title}`, step);
  }

  if (skill === "check-readiness") {
    const url = text.match(/https?:\/\/\S+/)?.[0] ?? text;
    const result = await checkTarget(url);
    return reply(id, `${result.score} checks pass. ${result.nextAction}`, result);
  }

  // Anything else is a note for the room board, which needs a person's approval.
  const gate = await agentGate(req);
  if (!gate.ok) {
    return rpc(id, {
      code: -32001,
      message: `${gate.message} Leaving a note needs a token with scope "progress:write": ${origin}/auth.md. ` +
        `Skills that need no token: ${agentConfig.a2a.skills.filter((s) => s.scopes.length === 0).map((s) => s.id).join(", ")}.`,
    }, 401);
  }
  if (!hasScope(gate.agent.scopes, "progress:write")) {
    return rpc(id, {
      code: -32003,
      message: `Your token lacks scope "progress:write". It holds: ${gate.agent.scopes.join(", ") || "none"}.`,
    }, 403);
  }

  // An inbound A2A message is recorded as a note on the sender's board row, so
  // it reaches a human instead of a queue nobody reads.
  await ws.upsertAttendee(
    { id: gate.agent.id, agentName: gate.agent.agentName, humanLabel: gate.agent.humanLabel },
    { note: `A2A${targetId ? ` to ${targetId}` : ""}: ${text.slice(0, 160)}` },
  );
  return reply(id, `Received${targetId ? ` for ${targetId}` : ""}, and on the room board.`);
}

export function a2aOptions() {
  return new Response(null, { status: 204, headers: {
    ...CORS, "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type" } });
}
