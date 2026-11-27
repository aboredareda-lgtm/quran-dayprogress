import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  ADHAN_ALL_IDS, ADHAN_DEFAULT, ADHAN_KEY, readAdhanSettings, upcomingAdhanAlerts,
  type AdhanPrayer, type AdhanSettings,
} from "@/lib/adhan-alerts";

const EVENT = "wird:adhan-changed";
function readLoc(): { lat: number; lng: number } | null {
  try {
    const v = JSON.parse(localStorage.getItem("wird:prayer-location") || "null");
    return v && typeof v.lat === "number" && typeof v.lng === "number" ? v : null;
  } catch {
    return null;
  }
}

/** Replaces the native queue with the next week of enabled adhan alerts. */
async function scheduleNative(settings: AdhanSettings) {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: ADHAN_ALL_IDS.map((id) => ({ id })) });
  const loc = readLoc();
  if (!loc) return;
  const list = upcomingAdhanAlerts(settings, loc.lat, loc.lng);
  if (!list.length) return;
  await LocalNotifications.schedule({
    notifications: list.map((a) => ({
      id: a.id,
      title: `حان وقت صلاة ${a.name}`,
      body: "حيّ على الصلاة، حيّ على الفلاح",
      schedule: { at: a.at, allowWhileIdle: true },
    })),
  });
}

/** Mounted once in the root: refreshes the schedule on open and fires web alerts while the page is open. */
export function AdhanAlertsRunner() {
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      timers.forEach(clearTimeout);
      timers = [];
      const settings = readAdhanSettings(localStorage.getItem(ADHAN_KEY));
      if (Capacitor.isNativePlatform()) {
        void scheduleNative(settings).catch(() => {});
        return;
      }
      const loc = readLoc();
      if (!loc || typeof Notification === "undefined" || Notification.permission !== "granted") return;
      for (const a of upcomingAdhanAlerts(settings, loc.lat, loc.lng, new Date(), 2)) {
        timers.push(setTimeout(() => {
          try { new Notification(`حان وقت صلاة ${a.name}`, { body: "حيّ على الصلاة، حيّ على الفلاح", tag: `adhan-${a.id}` }); } catch { /* */ }
        }, a.at.getTime() - Date.now()));
      }
    };
    run();
    const visible = () => { if (document.visibilityState === "visible") run(); };
    window.addEventListener(EVENT, run);
    document.addEventListener("visibilitychange", visible);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener(EVENT, run);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  return null;
}

export function useAdhanAlerts() {
  const [settings, setSettings] = useState<AdhanSettings>(ADHAN_DEFAULT);
  const [hasLocation, setHasLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setSettings(readAdhanSettings(localStorage.getItem(ADHAN_KEY)));
    setHasLocation(!!readLoc());
  }, []);
  const toggle = useCallback(async (prayer: AdhanPrayer) => {
    setError(null);
    const next = { ...settings, [prayer]: !settings[prayer] };
    if (next[prayer]) {
      let granted = false;
      try {
        if (Capacitor.isNativePlatform()) granted = (await LocalNotifications.requestPermissions()).display === "granted";
        else if (typeof Notification !== "undefined")
          granted = (Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission) === "granted";
      } catch { /* */ }
      if (!granted) {
        setError("الإشعارات غير مسموحة — اسمح بها من إعدادات الجهاز أو المتصفح.");
        return;
      }
    }
    try {
      localStorage.setItem(ADHAN_KEY, JSON.stringify(next));
    } catch {
      setError("تعذّر حفظ الإعداد.");
      return;
    }
    setSettings(next);
    window.dispatchEvent(new Event(EVENT));
  }, [settings]);
  return { settings, toggle, hasLocation, error };
}
