import { ImageResponse } from "next/og";
import agentConfig from "@/agent.config";

/**
 * The picture shown when this workshop is shared. Next serves it at
 * /opengraph-image and adds the og:image tag to every page on its own.
 * It is drawn from agent.config.ts, so renaming the product renames the image.
 */
export const alt = agentConfig.product.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: 80, background: "#0b0d10", color: "#f2f5f8",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#7aa2ff" }}>
          Workshop
        </div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
          {agentConfig.product.name}
        </div>
        <div style={{ fontSize: 36, marginTop: 32, color: "#aab4c0", lineHeight: 1.3 }}>
          {agentConfig.product.tagline}
        </div>
        <div style={{ fontSize: 28, marginTop: 56, color: "#aab4c0" }}>
          {agentConfig.hosts.canonical.replace("https://", "")}
        </div>
      </div>
    ),
    size,
  );
}
