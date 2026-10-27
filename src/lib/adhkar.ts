export type AdhkarPeriod = "morning" | "evening";

export const ADHKAR = [
  {
    id: "istighfar",
    title: "سيد الاستغفار",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
    repetitions: 1,
    repetitionLabel: "مرة واحدة",
    source: "صحيح البخاري: ٦٣٠٦",
    sourceUrl: "https://sunnah.com/bukhari:6306",
    hisnUrl: "https://sunnah.com/hisn:79",
  },
  {
    id: "tasbih",
    title: "التسبيح",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
    repetitions: 100,
    repetitionLabel: "مائة مرة",
    source: "صحيح مسلم: ٢٦٩٢",
    sourceUrl: "https://sunnah.com/muslim:2692",
    hisnUrl: "https://sunnah.com/hisn:91",
  },
] as const;

export function incrementDhikr(count: number, repetitions: number) {
  return Math.min(repetitions, Math.max(0, count) + 1);
}