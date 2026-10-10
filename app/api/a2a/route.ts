import { handleA2A, a2aOptions } from "@/lib/a2a";
import { resolveOrigin } from "@/lib/origin";
import agentConfig from "@/agent.config";

export const dynamic = "force-dynamic";

/**
 * A2A JSON-RPC at the address the agent card advertises. The card said
 * /api/a2a for a while before anything answered here, and the only check read
 * the card, not the address, so it passed. The check now calls this endpoint.
 */
export async function POST(req: Request) {
  return handleA2A(req, null);
}

/** A person or confused client. Say where the card is and how to call this. */
export function GET(req: Request) {
  const origin = resolveOrigin(req);
  return Response.json({
    name: agentConfig.product.name,
    protocol: "A2A JSON-RPC 2.0",
    note: "POST message/send here. This address does not serve a web page.",
    card: `${origin}/.well-known/agent-card.json`,
    skills: agentConfig.a2a.skills.map((s) => ({ id: s.id, needs_token: s.scopes.length > 0, scopes: s.scopes })),
    example: {
      jsonrpc: "2.0", id: 1, method: "message/send",
      params: { message: { role: "user", parts: [{ kind: "text", text: "3" }], metadata: { skill: "guide-build" } } },
    },
  }, { headers: { "access-control-allow-origin": "*" } });
}

export const OPTIONS = a2aOptions;
