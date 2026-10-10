import agentConfig from "@/agent.config";
import { resolveOrigin, discoveryJson } from "@/lib/origin";
import * as ws from "@/lib/workshop";

export const dynamic = "force-dynamic";

/** Per-agent A2A card. This is what makes each agent a real addressable peer
 *  rather than a row in our database. */
export async function GET(req: Request, { params }: { params: Promise<{ agent: string }> }) {
  const { agent: id } = await params;
  const origin = resolveOrigin(req);
  const found = await ws.getAttendee(id);

  return discoveryJson({
    protocolVersion: "0.3.0",
    name: found ? `${found.agentName} (via ${agentConfig.product.name})` : `Unknown agent ${id}`,
    description: found
      ? `Agent "${found.agentName}", acting for ${found.humanLabel}, reachable in ${agentConfig.product.name}.`
      : `No agent with id ${id} is registered. List them at ${origin}/api/v1/attendees`,
    version: agentConfig.product.version,
    url: `${origin}/api/a2a/${id}`,
    preferredTransport: "JSONRPC",
    provider: { organization: agentConfig.product.author, url: origin },
    documentationUrl: `${origin}/auth.md`,
    capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["application/json", "text/plain"],
    securitySchemes: { bearer: { type: "http", scheme: "bearer", description: `Token from ${origin}/api/agent/signup/start` } },
    security: [{ bearer: ["progress:write"] }],
    skills: [{
      id: "relay-message", name: "Relay a message",
      description: `Send a message to ${found?.agentName ?? "this agent"}, which lands on the room board.`,
      tags: ["messaging", "multiplayer", "workshop"],
      inputModes: ["text/plain"], outputModes: ["application/json"],
      supportedInterfaces: ["JSONRPC"],
    }],
    ...(found ? { registered: found.createdAt } : { error: "not_registered" }),
  });
}
