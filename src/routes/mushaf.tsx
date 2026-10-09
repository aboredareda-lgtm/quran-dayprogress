import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SURAHS, getSurah } from "@/lib/surahs";
import { useReadingLog } from "@/hooks/useReadingLog";

export const Route = createFileRoute("/mushaf")({
  validateSearch: (s: Record<string, unknown>): { s?: number | undefined; a?: number | undefined } => ({
    s: Math.min(114, Math.max(1, Number(s["s"]) || 0)) || undefined,
    a: Number(s["a"]) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "المصحف — الوِرد اليومي" },
      { name: "description", content: "اقرأ القرآن الكريم بالخط العثماني مع حركة تلقائية بطيئة." },
      { property: "og:title", content: "المصحف — الوِرد اليومي" },
      { property: "og:description", content: "مصحف بالخط العثماني يعمل بدون إنترنت." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap" },
    ],
  }),
  component: Mushaf,
});

let cache: string[][] | null = null;
const toAr = (n: number) => n.toLocaleString("ar-EG");

function Mushaf() {
  const search = Route.useSearch();
  const { last, loaded, addEntry } = useReadingLog();
  const [quran, setQuran] = useState<string[][] | null>(cache);
  const [surah, setSurah] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [size, setSize] = useState(26);
  const [speed, setSpeed] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const wake = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!cache) fetch("/quran.json").then((r) => r.json()).then((d) => { cache = d; setQuran(d); });
    try {
      setSize(Number(localStorage.getItem("wird:mushaf-size")) || 26);
      setSpeed(Number(localStorage.getItem("wird:mushaf-speed")) || 3);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    if (!loaded || surah !== null) return;
    const s = search.s ?? last?.surah ?? 1;
    setSurah(s);
    setTarget(search.s ? (search.a ?? 1) : (last?.ayah ?? 1));
  }, [loaded, last, search, surah]);

  useEffect(() => {
    if (!quran || target === null) return;
    const el = document.getElementById(`ayah-${target}`);
    const box = scroller.current;
    if (el && box) box.scrollTop = el.offsetTop - 80;
    setTarget(null);
  }, [quran, target, surah]);

  useEffect(() => { try { localStorage.setItem("wird:mushaf-size", String(size)); } catch { /* */ } }, [size]);
  useEffect(() => { try { localStorage.setItem("wird:mushaf-speed", String(speed)); } catch { /* */ } }, [speed]);

  // الحركة التلقائية
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let prev = performance.now();
    let acc = 0;
    const step = (t: number) => {
      const box = scroller.current;
      if (!box) return;
      acc += ((t - prev) / 1000) * speed * 10;
      prev = t;
      if (acc >= 1) {
        const px = Math.floor(acc);
        acc -= px;
        box.scrollTop += px;
      }
      if (box.scrollTop + box.clientHeight >= box.scrollHeight - 2) {
        setPlaying(false);
        setAtEnd(true);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request("screen").then((w) => { wake.current = w; }).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      wake.current?.release().catch(() => {});
      wake.current = null;
    };
  }, [playing, speed]);

  const goSurah = (n: number) => {
    setPlaying(false);
    setAtEnd(false);
    setSelected(null);
    setSurah(n);
    setTarget(null);
    if (scroller.current) scroller.current.scrollTop = 0;
  };

  const save = () => {
    if (surah === null || selected === null) return;
    addEntry(surah, selected, "من المصحف");
    setSelected(null);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const ayahs = quran && surah ? quran[surah - 1] : null;
  const btn = "rounded-full border border-gold/50 bg-card px-3 py-1.5 text-sm font-bold text-primary";

  return (
    <div className="fixed inset-0 flex flex-col bg-background" dir="rtl">
      <div className="z-10 flex flex-col gap-2 border-b border-gold/40 bg-card/95 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <Link to="/" className={btn}>رجوع</Link>
          <select
            value={surah ?? 1}
            onChange={(e) => goSurah(Number(e.target.value))}
            className="min-w-0 flex-1 rounded-full border border-gold/50 bg-background px-3 py-1.5 text-sm font-bold text-primary"
          >
            {SURAHS.map((s) => (
              <option key={s.number} value={s.number}>{toAr(s.number)}. {s.name}</option>
            ))}
          </select>
          <button className={btn} onClick={() => setSize((v) => Math.min(44, v + 2))} aria-label="تكبير الخط">أ+</button>
          <button className={btn} onClick={() => setSize((v) => Math.max(18, v - 2))} aria-label="تصغير الخط">أ−</button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button className={btn} onClick={() => setSpeed((v) => Math.max(1, v - 1))}>أبطأ</button>
          <button
            onClick={() => { setAtEnd(false); setPlaying((p) => !p); }}
            className="btn-turquoise-3d rounded-full px-5 py-1.5 text-sm font-bold"
          >
            {playing ? "⏸ إيقاف الحركة" : "▶ تشغيل الحركة"}
          </button>
          <button className={btn} onClick={() => setSpeed((v) => Math.min(10, v + 1))}>أسرع</button>
          <span className="text-xs text-muted-foreground">السرعة {toAr(speed)}</span>
        </div>
      </div>

      <div
        ref={scroller}
        onTouchStart={() => setPlaying(false)}
        onWheel={() => setPlaying(false)}
        className="flex-1 overflow-y-auto px-4 pb-32 pt-4"
      >
        {!ayahs ? (
          <p className="mt-10 text-center text-muted-foreground">جارٍ تحميل المصحف…</p>
        ) : (
          <div className="mx-auto max-w-2xl rounded-3xl border-2 border-gold/50 bg-card p-4 shadow-sm">
            <h1 className="mb-2 rounded-2xl border border-gold/50 bg-secondary py-2 text-center text-xl font-bold text-primary">
              سورة {getSurah(surah!).name}
            </h1>
            {surah !== 1 && surah !== 9 && (
              <p className="mb-3 text-center text-primary" style={{ fontFamily: "'Amiri Quran', serif", fontSize: size }}>
                بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            )}
            <p className="text-justify text-foreground" style={{ fontFamily: "'Amiri Quran', serif", fontSize: size, lineHeight: 2.3 }}>
              {ayahs.map((t, i) => (
                <span
                  key={i}
                  id={`ayah-${i + 1}`}
                  onClick={() => setSelected(i + 1)}
                  className={`cursor-pointer rounded-md ${selected === i + 1 ? "bg-gold/30" : ""}`}
                >
                  {t} <span className="text-gold">﴿{toAr(i + 1)}﴾</span>{" "}
                </span>
              ))}
            </p>
            {(
              <div className="mt-6 flex justify-between gap-2">
                {surah! > 1 ? <button className={btn} onClick={() => goSurah(surah! - 1)}>السورة السابقة</button> : <span />}
                {surah! < 114 && <button className={btn} onClick={() => goSurah(surah! + 1)}>{atEnd ? "◀ " : ""}السورة التالية</button>}
              </div>
            )}
          </div>
        )}
      </div>

      {(selected !== null || savedMsg) && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center gap-2 border-t border-gold/40 bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {savedMsg ? (
            <p className="font-bold text-primary">تم حفظ الموضع، بارك الله فيك.</p>
          ) : (
            <>
              <button onClick={save} className="btn-turquoise-3d rounded-full px-5 py-2 font-bold">
                حفظ هذا الموضع (آية {toAr(selected!)})
              </button>
              <button className={btn} onClick={() => setSelected(null)}>إلغاء</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
