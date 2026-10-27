import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, RotateCcw, Sun, Moon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { OrnamentDivider } from "@/components/Ornament";
import { Button } from "@/components/ui/button";
import { getAdhkar, getDhikrCounterPeriod, incrementDhikr, type AdhkarPeriod } from "@/lib/adhkar";

export const Route = createFileRoute("/adhkar")({
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
  const [period, setPeriod] = useState<AdhkarPeriod>("morning");
  const [counts, setCounts] = useState<Record<AdhkarPeriod | "daily", Record<string, number>>>({ morning: {}, evening: {}, daily: {} });
  const adhkar = getAdhkar(period);

  return (
    <main className="pattern-cream min-h-dvh pb-[max(2rem,env(safe-area-inset-bottom))]" dir="rtl">
      <PageHeader title="أذكار الصباح والمساء" />
      <div className="mx-auto max-w-lg px-4">
        <div className="my-4 grid grid-cols-2 gap-2" role="group" aria-label="وقت الأذكار">
          {(["morning", "evening"] as const).map((value) => (
            <Button key={value} onClick={() => setPeriod(value)} aria-pressed={period === value} variant={period === value ? "default" : "secondary"} className="h-12 rounded-full border border-gold font-display text-xl">
              {value === "morning" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
              {value === "morning" ? "أذكار الصباح" : "أذكار المساء"}
            </Button>
          ))}
        </div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-primary">{toAr(adhkar.length)} أذكار {period === "morning" ? "للصباح" : "للمساء"}</h2>
          <Button variant="ghost" size="icon" title="إعادة عدادات الفترة الحالية" aria-label="إعادة عدادات الفترة الحالية" onClick={() => {
            if (window.confirm("هل تريد إعادة عدادات هذه الفترة وعداد الاستغفار اليومي إلى الصفر؟")) {
              setCounts((previous) => ({ ...previous, [period]: {}, daily: {} }));
            }
          }}><RotateCcw /></Button>
        </div>
        <div className="space-y-5">
          {adhkar.map((dhikr) => {
            const counterPeriod = getDhikrCounterPeriod(dhikr, period);
            const count = counts[counterPeriod][dhikr.id] ?? 0;
            const completed = count >= dhikr.repetitions;
            return (
              <article key={dhikr.id} className="islamic-card p-5">
                <h3 className="text-center font-display text-3xl font-bold text-primary">{dhikr.title}</h3>
                <OrnamentDivider className="mx-auto my-2 max-w-40" />
                <p className="whitespace-pre-line font-display text-2xl leading-[2] text-foreground">{dhikr.text}</p>
                {dhikr.note && <p className="mt-3 text-sm leading-7 text-muted-foreground">{dhikr.note}</p>}
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <a href={dhikr.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground underline decoration-gold underline-offset-4">المصدر: {dhikr.source}</a>
                  <div className="text-center">
                    <Button disabled={completed} aria-label={`تكرار ${dhikr.title}`} onClick={() => setCounts((previous) => ({ ...previous, [counterPeriod]: { ...previous[counterPeriod], [dhikr.id]: incrementDhikr(previous[counterPeriod][dhikr.id] ?? 0, dhikr.repetitions) } }))} className="btn-emboss h-12 min-w-28 rounded-full text-lg text-primary" variant="secondary">
                      {completed && <Check aria-hidden="true" />}
                      <span aria-live="polite" aria-atomic="true"><bdi>{toAr(count)} / {toAr(dhikr.repetitions)}</bdi></span>
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">{completed ? "اكتمل الذكر" : dhikr.repetitionLabel}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <footer className="mt-7 text-center text-xs leading-7 text-muted-foreground">
          <OrnamentDivider />
          <p>المصدر: حصن المسلم — سعيد بن علي بن وهف القحطاني</p>
          <div className="flex flex-wrap justify-center gap-x-4">
            {adhkar.map((dhikr) => <a key={dhikr.id} href={dhikr.hisnUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-4">{dhikr.title} في حصن المسلم</a>)}
          </div>
        </footer>
      </div>
    </main>
  );
}