import { prayerTimes } from "./worship";

export const ADHAN_PRAYERS = [
  ["fajr", "الفجر"],
  ["dhuhr", "الظهر"],
  ["asr", "العصر"],
  ["maghrib", "المغرب"],
  ["isha", "العشاء"],
] as const;
export type AdhanPrayer = (typeof ADHAN_PRAYERS)[number][0];
export type AdhanSettings = Record<AdhanPrayer, boolean>;
export const ADHAN_KEY = "wird:adhan-alerts";
export const ADHAN_DEFAULT: AdhanSettings = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };

export function readAdhanSettings(raw: string | null): AdhanSettings {
  try {
    const v = JSON.parse(raw || "null");
    const out = { ...ADHAN_DEFAULT };
    for (const [k] of ADHAN_PRAYERS) if (v && v[k] === true) out[k] = true;
    return out;
  } catch {
    return { ...ADHAN_DEFAULT };
  }
}

export type AdhanAlert = { id: number; prayer: AdhanPrayer; name: string; at: Date };

/** Upcoming alerts for enabled prayers over the next `days` days, after `now`. */
export function upcomingAdhanAlerts(
  settings: AdhanSettings,
  lat: number,
  lng: number,
  now: Date = new Date(),
  days = 7,
): AdhanAlert[] {
  const list: AdhanAlert[] = [];
  for (let d = 0; d < days; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 12);
    const times = prayerTimes(day, lat, lng);
    ADHAN_PRAYERS.forEach(([key, name], i) => {
      const at = times[key];
      if (settings[key] && at > now) list.push({ id: 2000 + d * 10 + i, prayer: key, name, at });
    });
  }
  return list;
}
export const ADHAN_ALL_IDS = Array.from({ length: 7 * 10 }, (_, i) => 2000 + i);
