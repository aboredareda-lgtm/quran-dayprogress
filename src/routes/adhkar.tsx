import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Home, RotateCcw, Sun, Moon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { OrnamentDivider } from "@/components/Ornament";
import { Button } from "@/components/ui/button";
import { getAdhkar, getDhikrCounterPeriod, incrementDhikr, type AdhkarPeriod } from "@/lib/adhkar";
import { nextAdhkarPage, nextManualAdhkarPage } from "@/lib/adhkar-book";

export const Route = createFileRoute("/adhkar")({
  validateSearch: (search: Record<string, unknown>): { period?: "morning" | "evening" } => search["period"] === "morning" || search["period"] === "evening" ? { period: search["period"] } : {},
  head: () => ({ meta: [
    { title: "أذكار الصباح والمساء — الوِرد اليومي" },
    { name: "description", content: "كامل أذكار باب الصباح والمساء من حصن المسلم بنصوص كاملة ومراجعها وعدادات التكرار." },
    { property: "og:title", content: "أذكار الصباح والمساء — الوِرد اليومي" },
    { property: "og:description", content: "كامل أذكار باب الصباح والمساء من حصن المسلم، مع صيغ كل فترة والتكرارات والمراجع." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Adhkar,
});

const toAr = (value: number) => value.toLocaleString("ar-EG");

function Adhkar() {
  const search = Route.useSearch();
  const [period, setPeriod] = useState<AdhkarPeriod>(search.period ?? "morning");
  const [counts, setCounts] = useState<Record<AdhkarPeriod | "daily", Record<string, number>>>({ morning: {}, evening: {}, daily: {} });
  const [pages, setPages] = useState<Record<AdhkarPeriod, number>>({ morning: 0, evening: 0 });
  const [turning, setTurning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const book = useRef<HTMLDivElement | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const adhkar = getAdhkar(period);
  const page = pages[period];
  const dhikr = adhkar[page];
  const counterPeriod = dhikr ? getDhikrCounterPeriod(dhikr, period) : period;
  const count = dhikr ? counts[counterPeriod][dhikr.id] ?? 0 : 0;
  const completed = dhikr ? count >= dhikr.repetitions : true;
  const allCompleted = adhkar.every(item => (counts[getDhikrCounterPeriod(item, period)][item.id] ?? 0) >= item.repetitions);

  const turnPage = (target: number) => {
    if (turning) return;
    setTurning(true);
    timer.current = setTimeout(() => {
      setPages(previous => ({ ...previous, [period]: target }));
      setTurning(false);
      timer.current = null;
      book.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700);
  };

  const increment = () => {
    if (!dhikr || turning || completed) return;
    const updated = incrementDhikr(count, dhikr.repetitions);
    setCounts(previous => ({ ...previous, [counterPeriod]: { ...previous[counterPeriod], [dhikr.id]: updated } }));
    const next = nextAdhkarPage(page, adhkar.length, updated, dhikr.repetitions);
    if (next !== page) turnPage(next);
  };

  return (
    <main className="pattern-cream min-h-dvh pb-[max(2rem,env(safe-area-inset-bottom))]" dir="rtl">
      <PageHeader title="أذكار الصباح والمساء" />
      <div className="mx-auto max-w-lg px-4">
        <div className="my-4 grid grid-cols-2 gap-2" role="group" aria-label="وقت الأذكار">
          {(["morning", "evening"] as const).map((value) => (
            <Button key={value} disabled={turning} onClick={() => setPeriod(value)} aria-pressed={period === value} variant={period === value ? "default" : "secondary"} className="h-12 rounded-full border border-gold font-display text-xl">
              {value === "morning" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
              {value === "morning" ? "أذكار الصباح" : "أذكار المساء"}
            </Button>
          ))}
        </div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-primary">{toAr(adhkar.length)} أذكار {period === "morning" ? "للصباح" : "للمساء"}</h2>
          <Button disabled={turning} variant="ghost" size="icon" title="إعادة عدادات الفترة الحالية" aria-label="إعادة عدادات الفترة الحالية" onClick={() => {
            if (window.confirm("هل تريد إعادة عدادات هذه الفترة وعداد الاستغفار اليومي إلى الصفر؟")) {
              setCounts((previous) => ({ ...previous, [period]: {}, daily: {} }));
              setPages(previous => ({ ...previous, [period]: 0 }));
            }
          }}><RotateCcw /></Button>
        </div>
        <div ref={book} className="adhkar-book" aria-busy={turning}>
          <article key={`${period}-${page}`} className={`adhkar-book-page ${turning ? "is-turning-right" : ""}`}>
            <div className="adhkar-book-ornament" aria-hidden="true">۞</div>
            {dhikr ? <>
                <h3 className="text-center font-display text-3xl font-bold text-primary">{dhikr.title}</h3>
                <OrnamentDivider className="mx-auto my-2 max-w-40" />
                <p className="adhkar-book-text whitespace-pre-line font-display text-2xl leading-[2] text-foreground">{dhikr.text}</p>
                {dhikr.note && <p className="mt-3 text-sm leading-7 text-muted-foreground">{dhikr.note}</p>}
                <div className="mt-6 flex flex-col items-center gap-4">
                  <div className="text-center">
                    <Button disabled={completed || turning} aria-label={`تكرار ${dhikr.title}`} onClick={increment} className="adhkar-book-counter" >
                      {completed && <Check aria-hidden="true" />}
                      <span aria-live="polite" aria-atomic="true"><bdi>{toAr(count)} / {toAr(dhikr.repetitions)}</bdi></span>
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">{completed ? "اكتمل الذكر" : dhikr.repetitionLabel}</p>
                  </div>
                  <p className="text-center text-xs leading-6 text-muted-foreground">المصدر: {dhikr.source}</p>
                </div>
              </> : <div className="adhkar-book-finished">
                <span className="adhkar-book-check"><Check aria-hidden="true" /></span>
                 <h3 className="font-display text-3xl font-bold text-primary">{allCompleted ? "أتممت أذكار" : "نهاية أذكار"} {period === "morning" ? "الصباح" : "المساء"}</h3>
                <OrnamentDivider />
                <Button asChild className="h-14 w-full whitespace-normal border border-gold text-sm font-bold"><Link to="/"><Home />العودة للصفحة الرئيسية</Link></Button>
              </div>}
              <nav className="adhkar-book-navigation" aria-label="صفحات الأذكار">
                <Button variant="ghost" size="icon" aria-label="الذكر السابق" title="الذكر السابق" disabled={page === 0 || turning} onClick={() => setPages(previous => ({ ...previous, [period]: Math.max(0, page - 1) }))}><ChevronRight /></Button>
                 <span aria-live="polite">{dhikr ? `${toAr(page + 1)} / ${toAr(adhkar.length)}` : allCompleted ? "اكتملت الأذكار" : "نهاية الصفحات"}</span>
                 <Button variant="ghost" size="icon" aria-label="الذكر التالي" title="الذكر التالي" disabled={!dhikr || turning} onClick={() => turnPage(nextManualAdhkarPage(page, adhkar.length))}><ChevronLeft /></Button>
              </nav>
          </article>
        </div>
        <footer className="mt-7 text-center text-xs leading-7 text-muted-foreground">
          <OrnamentDivider />
          <p>المصدر: حصن المسلم — سعيد بن علي بن وهف القحطاني</p>
        </footer>
      </div>
    </main>
  );
}