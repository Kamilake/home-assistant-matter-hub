// Shared age-based Matter session rotation helpers (#287). Rotating a
// controller's CASE session makes it re-establish and re-subscribe, which
// clears wedged subscription state. Used by both the aggregator Bridge and
// the ServerModeBridge.

export const DEFAULT_SESSION_MAX_AGE_HOURS = 4;
export const SESSION_MAX_AGE_HOURS_RANGE = { min: 1, max: 168 };
export const ROTATION_CHECK_INTERVAL_MS = 5 * 60 * 1000;

// Returns the parsed hours, 0 (disabled), or null when the raw value is
// malformed and the caller should log + fall back to the default.
export function parseSessionMaxAgeHours(
  raw: string | undefined | null,
): number | null {
  if (raw == null || raw === "") return DEFAULT_SESSION_MAX_AGE_HOURS;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n < 0) return null;
  if (n === 0) return 0;
  const { min, max } = SESSION_MAX_AGE_HOURS_RANGE;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

// A 0-subscription session whose peer is still talking (MRP-active) is a
// controller mid-recovery, not a dead one. The stale/dead cleanup should leave
// it open so it can re-subscribe instead of forcing it offline (#287); only
// close it once the peer goes quiet (#266/#105).
export function staleSessionShouldClose(session: {
  subscriptions: { size: number };
  isClosing: boolean;
  isPeerActive: boolean;
}): boolean {
  return (
    session.subscriptions.size === 0 &&
    !session.isClosing &&
    !session.isPeerActive
  );
}

export function seedExistingSessionStarts(
  startedAt: Map<number, number>,
  sessions: Iterable<{ id: number }>,
  now = Date.now(),
): void {
  for (const session of sessions) {
    if (!startedAt.has(session.id)) {
      startedAt.set(session.id, now);
    }
  }
}
