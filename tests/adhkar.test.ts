import { expect, it } from "bun:test";
import { ADHKAR, getAdhkar, incrementDhikr } from "../src/lib/adhkar";
import quran from "../public/quran.json";

it("provides at least ten distinct morning adhkar", () => {
  expect(new Set(getAdhkar("morning").map((item) => item.id)).size).toBeGreaterThanOrEqual(10);
});

it("provides at least ten distinct evening adhkar", () => {
  expect(new Set(getAdhkar("evening").map((item) => item.id)).size).toBeGreaterThanOrEqual(10);
});

it("uses the reviewed morning and evening wording for the kingdom supplication", () => {
  const morning = getAdhkar("morning").find((item) => item.id === "kingdom")?.text;
  const evening = getAdhkar("evening").find((item) => item.id === "kingdom")?.text;
  expect(morning).toContain("أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ");
  expect(morning).toContain("هَذَا الْيَوْمِ");
  expect(evening).toContain("أَمْسَيْنَا وَأَمْسَى الْمُلْكُ");
  expect(evening).toContain("هَذِهِ اللَّيْلَةِ");
  expect(evening).not.toContain("هَذَا الْيَوْمِ");
});

it("uses resurrection in the morning and return in the evening for Allahumma bika", () => {
  expect(getAdhkar("morning").find((item) => item.id === "bika")?.text).toBe("اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.");
  expect(getAdhkar("evening").find((item) => item.id === "bika")?.text).toBe("اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.");
});

it("preserves the bundled Quran wording for Ayat al Kursi and all three surahs", () => {
  expect(ADHKAR.find((item) => item.id === "kursi")?.text).toContain(quran[1][254]);
  const text = ADHKAR.find((item) => item.id === "quls")?.text ?? "";
  for (const index of [111, 112, 113]) {
    expect(text).toContain(quran[index].join(" ۝ "));
  }
});

for (const [id, repetitions] of [["kursi", 1], ["quls", 3], ["kingdom", 1], ["bika", 1], ["health", 3], ["pardon", 1], ["protection", 3], ["contentment", 3]] as const) {
  it(`enforces the reviewed ${repetitions} repetitions for ${id} in each period`, () => {
    for (const period of ["morning", "evening"] as const) {
      const dhikr = getAdhkar(period).find((item) => item.id === id);
      expect(dhikr?.repetitions).toBe(repetitions);
      expect(incrementDhikr(repetitions - 1, dhikr?.repetitions ?? 0)).toBe(repetitions);
      expect(incrementDhikr(repetitions, dhikr?.repetitions ?? 0)).toBe(repetitions);
    }
  });
}

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