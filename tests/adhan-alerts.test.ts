import { describe, expect, it } from "bun:test";
import { ADHAN_DEFAULT, readAdhanSettings, upcomingAdhanAlerts } from "../src/lib/adhan-alerts";

const mecca = [21.4225, 39.8262] as const;
describe("adhan alerts", () => {
  it("schedules nothing when all prayers are off", () => {
    expect(upcomingAdhanAlerts(ADHAN_DEFAULT, ...mecca)).toHaveLength(0);
  });
  it("schedules only enabled prayers, one per day for 7 days", () => {
    const list = upcomingAdhanAlerts({ ...ADHAN_DEFAULT, fajr: true }, ...mecca, new Date(2026, 10, 27, 0, 1));
    expect(list).toHaveLength(7);
    expect(list.every((a) => a.prayer === "fajr")).toBe(true);
  });
  it("skips prayers that already passed today", () => {
    const now = new Date(2026, 10, 27, 23, 59);
    const list = upcomingAdhanAlerts({ ...ADHAN_DEFAULT, isha: true }, ...mecca, now);
    expect(list.every((a) => a.at > now)).toBe(true);
    expect(list).toHaveLength(6);
  });
  it("ignores invalid saved values", () => {
    expect(readAdhanSettings("garbage")).toEqual(ADHAN_DEFAULT);
  });
});
