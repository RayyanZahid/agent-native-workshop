import agentConfig from "@/agent.config";
import { type Scope } from "@/lib/scopes";
import type { AgentToken } from "@/lib/auth";
import { PARTS, SLIDES, BUILD_STEPS, slidesForPart, getSlide, getStep } from "@/lib/curriculum";
import * as ws from "@/lib/workshop";
import { checkTarget } from "@/lib/checkTarget";
import { recordFeedback, FEEDBACK_REMEDY } from "@/lib/feedback";

/**
 * THE WORKSHOP TOOL CATALOG.
 *
 * Note which tools are token-free: everything that teaches. An attendee points
 * their agent at this URL and can read the whole curriculum, get any build step
 * with its commands and its done-condition, and have their own deployment
 * checked, all with no signup at all.
 *
 * Only the tools that WRITE to the shared room need a human-approved token.
 * That split is the lesson, applied to the thing teaching the lesson: gate the
 * writes, never the catalog.
 */
export type ToolCtx = { agent: AgentToken | null; origin: string; via: "mcp" | "a2a" };

export type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  scope: Scope | null;
  rateClass: string;
  handler: (ctx: ToolCtx, input: Record<string, unknown>) => Promise<unknown>;
};

const EMPTY = { type: "object", properties: {}, additionalProperties: false };

