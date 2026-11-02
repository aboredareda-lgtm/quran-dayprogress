import { expect, it } from "bun:test";
import { nextAdhkarPage, nextManualAdhkarPage } from "../src/lib/adhkar-book";

it("keeps the same page until the dhikr count is complete", () => {
  expect(nextAdhkarPage(0, 22, 99, 100)).toBe(0);
});
it("advances automatically when the last repetition is reached", () => {
  expect(nextAdhkarPage(0, 22, 100, 100)).toBe(1);
});
it("advances from the final dhikr to the completion page", () => {
  expect(nextAdhkarPage(21, 22, 10, 10)).toBe(22);
});

it("allows manual navigation without completing the repetition target", () => {
  expect(nextAdhkarPage(0, 22, 0, 100)).toBe(0);
  expect(nextManualAdhkarPage(0, 22)).toBe(1);
});

it("stops manual navigation at the final page", () => {
  expect(nextManualAdhkarPage(21, 22)).toBe(22);
  expect(nextManualAdhkarPage(22, 22)).toBe(22);
});