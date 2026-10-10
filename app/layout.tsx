import type { Metadata } from "next";
import agentConfig from "@/agent.config";
import { WebMcpInline } from "@/app/WebMcpInline";
import "./globals.css";

export const metadata: Metadata = {
  // The canonical host, not the request's: a canonical link that changes with
  // the host it was fetched from is not canonical.
  metadataBase: new URL(agentConfig.hosts.canonical),
  title: `${agentConfig.product.name}: ${agentConfig.product.tagline}`,
  description: agentConfig.product.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: agentConfig.product.name,
    title: agentConfig.product.name,
    description: agentConfig.product.tagline,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: agentConfig.product.name,
    description: agentConfig.product.tagline,
  },
  other: {
    // Discovery hints in the served <head>. A crawler that never reads
    // /.well-known still finds the manifest from here.
    "ai-agent-manifest": "/.well-known/ai-agent.json",
    "mcp-server": agentConfig.mcp.path,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* RFC 8288 Link rels. Part of the api-catalog check, and genuinely
            useful: a client finds the spec without a second fetch. */}
        <link rel="service-desc" href="/openapi.json" type="application/json" />
        <link rel="service-doc" href="/auth.md" type="text/markdown" />
        <link rel="service-meta" href="/.well-known/ai-agent.json" type="application/json" />
        <link rel="api-catalog" href="/.well-known/api-catalog" type="application/linkset+json" />
        <link rel="ai-catalog" href="/.well-known/ai-catalog.json" type="application/json" />
        <link rel="describedby" href="/llms.txt" type="text/plain" />
        <link rel="alternate" href="/index.md" type="text/markdown" />
      </head>
      <body>
        {children}
        <WebMcpInline />
      </body>
    </html>
  );
}
