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
