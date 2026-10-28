// Browser-safe helpers for the optional App Store update prompt.
export const UPDATE_SNOOZE_KEY = "wird:update-snoozed";
export const UPDATE_SNOOZE_MS = 24 * 60 * 60 * 1000;

/** Returns true when `store` is a newer version than `installed` (e.g. "1.2" > "1.1.5"). */
export function isNewerVersion(store: string, installed: string): boolean {
  const a = store.split(".").map((n) => parseInt(n, 10) || 0);
  const b = installed.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

/** Snoozed when the user pressed "later" for this same version less than a day ago. */
export function isSnoozed(raw: string | null, version: string, now: number): boolean {
  if (!raw) return false;
  try {
    const s = JSON.parse(raw) as { version: string; at: number };
    return s.version === version && now - s.at < UPDATE_SNOOZE_MS;
  } catch {
    return false;
  }
}
