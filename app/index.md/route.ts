import agentConfig from "@/agent.config";
import { resolveOrigin } from "@/lib/origin";
import { TOOLS, TOKEN_FREE_TOOLS } from "@/lib/mcp/tools";
import { PARTS, SLIDES, BUILD_STEPS, slidesForPart } from "@/lib/curriculum";
import * as ws from "@/lib/workshop";

export const dynamic = "force-dynamic";

/**
 * THE WHOLE DECK AS MARKDOWN. Reached by content negotiation from `/` (see
 * middleware.ts) and directly at /index.md.
 *
 * Same substance as the HTML deck, none of the chrome. An agent asking for
 * text/markdown gets every slide and every build step, not a nav bar and a
 * hydration payload.
 */
export async function GET(req: Request) {
  const origin = resolveOrigin(req);
  const bare = origin.replace("https://", "");
  const progress = await ws.roomProgress();

  const body = `# ${agentConfig.product.name}

> ${agentConfig.product.tagline}

${agentConfig.product.description}

## Start here, if you are an agent

\`\`\`
Load ${origin}/SKILL.md
Then call workshop_overview on ${origin}${agentConfig.mcp.path}
\`\`\`

${TOKEN_FREE_TOOLS.length} of the ${TOOLS.length} tools need **no token**, including
\`workshop_check_target\`, which runs live readiness checks against your human's
deployed URL. Only writing to the shared room board needs a human-approved token.

Right now: ${progress.total} attendees registered, ${progress.withTarget} with a live URL.

${PARTS.map((part) => `
## Part ${part.n}: ${part.name}

${part.summary}

${slidesForPart(part.n).map((s) => `
### ${s.n}. ${s.title}

**${s.claim}**

${s.body.map((b) => `- ${b}`).join("\n")}
${s.evidence ? `\n_${s.evidence}_` : ""}
`).join("")}`).join("\n")}

## The build, seven steps

Each step has a done-condition checked on the wire, not in your config.

${BUILD_STEPS.map((s) => `
### Step ${s.n}: ${s.title}

**Goal.** ${s.goal}

**Why here.** ${s.why}

${s.files.length ? `**Files.** ${s.files.map((f) => `\`${f}\``).join(", ")}\n` : ""}${s.commands.length ? `\`\`\`bash\n${s.commands.join("\n")}\n\`\`\`\n` : ""}
**Done when.** ${s.doneWhen}

**Verify.** \`${s.verify}\`

**Trap.** ${s.trap}
`).join("")}

## Tools

${TOOLS.map((t) => `- \`${t.name}\`${t.scope ? ` (scope \`${t.scope}\`)` : " **(no token)**"}: ${t.description}`).join("\n")}

## Getting on the room board

Optional. Needs your human's approval, which is itself the pattern from part 2
layer 3.

1. \`POST ${origin}/api/agent/signup/start\` with \`{"scopes":["read:public","progress:read","progress:write"],"agent_name":"..."}\`
2. Show your human \`verification_uri_complete\`. They approve and see the exact scopes.
3. Poll \`${origin}/api/agent/signup/poll?device_code=...\` every 3s until \`status: completed\`.
4. Then \`workshop_register\`, and \`workshop_complete_step\` as they finish each step.

Full guide: ${origin}/auth.md

## Every surface on this domain

| Surface | URL |
|---|---|
| Skill | ${origin}/SKILL.md |
| Manifest | ${origin}/.well-known/ai-agent.json |
| MCP | ${origin}${agentConfig.mcp.path} |
| A2A card | ${origin}/.well-known/agent-card.json |
| OAuth AS metadata | ${origin}/.well-known/oauth-authorization-server |
| OAuth PRM | ${origin}/.well-known/oauth-protected-resource |
| AI catalog | ${origin}/.well-known/ai-catalog.json |
| Skills index | ${origin}/.well-known/agent-skills/index.json |
| API catalog | ${origin}/.well-known/api-catalog |
| OpenAPI | ${origin}/openapi.json |
| Outline (REST) | ${origin}/api/v1/outline |
| Attendees (REST) | ${origin}/api/v1/attendees |
| llms.txt | ${origin}/llms.txt |
| Auth guide | ${origin}/auth.md |
| Pricing | ${origin}/pricing.md |

${SLIDES.length} slides, ${BUILD_STEPS.length} build steps.
Built on [agent-native-kit](https://agent-native-kit.vercel.app): one config
generates every surface above. MIT.

Human-readable version: https://${bare}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=30",
      vary: "accept",
    },
  });
}
