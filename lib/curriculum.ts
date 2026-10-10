/**
 * THE CURRICULUM, AS DATA.
 *
 * Every consumer renders from this one array: the HTML deck, the markdown twin,
 * llms.txt, the SKILL.md an attendee's agent loads, and the MCP tools that walk
 * someone through the build.
 *
 * That is not an implementation detail, it is the thing being taught. A deck
 * whose slides live in markup cannot be read by an agent without scraping. A
 * deck whose slides are data can be read, summarised, searched and walked
 * through by any agent that finds the manifest. Same content, one source.
 */

export type Slide = {
  n: number;
  part: 1 | 2 | 3;
  title: string;
  claim: string;
  body: string[];
  evidence?: string;
};

export type BuildStep = {
  id: string;
  n: number;
  title: string;
  goal: string;
  why: string;
  files: string[];
  commands: string[];
  doneWhen: string;
  verify: string;
  trap: string;
};

export const PARTS = [
  {
    n: 1 as const,
    name: "What",
    summary:
      "What agent-native actually means, and why it is a repeatable pattern rather than a pile of one-off integrations.",
  },
  {
    n: 2 as const,
    name: "What is happening",
    summary:
      "The seven layers, in order, with the mechanism behind each one and the measured trap that eats a week if you skip it.",
  },
  {
    n: 3 as const,
    name: "Build your own",
    summary:
      "A guided build of a production agent-native app, in seven steps, each with a checkable done-condition your agent can verify.",
  },
];

