/**
 * ============================================================================
 * agent.config.ts: THE ONE SOURCE OF TRUTH
 * ============================================================================
 *
 * This deck is built on agent-native-kit, and it is a worked example of the
 * thing it teaches: every discovery surface below is GENERATED from this file.
 *
 *   /.well-known/ai-agent.json          /.well-known/agent-card.json
 *   /.well-known/mcp.json               /.well-known/api-catalog
 *   /.well-known/oauth-protected-resource (+ the path-inserted variant)
 *   /.well-known/oauth-authorization-server
 *   /.well-known/agent-skills/index.json
 *   /.well-known/ai-catalog.json
 *   /llms.txt   /auth.md   /robots.txt  /openapi.json  /pricing.md
 *   the WebMCP inline script             the MCP tool catalog
 *
 * Hand-writing those is easy. Keeping them agreeing for six months is not, and
 * that is the problem this file exists to solve. Change a scope here and every
 * surface moves together.
 */

export const agentConfig = {
  product: {
    name: "Agent-Native Workshop",
    slug: "workshop",
    tagline: "A workshop on building agent-native products, which is itself an agent-native product.",
    description:
      "Three parts: what agent-native means, what is actually happening in each of the seven layers, " +
      "and a guided build of a production agent-native app. Point your agent at this URL and it can " +
      "read the whole curriculum, hand you each build step with its commands and done-condition, and " +
      "check your deployment for you. Built on agent-native-kit.",
    version: "1.0.0",
    /** Date the content last changed, YYYY-MM-DD. Served as `last-updated` in the
     *  frontmatter of every markdown file. Bump it when you change the content;
     *  a date that always says "today" tells an agent nothing. */
    updated: "2026-10-10",
    license: "MIT",
    author: "Immersive Commons",
    /** The organisation's own site, used in the homepage structured data. */
    authorUrl: "https://www.immersivecommons.com",
    contact: "https://github.com/RayyanZahid/agent-native-workshop/issues",
  },

  hosts: {
    canonical: "https://agent-native-workshop.vercel.app",
    allowed: ["agent-native-workshop.vercel.app", "localhost:3000"],
  },

  /** Shared KV namespace. Set this when you fork, or two products silently
   *  overwrite each other's keys and the symptom is missing data, not an error. */
  kvNamespace: "anw",

  scopes: {
    "read:public": "Read the curriculum, the build steps and the room board. Everything teaching is already free without a token.",
    "progress:read": "Read your own recorded progress through the build.",
    "progress:write": "Register in the room, mark build steps complete, and ask the facilitator a question.",
  },

  tiers: {
    anonymous: ["read:public"],
    member: ["read:public", "progress:read", "progress:write"],
    operator: "*",
  },

  mcp: {
    path: "/api/mcp",
    protocolVersion: "2025-06-18",
    /**
     * Most tools need no token, and that is deliberate pedagogy as well as good
     * design: an attendee can get the entire curriculum, every build step, and a
     * live check of their own deployment without signing up for anything, and
     * can report a problem without an account. Only writing to the shared room
     * needs a human's approval. lib/mcp/tools.ts throws at build time if the
     * real tool list disagrees with these two lists.
     */
    tokenFreeTools: [
      "workshop_overview",
      "workshop_outline",
      "workshop_part",
      "workshop_slide",
      "workshop_build_step",
      "workshop_check_target",
      "workshop_board",
      "workshop_report_problem",
    ],
    gatedTools: ["workshop_register", "workshop_complete_step", "workshop_ask"],
  },

  a2a: {
    path: "/api/a2a",
    /**
     * Each skill names the permission it needs. An empty list means no token.
     * The card, the endpoint and the checks all read this, so a skill cannot
     * claim to need a login that the endpoint does not ask for.
     */
    skills: [
      {
        id: "guide-build",
        name: "Guide a build",
        description:
          "Get one of the seven build steps. Send message/send with metadata {\"skill\":\"guide-build\"} and a text part with the step number, for example \"3\".",
        tags: ["workshop", "build-steps", "guided-build"],
        scopes: [] as string[],
      },
      {
        id: "check-readiness",
        name: "Check readiness",
        description:
          "Run live agent-readiness checks against a deployed https URL. Send message/send with metadata {\"skill\":\"check-readiness\"} and a text part holding the URL.",
        tags: ["workshop", "readiness", "verification"],
        scopes: [] as string[],
      },
      {
        id: "leave-note",
        name: "Leave a note on the room board",
        description:
          "Send any other message/send and it is recorded on your row of the room board, where the facilitator reads it. Needs a token with progress:write.",
        tags: ["workshop", "room-board", "messaging"],
        scopes: ["progress:write"] as string[],
      },
    ],
  },

  api: {
    basePath: "/api/v1",
    tokenlessOperations: ["GET /api/v1/outline", "GET /api/v1/attendees", "GET /api/v1/health"],
    errorFormat: "application/problem+json",
    versioningPolicy:
      "URL path major version. Breaking changes ship a new major; the prior major is supported 180 days.",
  },

  pricing: {
    model: "free",
    summary: "Free. Rate-limited per token per UTC day. No payment required for any operation.",
    x402: false,
  },
} as const;

export type AgentConfig = typeof agentConfig;
export default agentConfig;
