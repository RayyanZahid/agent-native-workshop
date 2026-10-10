/**
 * LIVE READINESS CHECK against a URL an attendee supplies.
 *
 * This is what turns the deck from a document into a service: an attendee's
 * agent builds something, then asks this deck whether it actually worked, and
 * gets back specific findings naming the artifact that is missing. The loop
 * closes without a human reading a checklist aloud.
 *
 * ============================ SSRF ============================
 * We fetch a URL a stranger gave us, from our own server. That is a
 * server-side request forgery primitive unless it is fenced, and "it is just a
 * workshop" is exactly the reasoning that ships one.
 *
 * The fence, in order:
 *   - https only. http is refused outright, so no plaintext and no file:, no
 *     gopher:, no data:.
 *   - hostname must not be localhost, a bare host, or an IP literal. Blocking
 *     IP literals removes the whole private-range problem without needing to
 *     enumerate RFC 1918 and friends, and no legitimate deployment target is
 *     an IP.
 *   - hostname must contain a dot and a plausible TLD, so cloud metadata
 *     endpoints reachable by short name cannot be addressed.
 *   - redirects are NOT followed. A permitted public host that 302s to
 *     169.254.169.254 is the classic bypass.
 *   - hard timeout, hard response-size cap, and we read at most a few paths.
 *
 * What we still cannot stop from inside a serverless function is a DNS name
 * that resolves to a private address. If you lift this into something that
 * matters, resolve first and check the resolved address, or put an egress
 * proxy in front of it.
 * ==============================================================
 */

const MAX_BYTES = 256 * 1024;
const TIMEOUT_MS = 6000;

export type Finding = {
  check: string;
  ok: boolean;
  detail: string;
  fix?: string;
};

export function validateTarget(raw: string): { ok: true; url: URL } | { ok: false; error: string } {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, error: "Not a valid absolute URL. Include https://" };
  }
  if (url.protocol !== "https:") {
    return { ok: false, error: "I can only check a site that is on the internet with https. If you're running it on your own computer, run `npm run verify http://localhost:PORT` in the kit folder instead; that runs the same checks." };
  }
  const h = url.hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) {
    return { ok: false, error: "I can't reach a site on your own computer. Run `npm run verify http://localhost:PORT` in the kit folder instead; that runs the same checks. Once it is deployed, give me the https address." };
  }
  // Reject IP literals outright rather than enumerating private ranges.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(":") || h.startsWith("[")) {
    return { ok: false, error: "Point this at a hostname, not an IP address." };
  }
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(h)) {
    return { ok: false, error: "That does not look like a public hostname." };
  }
  return { ok: true, url };
}

type Fetched = { status: number; contentType: string; body: string; headers: Headers } | { error: string };

async function get(base: URL, path: string): Promise<Fetched> {
  const target = new URL(path, base);
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(target, {
      signal: ctl.signal,
      // Do NOT follow redirects: a permitted public host that redirects to a
      // metadata address is the standard SSRF bypass.
      redirect: "manual",
      headers: { "user-agent": "agent-native-workshop/1.0 (readiness check)" },
      cache: "no-store",
    });
    const buf = await r.arrayBuffer();
    const sliced = buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf;
    return {
      status: r.status,
      contentType: (r.headers.get("content-type") || "").toLowerCase(),
      body: new TextDecoder().decode(sliced),
      headers: r.headers,
    };
  } catch (e) {
    return { error: e instanceof Error && e.name === "AbortError" ? "timed out" : String(e) };
  } finally {
    clearTimeout(t);
  }
}

function isJson(f: Fetched): f is Extract<Fetched, { status: number }> {
  return "status" in f && f.status === 200 && f.contentType.includes("json");
}

