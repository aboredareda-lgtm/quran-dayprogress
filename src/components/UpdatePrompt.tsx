import { useEffect, useState } from "react";
import { isNewerVersion, isSnoozed, UPDATE_SNOOZE_KEY } from "@/lib/app-update";

const BUNDLE_ID = "com.aboreda.wird";

type StoreInfo = { version: string; url: string };

export function UpdatePrompt() {
  const [info, setInfo] = useState<StoreInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") return;
        const { App } = await import("@capacitor/app");
        const { version: installed } = await App.getInfo();
        const res = await fetch(
          `https://itunes.apple.com/lookup?bundleId=${BUNDLE_ID}&country=sa&t=${Date.now()}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          results?: { version?: string; trackViewUrl?: string }[];
        };
        const r = data.results?.[0];
        if (!r?.version || !r.trackViewUrl) return;
        if (!isNewerVersion(r.version, installed)) return;
        if (isSnoozed(localStorage.getItem(UPDATE_SNOOZE_KEY), r.version, Date.now())) return;
        if (!cancelled) setInfo({ version: r.version, url: r.trackViewUrl });
      } catch {
        // Offline or unavailable: stay silent, the app works normally.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!info) return null;

  const later = () => {
    localStorage.setItem(
      UPDATE_SNOOZE_KEY,
      JSON.stringify({ version: info.version, at: Date.now() }),
    );
    setInfo(null);
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 p-6"
    >
      <div className="w-full max-w-sm rounded-3xl border-2 border-accent bg-primary p-6 text-center text-primary-foreground shadow-2xl">
        <div className="mb-2 text-4xl">✨</div>
        <h2 className="mb-2 text-xl font-bold text-accent">يتوفر تحديث جديد</h2>
        <p className="mb-5 text-sm leading-7 opacity-90">
          نزلت نسخة جديدة من تطبيق الورد اليومي ({info.version})، حدّثه للحصول على آخر
          التحسينات.
        </p>
        <a
          href={info.url}
          onClick={() => setInfo(null)}
          className="mb-3 block rounded-2xl bg-accent px-4 py-3 font-bold text-accent-foreground shadow-lg"
        >
          تحديث الآن
        </a>
        <button
          type="button"
          onClick={later}
          className="w-full rounded-2xl border border-accent/60 px-4 py-2.5 text-sm"
        >
          لاحقًا
        </button>
      </div>
    </div>
  );
}
