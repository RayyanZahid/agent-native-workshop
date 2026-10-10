import { kvPush, kvList, kvGet, kvSet } from "@/lib/store";
import { BUILD_STEPS, getStep } from "@/lib/curriculum";

/**
 * THE WORKSHOP DOMAIN: who is in the room and how far each of them has got.
 *
 * This is the multiplayer layer, and during the session it is load-bearing
 * rather than decorative: attendees' agents report progress here, and the
 * board on the projector reads from it. Nobody has to raise a hand to say
 * which step they are stuck on.
 */
export type Attendee = {
  id: string;
  agentName: string;
  humanLabel: string;
  targetUrl: string | null;
  step: number;
  completedSteps: string[];
  /** How each completed step was proved. Absent on records written before proof was required. */
  verified?: Record<string, HowVerified>;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HowVerified = "online" | "local";

/** The words the board shows for each way of proving a step. */
export const HOW_LABEL: Record<HowVerified, string> = {
  online: "checked online",
  local: "checked locally (self-reported)",
};

const ATTENDEES = "attendees";

export async function upsertAttendee(
  a: Pick<Attendee, "id" | "agentName" | "humanLabel">,
  patch: Partial<Pick<Attendee, "targetUrl" | "step" | "note">> = {},
): Promise<Attendee> {
  const existing = await kvGet<Attendee>(`attendee:${a.id}`);
  const now = new Date().toISOString();

  const next: Attendee = {
    id: a.id,
    agentName: a.agentName,
    humanLabel: a.humanLabel,
    targetUrl: patch.targetUrl ?? existing?.targetUrl ?? null,
    step: patch.step ?? existing?.step ?? 0,
    completedSteps: existing?.completedSteps ?? [],
    verified: existing?.verified,
    note: patch.note ?? existing?.note ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await kvSet(`attendee:${a.id}`, next);
  if (!existing) await kvPush(ATTENDEES, a.id, 300);
  return next;
}

export async function completeStep(
  id: string,
  stepId: string,
  how: HowVerified,
): Promise<Attendee | null> {
  const a = await kvGet<Attendee>(`attendee:${id}`);
  if (!a) return null;
  const step = BUILD_STEPS.find((s) => s.id === stepId);
  if (!step) return null;

  const completed = a.completedSteps.includes(stepId)
    ? a.completedSteps
    : [...a.completedSteps, stepId];

  // `step` is the furthest step reached, derived from what is complete rather
  // than stored independently. Two numbers that mean the same thing drift.
  const furthest = Math.max(
    a.step,
    ...completed.map((sid) => getStep(sid)?.n ?? 0),
  );

  const next: Attendee = {
    ...a,
    completedSteps: completed,
    // Online proof is never downgraded by a later self-reported one.
    verified: { ...a.verified, [stepId]: a.verified?.[stepId] === "online" ? "online" : how },
    step: furthest,
    updatedAt: new Date().toISOString(),
  };
  await kvSet(`attendee:${id}`, next);
  return next;
}

export async function listAttendees(limit = 100): Promise<Attendee[]> {
  const ids = await kvList<string>(ATTENDEES, limit);
  const out: Attendee[] = [];
  for (const id of ids) {
    const a = await kvGet<Attendee>(`attendee:${id}`);
    if (a) out.push(a);
  }
  // Two registrations that say exactly the same thing are one person on the
  // board. Keep the most recently active of each.
  const seen = new Map<string, Attendee>();
  for (const a of out) {
    const key = JSON.stringify([a.humanLabel, a.agentName, a.targetUrl, a.step, a.completedSteps, a.note]);
    const prev = seen.get(key);
    if (!prev || a.updatedAt > prev.updatedAt) seen.set(key, a);
  }

  // Furthest first, then most recently active. The board should reward progress.
  return [...seen.values()].sort(
    (x, y) => y.step - x.step || y.updatedAt.localeCompare(x.updatedAt),
  );
}

export async function getAttendee(id: string): Promise<Attendee | null> {
  return kvGet<Attendee>(`attendee:${id}`);
}

/** Where the room is, as a histogram. Shown on the projector. */
export async function roomProgress(): Promise<{
  total: number;
  byStep: { step: number; title: string; count: number }[];
  withTarget: number;
}> {
  const all = await listAttendees(300);
  const byStep = BUILD_STEPS.map((s) => ({
    step: s.n,
    title: s.title,
    count: all.filter((a) => a.step === s.n).length,
  }));
  return {
    total: all.length,
    byStep: [
      { step: 0, title: "Not started", count: all.filter((a) => a.step === 0).length },
      ...byStep,
    ],
    withTarget: all.filter((a) => a.targetUrl).length,
  };
}