export async function checkTarget(raw: string): Promise<{
  target: string;
  passed: number;
  failed: number;
  score: string;
  findings: Finding[];
  nextAction: string;
}> {
  const v = validateTarget(raw);
  if (!v.ok) {
    return {
      target: raw,
      passed: 0,
      failed: 1,
      score: "0/1",
      findings: [{ check: "target", ok: false, detail: v.error }],
      nextAction: v.error,
    };
  }
  const base = v.url;
  const F: Finding[] = [];

  const [manifest, prm, prmMcp, mcpDisc, agentCard, llms, authMd, openapi, home, health] =
    await Promise.all([
      get(base, "/.well-known/ai-agent.json"),
      get(base, "/.well-known/oauth-protected-resource"),
      get(base, "/.well-known/oauth-protected-resource/api/mcp"),
      get(base, "/.well-known/mcp.json"),
      get(base, "/.well-known/agent-card.json"),
      get(base, "/llms.txt"),
      get(base, "/auth.md"),
      get(base, "/openapi.json"),
      get(base, "/"),
      get(base, "/api/v1/health"),
    ]);

  // --- Layer 1
  F.push(
    isJson(manifest)
      ? { check: "manifest", ok: true, detail: "ai-agent.json serves valid JSON" }
      : {
          check: "manifest",
          ok: false,
          detail: "/.well-known/ai-agent.json is missing or not JSON",
          fix: "This is the document every other URL hangs off. Build step 2.",
        },
  );

  let scopeCount = 0;
  if (isJson(prm)) {
    try {
      scopeCount = (JSON.parse(prm.body).scopes_supported || []).length;
    } catch { /* handled below */ }
  }
  F.push(
    scopeCount > 0
      ? { check: "oauth-prm", ok: true, detail: `protected-resource metadata declares ${scopeCount} scopes` }
      : {
          check: "oauth-prm",
          ok: false,
          detail: "PRM missing or scopes_supported is empty",
          fix: "Source scopes_supported from your scope vocabulary, never hand-list it. Build step 2.",
        },
  );

  F.push(
    isJson(prmMcp)
      ? { check: "oauth-prm-path-inserted", ok: true, detail: "RFC 9728 path-inserted PRM exists" }
      : {
          check: "oauth-prm-path-inserted",
          ok: false,
          detail: "/.well-known/oauth-protected-resource/api/mcp is missing",
          fix: "A strict MCP client that gets a 401 derives THIS path and does not fall back. Ship it alongside the root PRM.",
        },
  );

  // --- Layer 2
  const llmsOk = "status" in llms && llms.status === 200 && llms.contentType.includes("text/plain");
  F.push(
    llmsOk
      ? {
          check: "llms-txt",
          ok: true,
          detail: `llms.txt served as text/plain, ${("body" in llms ? llms.body.length : 0)} chars`,
        }
      : { check: "llms-txt", ok: false, detail: "llms.txt missing or wrong content-type", fix: "Serve as text/plain and include when-to-use guidance, not just links." },
  );

  const authOk = "status" in authMd && authMd.status === 200 && authMd.contentType.includes("markdown");
  const authHeading = authOk && "body" in authMd && /^#.*auth\.md/im.test(authMd.body);
  F.push(
    authOk && authHeading
      ? { check: "auth-md", ok: true, detail: "auth.md served as markdown with the expected H1" }
      : {
          check: "auth-md",
          ok: false,
          detail: !authOk ? "auth.md missing or not text/markdown" : "auth.md H1 does not contain \"Auth.md\"",
          fix: "The grader looks for that literal string in the H1. Build to the PASS string, not the check's name.",
        },
  );

  // --- Layer 4, the two that matter most
  const homeHtml = "status" in home ? home.body : "";
  const regCount = (homeHtml.match(/registerTool/g) || []).length;
  F.push(
    regCount > 0
      ? { check: "webmcp-served-bytes", ok: true, detail: `registerTool appears ${regCount} times in the served HTML` }
      : {
          check: "webmcp-served-bytes",
          ok: false,
          detail: "No registerTool in the served HTML",
          fix: "If you registered WebMCP in a useEffect, it is invisible: the effect lives in a JS chunk and runs at hydration. Move it to a server-rendered inline script.",
        },
  );

  let toolCount = 0;
  let anonWorked = false;
  const mcpPath = "/api/mcp";
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    const r = await fetch(new URL(mcpPath, base), {
      method: "POST",
      signal: ctl.signal,
      redirect: "manual",
      headers: { "content-type": "application/json", "user-agent": "agent-native-workshop/1.0" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    clearTimeout(t);
    if (r.ok) {
      const j = JSON.parse((await r.text()).slice(0, MAX_BYTES));
      toolCount = (j?.result?.tools || []).length;
      anonWorked = toolCount > 0;
    }
  } catch { /* reported below */ }

  F.push(
    anonWorked
      ? { check: "mcp-anonymous-tools-list", ok: true, detail: `tools/list returns ${toolCount} tools with no token` }
      : {
          check: "mcp-anonymous-tools-list",
          ok: false,
          detail: "tools/list returned nothing without a token",
          fix: "Anything evaluating you calls tools/list anonymously. All-gated means judged as having no tools. Give at least one tool scope: null.",
        },
  );

  // --- Layer 5 / 6
  F.push(
    isJson(agentCard)
      ? { check: "a2a-card", ok: true, detail: "A2A agent card serves valid JSON" }
      : { check: "a2a-card", ok: false, detail: "No A2A agent card (optional)", fix: "Optional. Add it when there is a second agent worth talking to." },
  );

  let pathCount = 0;
  if (isJson(openapi)) {
    try { pathCount = Object.keys(JSON.parse(openapi.body).paths || {}).length; } catch {}
  }
  F.push(
    pathCount > 0
      ? { check: "openapi", ok: true, detail: `OpenAPI spec describes ${pathCount} paths` }
      : {
          check: "openapi",
          ok: false,
          detail: "No OpenAPI spec with paths",
          fix: "The heaviest single check on the board, and publishing it activates dormant ones. Build step 6.",
        },
  );

  let storage = "unknown";
  if (isJson(health)) {
    try { storage = JSON.parse(health.body).storage || "unknown"; } catch {}
  }
  F.push(
    storage === "kv"
      ? { check: "durable-storage", ok: true, detail: "health reports durable kv storage" }
      : {
          check: "durable-storage",
          ok: false,
          detail: `health reports storage: ${storage}`,
          fix: "In-process memory loses writes between serverless invocations with nothing erroring. Build step 5.",
        },
  );

  F.push(
    isJson(mcpDisc)
      ? { check: "mcp-discovery", ok: true, detail: "/.well-known/mcp.json serves valid JSON" }
      : { check: "mcp-discovery", ok: false, detail: "/.well-known/mcp.json missing", fix: "Include serverInfo.name as well as a top-level name." },
  );

  const passed = F.filter((f) => f.ok).length;
  const failed = F.length - passed;
  const firstFail = F.find((f) => !f.ok);

  return {
    target: base.origin,
    passed,
    failed,
    score: `${passed}/${F.length}`,
    findings: F,
    nextAction: firstFail
      ? `Fix "${firstFail.check}" first: ${firstFail.fix || firstFail.detail}`
      : "Everything checked here passes. Run the graders next, and read slide 13 before you read their red lists.",
  };
}
