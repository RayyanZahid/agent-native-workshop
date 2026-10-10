import { agentGate, hasScope } from "@/lib/auth";
import { resolveOrigin } from "@/lib/origin";
import * as ws from "@/lib/workshop";

export const dynamic = "force-dynamic";

/**
 * A2A JSON-RPC, PER AGENT. Each agent in the room is individually addressable
 * at /api/a2a/<agentId>, with its own card at
 * /api/a2a/<agentId>/.well-known/agent-card.json
 *
 * WHY PER-AGENT RATHER THAN ONE ENDPOINT: A2A's model is agent-to-agent, so the
 * addressable unit is an agent, not a site. One shared endpoint forces every
 * caller to pass a recipient in the payload, which means a topology audit reads
 * your whole product as a single hub and the "multi-agent" claim is cosmetic.
 * Routing by path makes each agent a real peer, and costs one dynamic segment.
 *
 * AUTHENTICATED BY DEFAULT. Open A2A is irreversible once registries cache you.
 */
export async function POST(req: Request, { params }: { params: Promise<{ agent: string }> }) {
  const { agent: targetId } = await params;
  const origin = resolveOrigin(req);
  const body = await req.json().catch(() => null) as { method?: string; params?: any; id?: unknown } | null;
  if (!body) return rpc(null, { code: -32700, message: "Parse error" });

  const { method, id } = body;

  if (method === "agent/getCard") {
    return Response.redirect(`${origin}/api/a2a/${targetId}/.well-known/agent-card.json`, 307);
  }

  if (method !== "message/send") {
    return rpc(id, { code: -32601, message: `Method not found: ${method}. This endpoint supports message/send and agent/getCard.` });
  }

  const gate = await agentGate(req);
  if (!gate.ok) {
    return rpc(id, {
      code: -32001,
      message: `${gate.message} A2A here is authenticated. Get a token with scope "progress:write": ${origin}/auth.md`,
    }, 401);
  }
  if (!hasScope(gate.agent.scopes, "progress:write")) {
    return rpc(id, {
      code: -32003,
      message: `Your token lacks scope "progress:write". It holds: ${gate.agent.scopes.join(", ") || "none"}.`,
    }, 403);
  }

  const parts = body.params?.message?.parts ?? [];
  const text = parts.map((p: any) => p?.text ?? "").join(" ").trim().slice(0, 500);
  if (!text) {
    return rpc(id, { code: -32602, message: 'Empty message. Send params.message.parts = [{kind:"text", text:"..."}]' });
  }

  // An inbound A2A message is recorded as a note on the sender's board row, so
  // it reaches a human instead of a queue nobody reads.
  await ws.upsertAttendee(
    { id: gate.agent.id, agentName: gate.agent.agentName, humanLabel: gate.agent.humanLabel },
    { note: `A2A to ${targetId}: ${text.slice(0, 160)}` },
  );

  return rpc(id, null, 200, {
    kind: "message",
    role: "agent",
    messageId: `m_${Date.now().toString(36)}`,
    parts: [{ kind: "text", text: `Received for ${targetId}, and on the room board.` }],
  });
}

function rpc(id: unknown, error: { code: number; message: string } | null, status = 200, result?: unknown) {
  return Response.json(
    error ? { jsonrpc: "2.0", id: id ?? null, error } : { jsonrpc: "2.0", id: id ?? null, result },
    { status: error ? status : 200, headers: { "access-control-allow-origin": "*" } },
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: {
    "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type" } });
}
