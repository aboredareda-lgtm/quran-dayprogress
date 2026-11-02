import { describe, expect, it } from "vitest";
import { isNewerVersion, isSnoozed, UPDATE_SNOOZE_MS } from "../src/lib/app-update";

describe("app update prompt", () => {
  it("shows only when the store version is newer", () => {
    expect(isNewerVersion("1.2", "1.1")).toBe(true);
    expect(isNewerVersion("1.1", "1.1")).toBe(false);
    expect(isNewerVersion("1.1", "1.2")).toBe(false);
    expect(isNewerVersion("1.10", "1.9")).toBe(true);
  });

  it("'later' hides the same version for one day only", () => {
    const raw = JSON.stringify({ version: "1.2", at: 0 });
    expect(isSnoozed(raw, "1.2", UPDATE_SNOOZE_MS - 1)).toBe(true);
    expect(isSnoozed(raw, "1.2", UPDATE_SNOOZE_MS)).toBe(false);
    expect(isSnoozed(raw, "1.3", 1)).toBe(false);
  });
});
