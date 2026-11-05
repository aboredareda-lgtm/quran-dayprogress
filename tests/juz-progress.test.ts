import { describe, expect, it } from "bun:test";
import { daysToFinish, juzRead, juzReadToday } from "../src/lib/progress";
import { DEFAULT_GOAL, GOAL_OPTIONS } from "../src/hooks/useDailyGoal";

describe("juz-based finish estimates", () => {
  it("defaults to one juz per day and finishes from the beginning in 30 days", () => {
    expect(DEFAULT_GOAL).toBe(1);
    expect(Math.ceil(30 / DEFAULT_GOAL)).toBe(30);
    expect(daysToFinish(1, 1, DEFAULT_GOAL)).toBe(30);
  });
  it("finishes in 15 days at two juz per day", () => {
    expect(daysToFinish(1, 1, 2)).toBe(15);
  });
  it("uses actual juz boundaries: completing juz one leaves 29 days", () => {
    expect(juzRead(2, 141)).toBe(1);
    expect(daysToFinish(2, 141, 1)).toBe(29);
    expect(daysToFinish(2, 142, 1)).toBe(29);
    expect(juzRead(2, 252)).toBe(2);
    expect(daysToFinish(2, 252, 1)).toBe(28);
  });
  it("has no days remaining at the end of the Quran", () => {
    expect(juzRead(114, 6)).toBe(30);
    expect(daysToFinish(114, 6, 1)).toBe(0);
  });
  it("supports half a juz without rounding the daily goal", () => {
    expect(GOAL_OPTIONS.map(option => option.value)).toContain(0.5);
    expect(daysToFinish(1, 1, 0.5)).toBe(60);
  });
  it("counts today's reading using real juz boundaries", () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    expect(juzReadToday([
      { id: "today", surah: 2, ayah: 252, at: now.toISOString() },
      { id: "before", surah: 2, ayah: 141, at: yesterday.toISOString() },
    ])).toBe(1);
  });
});