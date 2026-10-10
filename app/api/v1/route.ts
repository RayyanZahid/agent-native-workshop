import agentConfig from "@/agent.config";
import { resolveOrigin } from "@/lib/origin";

export const dynamic = "force-dynamic";

/** The REST base address. It used to 404 while ai-agent.json named it as the
 *  base, so a client that followed the manifest hit a dead end on its first
 *  request. Now it says what lives under it. */
export function GET(req: Request) {
  const origin = resolveOrigin(req);
  return Response.json(
    {
      name: `${agentConfig.product.name} API`,
      version: agentConfig.product.version,
      description: "Every address under /api/v1 needs no token.",
      openapi: `${origin}/openapi.json`,
      endpoints: {
        outline: `${origin}/api/v1/outline`,
        attendees: `${origin}/api/v1/attendees`,
        health: `${origin}/api/v1/health`,
      },
      also: {
        get_a_token: `${origin}/api/agent/signup/start`,
        report_a_problem: `${origin}/api/agent/feedback`,
      },
    },
    { headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=300" } },
  );
}
