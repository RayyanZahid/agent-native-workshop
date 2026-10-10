import agentConfig from "@/agent.config";

/**
 * WebMCP registration as a SERVER-RENDERED INLINE SCRIPT.
 *
 * ================== THE LESSON THIS FILE ENCODES ==================
 * The identical registration written in a React `useEffect` ships, deploys,
 * rescans and moves NOTHING. The effect lives in a hashed JS chunk and does not
 * run until hydration, so anything reading the SERVED HTML — a scanner, a
 * crawler, an agent that fetches the page rather than driving a browser — sees
 * no tool surface at all. On a real target this check sat at 1/5 until the same
 * code moved into a server-rendered inline script, which took it to 5/5.
 *
 * ANYTHING A SCANNER READS FROM YOUR HTML MUST BE IN THE SERVED BYTES. That
 * sentence is the single highest-leverage thing in this whole repo.
 *
 * VERIFY IT, do not assume:
 *   curl -s https://your-domain/ | grep -c registerTool    # must be > 0
 * ==================================================================
 *
 * Also keep: the retry loop (an agent runtime often injects
 * document.modelContext AFTER parse, so a one-shot check finds nothing), the
 * two-host document/navigator fallback, and plain ES5 syntax, because an
 * agent's embedded browser is not guaranteed to parse optional chaining.
 */
const SITE = agentConfig.hosts.canonical;

const SCRIPT = `
(function () {
  if (window.__workshopWebMcpRegistered) return;
  var SITE = ${JSON.stringify(SITE)};
  function ok(v) { return { content: [{ type: "text", text: JSON.stringify(v, null, 2) }] }; }
  var EMPTY = { type: "object", properties: {}, additionalProperties: false };
  var tools = [
    {
      name: "workshop_overview",
      description: "What this workshop is, its three parts, and how to walk a human through it. Read this first.",
      inputSchema: EMPTY,
      annotations: { readOnlyHint: true },
      execute: function () {
        return ok({
          name: "Agent-Native Workshop",
          summary: "A workshop on building agent-native products, which is itself one.",
          parts: ["What", "What is happening", "Build your own"],
          skill: SITE + "/SKILL.md",
          mcp: SITE + "/api/mcp",
          manifest: SITE + "/.well-known/ai-agent.json",
          outline: SITE + "/api/v1/outline",
          the_kit: "https://agent-native-kit.vercel.app",
          how_to_use: "Load " + SITE + "/SKILL.md, then call workshop_build_step one step at a time and verify each with workshop_check_target."
        });
      }
    },
    {
      name: "workshop_outline",
      description: "The full outline: three parts, every slide title, and the seven build steps.",
      inputSchema: EMPTY,
      annotations: { readOnlyHint: true },
      execute: function () {
        return fetch(SITE + "/api/v1/outline", { headers: { accept: "application/json" } })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) { return ok(j || { error: "outline unavailable", url: SITE + "/api/v1/outline" }); })
          .catch(function (e) { return ok({ ok: false, error: String(e) }); });
      }
    },
    {
      name: "workshop_board",
      description: "Who is in the room and how far each attendee has got through the build.",
      inputSchema: EMPTY,
      annotations: { readOnlyHint: true },
      execute: function () {
        return fetch(SITE + "/api/v1/attendees", { headers: { accept: "application/json" } })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (j) { return ok(j || { error: "board unavailable" }); })
          .catch(function (e) { return ok({ ok: false, error: String(e) }); });
      }
    }
  ];

  function attempt() {
    if (window.__workshopWebMcpRegistered) return true;
    var hosts = [
      typeof document !== "undefined" ? document.modelContext : null,
      typeof navigator !== "undefined" ? navigator.modelContext : null
    ];
    for (var i = 0; i < hosts.length; i++) {
      var h = hosts[i];
      if (!h) continue;
      try {
        if (typeof h.registerTool === "function") {
          for (var j = 0; j < tools.length; j++) h.registerTool(tools[j]);
          window.__workshopWebMcpRegistered = true;
          return true;
        }
        if (typeof h.provideContext === "function") {
          var p = h.provideContext({ tools: tools });
          if (p && typeof p.catch === "function") p.catch(function () {});
          window.__workshopWebMcpRegistered = true;
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  if (attempt()) return;
  var tries = 0;
  var t = setInterval(function () { if (attempt() || ++tries > 40) clearInterval(t); }, 250);
})();
`.trim();

export function WebMcpInline() {
  return (
    <script
      id="workshop-webmcp-inline"
      type="text/javascript"
      // Static string built at module scope from constants. No request data
      // reaches it, so there is nothing here for a caller to inject into.
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}
