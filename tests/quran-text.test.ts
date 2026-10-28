import { expect, it } from "bun:test";
import quran from "../public/quran.json";

it("keeps 114 surahs and 6236 ayahs so saved positions and favorites stay valid", () => {
  expect(quran.length).toBe(114);
  expect(quran.flat().length).toBe(6236);
  expect(quran[1].length).toBe(286);
});

it("uses the King Fahd Complex wording for Ibrahim and An-Nabiyyin in Al-Baqarah", () => {
  expect(quran[1][123]).toContain("إِبۡرَٰهِـۧمَ");
  expect(quran[1][176]).toContain(`و${NABIYYIN}`);
});

it("stores ayah text without the embedded ayah number", () => {
  for (const ayah of quran.flat()) expect(/[٠-٩]$/.test(ayah)).toBe(false);
});

it("preserves the official Nabiyyin text and diacritics in Al-Baqarah 213", () => {
  expect(quran[1][212].startsWith("كَانَ ٱلنَّاسُ أُمَّةٗ وَٰحِدَةٗ فَبَعَثَ ٱللَّهُ ٱلنَّبِيِّـۧنَ مُبَشِّرِينَ")).toBe(true);
});

import { NABIYYIN, splitNabiyyin } from "../src/lib/quran-word";

it("marks all 13 small-high-yeh Nabiyyin words without changing any ayah", () => {
  let count = 0;
  for (const ayah of quran.flat()) {
    const parts = splitNabiyyin(ayah);
    count += parts.filter((part) => part === NABIYYIN).length;
    expect(parts.join("")).toBe(ayah);
  }
  expect(count).toBe(13);
});
