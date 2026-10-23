import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Ornament } from "@/components/Ornament";

export const Route = createFileRoute("/qibla")({
  head: () => ({
    meta: [
      { title: "اتجاه القبلة — الوِرد اليومي" },
      { name: "description", content: "بوصلة تحدد اتجاه الكعبة المشرفة من موقعك، دون إنترنت." },
      { property: "og:title", content: "اتجاه القبلة — الوِرد اليومي" },
      { property: "og:description", content: "اعرف اتجاه القبلة والمسافة إلى مكة من موقعك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Qibla,
});

const KAABA = { lat: 21.4225, lng: 39.8262 };
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

function qiblaBearing(lat: number, lng: number) {
  const φ1 = rad(lat), φ2 = rad(KAABA.lat), Δλ = rad(KAABA.lng - lng);
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}
function distanceKm(lat: number, lng: number) {
  const φ1 = rad(lat), φ2 = rad(KAABA.lat);
  const a = Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(rad(KAABA.lng - lng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type OrientationEvt = DeviceOrientationEvent & { webkitCompassHeading?: number };

function Qibla() {
  const [bearing, setBearing] = useState<number | null>(null);
  const [dist, setDist] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const aligned = useRef(false);

  const start = async () => {
    setError(null);
    setStarted(true);
    // إذن البوصلة (آيفون)
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    if (DOE?.requestPermission) {
      try {
        await DOE.requestPermission();
      } catch {
        /* تجاهل */
      }
    }
    const onOrient = (e: Event) => {
      const ev = e as OrientationEvt;
      let h: number | null = null;
      if (typeof ev.webkitCompassHeading === "number") h = ev.webkitCompassHeading;
      else if (ev.absolute && typeof ev.alpha === "number") h = (360 - ev.alpha) % 360;
      if (h !== null) setHeading(h);
    };
    window.addEventListener("deviceorientationabsolute", onOrient);
    window.addEventListener("deviceorientation", onOrient);

    if (!navigator.geolocation) {
      setError("جهازك لا يدعم تحديد الموقع.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBearing(qiblaBearing(p.coords.latitude, p.coords.longitude));
        setDist(distanceKm(p.coords.latitude, p.coords.longitude));
      },
      () => setError("لم نتمكن من معرفة موقعك. اسمح للبرنامج باستخدام الموقع ثم حاول مرة أخرى."),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  useEffect(() => () => {
    // تنظيف عام عند مغادرة الصفحة
    window.ondeviceorientation = null;
  }, []);

  const rotation = bearing !== null ? bearing - (heading ?? 0) : 0;
  const diff = bearing !== null && heading !== null ? Math.abs(((rotation % 360) + 540) % 360 - 180) : null;
  const isAligned = diff !== null && diff < 5;

  useEffect(() => {
    if (isAligned && !aligned.current) {
      try { navigator.vibrate?.(80); } catch { /* تجاهل */ }
    }
    aligned.current = isAligned;
  }, [isAligned]);

  return (
    <main className="pattern-cream screen-fill mx-auto overflow-x-hidden sm:max-w-[26rem] min-[700px]:max-w-none!">
      <header className="bg-gradient-calm pattern-arch safe-top px-4 pb-8 text-on-emerald min-[380px]:px-5">
        <Link to="/" className="text-sm text-gold-soft">→ عودة للرئيسية</Link>
        <h1 className="font-display mt-3 text-3xl font-bold">اتجاه القبلة</h1>
      </header>

      <section className="mx-auto flex max-w-md flex-col items-center px-4 pt-6 pb-10 text-center">
        <div
          className={`relative aspect-square w-full max-w-[19rem] rounded-full p-3 shadow-raised transition-shadow duration-500 ${
            isAligned ? "ring-4 ring-gold/70 shadow-[0_0_40px_var(--gold)]" : ""
          }`}
          style={{
            background:
              "conic-gradient(from 0deg, var(--gold-soft), var(--gold), var(--gold-soft), var(--gold), var(--gold-soft), var(--gold), var(--gold-soft))",
          }}
        >
          {/* حلقة زخرفية */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-primary/70" aria-hidden>
            {Array.from({ length: 36 }).map((_, i) => (
              <g key={i} transform={`rotate(${i * 10} 100 100)`}>
                <path d="M100 2.5 103.2 6 100 9.5 96.8 6Z" fill="currentColor" />
                <circle cx="100" cy="6" r="0.9" fill="var(--gold-soft)" />
              </g>
            ))}
          </svg>
          <div className="bg-gradient-calm relative h-full w-full overflow-hidden rounded-full border-2 border-gold shadow-[inset_0_4px_18px_oklch(0_0_0/0.5)]">
            {/* القرص: الدرجات والجهات */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full text-gold transition-transform duration-300"
              style={{ transform: `rotate(${-(heading ?? 0)}deg)` }}
              aria-hidden
            >
              <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.6" />
              {Array.from({ length: 72 }).map((_, i) => (
                <line
                  key={i}
                  x1="100" y1="9" x2="100" y2={i % 6 === 0 ? 17 : 13}
                  stroke="currentColor"
                  strokeWidth={i % 6 === 0 ? 1.4 : 0.6}
                  strokeOpacity={i % 6 === 0 ? 1 : 0.6}
                  transform={`rotate(${i * 5} 100 100)`}
                />
              ))}
              {([["ش", 100, 31], ["شر", 169, 100], ["ج", 100, 169], ["غ", 31, 100]] as const).map(([t, x, y]) => (
                <text
                  key={t}
                  x={x} y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="14"
                  fontWeight="700"
                  fill="currentColor"
                  transform={`rotate(${heading ?? 0} ${x} ${y})`}
                >
                  {t}
                </text>
              ))}
            </svg>
            {/* سهم القبلة */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
              aria-hidden
            >
              <path d="M100 58 108 100 100 96 92 100Z" fill="var(--gold)" />
              <path d="M100 58 100 96 92 100Z" fill="var(--gold-soft)" />
              <path d="M100 142 106 100 100 104 94 100Z" fill="var(--gold)" fillOpacity="0.45" />
              {/* الكعبة */}
              <g transform="translate(100 44)">
                <circle r="15" fill="var(--gold)" fillOpacity="0.18" />
                <path d="M-10 -7 0 -11 10 -7 10 8 0 12 -10 8Z" fill="oklch(0.15 0.01 160)" stroke="var(--gold)" strokeWidth="0.8" />
                <path d="M-10 -7 0 -3 10 -7" fill="none" stroke="var(--gold)" strokeWidth="0.6" />
                <path d="M0 -3 0 12" stroke="var(--gold)" strokeWidth="0.4" strokeOpacity="0.6" />
                <path d="M-10 -2 0 2 10 -2" fill="none" stroke="var(--gold)" strokeWidth="1.6" />
              </g>
            </svg>
            <Ornament className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-gold drop-shadow" />
          </div>
        </div>

        {!started ? (
          <button onClick={start} className="btn-turquoise-3d mt-8 w-full rounded-full px-4 py-3 text-base font-bold">
            حدد اتجاه القبلة
          </button>
        ) : (
          <div className="mt-6 w-full space-y-2">
            {isAligned && (
              <p className="rounded-2xl border border-gold/50 bg-secondary px-4 py-2 font-bold text-secondary-foreground">
                ✓ أنت متجه إلى القبلة
              </p>
            )}
            {bearing !== null ? (
              <>
                <p className="text-2xl font-bold text-primary">{Math.round(bearing)}° من الشمال</p>
                {dist !== null && (
                  <p className="text-sm text-muted-foreground">
                    المسافة إلى مكة: {Math.round(dist).toLocaleString("ar")} كم
                  </p>
                )}
                {heading === null && (
                  <p className="text-xs leading-5 text-muted-foreground">
                    لا تتوفر بوصلة على هذا الجهاز، استخدم الدرجة أعلاه مع اتجاه الشمال.
                  </p>
                )}
              </>
            ) : (
              !error && <p className="text-sm text-muted-foreground">جارٍ تحديد موقعك…</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          أدر الجوال حتى تصبح الكعبة في الأعلى. أبعده عن المعادن والمغناطيس لدقة أفضل. موقعك يبقى على جوالك فقط.
        </p>
      </section>
    </main>
  );
}
