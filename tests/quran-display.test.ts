import { describe, expect, it } from "vitest";
import quran from "../public/quran.json";
import { splitQuranDisplayText } from "../src/lib/quran-display";

describe("Quran display preserves the Uthmani source", () => {
  it("preserves every character of Al-Baqarah 124 including Ibrahim's small ya", () => {
    const text = quran[1][123];
    const parts = splitQuranDisplayText(text);
    expect(parts.map((part) => part.text).join("")).toBe(text);
    expect(parts.find((part) => part.isIbrahim)?.text).toBe("إِبْرَٰهِۦمَ");
  });
  it("preserves all verses and their annotations", () => {
    for (const surah of quran) {
      for (const text of surah) {
        expect(splitQuranDisplayText(text).map((part) => part.text).join("")).toBe(text);
      }
    }
  });
});