import { expect, it } from "bun:test";
import { ADHKAR, getAdhkar, getDhikrCounterPeriod, incrementDhikr } from "../src/lib/adhkar";
import quran from "../public/quran.json";
import { normalizeArabic } from "../src/lib/worship";

it("provides at least ten distinct morning adhkar", () => {
  expect(new Set(getAdhkar("morning").map((item) => item.id)).size).toBeGreaterThanOrEqual(10);
});

it("provides at least ten distinct evening adhkar", () => {
  expect(new Set(getAdhkar("evening").map((item) => item.id)).size).toBeGreaterThanOrEqual(10);
});

it("includes every entry from 75 through 98 of the morning and evening chapter", () => {
  expect(ADHKAR.map((item) => Number(item.hisnUrl.split(":").at(-1)))).toEqual(Array.from({ length: 24 }, (_, index) => 75 + index));
  expect(new Set(ADHKAR.map((item) => item.id)).size).toBe(24);
});

for (const [id, repetitions, periods] of [
  ["witness", 4, ["morning", "evening"]],
  ["blessings", 1, ["morning", "evening"]],
  ["trust", 7, ["morning", "evening"]],
  ["unseen", 1, ["morning", "evening"]],
  ["living", 1, ["morning", "evening"]],
  ["day-goodness", 1, ["morning", "evening"]],
  ["fitrah", 1, ["morning", "evening"]],
  ["tahlil-ten", 10, ["morning", "evening"]],
  ["tahlil-hundred", 100, ["morning"]],
  ["creation-praise", 3, ["morning"]],
  ["knowledge", 1, ["morning"]],
  ["daily-istighfar", 100, ["morning", "evening"]],
  ["perfect-words", 3, ["evening"]],
  ["salawat", 10, ["morning", "evening"]],
] as const) {
  it(`uses reviewed periods and counter limit for ${id}`, () => {
    for (const period of ["morning", "evening"] as const) {
      const item = getAdhkar(period).find((dhikr) => dhikr.id === id);
      if (periods.some((value) => value === period)) {
        expect(item?.repetitions).toBe(repetitions);
        expect(incrementDhikr(repetitions, item?.repetitions ?? 0)).toBe(repetitions);
      } else {
        expect(item).toBeUndefined();
      }
    }
  });
}

it("shares the daily hundred istighfar counter instead of requesting a hundred in each period", () => {
  const daily = ADHKAR.find((item) => item.id === "daily-istighfar");
  if (!daily) throw new Error("Daily istighfar missing");
  expect(getDhikrCounterPeriod(daily, "morning")).toBe("daily");
  expect(getDhikrCounterPeriod(daily, "evening")).toBe("daily");
  const tasbih = ADHKAR.find((item) => item.id === "tasbih");
  if (!tasbih) throw new Error("Tasbih missing");
  expect(getDhikrCounterPeriod(tasbih, "morning")).toBe("morning");
  expect(getDhikrCounterPeriod(tasbih, "evening")).toBe("evening");
});

it("uses the evening variants for witnessing, gratitude, day goodness and fitrah", () => {
  const evening = getAdhkar("evening");
  expect(evening.find((item) => item.id === "witness")?.text).toContain("إِنِّي أَمْسَيْتُ أُشْهِدُكَ");
  expect(evening.find((item) => item.id === "blessings")?.text).toContain("مَا أَمْسَى بِي");
  expect(evening.find((item) => item.id === "day-goodness")?.text).toContain("فَتْحَهَا وَنَصْرَهَا وَنُورَهَا وَبَرَكَتَهَا وَهُدَاهَا");
  expect(evening.find((item) => item.id === "fitrah")?.text).toContain("أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ");
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
  const words = (t: string) => normalizeArabic(t).replace(/[^\u0621-\u064A ]/g, "").split(/\s+/).filter(Boolean).join(" ");
  expect(words(ADHKAR.find((item) => item.id === "kursi")?.text ?? "")).toContain(words(quran[1][254]));
  const text = words(ADHKAR.find((item) => item.id === "quls")?.text ?? "");
  for (const index of [111, 112, 113]) {
    for (const ayah of quran[index]) expect(text).toContain(words(ayah));
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