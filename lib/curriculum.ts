/**
 * THE CURRICULUM, AS DATA.
 *
 * Every consumer renders from this one array: the HTML deck, the markdown twin,
 * llms.txt, the SKILL.md an attendee's agent loads, and the MCP tools that walk
 * someone through the build.
 *
 * VOICE: written for someone hearing this for the first time. Plain sentences,
 * one idea per slide, a tiny story, and the fix in plain words. An attendee's
 * agent relays this text to a beginner, so jargon here becomes jargon in their
 * chat. Technical depth lives in `evidence`, kept short and optional.
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
    name: "What it means",
    summary:
      "What it means for a website to work for AI agents, and why the same short list of things works every time.",
  },
  {
    n: 2 as const,
    name: "How it works",
    summary:
      "The seven things to build, in order. For each one: what it is, and what goes wrong if you skip it.",
  },
  {
    n: 3 as const,
    name: "Build your own",
    summary:
      "Seven steps to put your own agent-ready site on the internet today, with your AI agent checking each step.",
  },
];

export const SLIDES: Slide[] = [
  // ---------------------------------------------------------------- PART 1
  {
    n: 1,
    part: 1,
    title: "Your website has a new kind of visitor",
    claim: "People look at your site. AI agents read it, and most sites give them almost nothing to work with.",
    body: [
      "When you open a website, you see buttons, pictures and text.",
      "When an AI agent like Claude or ChatGPT visits, it often gets a nearly blank page, because the content only appears after code runs in a browser.",
      "The agent isn't there to read. It's there to do something for someone: book, buy, sign up, look something up.",
    ],
  },
  {
    n: 2,
    part: 1,
    title: "What \"agent-ready\" means: five things",
    claim: "An AI agent needs to find your site, read it, get permission, use it, and know the cost.",
    body: [
      "Find it: knowing only your web address, it can discover everything your site offers.",
      "Read it: it gets the actual content, not just the page layout.",
      "Get permission: it can act for a person without that person typing their password into a chatbot.",
      "Use it: it can do what a person could do, like booking or posting.",
      "Know the cost: it can tell what something costs before doing it, even if the answer is free.",
    ],
    evidence: "Miss any one and the agent gets stuck at that point, and gives up.",
  },
  {
    n: 3,
    part: 1,
    title: "Try it on this workshop right now",
    claim: "Paste one sentence into your AI agent and it can guide you through everything here.",
    body: [
      "Type: \"Use agent-native-workshop.vercel.app and walk me through this workshop.\"",
      "Your agent will find this workshop, read it, and walk you through the steps one at a time.",
      "Nobody set that up for your agent specifically. This site is built the way we're about to teach.",
    ],
  },
  {
    n: 4,
    part: 1,
    title: "Why it matters: agents recommend what they can use",
    claim: "If an AI agent can't use your site, it will send people somewhere else.",
    body: [
      "More people now ask an AI to find, compare and book things for them.",
      "The agent decides which site to use before any human sees your homepage.",
      "A beautiful site that an agent can't use simply doesn't make the list.",
    ],
  },
  {
    n: 5,
    part: 1,
    title: "The good news: it's the same seven things every time",
    claim: "Making a site agent-ready is a short, repeatable checklist, so we turned it into a starter kit.",
    body: [
      "Be findable, be readable, ask permission properly, be usable, let agents talk to each other, have a good API, and hear about breakages.",
      "The first two are free and take minutes. The API is the most work and the most valuable.",
      "Build them once, in that order, and you can stop thinking about it.",
    ],
    evidence: "The starter kit has all seven built in: agent-native-kit.vercel.app (free to copy).",
  },

  // ---------------------------------------------------------------- PART 2
  {
    n: 6,
    part: 2,
    title: "1. Be findable: write it down once",
    claim: "Agents look for a few small files that describe your site. Keep them all in sync by generating them from one place.",
    body: [
      "Your site needs about a dozen small description files at standard addresses that agents check first.",
      "The trouble starts when you change one and forget another. Now agents get told something false, and nothing shows an error.",
      "The fix: describe your site in one settings file, and let the kit generate all the others from it.",
    ],
    evidence: "In the kit that file is agent.config.ts. Change it once and every description updates together.",
  },
  {
    n: 7,
    part: 2,
    title: "2. Be readable: put the content in the page from the start",
    claim: "Agents usually read your page as it first arrives. If your content appears only after code runs, they see nothing.",
    body: [
      "Many modern sites send an almost empty page, then fill it in with code in your browser.",
      "People never notice. Agents often do, because many read the page before any code runs.",
      "The fix: make sure the important content and the list of things your site can do are in the page from the start.",
    ],
    evidence: "One real example: moving the same code into the initial page took a scanner score from 1 out of 5 to 5 out of 5.",
  },
  {
    n: 8,
    part: 2,
    title: "3. Ask permission: never paste a password into a chatbot",
    claim: "Let the agent ask, and let the person approve on their own phone, seeing exactly what they're allowing.",
    body: [
      "Think of a valet key: it starts the car but can't open the trunk.",
      "The agent asks your site for access. The person gets a short code, opens a page, sees exactly what the agent wants to do, and taps yes or no.",
      "The agent gets a key limited to what was approved. No passwords are shared, and the key can't later be widened.",
    ],
    evidence: "This is a standard login method called the device code flow, the same one smart TVs use.",
  },
  {
    n: 9,
    part: 2,
    title: "4. Be usable: show everyone what your site can do",
    claim: "Agents check what your site can do before signing up. If that list is hidden behind a login, they leave.",
    body: [
      "It's like a shop window: let anyone see what's for sale, and ask for payment only at the till.",
      "Show the list of things your site can do to everyone. Require login only to actually do them.",
      "Give agents at least one useful thing they can do without logging in, so they can tell your site is worth it.",
    ],
    evidence: "This workshop site offers 10 actions to agents, and 7 of them need no login.",
  },
  {
    n: 10,
    part: 2,
    title: "5. Let agents talk to each other: give each one its own address",
    claim: "If agents work together on your site, each needs its own address, like a phone number.",
    body: [
      "One shared front desk that forwards every message makes all your agents look like one.",
      "Give each agent its own address so others can reach it directly.",
      "Only agents with permission should be able to send messages. Once an address is public, you can't take it back.",
    ],
  },
  {
    n: 11,
    part: 2,
    title: "6. The biggest win is boring: a good, documented API",
    claim: "Agents are programs, and programs need a clear, documented way in. This is where most of the score comes from.",
    body: [
      "A document describing your API, and some data anyone can read without logging in, count for the most.",
      "A page for developers comes next. Each special agent file counts for very little by comparison.",
      "Clear error messages matter too: tell the agent what went wrong and what to do about it.",
    ],
    evidence: "On one popular scanner, the API document and the open data are worth 7 points each. Each agent file is worth 1 or 2.",
  },
  {
    n: 12,
    part: 2,
    title: "7. Let agents tell you when something breaks",
    claim: "Agents hit your broken links before you do. Give them a way to tell you.",
    body: [
      "You rename a page. An AI agent that was using it now gets an error.",
      "It doesn't email you. It gives up, and the person who sent it never comes back. You find out weeks later, if ever.",
      "The fix: a \"report a problem\" address any agent can send a note to, with no login. A suggestion box by the front door.",
    ],
    evidence: "Example: an agent sends \"the page /pricing is gone.\"",
  },
  {
    n: 13,
    part: 2,
    title: "Free scanners score your site. Use them as a checklist.",
    claim: "Two free websites check how agent-ready you are. They measure different things, so pick one to follow.",
    body: [
      "A scanner visits your site like an agent would, and lists what works and what's missing.",
      "The two main scanners can disagree completely: one site scored top marks on one and about half on the other.",
      "Fix what's worth the most first, not whatever is at the top of the list. Re-check after each fix, because fixing one thing can reveal the next.",
    ],
    evidence: "While building this workshop, the starter kit went from 6 checks passing to 14.",
  },

  // ---------------------------------------------------------------- PART 3
  {
    n: 14,
    part: 3,
    title: "Start from the free starter kit",
    claim: "Copy it, change one settings file, put it online. All seven things are already built in.",
    body: [
      "It's a normal website project with everything from Part 2 included and tested.",
      "It comes with a small example app you replace with your own idea.",
      "It's free to copy and use.",
    ],
    evidence: "github.com/RayyanZahid/agent-native-kit",
  },
  {
    n: 15,
    part: 3,
    title: "Seven steps, and your agent checks each one",
    claim: "Your AI agent gives you a step, you do it, it checks your live site, then you move on.",
    body: [
      "Put the kit online first, before changing anything, so if something breaks you know why.",
      "Then: change the settings, add your own idea, connect a real login, add a small database.",
      "Then: make your API clear, and check everything.",
      "Ask your agent for step 1 and it will walk you through it.",
    ],
  },
  {
    n: 16,
    part: 3,
    title: "Three checks so you know it really works",
    claim: "Does it build, does the live site actually work, and what do the scanners say.",
    body: [
      "First: the code builds without errors.",
      "Second: a test script checks your live site from the outside, the way an agent sees it.",
      "Third: the free scanners give you a score.",
      "If you're finishing today, passing the second check is already further than almost any site on the web.",
    ],
  },
  {
    n: 17,
    part: 3,
    title: "What to do next",
    claim: "Start with the first four, add the rest when you need them.",
    body: [
      "Findable, readable, permission and usable are the smallest useful set.",
      "Add the good API when you want your score to go up. Add the problem-report address the day you launch.",
      "Add agent-to-agent addresses only when you have a second agent worth talking to.",
      "Don't add payments just to raise a score. Scanners don't count them.",
    ],
  },
];

export const BUILD_STEPS: BuildStep[] = [
  {
    id: "deploy-first",
    n: 1,
    title: "Put the starter kit online before changing anything",
    goal: "A working copy of the kit on the internet, with nothing of yours in it yet.",
    why:
      "If you change things first and something breaks, you won't know whether it's your change or your setup. " +
      "Put the working version online first, and every later problem has one cause.",
    files: [],
    commands: [
      "git clone https://github.com/RayyanZahid/agent-native-kit my-product && cd my-product",
      "npm install",
      "npx vercel deploy --prod",
    ],
    doneWhen: "Opening YOUR_SITE/.well-known/ai-agent.json in a browser shows text, not an error page.",
    verify: "curl -s YOUR_URL/.well-known/ai-agent.json | head -5",
    trap:
      "The first time you run the deploy command, Vercel asks you to log in and link a project. Accept the defaults. " +
      "Any other host works too, and the check is the same. Don't add your own domain name yet. That comes in step 2.",
  },
  {
    id: "make-it-yours",
    n: 2,
    title: "Change one file: the settings",
    goal: "Your product's name, web address, and the permissions agents can ask for.",
    why:
      "Every description file agents read is generated from agent.config.ts. " +
      "If the web address there is wrong, every file points agents to the wrong place. " +
      "The web address in that file must match where your site really runs, or the description files point to the kit's default address. " +
      "Your changes do not show until you rebuild and redeploy (or restart, if you run it on your own computer).",
    files: ["agent.config.ts"],
    commands: ["npm run build", "npx vercel deploy --prod"],
    doneWhen: "Your site's description files show your product name and your real web address.",
    verify: "curl -s YOUR_URL/.well-known/oauth-protected-resource",
    trap:
      "If your site works both with and without \"www.\", list both addresses in the settings, or agents get confused about which one is real.",
  },
  {
    id: "replace-domain",
    n: 3,
    title: "Swap the example app for your own idea",
    goal: "Your own features, and the list of actions agents can take on your site.",
    why:
      "This is the only step about your actual product. Everything else is the foundation. " +
      "Keep at least one action agents can do without logging in, or they can't tell what your site is for.",
    files: ["lib/mcp/tools.ts", "lib/room.ts"],
    commands: ["npm run build"],
    doneWhen:
      "tools/list shows at least one tool you added (not one of the example's floor_ tools), and it works without a login.",
    verify:
      "curl -s -X POST YOUR_URL/api/mcp -H 'content-type: application/json' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    trap:
      "Agents choose actions by reading their descriptions. Write each one as if explaining it to a new colleague: what it does and when to use it. " +
      "After you rename things in those two files, search the whole project for floor_ and rename what's left.",
  },
  {
    id: "wire-auth",
    n: 4,
    title: "Connect a real login, so only you can approve your agent",
    goal: "The person approving an agent is a real, logged-in user.",
    why:
      "Right now, anyone who knows an approval code can approve an agent. That's fine for practice, not for real use. " +
      "The whole point of the approval step is that a known person said yes. " +
      "This step needs a free Clerk account (clerk.com) and two keys from it: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY. " +
      "Add both in your Vercel project settings under Environment Variables, then redeploy.",
    files: ["app/api/agent/signup/complete/route.ts"],
    commands: ["npm install @clerk/nextjs", "npm run build"],
    doneWhen:
      "Starting a real signup and then trying to approve its code without being logged in is refused (401 or 403), not approved. Approvals record who you are.",
    verify:
      "CODE=$(curl -s -X POST YOUR_URL/api/agent/signup/start -H 'content-type: application/json' -d '{\"scopes\":[\"read:public\"],\"agent_name\":\"check\"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)[\"user_code\"])') && " +
      "curl -s -o /dev/null -w '%{http_code}\n' -X POST YOUR_URL/api/agent/signup/complete -H 'content-type: application/json' -d \"{\\\"user_code\\\":\\\"$CODE\\\"}\"  # 401 or 403 is a pass, 200 means anyone can approve",
    trap:
      "Read who the person is from their login, never from what the request says. The comment in that file shows how.",
  },
  {
    id: "durable-storage",
    n: 5,
    title: "Add a small database so your site remembers things",
    goal: "Things saved on your site stay saved.",
    why:
      "Free hosting runs your code on a fresh machine for each visit. Save something in memory and the next visit can't see it, " +
      "with no error anywhere. A small database fixes that with two settings.",
    files: [".env.local"],
    commands: [
      "npx vercel env add KV_REST_API_URL production",
      "npx vercel env add KV_REST_API_TOKEN production",
      "npx vercel deploy --prod",
    ],
    doneWhen: "YOUR_SITE/api/v1/health says \"ok\" instead of \"degraded\".",
    verify: "curl -s YOUR_URL/api/v1/health",
    trap:
      "If you share the database with another project, give yours its own name prefix in the settings, or the two projects overwrite each other's data.",
  },
  {
    id: "api-product",
    n: 6,
    title: "Make your API clear and documented",
    goal: "A description of your API, some data anyone can read, and helpful error messages.",
    why:
      "This counts for the most on the scanners, and it's what lets an agent decide your site is worth using. " +
      "A site that demands a login before saying anything looks like it has nothing to offer.",
    files: ["app/openapi.json/route.ts", "lib/errors.ts", "lib/ratelimit.ts", "app/developers/page.tsx"],
    commands: ["npm run build", "npx vercel deploy --prod"],
    doneWhen:
      "Your API description lists your real features, and a failed request explains what went wrong and how to fix it.",
    verify: "curl -s YOUR_URL/openapi.json",
    trap:
      "Let the developer page count your features automatically. A page that says 12 when there are 7 is worse than no page.",
  },
  {
    id: "verify-and-scan",
    n: 7,
    title: "Check it from the outside, then scan it",
    goal: "A test script that checks your live site passes, then a score from a scanner.",
    why:
      "The test script checks what agents actually receive, not what you think you shipped. " +
      "The scanners then tell you what to improve next.",
    files: ["scripts/verify.sh"],
    commands: [
      "bash scripts/verify.sh YOUR_URL",
      "curl -s -X POST https://isitagentready.com/api/scan -H 'content-type: application/json' -d '{\"url\":\"YOUR_URL\"}'",
    ],
    doneWhen: "The test script reports zero failures.",
    verify: "bash scripts/verify.sh YOUR_URL",
    trap:
      "Re-scan after every single fix. Fixing one thing often reveals the next one underneath it.",
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
