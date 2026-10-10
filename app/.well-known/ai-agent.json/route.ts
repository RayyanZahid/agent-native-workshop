import agentConfig from "@/agent.config";
import { resolveOrigin, discoveryJson } from "@/lib/origin";
import { SCOPES } from "@/lib/scopes";
import { TOOLS, TOKEN_FREE_TOOLS } from "@/lib/mcp/tools";
import { ENTRY_LINE } from "@/lib/entry";

export const dynamic = "force-dynamic";

/** The Aiia ai-agent.json manifest: the single document that points an agent
 *  at everything else. Generated, so it can never disagree with the rest. */
export function GET(req: Request) {
  const origin = resolveOrigin(req);
  return discoveryJson({
    schema_version: "1.0",
    start_here: { instruction: ENTRY_LINE, skill: `${origin}/SKILL.md`, first_tool: "workshop_overview" },
    name: agentConfig.product.name,
    description: agentConfig.product.description,
    version: agentConfig.product.version,
    homepage: origin,
    contact: agentConfig.product.contact,
    license: agentConfig.product.license,
    interfaces: {
      mcp: { url: `${origin}${agentConfig.mcp.path}`, transport: "streamable-http", protocol_version: agentConfig.mcp.protocolVersion },
      a2a: { url: `${origin}${agentConfig.a2a.path}`, card: `${origin}/.well-known/agent-card.json`, skills: agentConfig.a2a.skills.map((s) => ({ id: s.id, needs_token: s.scopes.length > 0 })) },
      rest: { base_url: `${origin}${agentConfig.api.basePath}`, openapi: `${origin}/openapi.json` },
    },
    authentication: {
      type: "oauth2-device-code",
      rfc: "8628",
      start: `${origin}/api/agent/signup/start`,
      poll: `${origin}/api/agent/signup/poll`,
      protected_resource_metadata: `${origin}/.well-known/oauth-protected-resource`,
      guide: `${origin}/auth.md`,
      scopes_supported: SCOPES,
      note: "An agent cannot mint its own token. A signed-in human approves every grant.",
    },
    capabilities: {
      tool_count: TOOLS.length,
      token_free_tool_count: TOKEN_FREE_TOOLS.length,
      token_free_tools: TOKEN_FREE_TOOLS.map((t) => t.name),
    },
    pricing: { model: agentConfig.pricing.model, summary: agentConfig.pricing.summary, document: `${origin}/pricing.md` },
    discovery: {
      llms_txt: `${origin}/llms.txt`,
      skills_index: `${origin}/.well-known/agent-skills/index.json`,
      api_catalog: `${origin}/.well-known/api-catalog`,
      developer_portal: `${origin}/developers`,
    },
    recovery: {
      feedback: `${origin}/api/agent/feedback`,
      how: 'POST {"problem": "what went wrong", "url": "...", "agent": "your name", "expected": "..."}. Only problem is required. No token. Never public.',
      mcp_tool: "workshop_report_problem",
      guide: `${origin}/auth.md`,
      contact: agentConfig.product.contact,
    },
  });
}
