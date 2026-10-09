import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { prayerTimes, type PrayerTimes } from "@/lib/worship";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "أوقات الصلاة — الوِرد اليومي" },
      { name: "description", content: "أوقات الصلاة حسب موقعك على طريقة أم القرى، دون إنترنت." },
      { property: "og:title", content: "أوقات الصلاة — الوِرد اليومي" },
      { property: "og:description", content: "الفجر والظهر والعصر والمغرب والعشاء حسب موقعك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Prayer,
});

const NAMES: [keyof PrayerTimes, string][] = [
  ["fajr", "الفجر"],
  ["sunrise", "الشروق"],
  ["dhuhr", "الظهر"],
  ["asr", "العصر"],
  ["maghrib", "المغرب"],
  ["isha", "العشاء"],
];
const LOC = "wird:prayer-location";
const fmt = (d: Date) => new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "2-digit" }).format(d);

function Prayer() {
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(LOC) || "null");
      if (v && typeof v.lat === "number") setLoc(v);
    } catch {
      /* */
    }
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const locate = () => {
    setError(null);
    if (!navigator.geolocation) return setError("تحديد الموقع غير متاح في هذا الجهاز.");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const v = { lat: p.coords.latitude, lng: p.coords.longitude };
        setLoc(v);
        try {
          localStorage.setItem(LOC, JSON.stringify(v));
        } catch {
          /* */
        }
      },
      () => setError("لم نتمكن من معرفة موقعك. اسمح للبرنامج باستخدام الموقع ثم حاول مرة أخرى."),
      { enableHighAccuracy: false, timeout: 15000 },
    );
  };

  const times = loc ? prayerTimes(now, loc.lat, loc.lng) : null;
  let next: { name: string; at: Date } | null = null;
  if (times && loc) {
    const found = NAMES.find(([k]) => k !== "sunrise" && times[k] > now);
    if (found) next = { name: found[1], at: times[found[0]] };
    else {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      next = { name: "الفجر", at: prayerTimes(tomorrow, loc.lat, loc.lng).fajr };
    }
  }
  const mins = next ? Math.max(0, Math.round((next.at.getTime() - now.getTime()) / 60000)) : 0;

  return (
    <main className="pattern-cream min-h-dvh px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]" dir="rtl">
      <div className="mx-auto max-w-md">
        <Link to="/more" className="inline-block rounded-full border border-gold/50 bg-card px-4 py-1.5 text-sm font-bold text-primary">
          رجوع
        </Link>
        <h1 className="mt-4 text-center text-2xl font-bold text-primary">🕌 أوقات الصلاة</h1>

        {!times ? (
          <div className="mt-6 rounded-3xl border-2 border-gold/50 bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">نحتاج موقعك لحساب الأوقات. يبقى موقعك على جوالك فقط.</p>
            <button onClick={locate} className="btn-turquoise-3d mt-4 w-full rounded-full py-2.5 font-bold">
              حدد موقعي
            </button>
          </div>
        ) : (
          <>
            {next && (
              <div className="mt-5 rounded-3xl border-2 border-gold/60 bg-primary p-4 text-center text-primary-foreground">
                <p className="text-sm">الصلاة القادمة</p>
                <p className="text-2xl font-bold">{next.name} — {fmt(next.at)}</p>
                <p className="mt-1 text-sm">
                  بعد {Math.floor(mins / 60) > 0 ? `${Math.floor(mins / 60)} ساعة و` : ""}{mins % 60} دقيقة
                </p>
              </div>
            )}
            <ul className="mt-4 divide-y divide-gold/30 rounded-3xl border-2 border-gold/50 bg-card">
              {NAMES.map(([k, n]) => (
                <li key={k} className={`flex justify-between px-5 py-3 text-lg ${next?.name === n ? "font-bold text-primary" : ""}`}>
                  <span>{n}</span>
                  <span>{fmt(times[k])}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-center text-xs text-muted-foreground">طريقة أم القرى — الأوقات تقريبية.</p>
            <button onClick={locate} className="mt-3 w-full rounded-full border border-border py-2 text-sm">
              تحديث الموقع
            </button>
          </>
        )}
        {error && <p role="alert" className="mt-3 text-center text-sm text-destructive">{error}</p>}
      </div>
    </main>
  );
}
