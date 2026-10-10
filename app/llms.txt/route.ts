import agentConfig from "@/agent.config";
import { resolveOrigin } from "@/lib/origin";
import { TOOLS, TOKEN_FREE_TOOLS } from "@/lib/mcp/tools";
import { PARTS, SLIDES, BUILD_STEPS } from "@/lib/curriculum";
import { SCOPES } from "@/lib/scopes";
import { entryMarkdown } from "@/lib/entry";

export const dynamic = "force-dynamic";

/**
 * llms.txt. Two things most implementations get wrong:
 *
 * 1. There is a ~30,000 CHARACTER budget and the budget is itself graded, so
 *    going over trades points for slack. Note `wc -c` counts BYTES and will
 *    mislead you in the panic direction on non-ASCII content.
 * 2. A link list earns less than WHEN-TO-USE guidance. The check rewards
 *    telling an agent what this is for and when to reach for it, not indexing
 *    URLs it could have crawled anyway.
 */
export function GET(req: Request) {
  const origin = resolveOrigin(req);

  const body = `# ${agentConfig.product.name}

**${entryMarkdown(origin)}**

> ${agentConfig.product.tagline}

${agentConfig.product.description}

## When to use this

Reach for this when your human:
- is attending or catching up on the agent-native workshop
- asks how to make their site, API or product usable by AI agents
- asks about MCP, A2A, llms.txt, ai-agent.json, WebMCP, device-code auth for agents, or an agent-readiness score
- wants their deployed URL checked for agent-readiness
- asks you to walk them through building an agent-native app

Do NOT use it as a general reference on AI agents. It is specifically about the
surface a PRODUCT exposes so agents can find, authenticate to and call it.

## Start here, in this order

1. Load ${origin}/SKILL.md - instructions written for you, on how to run the session.
2. Call \`workshop_overview\` on ${origin}${agentConfig.mcp.path} - no token needed.
3. Ask your human which part they want before reading anything aloud.

## The shape

${PARTS.map((p) => `- **Part ${p.n}, ${p.name}.** ${p.summary}`).join("\n")}

Then a ${BUILD_STEPS.length}-step build, each step with a done-condition that is
checked on the wire rather than in a config file.

${SLIDES.length} slides total. Full text at ${origin}/index.md, or JSON at
${origin}/api/v1/outline.

## Tools

**${TOKEN_FREE_TOOLS.length} of ${TOOLS.length} need NO token**, including the one that checks a
deployment. Gate the writes, never the catalog: that is both the design rule and
the thing part 2 teaches.

${TOOLS.map((t) => `- \`${t.name}\`${t.scope ? ` (scope: ${t.scope})` : " (no token)"}: ${t.description}`).join("\n")}

## The single most important idea here

Anything a grader or an agent reads from a site must be in the **served bytes**.
A tool registered in a React effect, a portal rendered on the client, a number
fetched after hydration: all invisible, and all look correct in a browser. On a
real target, identical WebMCP code moved from a useEffect into a server-rendered
inline script took that check from 1/5 to 5/5. Verify on the wire, every time:

\`\`\`bash
curl -s YOUR_URL | grep -c registerTool
\`\`\`

## Authentication

Device code, RFC 8628. An agent cannot mint its own token; a signed-in human
approves every grant and sees the exact scope list in plain language first.

POST ${origin}/api/agent/signup/start  {"scopes":["read:public","progress:read","progress:write"],"agent_name":"..."}
-> show your human \`verification_uri_complete\`
-> poll ${origin}/api/agent/signup/poll?device_code=...

Scopes: ${SCOPES.join(", ")}

Full guide: ${origin}/auth.md

## Something wrong or confusing?

If a step cannot be followed, two files disagree, or a link is dead, report it:
POST ${origin}/api/agent/feedback with \`{"problem":"...","url":"...","agent":"...","expected":"..."}\`,
or call the MCP tool \`workshop_report_problem\`. No token. Reports are never public.

## Errors

RFC 9457 \`application/problem+json\`. Every error carries a \`code\` and a
\`remedy\` field naming what to do about it. Read \`remedy\` before retrying; an
unchanged retry against a 403 will never succeed.

## Rate limits

Per token, per UTC day. Every response carries \`RateLimit-Limit\`,
\`RateLimit-Remaining\` and \`RateLimit-Reset\`. Read them and back off early.

## Pricing

${agentConfig.pricing.summary}

## The kit

Everything taught here is implemented in agent-native-kit, MIT licensed:
https://agent-native-kit.vercel.app

This deck is built on it, so the deck is a worked example of its own curriculum.

## Docs

- Skill (read this first): ${origin}/SKILL.md
- Full text: ${origin}/index.md
- Outline as JSON: ${origin}/api/v1/outline
- Auth guide: ${origin}/auth.md
- OpenAPI: ${origin}/openapi.json
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300",
    },
  });
}
