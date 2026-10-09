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
          className={`relative aspect-square w-full max-w-[18rem] rounded-full border-4 bg-card shadow-raised transition-colors ${
            isAligned ? "border-primary" : "border-gold/60"
          }`}
        >
          <div className="absolute inset-3 rounded-full border border-gold/40" />
          {["N", "E", "S", "W"].map((d, i) => (
            <span
              key={d}
              className="absolute left-1/2 top-1/2 text-xs font-bold text-muted-foreground"
              style={{
                transform: `rotate(${i * 90 - (heading ?? 0)}deg) translateY(-7.4rem) rotate(${-(i * 90 - (heading ?? 0))}deg) translate(-50%,-50%)`,
              }}
            >
              {["ش", "شر", "ج", "غ"][i]}
            </span>
          ))}
          <div
            className="absolute inset-0 flex items-start justify-center transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="mt-6 flex flex-col items-center">
              <span className="text-4xl">🕋</span>
              <div className="h-24 w-2 rounded-full bg-primary" />
            </div>
          </div>
          <Ornament className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-gold" />
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