export const TOOLS: Tool[] = [
  {
    name: "workshop_overview",
    description:
      "START HERE. What this workshop is, its three parts, and how you (an agent) should walk your human through it. " +
      "Returns the structure plus the URL map for every other surface. No token required.",
    inputSchema: EMPTY,
    scope: null,
    rateClass: "public",
    handler: async ({ origin }) => ({
      name: agentConfig.product.name,
      summary: agentConfig.product.tagline,
      what_this_is:
        "A workshop on building agent-native products. It is also itself an agent-native product, which is the point: " +
        "you are reading its curriculum through the same kind of interface it teaches you to build.",
      how_to_use_this:
        "Call workshop_outline for the shape. Call workshop_part to read a part in full. " +
        "When your human is ready to build, call workshop_build_step with step 1 and work through all seven, " +
        "checking each one with workshop_check_target against their deployed URL before moving on. " +
        "Note the two lists of seven: Part 2 has Layer 1 to Layer 7, Part 3 has Step 1 to Step 7. Never call a layer a step.",
      parts: PARTS,
      slide_count: SLIDES.length,
      build_step_count: BUILD_STEPS.length,
      the_kit: "https://agent-native-kit.vercel.app",
      surfaces: {
        deck: origin,
        markdown: `${origin}/index.md`,
        skill: `${origin}/SKILL.md`,
        llms_txt: `${origin}/llms.txt`,
        mcp: `${origin}${agentConfig.mcp.path}`,
        openapi: `${origin}/openapi.json`,
        auth_guide: `${origin}/auth.md`,
      },
    }),
  },
  {
    name: "workshop_outline",
    description:
      "The full outline: three parts, every slide title and its one-line claim, and the seven build steps. " +
      "Use this to orient before reading anything in full. No token required.",
    inputSchema: EMPTY,
    scope: null,
    rateClass: "public",
    handler: async () => ({
      parts: PARTS.map((p) => ({
        ...p,
        slides: slidesForPart(p.n).map((s) => ({ n: s.n, title: s.title, claim: s.claim })),
      })),
      build_steps: BUILD_STEPS.map((s) => ({ n: s.n, id: s.id, title: s.title, goal: s.goal })),
    }),
  },
  {
    name: "workshop_part",
    description:
      "Read one whole part in full, every slide with its body. Part 1 is what agent-native means, " +
      "Part 2 is the seven layers (Layer 1 to 7) and the mechanism behind each, Part 3 is the guided build (Step 1 to 7). No token required.",
    inputSchema: {
      type: "object",
      properties: { part: { type: "integer", enum: [1, 2, 3], description: "Which part, 1 to 3." } },
      required: ["part"],
      additionalProperties: false,
    },
    scope: null,
    rateClass: "public",
    handler: async (_ctx, { part }) => {
      const n = Number(part) as 1 | 2 | 3;
      const meta = PARTS.find((p) => p.n === n);
      if (!meta) throw new Error("part must be 1, 2 or 3");
      return { part: meta, slides: slidesForPart(n) };
    },
  },
  {
    name: "workshop_slide",
    description: "One slide in full by its number, 1 to 17. No token required.",
    inputSchema: {
      type: "object",
      properties: { n: { type: "integer", minimum: 1, description: "Slide number." } },
      required: ["n"],
      additionalProperties: false,
    },
    scope: null,
    rateClass: "public",
    handler: async (_ctx, { n }) => {
      const s = getSlide(Number(n));
      if (!s) throw new Error(`No slide ${n}. There are ${SLIDES.length}.`);
      return s;
    },
  },
  {
    name: "workshop_build_step",
    description:
      "THE GUIDED BUILD. One of seven steps, with its goal, why it is in this order, the files to edit, " +
      "the exact commands, a checkable done-condition, the command that verifies it, and the trap that " +
      "costs people the most time. Walk your human through these in order. No token required.",
    inputSchema: {
      type: "object",
      properties: {
        step: {
          type: ["integer", "string"],
          description: "Step number 1 to 7, or its id such as \"deploy-first\".",
        },
      },
      required: ["step"],
      additionalProperties: false,
    },
    scope: null,
    rateClass: "public",
    handler: async (_ctx, { step }) => {
      const s = getStep(typeof step === "number" ? step : String(step));
      if (!s) throw new Error(`No such step. Use 1 to ${BUILD_STEPS.length}, or an id from workshop_outline.`);
      const next = BUILD_STEPS.find((x) => x.n === s.n + 1);
      return {
        ...s,
        of: BUILD_STEPS.length,
        next_step: next ? { n: next.n, id: next.id, title: next.title } : null,
        reminder:
          "Check this step before moving on. For a deployed site, use workshop_check_target with its https address. " +
          "For a site running on your own computer, run `npm run verify http://localhost:PORT` in the kit folder (scripts/verify.sh), which runs the same kind of checks on your own computer. " +
          "A step that is not verified on the wire is not done.",
      };
    },
  },
  {
    name: "workshop_check_target",
    description:
      "VERIFY YOUR HUMAN'S BUILD. Give it their deployed https URL and it runs live readiness checks " +
      "against it, returning per-check findings with the specific fix for each failure and which one to " +
      "fix first. Use this after every build step. No token required.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The deployed https URL to check, e.g. https://my-product.vercel.app" },
      },
      required: ["url"],
      additionalProperties: false,
    },
    scope: null,
    rateClass: "public",
    handler: async (_ctx, { url }) => checkTarget(String(url ?? "")),
  },
  {
    name: "workshop_board",
    description:
      "Who is in the room and how far each attendee has got. This is what is on the projector. No token required.",
    inputSchema: EMPTY,
    scope: null,
    rateClass: "public",
    handler: async () => {
      const [attendees, progress] = await Promise.all([ws.listAttendees(100), ws.roomProgress()]);
      return {
        progress,
        attendees: attendees.map((a) => ({
          human: a.humanLabel,
          agent: a.agentName,
          step: a.step,
          completed: a.completedSteps.length,
          target: a.targetUrl,
          note: a.note,
        })),
      };
    },
  },
  {
    name: "workshop_report_problem",
    description:
      "REPORT A PROBLEM. If anything in this workshop is wrong, missing, out of date or confusing, say so here: " +
      "a step that did not work, two files that disagree, an instruction you could not follow. " +
      "It goes to the facilitator and is how this workshop gets fixed. Say what you tried and what you expected. " +
      "Nothing you send is made public. No token required.",
    inputSchema: {
      type: "object",
      properties: {
        problem: { type: "string", description: "What went wrong, in a sentence or two. Max 1000 chars." },
        url: { type: "string", description: "The address you were using when it went wrong." },
        agent: { type: "string", description: "Your name, so the facilitator knows who to ask." },
        expected: { type: "string", description: "What you expected to happen instead." },
      },
      required: ["problem"],
      additionalProperties: false,
    },
    scope: null,
    rateClass: "public",
    handler: async (_ctx, input) => {
      const saved = await recordFeedback(input, "mcp");
      if (!saved.ok) throw new Error(`problem is required. ${FEEDBACK_REMEDY}`);
      return { ok: true, note: "Logged. Thank you. This is how the workshop gets fixed." };
    },
  },

  // ---------------- writes, which need a human-approved token ----------------
  {
    name: "workshop_register",
    description:
      "Register your human in the room and optionally record the URL they are building. " +
      "Puts them on the board. Needs a token with scope progress:write.",
    inputSchema: {
      type: "object",
      properties: {
        target_url: { type: "string", description: "The https URL they are building, if they have one yet." },
        note: { type: "string", description: "What they are building, one line." },
      },
      additionalProperties: false,
    },
    scope: "progress:write",
    rateClass: "write",
    handler: async ({ agent }, { target_url, note }) => {
      const a = await ws.upsertAttendee(
        { id: agent!.id, agentName: agent!.agentName, humanLabel: agent!.humanLabel },
        {
          targetUrl: typeof target_url === "string" && target_url.trim() ? target_url.trim().slice(0, 300) : undefined,
          note: typeof note === "string" && note.trim() ? note.trim().slice(0, 200) : undefined,
        },
      );
      return { ok: true, attendee: a, next: "Call workshop_build_step with step 1." };
    },
  },
  {
    name: "workshop_complete_step",
    description:
      "Mark a build step complete for your human, after workshop_check_target confirms it on the wire. " +
      "Moves them up the board. Needs a token with scope progress:write.",
    inputSchema: {
      type: "object",
      properties: {
        step_id: { type: "string", description: "The step id, e.g. \"deploy-first\"." },
      },
      required: ["step_id"],
      additionalProperties: false,
    },
    scope: "progress:write",
    rateClass: "write",
    handler: async ({ agent }, { step_id }) => {
      await ws.upsertAttendee({ id: agent!.id, agentName: agent!.agentName, humanLabel: agent!.humanLabel });
      const a = await ws.completeStep(agent!.id, String(step_id));
      if (!a) throw new Error("Unknown step_id. Get valid ids from workshop_outline.");
      const next = BUILD_STEPS.find((s) => s.n === a.step + 1);
      return {
        ok: true,
        completed: a.completedSteps,
        step: a.step,
        next_step: next ? { n: next.n, id: next.id, title: next.title } : null,
      };
    },
  },
  {
    name: "workshop_ask",
    description:
      "Leave a question for the facilitator. It appears on the room board, so a question asked here gets " +
      "answered out loud without anyone raising a hand. Needs a token with scope progress:write.",
    inputSchema: {
      type: "object",
      properties: { question: { type: "string", description: "The question, max 300 chars." } },
      required: ["question"],
      additionalProperties: false,
    },
    scope: "progress:write",
    rateClass: "write",
    handler: async ({ agent }, { question }) => {
      const q = String(question ?? "").trim().slice(0, 300);
      if (!q) throw new Error("question is required");
      await ws.upsertAttendee(
        { id: agent!.id, agentName: agent!.agentName, humanLabel: agent!.humanLabel },
        { note: `Q: ${q}` },
      );
      return { ok: true, note: "On the board. The facilitator can see it." };
    },
  },
];

export const TOKEN_FREE_TOOLS = TOOLS.filter((t) => t.scope === null);

/**
 * Throws at module load, so a build fails if the tool list and the lists in
 * agent.config.ts (which the slides and counts read) ever disagree.
 */
(function assertToolSplit() {
  const free = TOKEN_FREE_TOOLS.map((t) => t.name).sort().join(",");
  const gated = TOOLS.filter((t) => t.scope !== null).map((t) => t.name).sort().join(",");
  if (free !== [...agentConfig.mcp.tokenFreeTools].sort().join(",")) {
    throw new Error("agent.config.ts mcp.tokenFreeTools does not match the tools with scope: null");
  }
  if (gated !== [...agentConfig.mcp.gatedTools].sort().join(",")) {
    throw new Error("agent.config.ts mcp.gatedTools does not match the tools with a scope");
  }
})();

export function findTool(name: string): Tool | undefined {
  return TOOLS.find((t) => t.name === name);
}

export function publicToolList() {
  return TOOLS.map(({ name, description, inputSchema, scope }) => ({
    name,
    description,
    inputSchema,
    ...(scope ? { _meta: { requiredScope: scope } } : {}),
  }));
}
