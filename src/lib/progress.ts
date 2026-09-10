import { SURAHS, getSurah } from "./surahs";
import type { ReadingEntry } from "@/hooks/useReadingLog";

/** العدد الكلي لآيات المصحف */
export const TOTAL_AYAHS = SURAHS.reduce((sum, s) => sum + s.ayahs, 0);

/** ترتيب الآية في المصحف كله (1 .. TOTAL_AYAHS) */
export function ayahIndex(surah: number, ayah: number): number {
  let before = 0;
  for (const s of SURAHS) {
    if (s.number >= surah) break;
    before += s.ayahs;
  }
  const clamped = Math.min(Math.max(ayah, 1), getSurah(surah).ayahs);
  return before + clamped;
}

/** نسبة التقدّم في المصحف كله (0 - 100) */
export function mushafPercent(surah: number, ayah: number): number {
  return Math.round((ayahIndex(surah, ayah) / TOTAL_AYAHS) * 1000) / 10;
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function todayKey(now = new Date()) {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function shiftDay(key: string, days: number) {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + days);
  return todayKey(d);
}

/** سلسلة الأيام المتواصلة المنتهية اليوم أو أمس */
export function currentStreak(entries: ReadingEntry[]): number {
  const days = new Set(entries.map((e) => dayKey(e.at)));
  if (days.size === 0) return 0;

  const today = todayKey();
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  if (!days.has(cursor)) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

/** عدد الآيات المقروءة اليوم = الفرق بين آخر موضع اليوم وآخر موضع قبل اليوم */
export function ayahsReadToday(entries: ReadingEntry[]): number {
  const today = todayKey();
  const todays = entries.filter((e) => dayKey(e.at) === today);
  if (todays.length === 0) return 0;

  const latestToday = Math.max(...todays.map((e) => ayahIndex(e.surah, e.ayah)));
  const before = entries.filter((e) => dayKey(e.at) < today);
  const baseline = before.length
    ? ayahIndex(before[0]!.surah, before[0]!.ayah)
    : 0;

  return Math.max(latestToday - baseline, 0);
}

/** الأيام المتبقّية تقديريًا لإتمام الختمة بناءً على الهدف اليومي */
export function daysToFinish(
  surah: number,
  ayah: number,
  goalAyahs: number,
): number {
  const remaining = TOTAL_AYAHS - ayahIndex(surah, ayah);
  if (goalAyahs <= 0) return 0;
  return Math.ceil(remaining / goalAyahs);
}

/** عدد الآيات المقروءة في كل يوم (بناءً على تقدّم الموضع) */
export function ayahsPerDay(entries: ReadingEntry[]): Map<string, number> {
  const perDay = new Map<string, number>();
  for (const e of entries) {
    const key = dayKey(e.at);
    const idx = ayahIndex(e.surah, e.ayah);
    perDay.set(key, Math.max(perDay.get(key) ?? 0, idx));
  }

  const days = [...perDay.keys()].sort();
  const result = new Map<string, number>();
  let previous = 0;
  for (const day of days) {
    const idx = perDay.get(day)!;
    result.set(day, Math.max(idx - previous, 0));
    previous = Math.max(previous, idx);
  }
  return result;
}

export type MonthlyStats = {
  days: number;
  ayahs: number;
  bestDay: { day: string; ayahs: number } | null;
};

/** إحصائية الشهر الحالي: أيام القراءة، مجموع الآيات، وأكثر يوم قراءة */
export function monthlyStats(entries: ReadingEntry[], now = new Date()): MonthlyStats {
  const prefix = todayKey(now).slice(0, 7);
  const perDay = ayahsPerDay(entries);

  let days = 0;
  let ayahs = 0;
  let bestDay: { day: string; ayahs: number } | null = null;

  for (const [day, count] of perDay) {
    if (!day.startsWith(prefix)) continue;
    days += 1;
    ayahs += count;
    if (!bestDay || count > bestDay.ayahs) bestDay = { day, ayahs: count };
  }

  return { days, ayahs, bestDay };
}

export function formatArabicDate(d: Date) {
  return new Intl.DateTimeFormat("ar", { dateStyle: "long" }).format(d);
}

