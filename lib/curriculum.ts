import agentConfig from "@/agent.config";

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
  /** The exact things to change, in plain words. Empty when the step is only commands. */
  edits: string[];
  commands: string[];
  doneWhen: string;
  /** The time this step should take with an agent guiding, in minutes. Past it, the agent stops and checks in. */
  budgetMinutes: number;
  /** Check a deployed site. Also runnable as workshop_check_target with the https address. */
  verify: string;
  /** The same check against a copy running on your own computer. PORT is the port you started it on. */
  verifyLocal: string;
  trap: string;
  /** 2 to 4 plain sentences an agent can read aloud word for word to a non-developer. */
  sayToBeginner: string;
  /** Every technical word this step uses, with its plain meaning, to explain the first time it comes up. */
  wordsToExplain: { word: string; plain: string }[];
  /** What the guiding agent must do or never do in this step. Kept inside the step on purpose: page-reading
   *  tools summarise a page and drop instructions addressed to agents, but keep the steps (run 6, cold control). */
  agentShould: string[];
};

/** Rules for every step, printed at the top of the build so a summary of the page still carries them. */
export const AGENT_RULES_ALL_STEPS = [
  "Read /SKILL.md before Step 1. It has the rules for guiding someone who is new to code.",
  "Run the step's check and show the person its result line (for example PASS 22, FAIL 0) before you say a step is done.",
  "Say where the work is happening. If you run on a different machine from the person's, tell them, because they cannot open its local addresses.",
  "Every step has a time budget in minutes. If a step runs past it, stop, say what is done, what is half done and what you need decided, and ask.",
  "If a check still fails after two fixes, stop and ask instead of trying a third time.",
];

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
      "The seven layers (Layer 1 to Layer 7), in order. For each one: what it is, and what goes wrong if you skip it.",
  },
  {
    n: 3 as const,
    name: "Build your own",
    summary:
      "Seven build steps (Step 1 to Step 7) to put your own agent-ready site on the internet today, with your AI agent checking each step. The steps are what you do. The layers in Part 2 are what you are building.",
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
      "Type: \"Read agent-native-workshop.vercel.app/SKILL.md and walk me through this workshop.\"",
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
    title: "The good news: it's the same seven layers every time",
    claim: "Making a site agent-ready is a short, repeatable checklist, so we turned it into a starter kit.",
    body: [
      "The seven layers: be findable, be readable, ask permission properly, be usable, let agents talk to each other, have a good API, and hear about breakages.",
      "Layers 1 and 2 are free and take minutes. Layer 6, the API, is the most work and the most valuable.",
      "Build them once, in that order, and you can stop thinking about it.",
    ],
    evidence: "The starter kit has all seven built in: agent-native-kit.vercel.app (free to copy).",
  },

  // ---------------------------------------------------------------- PART 2
  {
    n: 6,
    part: 2,
    title: "Layer 1, Be findable: write it down once",
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
    title: "Layer 2, Be readable: put the content in the page from the start",
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
    title: "Layer 3, Ask permission: never paste a password into a chatbot",
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
    title: "Layer 4, Be usable: show everyone what your site can do",
    claim: "Agents check what your site can do before signing up. If that list is hidden behind a login, they leave.",
    body: [
      "It's like a shop window: let anyone see what's for sale, and ask for payment only at the till.",
      "Show the list of things your site can do to everyone. Require login only to actually do them.",
      "Give agents at least one useful thing they can do without logging in, so they can tell your site is worth it.",
    ],
    evidence: `This workshop site offers ${agentConfig.mcp.tokenFreeTools.length + agentConfig.mcp.gatedTools.length} actions to agents, and ${agentConfig.mcp.tokenFreeTools.length} of them need no login.`,
  },
  {
    n: 10,
    part: 2,
    title: "Layer 5, Let agents talk to each other: give each one its own address",
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
    title: "Layer 6, The biggest win is boring: a good, documented API",
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
    title: "Layer 7, Let agents tell you when something breaks",
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
    claim: "Copy it, change one settings file, put it online. All seven layers are already built in.",
    body: [
      "It's a normal website project with all seven layers from Part 2 included and tested.",
      "It comes with a small example app you replace with your own idea.",
      "It's free to copy and use.",
    ],
    evidence: "github.com/RayyanZahid/agent-native-kit",
  },
  {
    n: 15,
    part: 3,
    title: "Seven build steps, and your agent checks each one",
    claim: "Your AI agent gives you a step, you do it, it checks your live site, then you move on.",
    body: [
      "Put the kit online first, before changing anything, so if something breaks you know why.",
      "Then: change the settings, add your own idea, connect a real login, add a small database.",
      "Then: make your API clear, and check everything.",
      "These are build steps, not the seven layers from Part 2: the layers are what you build, the steps are the order you do it in.",
      "Ask your agent for Step 1 and it will walk you through it.",
    ],
  },
  {
    n: 16,
    part: 3,
    title: "Your agent works in short steps, and a separate check says when each one is done",
    claim: "Five roles share the work, and no step runs past ten minutes without checking in with you.",
    body: [
      "One role splits the work into short steps and writes none of it: the dispatcher.",
      "A quick lookup goes to a scout, and a simple change to one file goes to a hand.",
      "Your own idea in Step 3 has no ready answer, so a builder takes it, and the decisions stay yours.",
      "After every step a verifier reads and runs the check and changes nothing, so the one who built it never marks it done.",
    ],
    evidence: "Roles and gates from the project-cycle dispatch family; its brief gate refuses a task with no deliverable or no budget, and warns when there is no check.",
  },
  {
    n: 17,
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
    n: 18,
    part: 3,
    title: "What to do next",
    claim: "Start with Layers 1 to 4, add the rest when you need them.",
    body: [
      "Findable, readable, permission and usable (Layers 1 to 4) are the smallest useful set.",
      "Add the good API (Layer 6) when you want your score to go up. Add the problem-report address (Layer 7) the day you launch.",
      "Add agent-to-agent addresses (Layer 5) only when you have a second agent worth talking to.",
      "Don't add payments just to raise a score. Scanners don't count them.",
    ],
  },
];