export const SLIDES: Slide[] = [
  // ---------------------------------------------------------------- PART 1
  {
    n: 1,
    part: 1,
    title: "Two visitors, one of them unserved",
    claim: "A human reads pixels. An agent reads bytes. Almost every site is built entirely for the first one.",
    body: [
      "Open any product site with curl instead of a browser and you get a shell: markup, a hydration payload, nothing an agent can act on.",
      "The agent is not a crawler looking for text. It is a caller looking for a function.",
      "That gap is the whole subject of this session.",
    ],
  },
  {
    n: 2,
    part: 1,
    title: "Agent-native, defined",
    claim: "Five verbs: discoverable, readable, authenticatable, callable, payable.",
    body: [
      "Discoverable: an agent that knows only your domain can find everything else.",
      "Readable: it gets substance, not chrome.",
      "Authenticatable: it can get credentials without a human pasting an API key into a prompt.",
      "Callable: it can do what a human can do, through a typed interface.",
      "Payable: it knows what things cost before it commits, even when the answer is nothing.",
    ],
    evidence: "Miss any one and the chain breaks at that link. Discovery with no auth path is a dead end; auth with no tools is a login to nowhere.",
  },
  {
    n: 3,
    part: 1,
    title: "This presentation is the demo",
    claim: "Send this URL to your agent right now and ask it what this workshop covers.",
    body: [
      "It will find the manifest, read the outline, and be able to walk you through the build without you reading another slide.",
      "Nothing was scraped. The deck exposes itself the same way the thing it teaches does.",
      "If a slide deck can do this, your product has no excuse.",
    ],
    evidence: "Try: \"Use this URL and tell me what part 3 asks me to build.\"",
  },
  {
    n: 4,
    part: 1,
    title: "Why bother",
    claim: "An agent that cannot call you cannot recommend you.",
    body: [
      "Agents are becoming the surface where products get chosen, not just the tool that fetches them.",
      "The decision happens before a human sees your landing page, using whatever your domain exposes.",
      "An empty tool list is read as having no tools, not as having a beautiful website.",
    ],
  },
  {
    n: 5,
    part: 1,
    title: "The thesis: it is the same seven layers every time",
    claim: "This is a pattern, not a pile of integrations, which is why it can ship as a kit.",
    body: [
      "Discovery, readability, identity, execution, multiplayer, API-as-product, recovery.",
      "The order is load-bearing. Discovery is free and takes minutes. API-as-product is where the points are but needs the rest to mean anything.",
      "Build it once, correctly, and the agent surface stops being a project and becomes a floor you build on.",
    ],
    evidence: "Everything in part 3 is that floor, already written, already deployed, MIT licensed.",
  },

  // ---------------------------------------------------------------- PART 2
  {
    n: 6,
    part: 2,
    title: "Layer 1, Discovery: the real enemy is drift",
    claim: "Hand-writing eleven well-known documents is easy. Keeping them agreeing for six months is not.",
    body: [
      "The failure has one shape. You add a scope to a token and forget to add it to scopes_supported.",
      "Now your metadata advertises a permission vocabulary your tokens do not carry. Nothing fails loudly.",
      "An agent reads the metadata, requests the scope, gets a token without it, and the call 403s with no explanation anywhere in the chain.",
      "So: one config object, many consumers. Change a scope in one place and every surface moves together.",
    ],
    evidence: "In the kit, agent.config.ts generates all eleven. There is no second place to edit.",
  },
  {
    n: 7,
    part: 2,
    title: "Layer 2, Readable: anything a grader reads must be in the served bytes",
    claim: "This is the single highest-leverage sentence in the session.",
    body: [
      "WebMCP tools registered from a React useEffect ship, deploy, rescan, and move nothing.",
      "The effect lives in a hashed JS chunk and does not run until hydration, so the served HTML contains no tool surface at all.",
      "The identical code in a server-rendered inline script took that check from 1 out of 5 to 5 out of 5.",
      "Same idea for content: an agent sending Accept: text/markdown wants substance. Serving 40KB of HTML is technically valid and practically a refusal.",
    ],
    evidence: "Verify it the only way that counts: curl -s YOUR_URL | grep -c registerTool",
  },
  {
    n: 8,
    part: 2,
    title: "Layer 3, Identity: an agent must not be able to credential itself",
    claim: "RFC 8628 device code. The human approves, in plain language, on a device they trust.",
    body: [
      "Every other answer is worse. An API key in the prompt is a key the agent can leak to anyone who asks nicely. A browser OAuth redirect assumes a browser and a human watching it.",
      "Device code assumes neither. The agent gets a short code. A person opens a URL, sees exactly which scopes, and decides.",
      "The audit trail then reads: a signed-in human approved these five scopes for an agent calling itself X at this timestamp.",
      "That is a sentence that survives a security review. The agent had a key is not.",
    ],
    evidence: "Scopes are frozen at mint time. No widen-a-token path, because widening after approval means the human approved something other than what exists.",
  },
  {
    n: 9,
    part: 2,
    title: "Layer 4, Execution: your tool list is called anonymously",
    claim: "Gate the writes. Never gate the catalog.",
    body: [
      "Anything evaluating you calls tools/list with no token. If every tool needs auth, that list is empty and you are judged as having no tools.",
      "So ship at least one genuinely useful anonymous tool. Not a stub: let an agent understand the product, learn how to authenticate, and read real content before any human approves anything.",
      "Remote MCP over Streamable HTTP. Stdio is a local-dev transport; a hosted client cannot reach it at all.",
    ],
    evidence: "The reference app exposes 7 tools, 3 of them token-free. Those three are what make it evaluable.",
  },
  {
    n: 10,
    part: 2,
    title: "Layer 5, Multiplayer: the addressable unit is an agent, not a site",
    claim: "Per-agent A2A, each with its own card, or your multi-agent claim is cosmetic.",
    body: [
      "One shared endpoint forces every caller to pass a recipient in the payload. A topology audit then reads your whole product as a single hub.",
      "Routing by path makes each agent a real peer, and costs one dynamic segment.",
      "Authenticated by default. Open A2A is irreversible once registries cache you.",
    ],
  },
  {
    n: 11,
    part: 2,
    title: "Layer 6, API as product: this is where the points actually are",
    claim: "Being agent-ready is mostly being a good API product.",
    body: [
      "The two heaviest checks are an OpenAPI spec and a public API, at 7 points each. The developer portal is 6. Every shiny well-known file is worth 1 to 2.",
      "An MCP server bolted onto a weak REST API scores badly, and the MCP server is not the problem.",
      "Publishing a spec also activates dormant checks: on one real target the usability denominator grew from 81 to 150 behind a single spec.",
      "Expect more movement than 7 points, and expect new red checks. Both are correct.",
    ],
    evidence: "Error contract with a remedy field, cursor pagination, idempotency keys, live RateLimit headers. Each worth points, each only honest because the routes do it.",
  },
  {
    n: 12,
    part: 2,
    title: "Layer 7, Recovery: the layer nobody builds",
    claim: "Your discovery surface will drift, and the agents hitting you are the only witnesses.",
    body: [
      "A URL moves, a scope gets renamed, a grader changes what it reads.",
      "Without a feedback endpoint, the agents that break have no way to tell you. They fail quietly and stop coming back.",
      "You find out from a score drop weeks later.",
      "Anonymous and unauthenticated on purpose: the agent that cannot authenticate is exactly the one with something to report.",
    ],
  },
  {
    n: 13,
    part: 2,
    title: "The scoreboard, and how to read it without lying to yourself",
    claim: "Two graders. They do not measure the same thing, and a site can top one while failing the other.",
    body: [
      "ora.ai reports out of 100 over about 125 weighted checks. Cloudflare's isitagentready reports Level 1 to 5 over 22. One real property held Level 5 and scored 52 on ora for six weeks.",
      "Rank work by what a fix is worth, never by the red list. On a saturated site the red list is mostly noise.",
      "ora allows six fresh scans a day, so batch fixes then scan. Cloudflare has no observed limit and reveals sub-checks one at a time, so rescan after every single fix.",
      "Watch the cache between you and the grader. A document a grader reads to decide your score should not be cached for an hour.",
    ],
    evidence: "Measured live while building this: the reference app went from 6 passing / 10 failing to 14 passing / 2 failing. One remaining failure needs DNS records a vercel.app subdomain cannot have.",
  },

  // ---------------------------------------------------------------- PART 3
  {
    n: 14,
    part: 3,
    title: "The kit",
    claim: "Clone it, edit one file, deploy. The agent surface is already correct.",
    body: [
      "A Next.js base with all seven layers wired and 18 live assertions that check them on your own deployment.",
      "The reference product on top is a room where agents register, post, and message each other. Delete it and put yours there.",
      "MIT. Nothing to buy, no service to sign up for.",
    ],
    evidence: "agent-native-kit.vercel.app",
  },
  {
    n: 15,
    part: 3,
    title: "Your build, seven steps",
    claim: "Each step has a done-condition your agent can actually check.",
    body: [
      "Deploy something live before you customise anything, so you are always debugging one change.",
      "Make it yours in agent.config.ts. Replace the domain. Wire real auth. Add durable storage.",
      "Then the API product layer, then verify and scan.",
      "Ask your agent for step 1 and it will walk you through it with the commands and the check.",
    ],
    evidence: "Call the workshop_build_step tool, or read /build.",
  },
  {
    n: 16,
    part: 3,
    title: "The gates, so done means done",
    claim: "Three checks, in order, and none of them is an opinion.",
    body: [
      "npm run build typechecks every route. A route that does not compile cannot be a surface.",
      "bash scripts/verify.sh YOUR_URL runs 18 assertions against the live deployment, not against your config file.",
      "Then the graders, which are the acceptance test rather than the build plan.",
      "If you are shipping at the end of today, stop at the second gate. It is already further than almost anything on the web.",
    ],
  },
  {
    n: 17,
    part: 3,
    title: "What to do next",
    claim: "Keep layers 1 through 4. Add 6 when you want the number to move. Add 7 the day you ship.",
    body: [
      "Layers 1 to 4 are a discoverable, readable, authenticated, agent-callable product. That is the smallest genuinely useful thing.",
      "Add multiplayer when there is a second agent worth talking to, not before.",
      "Do DNS records last or never: highest effort, one grader, and it needs everything else live first.",
      "Do not build a paywall to chase a score. The commerce checks are neutral and do not count.",
    ],
    evidence: "MODULES.md says what each layer is worth and what breaks if you delete it.",
  },
];

