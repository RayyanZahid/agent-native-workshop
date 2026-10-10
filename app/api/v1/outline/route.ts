import { PARTS, SLIDES, BUILD_STEPS, slidesForPart } from "@/lib/curriculum";

export const dynamic = "force-dynamic";

/** Tokenless. The whole curriculum as JSON, so a client that speaks REST
 *  rather than MCP is not a second-class citizen here. */
export function GET() {
  return Response.json(
    {
      object: "outline",
      parts: PARTS.map((p) => ({ ...p, slides: slidesForPart(p.n) })),
      build_steps: BUILD_STEPS,
      counts: { slides: SLIDES.length, steps: BUILD_STEPS.length },
    },
    { headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=60" } },
  );
}