const LIST_CALL = (base: string) =>
  `curl -s -X POST ${base}/api/mcp -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;
const TOOL_CALL = (base: string) =>
  `curl -s -X POST ${base}/api/mcp -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"YOUR_TOOL","arguments":{}}}'`;

export const BUILD_STEPS: BuildStep[] = [
  {
    id: "deploy-first",
    agentShould: [
      "If the person cannot open the local address, do not open a public tunnel (localtunnel, ngrok, or similar) without asking first. It puts their unfinished site on the open internet. Offer the online deploy instead.",
    ],
    sayToBeginner:
      "This step puts a working copy of the starter site on the internet before you change anything. That way, if something breaks later, we know it was your change and not the setup. You will see a web address come back, and when you open it you will see a block of text describing the site, not an error.",
    wordsToExplain: [
      {
        "word": "deploy",
        "plain": "put your site on the internet so anyone can reach it"
      },
      {
        "word": "starter kit",
        "plain": "a ready-made website project that already works for AI agents, which you copy and then make your own"
      },
      {
        "word": "localhost",
        "plain": "a web address that only works on your own computer, so nobody else can see it"
      },
      {
        "word": "port",
        "plain": "a numbered door on your computer that a running site listens on; the usual one is 3000"
      },
      {
        "word": "terminal command",
        "plain": "a line of text you type into a window on your computer to make it do something"
      },
      {
        "word": "Vercel",
        "plain": "a free hosting service that puts your site online"
      }
    ],
    n: 1,
    title: "Put the starter kit online before changing anything",
    goal: "A working copy of the kit running, with nothing of yours in it yet.",
    why:
      "If you change things first and something breaks, you won't know whether it's your change or your setup. " +
      "Put the working version up first, and every later problem has one cause.",
    files: [],
    edits: [],
    commands: [
      "git clone https://github.com/RayyanZahid/agent-native-kit my-product && cd my-product",
      "npm install",
      "# Online with Vercel (a free hosting site; the first run asks you to log in):",
      "npx vercel deploy --prod",
      "# Or on your own computer, no account needed. It serves on http://localhost:3000 (to use another port, put PORT=3001 in front of npm start):",
      "npm run build && npm start",
    ],
    doneWhen:
      "YOUR_SITE/.well-known/ai-agent.json shows a block of text with a \"name\" and an \"interfaces\" section, not an error page. " +
      "It will still show the kit's own web address until Step 2. That is expected.",
    budgetMinutes: 10,
    verify: "curl -s YOUR_URL/.well-known/ai-agent.json | head -5",
    verifyLocal: "npm run verify http://localhost:PORT",
    trap:
      "Until Step 4, anyone who gets an approval code can approve an agent on your site. That is fine while you practise. " +
      "The first deploy asks you to log in and link a project; accept the defaults. " +
      "Any other host works too, and the check is the same. Don't add your own domain name yet. That comes in Step 2.",
  },
  {
    id: "make-it-yours",
    agentShould: [
      "Ask the person which name and contact to publish. Never fill in the email from their login or account: this file is published for anyone to read.",
    ],
    sayToBeginner:
      "This step is where you put your own name, description and contact into one settings file. Every file an AI agent reads about your site is made from that one file, so if it still says the starter's details, agents are told the wrong thing and nothing warns you. After you change it, the site has to be restarted or put online again, and then you will see your own name show up.",
    wordsToExplain: [
      {
        "word": "config file",
        "plain": "a plain text file of settings that the rest of the site reads from"
      },
      {
        "word": "restart",
        "plain": "stop the running site and start it again so it picks up your changes"
      },
      {
        "word": "port",
        "plain": "a numbered door on your computer that a running site listens on; the usual one is 3000"
      },
      {
        "word": "localhost",
        "plain": "a web address that only works on your own computer"
      },
      {
        "word": "host name",
        "plain": "the part of a web address after https://, like my-product.vercel.app"
      },
      {
        "word": "canonical address",
        "plain": "the one official web address you want agents to use for your site"
      },
      {
        "word": "WARN",
        "plain": "a yellow note from the checker: it works, but something is not finished yet"
      }
    ],
    n: 2,
    title: "Change one file: the settings",
    goal: "Your product's name, web address, and contact, in the one settings file.",
    why:
      "Every description file agents read is generated from agent.config.ts. " +
      "If the web address there is wrong, every file points agents to the wrong place, and nothing shows an error. " +
      "The file only takes effect after you restart (on your own computer) or redeploy (online), so the last part of this step is not optional.",
    files: ["agent.config.ts"],
    edits: [
      "product.name: your product's name.",
      "product.description: one or two plain sentences about what it does. It still describes the kit's example room until you change it.",
      "product.tagline: the one-line summary. It still describes the kit's example room until you change it.",
      "product.author: you or your team. It ships as \"Immersive Commons\".",
      "product.contact: a web address or email where people can reach you. It ships as TODO-your-contact@example.com, which is a placeholder, not you, and verify warns until you change it.",
      "hosts.canonical: your real address with https://, for example https://my-product.vercel.app. Leave it as is if you are only running on your own computer.",
      "hosts.allowed: every host name your site answers on, as host:port with no https://. For example \"my-product.vercel.app\" and \"localhost:3000\". If you run on another port, add \"localhost:PORT\" exactly, or the files quietly use the kit's address. You must also pass that PORT to every npm run start, restart, stop and verify command (for example PORT=3001 npm run restart), or they act on port 3000.",
      "If you only run on your own computer, npm run verify will WARN that the web address is the kit's default or not yours. That is expected until you put the site online, so do not chase it.",
    ],
    commands: [
      "# Online: rebuild and redeploy (a deploy replaces the old version for you):",
      "npx vercel deploy --prod",
      "# On your own computer: one command stops the old server, rebuilds and starts the new one:",
      "npm run restart",
    ],
    doneWhen:
      "YOUR_SITE/.well-known/ai-agent.json shows your product name, your description and your real web address, not \"The Floor\" or agent-native-kit.vercel.app.",
    budgetMinutes: 5,
    verify: "curl -s YOUR_URL/.well-known/ai-agent.json | head -20",
    verifyLocal: "curl -s http://localhost:PORT/.well-known/ai-agent.json | head -20 && npm run verify http://localhost:PORT",
    trap:
      "Check ai-agent.json, because it is the one file that shows your name. The others only show the address. " +
      "Restart with npm run restart on your own computer, or redeploy online. Do not stop the server by hand. " +
      "Closing the wrong window or stopping the wrong process leaves the old version running, so the check reads stale results and looks like your edit did nothing. " +
      "npm run restart finds whatever is holding the port, stops it, rebuilds, starts the new version and waits until it answers. " +
      "Do not use pkill -f, which can stop other people's servers on a shared machine. " +
      "If the server log says your host is \"not in agent.config.ts hosts.allowed\", add that host:port to hosts.allowed. " +
      "If your site works both with and without \"www.\", list both in hosts.allowed.",
  },
  {
    id: "your-idea",
    agentShould: [
      "Ask for the person's idea and use their words. Never invent it.",
      "If you add example data, say out loud that it is made up.",
      "The ten minutes for this step start once the person has chosen their idea. Say so up front.",
    ],
    sayToBeginner:
      "This step is where the site becomes yours: you add one action for your own idea that any AI agent can see and use. It matters because an agent decides whether your site is worth using by reading what it can do, so a clear action is what gets you picked. You will see your new action appear in the list of what the site can do, and calling it will return an answer without any login.",
    wordsToExplain: [
      {
        "word": "action",
        "plain": "one thing an AI agent can ask your site to do, like list items or look something up"
      },
      {
        "word": "tool",
        "plain": "another word for an action, used in the code"
      },
      {
        "word": "login",
        "plain": "proving who you are, usually with a password or account"
      },
      {
        "word": "sample data",
        "plain": "made-up example answers, used until you have real ones"
      },
      {
        "word": "permission",
        "plain": "a limit on what an agent is allowed to do, like only reading or also posting"
      },
      {
        "word": "build",
        "plain": "check the code and put it together to make sure there are no mistakes"
      }
    ],
    n: 3,
    title: "Swap the example app for your own idea",
    goal: "A new action for your idea that any agent can see and use, with no login.",
    why:
      "This is the only step about your actual product. Everything else is the foundation. " +
      "\"Your own tool\" means a new action for your idea, for example \"list the tools I can lend\". " +
      "It does not mean an example tool with a new name: renaming keeps what the example does, and the check cannot tell the difference. " +
      "Keep at least one action agents can use without logging in, or they can't tell what your site is for. " +
      "There is no database until Step 5, so for now the action can return a few sample items. Say so in its description.",
    files: ["lib/mcp/tools.ts", "lib/room.ts"],
    edits: [
      "In lib/mcp/tools.ts, add one entry to the TOOLS list. It needs a name, a description, an inputSchema (what the agent sends), scope: null (null means no login needed), rateClass: \"public\", and a handler (the code that runs and returns the answer).",
      "Copy the shape of a nearby entry. Write the description as if explaining it to a new colleague: what it does and when to use it.",
      "Delete the example floor_ tools you do not need, rather than renaming them.",
      "A scope is a permission your actions ask for, for example posts:write. If you delete every action that uses a permission, verify shows a WARN that the permission is unused. To clear it, have your agent remove that permission from agent.config.ts and from any example route that still names it, then run npm run build. Removing it from only one place breaks the build.",
      "If your idea has any action that saves, posts or changes something, keep at least one action that needs a login (give it a scope instead of null). Verify needs one to prove that a request with no login is refused, and without one it shows a WARN. A read-only idea can skip this.",
      "lib/room.ts is the example's data. Replace it with yours, or return sample data for now.",
    ],
    commands: ["npm run build"],
    doneWhen:
      "tools/list shows a tool you wrote for your idea, not one of the example's floor_ tools (renamed or not), and calling it works without a login.",
    budgetMinutes: 10, // EXCEPTION: the person's own idea; the clock pauses while they decide.
    verify: `${LIST_CALL("YOUR_URL")} && ${TOOL_CALL("YOUR_URL")}`,
    verifyLocal: `${LIST_CALL("http://localhost:PORT")} && ${TOOL_CALL("http://localhost:PORT")}`,
    trap:
      "Agents choose actions by reading their descriptions, so a vague description means your action never gets picked. " +
      "After you change those two files, search the whole project, not just app/, for floor_ and remove what's left. There are about a dozen.",
  },
  {
    id: "wire-auth",
    agentShould: [
      "The person creates their own accounts and copies their own keys. Never sign them up for anything.",
    ],
    sayToBeginner:
      "This step connects a real sign-in, so only a real, logged-in person can approve an AI agent on your site. Until now anyone could type any name when approving, which defeats the point of asking a person to say yes. You will make a free account and copy two keys, your assistant does the code, and afterwards approving without signing in is refused.",
    wordsToExplain: [
      {
        "word": "Clerk",
        "plain": "a free sign-in service that handles accounts and logins for you"
      },
      {
        "word": "API key",
        "plain": "a long secret string that proves a program is allowed to use a service"
      },
      {
        "word": "secret key",
        "plain": "a key you treat like a password: never paste it into a chat or share it"
      },
      {
        "word": "environment variable",
        "plain": "a setting stored outside your code, so secrets stay out of it"
      },
      {
        "word": "redeploy",
        "plain": "put the site online again so it picks up new settings"
      },
      {
        "word": "approve page",
        "plain": "the page where a person sees what an agent wants and says yes or no"
      }
    ],
    n: 4,
    title: "Connect a real login, so only you can approve your agent",
    goal: "The person approving an agent is a real, logged-in user, and their name comes from the login, not from what they type.",
    why:
      "Until now, approval has not checked who you are (see the note in Step 1). " +
      "The approve page takes whatever name is typed into it, and records it as unverified. " +
      "The whole point of the approval step is that a known person said yes. " +
      "Clerk (clerk.com) is a free sign-in service that fixes this. " +
      "It splits cleanly: you make the account and copy two keys, and your agent does all the code.",
    files: [
      "app/api/agent/signup/complete/route.ts",
      "app/approve/page.tsx",
      "app/layout.tsx",
      "proxy.ts",
      ".env.local (on your computer) or Environment Variables in your Vercel project (online)",
    ],
    edits: [
      "YOU: create a free account at clerk.com, create an application in it, and copy two keys from its API Keys page: the Publishable key (starts with pk_) and the Secret key (starts with sk_). Treat the secret key like a password: give it to your agent through the .env.local file or the Vercel page, never paste it into a chat or commit it.",
      "YOU, local: your agent creates a file called .env.local in the kit folder. Put the two keys in it as NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=... and CLERK_SECRET_KEY=... (one per line).",
      "YOU, online: open your project on vercel.com, go to Settings, then Environment Variables, and add the same two names with the two keys. Then redeploy, because a running site does not pick up new variables.",
      "YOUR AGENT: runs npm install @clerk/nextjs.",
      "YOUR AGENT, app/layout.tsx: wraps the page in <ClerkProvider> so every page knows who is signed in.",
      "YOUR AGENT, proxy.ts: adds Clerk's clerkMiddleware, keeping what the file already does. Nothing under /.well-known, /api/mcp, /llms.txt or the other public discovery files may start requiring a login.",
      "YOUR AGENT, app/approve/page.tsx: shows Clerk's sign-in button when nobody is signed in, and the approval form when someone is.",
      "YOUR AGENT, app/api/agent/signup/complete/route.ts: at the top of POST, calls auth() from @clerk/nextjs/server. If there is no userId, it returns the 401 problem response (this is what makes the check pass). Then it calls currentUser() and builds humanId from user.id and humanLabel from the user's name or email address. It deletes the TODO that reads human_label from the request body, and stops reading the name from the body at all. The comment at the top of that file has the exact lines.",
    ],
    commands: ["npm install @clerk/nextjs", "npm run build", "npm run restart   # on your own computer; online, redeploy instead"],
    doneWhen:
      "Starting a real signup and then trying to approve its code without being logged in is refused (401 or 403), not approved. " +
      "Approving while signed in records your real name, and the board shows it as verified.",
    budgetMinutes: 10,
    verify:
      "CODE=$(curl -s -X POST YOUR_URL/api/agent/signup/start -H 'content-type: application/json' -d '{\"scopes\":[\"read:public\"],\"agent_name\":\"check\"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)[\"user_code\"])') && " +
      "curl -s -o /dev/null -w '%{http_code}\\n' -X POST YOUR_URL/api/agent/signup/complete -H 'content-type: application/json' -d \"{\\\"user_code\\\":\\\"$CODE\\\"}\"  # 401 or 403 is a pass, 200 means anyone can approve",
    verifyLocal:
      "Run the same command with http://localhost:PORT in place of YOUR_URL, after the keys are in .env.local and npm run restart. Then run npm run verify http://localhost:PORT as well.",
    trap:
      "Read who the person is from their login, never from what the request says. The comment in that file shows how. " +
      "Keys added to Vercel only reach your site after a redeploy, and keys in .env.local only after npm run restart.",
  },
  {
    id: "durable-storage",
    agentShould: [
      "Keys go in .env.local or the host's settings page. Never paste them into chat, a commit, or a public file.",
    ],
    sayToBeginner:
      "This step gives your site a small database so the things people save stay saved. Free hosting starts your site fresh for each visit, so without a database, whatever was saved can quietly vanish and nothing tells you. You will add two settings and put the site online again, and then the health page says ok instead of degraded.",
    wordsToExplain: [
      {
        "word": "database",
        "plain": "a place that keeps information safely so it is still there next time"
      },
      {
        "word": "memory",
        "plain": "temporary storage that is wiped when the site restarts"
      },
      {
        "word": "health page",
        "plain": "an address that reports whether the site's parts are working"
      },
      {
        "word": "degraded",
        "plain": "working, but with something missing, such as no database"
      },
      {
        "word": "environment variable",
        "plain": "a setting stored outside your code, so secrets stay out of it"
      },
      {
        "word": "redeploy",
        "plain": "put the site online again so it picks up new settings"
      }
    ],
    n: 5,
    title: "Add a small database so your site remembers things",
    goal: "Things saved on your site stay saved.",
    why:
      "Free hosting runs your code on a fresh machine for each visit. Save something in memory and the next visit can't see it, " +
      "with no error anywhere. A small database fixes that with two settings.",
    files: [".env.local"],
    edits: [],
    commands: [
      "npx vercel env add KV_REST_API_URL production",
      "npx vercel env add KV_REST_API_TOKEN production",
      "npx vercel deploy --prod",
    ],
    doneWhen: "YOUR_SITE/api/v1/health says \"ok\" instead of \"degraded\".",
    budgetMinutes: 5,
    verify: "curl -s YOUR_URL/api/v1/health",
    verifyLocal:
      "curl -s http://localhost:PORT/api/v1/health   # on your own computer this says degraded until you put KV_REST_API_URL and KV_REST_API_TOKEN in .env.local and restart",
    trap:
      "If you share the database with another project, give yours its own name prefix (kvNamespace in agent.config.ts), or the two projects overwrite each other's data.",
  },
  {
    id: "api-product",
    agentShould: [
      "Describe only actions the site really has. Check each one against tools/list before you write it down.",
    ],
    sayToBeginner:
      "This step makes the way programs talk to your site clear and written down. It counts for the most on the free scanners, and it is how an agent decides your site is worth using. You will see a document listing what your site offers, and failed requests that explain what went wrong and how to fix it.",
    wordsToExplain: [
      {
        "word": "API",
        "plain": "a way for one program to use another directly, without clicking through web pages"
      },
      {
        "word": "API description",
        "plain": "a written list of what a program can ask your site, and what it gets back"
      },
      {
        "word": "error message",
        "plain": "the note a program gets back when something fails"
      },
      {
        "word": "scanner",
        "plain": "a free website that checks your site and scores how easy it is for agents to use"
      },
      {
        "word": "developer page",
        "plain": "a page that explains your site to people who build with it"
      }
    ],
    n: 6,
    title: "Make your API clear and documented",
    goal: "A description of your API, some data anyone can read, and helpful error messages.",
    why:
      "This counts for the most on the scanners, and it's what lets an agent decide your site is worth using. " +
      "A site that demands a login before saying anything looks like it has nothing to offer.",
    files: ["app/openapi.json/route.ts", "lib/errors.ts", "lib/ratelimit.ts", "app/developers/page.tsx"],
    edits: [],
    commands: ["npm run build", "npx vercel deploy --prod"],
    doneWhen:
      "Your API description lists your real features, and a failed request explains what went wrong and how to fix it.",
    budgetMinutes: 10,
    verify: "curl -s YOUR_URL/openapi.json",
    verifyLocal: "curl -s http://localhost:PORT/openapi.json",
    trap:
      "Let the developer page count your features automatically. A page that says 12 when there are 7 is worse than no page.",
  },
  {
    id: "verify-and-scan",
    agentShould: [
      "Report zero failures only when the script's own output says FAIL 0, and show that line.",
      "The scanner allows six scans a day. After two rounds of fix and re-scan with a finding left, stop, show the person the last result and ask.",
    ],
    sayToBeginner:
      "This last step checks your site from the outside, the way an AI agent sees it, and then gets a score from a free scanner. It matters because checking what is really being served is the only way to know it works, not what you think you shipped. You will see a short summary line with the number of checks passed and zero failed, and a score you can improve.",
    wordsToExplain: [
      {
        "word": "verify script",
        "plain": "a small program that tests your site from the outside and reports pass, warn or fail"
      },
      {
        "word": "PASS, WARN, FAIL",
        "plain": "good, works but unfinished, and broken"
      },
      {
        "word": "scanner",
        "plain": "a free website that checks your site and scores how easy it is for agents to use"
      },
      {
        "word": "localhost",
        "plain": "a web address that only works on your own computer"
      },
      {
        "word": "port",
        "plain": "a numbered door on your computer that a running site listens on; the usual one is 3000"
      }
    ],
    n: 7,
    title: "Check it from the outside, then scan it",
    goal: "A test script that checks your live site passes, then a score from a scanner.",
    why:
      "The test script checks what agents actually receive, not what you think you shipped. " +
      "The scanners then tell you what to improve next.",
    files: ["scripts/verify.sh"],
    edits: [],
    commands: [
      "bash scripts/verify.sh YOUR_URL",
      "curl -s -X POST https://isitagentready.com/api/scan -H 'content-type: application/json' -d '{\"url\":\"YOUR_URL\"}'",
    ],
    doneWhen: "The test script reports zero failures.",
    budgetMinutes: 5,
    verify: "bash scripts/verify.sh YOUR_URL",
    verifyLocal: "npm run verify http://localhost:PORT   # the scanner needs a public address, so scan after you deploy",
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

/** Old step ids that still resolve, so a saved link or an agent's memory keeps working. */
export const STEP_ID_ALIASES: Record<string, string> = { "replace-domain": "your-idea" };

export function getStep(idOrN: string | number): BuildStep | undefined {
  if (typeof idOrN === "number") return BUILD_STEPS.find((s) => s.n === idOrN);
  const asNum = Number(idOrN);
  if (!Number.isNaN(asNum)) return BUILD_STEPS.find((s) => s.n === asNum);
  const id = STEP_ID_ALIASES[idOrN] ?? idOrN;
  return BUILD_STEPS.find((s) => s.id === id);
}