export const BUILD_STEPS: BuildStep[] = [
  {
    id: "deploy-first",
    n: 1,
    title: "Deploy the kit unchanged, before you customise anything",
    goal: "A live URL serving all seven layers, with nothing of yours in it yet.",
    why:
      "If you customise first and it breaks, you are debugging your product and the kit and your deploy pipeline at once. " +
      "Deploy the known-good thing first and every later failure has exactly one cause.",
    files: [],
    commands: [
      "git clone https://github.com/RayyanZahid/agent-native-kit my-product && cd my-product",
      "npm install",
      "npx vercel deploy --prod",
    ],
    doneWhen: "Your deployed URL returns HTTP 200 for /.well-known/ai-agent.json",
    verify: "curl -s YOUR_URL/.well-known/ai-agent.json | head -5",
    trap:
      "Do not set a custom domain yet. The canonical host is baked into every discovery document, and changing it is step 2.",
  },
  {
    id: "make-it-yours",
    n: 2,
    title: "Edit agent.config.ts, and nothing else",
    goal: "Your product name, your canonical host, your scope vocabulary.",
    why:
      "Every discovery surface reads from this file. Setting the host here is what makes eleven documents self-consistent. " +
      "Skipping it leaves a manifest pointing at someone else's domain, which fails in a way that looks like an auth bug.",
    files: ["agent.config.ts"],
    commands: ["npm run build", "npx vercel deploy --prod"],
    doneWhen:
      "Your manifest's homepage field equals your real deployed origin, and scopes_supported in the PRM lists your scopes",
    verify:
      "curl -s YOUR_URL/.well-known/oauth-protected-resource | python -m json.tool",
    trap:
      "Add BOTH the apex and the www host to hosts.allowed if you serve both. A document that self-references the wrong host breaks the discovery chain one link from the end.",
  },
  {
    id: "replace-domain",
    n: 3,
    title: "Delete the demo domain and put your product there",
    goal: "Your nouns in lib/, your tools in lib/mcp/tools.ts.",
    why:
      "This is the only step that is actually about your product. Everything else is the floor. " +
      "Keep at least one tool with scope: null, or your whole execution surface is invisible to anything evaluating you anonymously.",
    files: ["lib/room.ts", "lib/mcp/tools.ts"],
    commands: ["npm run build"],
    doneWhen:
      "An anonymous tools/list returns your tools, and at least one of them executes with no token",
    verify:
      "curl -s -X POST YOUR_URL/api/mcp -H 'content-type: application/json' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    trap:
      "A tool description is read by an agent deciding whether to call it. Write it for that reader, not as a label. Say what it returns and when to reach for it.",
  },
  {
    id: "wire-auth",
    n: 4,
    title: "Wire your identity provider into the approval step",
    goal: "The human who approves a token is identified by their session, not by a posted field.",
    why:
      "The kit ships this seam deliberately open, because it has no opinion about your auth. As shipped, anyone who knows a user_code can approve it. " +
      "The device-code flow's entire value is that a KNOWN human approved a SPECIFIC grant, and a body-supplied identity throws that away.",
    files: ["app/api/agent/signup/complete/route.ts"],
    commands: ["npm install @clerk/nextjs", "npm run build"],
    doneWhen:
      "An unauthenticated POST to the complete endpoint is refused, and an approval records a real user id from the session",
    verify:
      "curl -s -X POST YOUR_URL/api/agent/signup/complete -H 'content-type: application/json' -d '{\"user_code\":\"TEST-TEST\"}'",
    trap:
      "Pass the approving user's REAL tier so the scope ceiling is enforced against who they actually are. The ceiling at /start was a guess made by an anonymous caller.",
  },
  {
    id: "durable-storage",
    n: 5,
    title: "Add durable storage before you demo to anyone",
    goal: "Writes that survive between requests.",
    why:
      "Without KV the kit uses an in-process Map. On a serverless host each invocation may land in a fresh instance, " +
      "so writes appear to succeed and then vanish with nothing erroring. That silent version is much worse than an outright failure.",
    files: [".env.local"],
    commands: [
      "npx vercel env add KV_REST_API_URL production",
      "npx vercel env add KV_REST_API_TOKEN production",
      "npx vercel deploy --prod",
    ],
    doneWhen: "GET /api/v1/health returns status ok with storage kv, not degraded",
    verify: "curl -s YOUR_URL/api/v1/health",
    trap:
      "Set kvNamespace in agent.config.ts if you share a KV with another project. Two products writing an unprefixed key silently overwrite each other, and the symptom is missing data rather than an error.",
  },
  {
    id: "api-product",
    n: 6,
    title: "Ship the API-as-product layer",
    goal: "An OpenAPI spec, a tokenless read, a typed error contract, live rate-limit headers.",
    why:
      "This is where the points are: a spec and a public API are worth 7 each, against 1 to 2 for a well-known file. " +
      "It is also what makes you evaluable. An API that demands a key before it will tell you anything gets judged as having nothing.",
    files: ["app/openapi.json/route.ts", "lib/errors.ts", "lib/ratelimit.ts", "app/developers/page.tsx"],
    commands: ["npm run build", "npx vercel deploy --prod"],
    doneWhen:
      "Your spec lists your real paths, a write with no token returns problem+json carrying a remedy field, and an authenticated write carries RateLimit headers",
    verify:
      "curl -s YOUR_URL/openapi.json | python -c 'import json,sys; d=json.load(sys.stdin); print(list(d[\"paths\"]))'",
    trap:
      "Derive the developer portal's counts from the tool catalog. A portal claiming 12 tools next to a server exposing 7 is worse than no portal, and hand-maintained numbers always end up there.",
  },
  {
    id: "verify-and-scan",
    n: 7,
    title: "Verify, then scan",
    goal: "18 live assertions green, then a number from a grader.",
    why:
      "The assertions read the wire, not your config, which is the only thing that counts. " +
      "The graders are the acceptance test, not the build plan: treat a red check as a question about your surface, not as a to-do item.",
    files: ["scripts/verify.sh"],
    commands: [
      "bash scripts/verify.sh YOUR_URL",
      "curl -s -X POST https://isitagentready.com/api/scan -H 'content-type: application/json' -d '{\"url\":\"YOUR_URL\"}'",
    ],
    doneWhen: "verify.sh reports FAIL 0",
    verify: "bash scripts/verify.sh YOUR_URL",
    trap:
      "Rescan after every single fix on the Cloudflare grader: it reveals sub-checks one at a time, so a check that just went green can be hiding the next one. Three of ours took two or three passes each.",
  },
];

export function slidesForPart(part: 1 | 2 | 3): Slide[] {
  return SLIDES.filter((s) => s.part === part);
}

export function getSlide(n: number): Slide | undefined {
  return SLIDES.find((s) => s.n === n);
}

export function getStep(idOrN: string | number): BuildStep | undefined {
  if (typeof idOrN === "number") return BUILD_STEPS.find((s) => s.n === idOrN);
  const asNum = Number(idOrN);
  if (!Number.isNaN(asNum)) return BUILD_STEPS.find((s) => s.n === asNum);
  return BUILD_STEPS.find((s) => s.id === idOrN);
}
