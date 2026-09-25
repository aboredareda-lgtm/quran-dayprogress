import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { reminderSchema, timeSchema } from "@/lib/backup-schema";

const KEY = "wird:reminder";
const ID = 1001;
export type Reminder = { enabled: boolean; time: string };
const DEFAULT: Reminder = { enabled: false, time: "20:00" };
type Permission = NotificationPermission | "unsupported";
function read(): Reminder {
  try {
    return reminderSchema.parse(JSON.parse(localStorage.getItem(KEY) || "null"));
  } catch {
    return DEFAULT;
  }
}
async function permissionStatus(request = false): Promise<Permission> {
  if (Capacitor.isNativePlatform()) {
    const result = await (request
      ? LocalNotifications.requestPermissions()
      : LocalNotifications.checkPermissions());
    return result.display === "granted"
      ? "granted"
      : result.display === "denied"
        ? "denied"
        : "default";
  }
  if (typeof Notification === "undefined") return "unsupported";
  return request && Notification.permission === "default"
    ? Notification.requestPermission()
    : Notification.permission;
}
async function scheduleNative(next: Reminder) {
  if (!Capacitor.isNativePlatform()) return;
  if (!next.enabled) {
    await LocalNotifications.cancel({ notifications: [{ id: ID }] });
    return;
  }
  const [hour = 20, minute = 0] = next.time.split(":").map(Number);
  // Reusing the identifier replaces the existing daily request.
  await LocalNotifications.schedule({
    notifications: [
      {
        id: ID,
        title: "وقت وردك اليومي",
        body: "لا تنسَ قراءة وردك من القرآن الكريم وتسجيل موضعك.",
        schedule: { on: { hour, minute }, repeats: true },
      },
    ],
  });
}
export function useReminder() {
  const [reminder, setReminder] = useState<Reminder>(DEFAULT);
  const current = useRef(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [permission, setPermission] = useState<Permission>("unsupported");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const initial = read();
    current.current = initial;
    setReminder(initial);
    const refresh = async () => {
      try {
        const status = await permissionStatus();
        if (active) setPermission(status);
      } catch {
        if (active) setError("تعذّر التحقق من الإشعارات.");
      } finally {
        if (active) setLoaded(true);
      }
    };
    void refresh();
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  const change = useCallback(async (next: Reminder, request = false) => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError(null);
    const previous = current.current;
    try {
      reminderSchema.parse(next);
      if (next.enabled) {
        const status = await permissionStatus(request);
        setPermission(status);
        if (status !== "granted") return false;
      }
      await scheduleNative(next);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch (error) {
        await scheduleNative(previous.enabled ? previous : { ...next, enabled: false });
        throw error;
      }
      current.current = next;
      setReminder(next);
      return true;
    } catch {
      setError("تعذّر حفظ التذكير. حاول مرة أخرى وتحقق من إعدادات الإشعارات.");
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }, []);
  const enable = useCallback(
    (time?: string) => change({ enabled: true, time: time ?? current.current.time }, true),
    [change],
  );
  const disable = useCallback(() => change({ ...current.current, enabled: false }), [change]);
  const setTime = useCallback(
    (time: string) => {
      if (!timeSchema.safeParse(time).success) return;
      void change({ ...current.current, time });
    },
    [change],
  );
  useEffect(() => {
    if (Capacitor.isNativePlatform() || !loaded || !reminder.enabled || permission !== "granted")
      return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const [hour = 20, minute = 0] = reminder.time.split(":").map(Number);
      const now = new Date();
      const target = new Date(now);
      target.setHours(hour, minute, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      timer = setTimeout(() => {
        try {
          new Notification("وقت وردك اليومي", {
            body: "تذكير بقراءة وردك وتسجيل موضعك.",
            tag: "wird-daily",
          });
        } catch {
          /* Browsers may require a service worker. */
        }
        schedule();
      }, target.getTime() - now.getTime());
    };
    schedule();
    return () => clearTimeout(timer);
  }, [loaded, reminder, permission]);
  return { reminder, loaded, permission, enable, disable, setTime, busy, error };
}
