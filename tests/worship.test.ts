import { describe, expect, it } from "bun:test";
import { dailyPortion, normalizeArabic, prayerTimes, readingStreak, TOTAL_AYAHS } from "../src/lib/worship";

describe("streak", () => {
  const now = new Date(2026, 9, 9, 20);
  it("counts consecutive days ending today", () => {
    const d = (day: number) => new Date(2026, 9, day, 10).toISOString();
    expect(readingStreak([d(9), d(8), d(7), d(5)], now)).toBe(3);
  });
  it("still counts when today is not read yet", () => {
    expect(readingStreak([new Date(2026, 9, 8, 10).toISOString()], now)).toBe(1);
  });
  it("resets after a missed day", () => {
    expect(readingStreak([new Date(2026, 9, 6, 10).toISOString()], now)).toBe(0);
  });
});

describe("khatmah plan", () => {
  it("splits the whole Quran over 30 days", () => {
    const p = dailyPortion({ days: 30, start: new Date(2026, 9, 9).toISOString() }, null, new Date(2026, 9, 9));
    expect(TOTAL_AYAHS).toBe(6236);
    expect(p.perDay).toBe(208);
    expect(p.from).toEqual({ surah: 1, ayah: 1 });
  });
});

describe("search", () => {
  it("ignores diacritics", () => {
    expect(normalizeArabic("ٱلصَّٰبِرِينَ").includes(normalizeArabic("الصابرين"))).toBe(true);
  });
});

describe("prayer times", () => {
  it("Makkah dhuhr is around 12:20 local (UTC+3)", () => {
    const t = prayerTimes(new Date(2026, 9, 9), 21.4225, 39.8262);
    const h = (t.dhuhr.getUTCHours() + 3) + t.dhuhr.getUTCMinutes() / 60;
    expect(h).toBeGreaterThan(11.9);
    expect(h).toBeLessThan(12.5);
    expect(t.isha.getTime() - t.maghrib.getTime()).toBe(90 * 60000);
  });
});
