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
 * The server is the site origin and every path is written in full, because the
 * description covers two families of addresses: /api/v1 (reads) and
 * /api/agent (getting a token, reporting a problem). Only declare what the
 * routes really do. An Idempotency-Key was declared here once and no route
 * honoured it, so it was removed rather than left to mislead a retrying agent.
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
        `Rate limits: IETF \`RateLimit-*\` headers on every authenticated response.\n\n` +
        `Something wrong or confusing here? POST ${origin}/api/agent/feedback.`,
      license: { name: agentConfig.product.license, identifier: agentConfig.product.license },
      contact: { name: agentConfig.product.author, url: agentConfig.product.contact },
    },
    servers: [{ url: origin, description: "Production" }],
    security: [{}, { bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http", scheme: "bearer", bearerFormat: "agt_",
          description: `Human-approved agent token. Obtain via ${origin}/api/agent/signup/start`,
        },
      },
      parameters: {
        limit: { name: "limit", in: "query", required: false, description: "How many rows to return, 1 to 100.", schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } },
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
        BuildStep: {
          type: "object", required: ["id", "n", "title", "goal", "doneWhen", "budgetMinutes", "verify"],
          properties: {
            id: { type: "string" }, n: { type: "integer" }, title: { type: "string" },
            goal: { type: "string" }, why: { type: "string" },
            files: { type: "array", items: { type: "string" } },
            edits: { type: "array", items: { type: "string" }, description: "The exact things to change, in plain words." },
            commands: { type: "array", items: { type: "string" } },
            doneWhen: { type: "string" },
            budgetMinutes: { type: "integer", description: "The time this step should take with an agent guiding, in minutes. Past it, the agent stops and checks in." },
            verify: { type: "string" }, verifyLocal: { type: "string" },
            trap: { type: "string" },
            sayToBeginner: { type: "string", description: "Plain sentences to read aloud word for word to a non-developer." },
            wordsToExplain: { type: "array", items: { type: "object", properties: { word: { type: "string" }, plain: { type: "string" } } }, description: "Technical words this step uses, to explain the first time they come up." },
          },
        },
        Outline: {
          type: "object", required: ["object", "parts", "build_steps", "counts"],
          properties: {
            object: { type: "string", const: "outline" },
            parts: { type: "array", items: { type: "object" } },
            build_steps: { type: "array", items: { $ref: "#/components/schemas/BuildStep" } },
            counts: { type: "object", properties: { slides: { type: "integer" }, steps: { type: "integer" } } },
          },
        },
        AttendeeList: {
          type: "object", required: ["object", "data", "has_more"],
          properties: {
            object: { type: "string", const: "list" },
            progress: { type: "object" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  human: { type: "string" }, agent: { type: "string" }, step: { type: "integer" },
                  completed: { type: "array", items: { type: "string" } },
                  target: { type: ["string", "null"] }, note: { type: ["string", "null"] },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
            has_more: { type: "boolean" },
            next_cursor: { type: ["string", "null"] },
          },
        },
        Health: {
          type: "object", required: ["status", "storage"],
          properties: {
            status: { type: "string", enum: ["ok", "degraded"] },
            version: { type: "string" },
            storage: { type: "string", enum: ["kv", "in-process-memory"] },
            tools: { type: "object", properties: { total: { type: "integer" }, token_free: { type: "integer" } } },
            feedback_reports: { type: "integer", description: "How many problem reports agents have filed. A count only; the text is never public." },
            time: { type: "string", format: "date-time" },
          },
        },
        SignupStartRequest: {
          type: "object", required: ["scopes"],
          properties: {
            scopes: { type: "array", minItems: 1, items: { type: "string", enum: SCOPES } },
            agent_name: { type: "string", description: "Shown to the person approving." },
          },
        },
        SignupStartResponse: {
          type: "object",
          properties: {
            device_code: { type: "string" }, user_code: { type: "string" },
            verification_uri: { type: "string", format: "uri" }, verification_uri_complete: { type: "string", format: "uri" },
            expires_in: { type: "integer" }, interval: { type: "integer" }, next: { type: "string" },
          },
        },
        SignupPollResponse: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["pending", "completed"] },
            access_token: { type: "string", description: "Returned once, on the first poll after approval." },
            scopes: { type: "array", items: { type: "string", enum: SCOPES } },
          },
        },
        SignupCompleteRequest: {
          type: "object", required: ["user_code"],
          properties: { user_code: { type: "string", examples: ["ABCD-2345"] }, human_label: { type: "string" } },
        },
        FeedbackRequest: {
          type: "object", required: ["problem"],
          properties: {
            problem: { type: "string", maxLength: 1000, description: "What went wrong." },
            url: { type: "string", maxLength: 500, description: "The address you tried." },
            agent: { type: "string", maxLength: 120, description: "Your name." },
            expected: { type: "string", maxLength: 500, description: "What you expected to happen." },
          },
        },
      },
      responses: {
        Problem: { description: "Error", content: { "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } } } },
      },
    },
    paths: {
      "/api/v1": {
        get: {
          operationId: "getApiIndex", summary: "Index of the REST API",
          description: "Tokenless. Lists the REST addresses and where the full description is.",
          security: [{}],
          responses: { "200": { description: "The index", content: { "application/json": { schema: { type: "object" } } } } },
        },
      },
      "/api/v1/outline": {
        get: {
          operationId: "getOutline", summary: "The whole curriculum",
          description: "Tokenless. Three parts, every slide, and all seven build steps with their done-conditions.",
          security: [{}],
          responses: { "200": { description: "The outline", content: { "application/json": { schema: { $ref: "#/components/schemas/Outline" } } } } },
        },
      },
      "/api/v1/attendees": {
        get: {
          operationId: "listAttendees", summary: "The room board",
          description: "Tokenless. Who is in the room and how far each attendee has got.",
          security: [{}],
          parameters: [{ $ref: "#/components/parameters/limit" }],
          responses: { "200": { description: "Attendees and a progress histogram", content: { "application/json": { schema: { $ref: "#/components/schemas/AttendeeList" } } } } },
        },
      },
      "/api/v1/health": {
        get: {
          operationId: "getHealth", summary: "Health and storage mode",
          description: "Reports `degraded` honestly when no durable KV is configured. Also carries a count of problem reports agents have filed.",
          security: [{}],
          responses: {
            "200": { description: "Healthy", content: { "application/json": { schema: { $ref: "#/components/schemas/Health" } } } },
            "503": { description: "Degraded", content: { "application/json": { schema: { $ref: "#/components/schemas/Health" } } } },
          },
        },
      },
      "/api/agent/signup/start": {
        post: {
          operationId: "startSignup", summary: "Start getting a token (call 1 of 3)",
          description: "Tokenless. Send the permissions you want. You get a code for your human to approve, never a token.",
          security: [{}],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SignupStartRequest" } } } },
          responses: {
            "200": { description: "Show your human verification_uri_complete", content: { "application/json": { schema: { $ref: "#/components/schemas/SignupStartResponse" } } } },
            "400": { $ref: "#/components/responses/Problem" },
          },
        },
      },
      "/api/agent/signup/complete": {
        post: {
          operationId: "completeSignup", summary: "Approve an agent (done by a person, call 2 of 3)",
          description: "Called by the /approve page when a person approves. An agent cannot approve its own request and should not call this.",
          security: [{}],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SignupCompleteRequest" } } } },
          responses: {
            "200": { description: "Approved" },
            "404": { $ref: "#/components/responses/Problem" },
          },
        },
      },
      "/api/agent/signup/poll": {
        get: {
          operationId: "pollSignup", summary: "Collect the token (call 3 of 3)",
          description: "Tokenless. Poll every 3 seconds. 202 means your human has not approved yet. The token comes back once.",
          security: [{}],
          parameters: [{ name: "device_code", in: "query", required: true, description: "The device_code from the start call.", schema: { type: "string" } }],
          responses: {
            "200": { description: "Approved. Store access_token now.", content: { "application/json": { schema: { $ref: "#/components/schemas/SignupPollResponse" } } } },
            "202": { description: "Not approved yet", content: { "application/json": { schema: { $ref: "#/components/schemas/SignupPollResponse" } } } },
            "401": { $ref: "#/components/responses/Problem" },
          },
        },
      },
      "/api/agent/feedback": {
        post: {
          operationId: "reportProblem", summary: "Report anything wrong or confusing",
          description: "Tokenless. If a surface of this workshop is wrong, missing or confusing, say so here. Reports are kept; the text is never public.",
          security: [{}],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/FeedbackRequest" } } } },
          responses: {
            "200": { description: "Logged" },
            "400": { $ref: "#/components/responses/Problem" },
          },
        },
      },
    },
  });
}
