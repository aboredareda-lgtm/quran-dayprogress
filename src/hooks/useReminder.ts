import { useCallback, useEffect, useState } from "react";

const KEY = "wird:reminder";

export type Reminder = {
  enabled: boolean;
  /** وقت التذكير بصيغة HH:MM */
  time: string;
};

const DEFAULT: Reminder = { enabled: false, time: "20:00" };

function read(): Reminder {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Reminder>;
    return {
      enabled: Boolean(parsed.enabled),
      time: typeof parsed.time === "string" ? parsed.time : DEFAULT.time,
    };
  } catch {
    return DEFAULT;
  }
}

function msUntil(time: string): number {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(h || 0, m || 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

export function useReminder() {
  const [reminder, setReminder] = useState<Reminder>(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "unsupported",
  );

  useEffect(() => {
    setReminder(read());
    setLoaded(true);
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
  }, []);

  const persist = useCallback((next: Reminder) => {
    setReminder(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* تجاهل */
    }
  }, []);

  const enable = useCallback(
    async (time?: string) => {
      if (typeof Notification === "undefined") return false;
      let perm = Notification.permission;
      if (perm === "default") perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;
      persist({ enabled: true, time: time ?? reminder.time });
      return true;
    },
    [persist, reminder.time],
  );

  const disable = useCallback(() => {
    persist({ ...reminder, enabled: false });
  }, [persist, reminder]);

  const setTime = useCallback(
    (time: string) => {
      persist({ ...reminder, time });
    },
    [persist, reminder],
  );

  // جدولة التذكير أثناء فتح التطبيق
  useEffect(() => {
    if (!loaded || !reminder.enabled || permission !== "granted") return;
    if (typeof Notification === "undefined") return;

    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(() => {
        try {
          new Notification("وقت وردك اليومي 🌙", {
            body: "لا تنسَ قراءة وردك من القرآن الكريم وتسجيل موضعك.",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: "wird-daily",
          });
        } catch {
          /* تجاهل */
        }
        schedule();
      }, msUntil(reminder.time));
    };

    schedule();
    return () => clearTimeout(timer);
  }, [loaded, reminder.enabled, reminder.time, permission]);

  return { reminder, loaded, permission, enable, disable, setTime };
}
