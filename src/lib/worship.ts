import { SURAHS } from "@/lib/surahs";
import { localDayKey } from "@/lib/local-date";

/** عدد الأيام المتتالية التي فيها قراءة حتى اليوم (أو أمس إن لم يُقرأ اليوم بعد). */
export function readingStreak(dates: string[], now: Date = new Date()): number {
  const days = new Set(dates.map((d) => localDayKey(d)));
  const cursor = new Date(now);
  if (!days.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(localDayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export const TOTAL_AYAHS = SURAHS.reduce((n, s) => n + s.ayahs, 0);

/** ترتيب الآية في المصحف كله (1..6236). */
export function ayahIndex(surah: number, ayah: number): number {
  let n = 0;
  for (const s of SURAHS) {
    if (s.number === surah) return n + ayah;
    n += s.ayahs;
  }
  return n;
}

export function positionFromIndex(index: number): { surah: number; ayah: number } {
  let left = Math.min(Math.max(index, 1), TOTAL_AYAHS);
  for (const s of SURAHS) {
    if (left <= s.ayahs) return { surah: s.number, ayah: left };
    left -= s.ayahs;
  }
  return { surah: 114, ayah: 6 };
}

/** ورد اليوم في خطة الختمة: من الموضع الحالي، مقسومًا على الأيام الباقية. */
export function dailyPortion(
  plan: { days: number; start: string },
  current: { surah: number; ayah: number } | null,
  now: Date = new Date(),
) {
  const startDay = new Date(localDayKey(plan.start) + "T00:00:00");
  const today = new Date(localDayKey(now) + "T00:00:00");
  const elapsed = Math.round((today.getTime() - startDay.getTime()) / 86400000);
  const daysLeft = Math.max(plan.days - elapsed, 1);
  const done = current ? ayahIndex(current.surah, current.ayah) : 0;
  const remaining = TOTAL_AYAHS - done;
  const perDay = Math.ceil(remaining / daysLeft);
  return {
    daysLeft,
    perDay,
    remaining,
    from: positionFromIndex(done + 1),
    to: positionFromIndex(done + perDay),
  };
}

/** إزالة التشكيل وتوحيد الحروف للبحث. */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\uFEFF]/g, "")
    .replace(/[ٱأإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

// ===== أوقات الصلاة — طريقة أم القرى (الفجر 18.5°، العشاء بعد المغرب بـ90 دقيقة، العصر شافعي)
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export type PrayerTimes = Record<"fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha", Date>;

export function prayerTimes(date: Date, lat: number, lng: number): PrayerTimes {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jd =
    d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  const n = jd - 2451545;
  const g = rad((357.529 + 0.98560028 * n) % 360);
  const q = (280.459 + 0.98564736 * n) % 360;
  const L = rad(q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
  const e = rad(23.439 - 0.00000036 * n);
  const decl = Math.asin(Math.sin(e) * Math.sin(L));
  let ra = deg(Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L))) / 15;
  ra = ((ra % 24) + 24) % 24;
  let eqt = q / 15 - ra;
  eqt = ((eqt + 12) % 24 + 24) % 24 - 12;
  const noonUtc = 12 - lng / 15 - eqt; // ساعات UTC
  const phi = rad(lat);
  const hourAngle = (angle: number) => {
    const v = (Math.sin(rad(angle)) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
    return deg(Math.acos(Math.min(1, Math.max(-1, v)))) / 15;
  };
  const asrAngle = deg(Math.atan(1 / (1 + Math.tan(Math.abs(phi - decl)))));
  const at = (h: number) => new Date(Date.UTC(y, m - 1, d) + h * 3600000);
  const sunset = noonUtc + hourAngle(-0.833);
  return {
    fajr: at(noonUtc - hourAngle(-18.5)),
    sunrise: at(noonUtc - hourAngle(-0.833)),
    dhuhr: at(noonUtc + 2 / 60),
    asr: at(noonUtc + hourAngle(asrAngle)),
    maghrib: at(sunset),
    isha: at(sunset + 1.5),
  };
}
