import { describe, expect, it } from "vitest";
import quran from "../public/quran.json";
import { splitQuranDisplayText } from "../src/lib/quran-display";

describe("Quran display preserves the Uthmani source", () => {
  it("shows Al-Baqarah 177 with the Madinah small ya and diacritics while preserving the source", () => {
    const text = quran[1][176];
    const parts = splitQuranDisplayText(text);
    expect(parts.map((part) => part.text).join("")).toBe(text);
    expect(parts.find((part) => part.isNabiyyin)?.display).toBe("وَٱلنَّبِيِّـۧنَ");
    expect(parts.map((part) => part.display).join("")).toBe(text.replace("وَٱلنَّبِيِّۦنَ", "وَٱلنَّبِيِّـۧنَ"));
  });
  it("preserves every character of Al-Baqarah 124 including Ibrahim's small ya", () => {
    const text = quran[1][123];
    const parts = splitQuranDisplayText(text);
    expect(parts.map((part) => part.text).join("")).toBe(text);
    expect(parts.find((part) => part.isIbrahim)?.text).toBe("إِبْرَٰهِۦمَ");
    expect(parts.find((part) => part.isIbrahim)?.display).toBe("إِبْرَٰهِـۧمَ");
  });
  it("preserves all verses and their annotations", () => {
    for (const surah of quran) {
      for (const text of surah) {
        expect(splitQuranDisplayText(text).map((part) => part.text).join("")).toBe(text);
      }
    }
  });
});
describe("Quran text matches the Madinah Mushaf corrections", () => {
  it("Yusuf 39 and 41 read يَٰصَٰحِبَىِ without the extra ya", () => {
    expect(quran[11][38].startsWith("يَٰصَٰحِبَىِ ")).toBe(true);
    expect(quran[11][40].startsWith("يَٰصَٰحِبَىِ ")).toBe(true);
  });
  it("بَعْدَ مَا is written as two words in 2:181, 8:6 and 13:37", () => {
    for (const [s, a] of [[2, 181], [8, 6], [13, 37]]) {
      expect(quran[s - 1][a - 1]).toContain("بَعْدَ مَا");
    }
  });
});
