import * as ws from "@/lib/workshop";

export const dynamic = "force-dynamic";

/** Tokenless. The room board. */
export async function GET(req: Request) {
  const limit = Math.min(Math.max(Number(new URL(req.url).searchParams.get("limit")) || 50, 1), 100);
  const [attendees, progress] = await Promise.all([ws.listAttendees(limit), ws.roomProgress()]);
  return Response.json(
    {
      object: "list",
      progress,
      data: attendees.map((a) => ({
        human: a.humanLabel, agent: a.agentName, step: a.step,
        completed: a.completedSteps, target: a.targetUrl, note: a.note,
        updatedAt: a.updatedAt,
      })),
      has_more: false, next_cursor: null,
    },
    { headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=10" } },
  );
}
