import type { MetadataRoute } from "next";
import agentConfig from "@/agent.config";

/**
 * A sitemap, because robots.txt ADVERTISES one.
 *
 * The scanner caught this: we promised `Sitemap:` and served a 404. Promising a
 * surface you do not serve is worse than omitting it, because a client that
 * trusts the advertisement wastes a request and learns our metadata lies.
 *
 * It lists the agent files too, since an agent that reads the sitemap should
 * find them there. /approve is left out on purpose: it is a page for the person
 * approving an agent, not something to index.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const b = agentConfig.hosts.canonical;
  const now = new Date();
  return [
    { url: `${b}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${b}/SKILL.md`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${b}/index.md`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${b}/developers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${b}/auth.md`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${b}/llms.txt`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${b}/pricing.md`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${b}/openapi.json`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${b}/api/mcp`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${b}/api/v1/outline`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${b}/.well-known/ai-agent.json`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${b}/.well-known/agent-card.json`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${b}/.well-known/mcp.json`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${b}/.well-known/ai-catalog.json`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${b}/.well-known/agent-skills/index.json`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${b}/.well-known/api-catalog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${b}/.well-known/oauth-protected-resource`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${b}/.well-known/oauth-authorization-server`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
