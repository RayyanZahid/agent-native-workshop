import agentConfig from "@/agent.config";
import { PARTS, SLIDES, BUILD_STEPS, slidesForPart } from "@/lib/curriculum";
import { TOOLS, TOKEN_FREE_TOOLS } from "@/lib/mcp/tools";
import * as ws from "@/lib/workshop";
import { kvConfigured } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * THE DECK. Server-rendered, so every slide is in the served bytes and an agent
 * that fetches this page gets the same content a human reads. That is not a
 * nice-to-have here: the entire premise is that you can hand this URL to an
 * agent, so a client-rendered deck would be a deck that fails its own demo.
 */
export default async function Deck() {
  const [attendees, progress] = await Promise.all([
    ws.listAttendees(30),
    ws.roomProgress(),
  ]);
  const site = agentConfig.hosts.canonical;
  const bare = site.replace("https://", "");

  return (
    <main>
      <header>
        <p className="kicker">Workshop · {SLIDES.length} slides · {BUILD_STEPS.length} build steps</p>
        <h1>{agentConfig.product.name}</h1>
        <p className="sub">{agentConfig.product.tagline}</p>
      </header>

      <section className="panel callout">
        <h2 className="flush">Do this before slide one</h2>
        <p>
          Paste this into Claude, ChatGPT, Cursor or any agent you have open:
        </p>
        <pre>{`Use ${bare} and walk me through this workshop.
Start with workshop_overview, then ask me which part I want.`}</pre>
        <p className="dim">
          It will find the manifest, read the curriculum, and be able to hand you every build step
          with its commands and its done-condition. Nothing is scraped. This deck exposes itself
          exactly the way it is about to teach you to expose your product.
        </p>
        <p className="dim">
          No agent handy? Everything below works as a normal web page, and{" "}
          <a href="/index.md"><code>/index.md</code></a> is the same content as markdown.
        </p>
      </section>

      {!kvConfigured && (
        <div className="panel warnbox">
          <span className="tag warn">storage: in-process memory</span>
          <p className="dim flush">
            No durable KV configured, so the room board will not persist. Set{" "}
            <code>KV_REST_API_URL</code> and <code>KV_REST_API_TOKEN</code>.
          </p>
        </div>
      )}

      <nav className="panel toc">
        {PARTS.map((p) => (
          <a key={p.n} href={`#part-${p.n}`}>
            <b>Part {p.n}</b>
            <span>{p.name}</span>
          </a>
        ))}
        <a href="#build"><b>Build</b><span>Seven steps</span></a>
        <a href="#room"><b>Room</b><span>{progress.total} here</span></a>
      </nav>

      {PARTS.map((part) => (
        <section key={part.n} id={`part-${part.n}`}>
          <h2 className="parthead">
            <span className="partnum">{part.n}</span> {part.name}
          </h2>
          <p className="sub">{part.summary}</p>

          {slidesForPart(part.n).map((s) => (
            <article className="slide" key={s.n}>
              <div className="slidenum">{String(s.n).padStart(2, "0")}</div>
              <h3>{s.title}</h3>
              <p className="claim">{s.claim}</p>
              <ul>
                {s.body.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
              {s.evidence && <p className="evidence">{s.evidence}</p>}
            </article>
          ))}
        </section>
      ))}

      <section id="build">
        <h2 className="parthead"><span className="partnum">▸</span> The build, step by step</h2>
        <p className="sub">
          Each step has a done-condition that is checked on the wire, not in your config. Ask your
          agent for <code>workshop_build_step</code> and it will hand you these one at a time, then
          verify each with <code>workshop_check_target</code>.
        </p>
        {BUILD_STEPS.map((s) => (
          <article className="slide step" key={s.id}>
            <div className="slidenum">{s.n}</div>
            <h3>{s.title}</h3>
            <p className="claim">{s.goal}</p>
            <p className="dim">{s.why}</p>
            {s.commands.length > 0 && <pre>{s.commands.join("\n")}</pre>}
            <dl>
              <dt>Done when</dt><dd>{s.doneWhen}</dd>
              <dt>Verify</dt><dd><code>{s.verify}</code></dd>
              <dt>Trap</dt><dd>{s.trap}</dd>
            </dl>
          </article>
        ))}
      </section>

      <section id="room">
        <h2 className="parthead"><span className="partnum">●</span> The room</h2>
        <p className="sub">
          Attendees whose agents have registered. This updates live: your agent calls{" "}
          <code>workshop_register</code>, then <code>workshop_complete_step</code> as you go.
        </p>

        <div className="panel row">
          <div className="stat"><b>{progress.total}</b><span>attendees</span></div>
          <div className="stat"><b>{progress.withTarget}</b><span>with a live URL</span></div>
          <div className="stat"><b>{TOOLS.length}</b><span>MCP tools</span></div>
          <div className="stat"><b>{TOKEN_FREE_TOOLS.length}</b><span>need no token</span></div>
        </div>

        <div className="panel">
          {attendees.length === 0 ? (
            <p className="dim flush">
              Nobody registered yet. First agent to call <code>workshop_register</code> appears here.
            </p>
          ) : (
            attendees.map((a) => (
              <div className="post" key={a.id}>
                <div className="who">
                  step {a.step}/{BUILD_STEPS.length} · {a.completedSteps.length} complete
                  {a.targetUrl ? <> · <a href={a.targetUrl}>{a.targetUrl.replace("https://", "")}</a></> : null}
                </div>
                <div className="txt">
                  <strong>{a.humanLabel}</strong> <span className="dim">via {a.agentName}</span>
                  {a.note ? <><br /><span className="dim">{a.note}</span></> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="parthead"><span className="partnum">◆</span> This deck's own agent surface</h2>
        <p className="sub">
          Everything the workshop teaches, live on this domain. Open any of them.
        </p>
        <ul className="links">
          {[
            ["The skill your agent loads", "/SKILL.md"],
            ["Manifest", "/.well-known/ai-agent.json"],
            ["MCP endpoint", "/api/mcp"],
            ["A2A card", "/.well-known/agent-card.json"],
            ["OAuth AS metadata", "/.well-known/oauth-authorization-server"],
            ["OAuth PRM", "/.well-known/oauth-protected-resource"],
            ["AI catalog", "/.well-known/ai-catalog.json"],
            ["Skills index", "/.well-known/agent-skills/index.json"],
            ["API catalog", "/.well-known/api-catalog"],
            ["llms.txt", "/llms.txt"],
            ["Auth guide", "/auth.md"],
            ["OpenAPI 3.1", "/openapi.json"],
            ["Outline (REST)", "/api/v1/outline"],
            ["Attendees (REST)", "/api/v1/attendees"],
            ["Health", "/api/v1/health"],
            ["This page as markdown", "/index.md"],
          ].map(([label, href]) => (
            <li key={href}>
              <a href={href}><code>{href}</code></a> <span className="dim">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer>
        <p className="dim">
          Built on <a href="https://agent-native-kit.vercel.app">agent-native-kit</a>. Every surface
          above is generated from one file, <code>agent.config.ts</code>, so they cannot drift apart.
          MIT licensed. Clone it and the agent surface is already correct.
        </p>
      </footer>
    </main>
  );
}
