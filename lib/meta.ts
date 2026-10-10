import agentConfig from "@/agent.config";

/**
 * FRONTMATTER for every served markdown file: title, description, canonical
 * and last-updated, so an agent gets the metadata without scraping the body.
 *
 * `canonical` always uses the canonical host, never the host the request came
 * in on, because a canonical address that changes with the request is not one.
 * Values go through JSON.stringify, which is valid YAML for a string and cannot
 * be broken by a colon or a quote in the text.
 */
export function frontmatter(f: { title: string; description: string; path: string; extra?: Record<string, string> }): string {
  const lines = [
    `title: ${JSON.stringify(f.title)}`,
    `description: ${JSON.stringify(f.description)}`,
    `canonical: ${JSON.stringify(agentConfig.hosts.canonical + f.path)}`,
    `last-updated: ${agentConfig.product.updated}`,
    ...Object.entries(f.extra ?? {}).map(([k, v]) => `${k}: ${v}`),
  ];
  return `---\n${lines.join("\n")}\n---\n\n`;
}
