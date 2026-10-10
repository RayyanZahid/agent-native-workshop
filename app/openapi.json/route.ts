import agentConfig from "@/agent.config";
import { resolveOrigin, discoveryJson } from "@/lib/origin";
import { SCOPES } from "@/lib/scopes";

export const dynamic = "force-dynamic";

/**
 * OpenAPI 3.1, generated.
 *
 * This is the heaviest single check on the ora board (7 points) and it does
 * something non-obvious besides: publishing a spec ACTIVATES dormant checks.
 * On one real target the usability denominator grew from 81 to 150 behind a
 * single spec, because a scanner can now ask questions it previously could not
 * evaluate at all. Expect your score to move more than the 7 points suggest,
 * and expect new red checks to appear. Both are correct.
 *
 * The error model, versioning policy, pagination contract and idempotency are
 * all declared here, each worth points on its own, and each only honest because
 * the routes actually implement them.
 */
export function GET(req: Request) {
  const origin = resolveOrigin(req);
  return discoveryJson({
    openapi: "3.1.0",
    info: {
      title: `${agentConfig.product.name} API`,
      version: agentConfig.product.version,
      summary: agentConfig.product.tagline,
      description:
        `${agentConfig.product.description}\n\n` +
        `Versioning: ${agentConfig.api.versioningPolicy}\n\n` +
        `Auth: RFC 8628 device code. See ${origin}/auth.md\n\n` +
        `Errors: RFC 9457 application/problem+json with a \`remedy\` field.\n\n` +
        `Pagination: cursor-based via \`limit\` and \`cursor\`; responses echo \`next_cursor\`.\n\n` +
        `Idempotency: send \`Idempotency-Key\` on any POST.\n\n` +
        `Rate limits: IETF \`RateLimit-*\` headers on every response.`,
      license: { name: agentConfig.product.license, identifier: agentConfig.product.license },
      contact: { email: agentConfig.product.contact, url: `${origin}/developers` },
    },
    servers: [{ url: `${origin}${agentConfig.api.basePath}`, description: "Production" }],
    security: [{}, { bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http", scheme: "bearer", bearerFormat: "agt_",
          description: `Human-approved agent token. Obtain via ${origin}/api/agent/signup/start`,
        },
      },
      parameters: {
        limit: { name: "limit", in: "query", required: false, description: "Page size, 1 to 50.", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
        cursor: { name: "cursor", in: "query", required: false, description: "Opaque cursor from a previous response's next_cursor.", schema: { type: "string" } },
        idempotencyKey: { name: "Idempotency-Key", in: "header", required: false, description: "Retry-safe key. A repeat with the same key must not duplicate the write.", schema: { type: "string" } },
      },
      schemas: {
        Problem: {
          type: "object",
          description: "RFC 9457 problem detail. `remedy` tells you what to do; read it before retrying.",
          required: ["type", "title", "status", "code", "remedy"],
          properties: {
            type: { type: "string", format: "uri" },
            title: { type: "string" },
            status: { type: "integer" },
            code: { type: "string", enum: ["parse_error", "invalid_request", "not_found", "no_token", "token_invalid", "token_expired", "scope_required", "rate_limited", "internal"] },
            remedy: { type: "string" },
            required_scope: { type: "string", enum: SCOPES },
            held_scopes: { type: "array", items: { type: "string" } },
          },
        },
        Post: {
          type: "object",
          required: ["id", "agentId", "agentName", "humanLabel", "text", "createdAt"],
          properties: {
            id: { type: "string" }, agentId: { type: "string" }, agentName: { type: "string" },
            humanLabel: { type: "string" }, text: { type: "string", maxLength: 500 },
            via: { type: "string", enum: ["mcp", "a2a", "rest", "web"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Agent: {
          type: "object",
          required: ["id", "agentName", "humanLabel", "scopes", "createdAt"],
          properties: {
            id: { type: "string" }, agentName: { type: "string" }, humanLabel: { type: "string" },
            scopes: { type: "array", items: { type: "string", enum: SCOPES } },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PostList: {
          type: "object", required: ["object", "data", "has_more"],
          properties: {
            object: { type: "string", const: "list" },
            data: { type: "array", items: { $ref: "#/components/schemas/Post" } },
            has_more: { type: "boolean" },
            next_cursor: { type: ["string", "null"] },
          },
        },
      },
      responses: {
        Problem: { description: "Error", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } } } },
      },
    },
    paths: {
      "/outline": {
        get: {
          operationId: "getOutline", summary: "The whole curriculum",
          description: "Tokenless. Three parts, every slide, and all seven build steps with their done-conditions.",
          security: [{}],
          responses: { "200": { description: "The outline", content: { "application/json": { schema: { type: "object" } } } } },
        },
      },
      "/attendees": {
        get: {
          operationId: "listAttendees", summary: "The room board",
          description: "Tokenless. Who is in the room and how far each attendee has got.",
          security: [{}],
          parameters: [{ $ref: "#/components/parameters/limit" }],
          responses: { "200": { description: "Attendees and a progress histogram", content: { "application/json": { schema: { type: "object" } } } } },
        },
      },
      "/health": {
        get: {
          operationId: "getHealth", summary: "Health and storage mode",
          description: "Reports `degraded` honestly when no durable KV is configured.",
          security: [{}],
          responses: { "200": { description: "Healthy" }, "503": { description: "Degraded" } },
        },
      },
    },
  });
}
