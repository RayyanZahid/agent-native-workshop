import { recordFeedback, FEEDBACK_REMEDY } from "@/lib/feedback";
import { resolveOrigin } from "@/lib/origin";

export const dynamic = "force-dynamic";

/**
 * THE RECOVERY LOOP, and the module most people never think to build.
 *
 * Your discovery surface will drift. A URL moves, a scope is renamed, a scanner
 * changes what it reads. When that happens the agents hitting you are the only
 * witnesses, and without this endpoint they have no way to tell you, they just
 * fail quietly and stop coming back. You find out from a score drop weeks later.
 *
 * Anonymous and unauthenticated on purpose: an agent that cannot authenticate
 * is exactly the agent with something to report.
 */
export async function POST(req: Request) {
  const origin = resolveOrigin(req);
  const body = await req.json().catch(() => null) as
    { problem?: unknown; url?: unknown; agent?: unknown; expected?: unknown } | null;

  if (!body || typeof body.problem !== "string") {
    return Response.json(
      {
        error: "invalid_request",
        remedy: FEEDBACK_REMEDY,
        docs: `${origin}/auth.md`,
      },
      { status: 400, headers: { "access-control-allow-origin": "*" } },
    );
  }

  const saved = await recordFeedback(body, "rest");
  if (!saved.ok) {
    return Response.json(
      { error: "invalid_request", remedy: FEEDBACK_REMEDY, docs: `${origin}/auth.md` },
      { status: 400, headers: { "access-control-allow-origin": "*" } },
    );
  }

  return Response.json(
    { ok: true, note: "Logged. Thank you. This is how we find out our discovery surface drifted." },
    { headers: { "access-control-allow-origin": "*" } },
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: {
    "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type" } });
}
