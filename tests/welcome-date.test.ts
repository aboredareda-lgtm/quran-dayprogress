import { expect, it } from "bun:test";
import { formatWelcomeDate } from "../src/lib/welcome-date";

it("uses Hijri months for the welcome date", () => {
  const date = formatWelcomeDate(new Date(2026, 9, 25, 12));
  expect(date.day).toBe("الأحد");
  expect(date.hijri).toBe("١٤ جمادى الأولى ١٤٤٨ هـ");
});