import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SURAHS, getSurah } from "@/lib/surahs";
import { useReadingLog } from "@/hooks/useReadingLog";
import { useFavorites } from "@/hooks/useLocalList";
import { normalizeArabic } from "@/lib/worship";

const tafsirCache = new Map<number, Map<number, string>>();
async function loadTafsir(surah: number): Promise<Map<number, string>> {
  const hit = tafsirCache.get(surah);
  if (hit) return hit;
  const key = `wird:tafsir-${surah}`;
  let list: { ayah: number; text: string }[] | null = null;
  try { list = JSON.parse(localStorage.getItem(key) || "null"); } catch { /* */ }
  if (!list) {
    const res = await fetch(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-muyassar/${surah}.json`);
    if (!res.ok) throw new Error("tafsir");
    const raw = (await res.json()) as { ayah: number; text: string }[];
    list = raw.map((x) => ({ ayah: x.ayah, text: x.text }));
    try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* */ }
  }
  const map = new Map<number, string>();
  for (const x of list) if (!map.has(x.ayah)) map.set(x.ayah, x.text);
  tafsirCache.set(surah, map);
  return map;
}

export const Route = createFileRoute("/mushaf")({
  validateSearch: (s: Record<string, unknown>): { s?: number | undefined; a?: number | undefined } => ({
    s: Number(s["s"]) >= 1 && Number(s["s"]) <= 114 ? Number(s["s"]) : undefined,
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
  const { isFav, toggle } = useFavorites();
  const [tafsir, setTafsir] = useState<{ ayah: number; text: string | null; error?: boolean } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
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

  const save = (n: number) => {
    if (surah === null) return;
    addEntry(surah, n, "من المصحف");
    setSelected(n);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const openTafsir = (n: number) => {
    if (surah === null) return;
    setPlaying(false);
    setTafsir({ ayah: n, text: null });
    const s = surah;
    loadTafsir(s)
      .then((m) => setTafsir({ ayah: n, text: m.get(n) ?? "لا يوجد تفسير لهذه الآية." }))
      .catch(() => setTafsir({ ayah: n, text: null, error: true }));
  };

  const q = normalizeArabic(query);
  const results: { s: number; a: number; t: string }[] = [];
  if (quran && q.length >= 2) {
    outer: for (let si = 0; si < quran.length; si++) {
      const sur = quran[si]!;
      for (let ai = 0; ai < sur.length; ai++) {
        if (normalizeArabic(sur[ai]!).includes(q)) {
          results.push({ s: si + 1, a: ai + 1, t: sur[ai]! });
          if (results.length >= 100) break outer;
        }
      }
    }
  }

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
          <button className={btn} onClick={() => { setPlaying(false); setSearchOpen(true); }} aria-label="البحث في القرآن">🔍</button>
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
                  onClick={() => save(i + 1)}
                  className={`cursor-pointer rounded-md ${selected === i + 1 ? "bg-gold/30" : ""}`}
                >
                  {t} <span className="text-gold">﴿{toAr(i + 1)}﴾</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggle(surah!, i + 1); }}
                    aria-label={isFav(surah!, i + 1) ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                    className="mx-0.5 align-middle text-base text-gold"
                    style={{ fontFamily: "system-ui" }}
                  >
                    {isFav(surah!, i + 1) ? "★" : "☆"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openTafsir(i + 1); }}
                    className="mx-0.5 rounded-full border border-gold/50 px-1.5 align-middle text-xs text-primary"
                    style={{ fontFamily: "system-ui", lineHeight: 1.6 }}
                  >
                    تفسير
                  </button>{" "}
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

      {tafsir && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-foreground/50 p-3" onClick={() => setTafsir(null)}>
          <div
            className="max-h-[75dvh] w-full max-w-xl overflow-y-auto rounded-3xl border-2 border-gold/50 bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-center text-lg font-bold text-primary">
              التفسير الميسّر — {getSurah(surah!).name}، الآية {toAr(tafsir.ayah)}
            </h2>
            <p className="mt-3 text-lg leading-loose text-foreground">
              {tafsir.error
                ? "تعذّر تحميل التفسير. تأكد من اتصالك بالإنترنت ثم حاول مرة أخرى."
                : tafsir.text ?? "جارٍ تحميل التفسير…"}
            </p>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              المصدر: التفسير الميسّر — مجمع الملك فهد لطباعة المصحف الشريف
            </p>
            <button onClick={() => setTafsir(null)} className="mt-4 w-full rounded-full border border-border py-2 font-bold">
              إغلاق
            </button>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-30 flex flex-col bg-background pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex gap-2 border-b border-gold/40 px-3 pb-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب كلمة للبحث، مثل: الصبر"
              className="min-w-0 flex-1 rounded-full border border-gold/50 bg-card px-4 py-2 text-base"
            />
            <button className={btn} onClick={() => setSearchOpen(false)}>إغلاق</button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
            {q.length >= 2 && (
              <p className="mb-2 text-center text-xs text-muted-foreground">
                {results.length === 0 ? "لا توجد نتائج" : `${toAr(results.length)}${results.length >= 100 ? "+" : ""} نتيجة`}
              </p>
            )}
            {results.map((r) => (
              <button
                key={`${r.s}-${r.a}`}
                onClick={() => {
                  setSearchOpen(false);
                  setAtEnd(false);
                  setSurah(r.s);
                  setTarget(r.a);
                  setSelected(r.a);
                }}
                className="mb-2 block w-full rounded-2xl border border-gold/40 bg-card p-3 text-right"
              >
                <span className="text-xs font-bold text-primary">سورة {getSurah(r.s).name} — الآية {toAr(r.a)}</span>
                <span className="mt-1 block text-lg leading-loose" style={{ fontFamily: "'Amiri Quran', serif" }}>{r.t}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {savedMsg && selected !== null && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center border-t border-gold/40 bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <p className="font-bold text-primary">
            ✓ حُفظ الموضع: سورة {getSurah(surah!).name}، الآية {toAr(selected)}
          </p>
        </div>
      )}
    </div>
  );
}
