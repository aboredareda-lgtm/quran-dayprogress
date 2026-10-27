import { expect, it } from "bun:test";
import { ADHKAR, incrementDhikr } from "../src/lib/adhkar";

it("counts sayyid al-istighfar once without exceeding its reviewed repetition", () => {
  const dhikr = ADHKAR.find((item) => item.id === "istighfar");
  expect(dhikr?.repetitions).toBe(1);
  expect(incrementDhikr(0, dhikr?.repetitions ?? 0)).toBe(1);
  expect(incrementDhikr(1, dhikr?.repetitions ?? 0)).toBe(1);
});

it("counts tasbih one hundred times without exceeding its reviewed repetition", () => {
  const dhikr = ADHKAR.find((item) => item.id === "tasbih");
  expect(dhikr?.repetitions).toBe(100);
  expect(incrementDhikr(98, dhikr?.repetitions ?? 0)).toBe(99);
  expect(incrementDhikr(99, dhikr?.repetitions ?? 0)).toBe(100);
  expect(incrementDhikr(100, dhikr?.repetitions ?? 0)).toBe(100);
});