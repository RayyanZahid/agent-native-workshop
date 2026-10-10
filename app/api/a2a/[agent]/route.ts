import { handleA2A, a2aOptions } from "@/lib/a2a";

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
 * The behaviour lives in lib/a2a.ts and is shared with /api/a2a.
 */
export async function POST(req: Request, { params }: { params: Promise<{ agent: string }> }) {
  const { agent } = await params;
  return handleA2A(req, agent);
}

export const OPTIONS = a2aOptions;
