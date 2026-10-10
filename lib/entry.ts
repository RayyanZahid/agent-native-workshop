/**
 * THE FIRST STEP FOR AN AGENT, said identically on every surface it can land on.
 *
 * In the second test run a Haiku agent started at /index.md, found it complete,
 * and never opened SKILL.md, which is the file that tells it how to behave. The
 * page's own "start here" block sat in the middle of the document. So the same
 * line now opens the homepage, llms.txt, index.md, the manifest and the MCP
 * initialize reply. One constant, so no surface can word it differently.
 */
export const ENTRY_LINE = "Agents: read /SKILL.md first, then call workshop_overview.";

/** The same line with the path made a link, for markdown surfaces. */
export function entryMarkdown(origin: string): string {
  return ENTRY_LINE.replace("/SKILL.md", `[/SKILL.md](${origin}/SKILL.md)`);
}

/**
 * The same first step, written to survive a summary. In run 6 (cold control) a stock Claude Code read the
 * homepage through its page-reading tool, which hands the agent a summary shaped by the agent's own question.
 * Both summaries dropped ENTRY_LINE; the cold Haiku lost the build steps too and wrote its own app instead of
 * using the kit. Both summaries kept the page title and description, so this line goes there.
 */
export const SUMMARY_LINE =
  "AI agents guiding a person: read /SKILL.md first, it has the steps and the rules. " +
  "The build starts from the starter kit at github.com/RayyanZahid/agent-native-kit, so do not write your own app.";
