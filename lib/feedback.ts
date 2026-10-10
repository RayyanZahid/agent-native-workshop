import { kvPush, kvGet, kvIncr } from "@/lib/store";

/**
 * PROBLEM REPORTS from agents, one store for every way in: POST
 * /api/agent/feedback and the workshop_report_problem MCP tool both land here,
 * so a report is kept the same way whichever door it came through.
 *
 * The text is for the facilitator and is NEVER served publicly. Only a count is
 * public (see /api/v1/health), because "agents are reporting problems" is a
 * useful fact and what they wrote may contain a person's URL or name.
 */
const COUNT_KEY = "agent:feedback:count";
const TEN_YEARS = 315_360_000;

export type FeedbackInput = { problem?: unknown; url?: unknown; agent?: unknown; expected?: unknown };

export const FEEDBACK_REMEDY =
  'POST {"problem":"what went wrong","url":"the address you tried","agent":"your name","expected":"what you expected"}';

export async function recordFeedback(
  input: FeedbackInput,
  via: "rest" | "mcp",
): Promise<{ ok: true } | { ok: false }> {
  if (typeof input.problem !== "string" || !input.problem.trim()) return { ok: false };
  await kvPush("agent:feedback", {
    problem: input.problem.trim().slice(0, 1000),
    url: typeof input.url === "string" ? input.url.slice(0, 500) : null,
    agent: typeof input.agent === "string" ? input.agent.slice(0, 120) : null,
    expected: typeof input.expected === "string" ? input.expected.slice(0, 500) : null,
    via,
    at: new Date().toISOString(),
  }, 100);
  // The list is capped at 100 so a free KV tier cannot fill up. A separate
  // counter keeps the public number honest past that cap.
  await kvIncr(COUNT_KEY, TEN_YEARS);
  return { ok: true };
}

export async function feedbackCount(): Promise<number | null> {
  try {
    return (await kvGet<number>(COUNT_KEY)) ?? 0;
  } catch {
    return null;
  }
}
