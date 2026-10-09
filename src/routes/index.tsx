import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SURAHS, getSurah, getJuz } from "@/lib/surahs";
import { useReadingLog } from "@/hooks/useReadingLog";
import { useKhatmahs } from "@/hooks/useKhatmahs";
import { Ornament, OrnamentDivider } from "@/components/Ornament";
import { WirdHeader } from "@/components/WirdHeader";
import { ProgressPanel } from "@/components/ProgressPanel";
import { ReminderCard } from "@/components/ReminderCard";
import { readingStreak } from "@/lib/worship";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الوِرد اليومي — متابعة قراءة القرآن" },
      {
        name: "description",
        content: "سجّل آخر سورة وآية وصلت إليها في قراءتك، والبيانات محفوظة على جوالك وحده.",
      },
      { property: "og:title", content: "الوِرد اليومي — متابعة قراءة القرآن" },
      {
        property: "og:description",
        content: "تطبيق بسيط لمتابعة وردك اليومي من القرآن الكريم.",
      },
    ],
  }),
  component: Index,
});

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}

function Index() {
  const navigate = useNavigate();
  const { last, daysTracked, entries, loaded, addEntry } = useReadingLog();
  const { count: khatmahCount, addKhatmah } = useKhatmahs();

  // عند كل فتح للبرنامج → صفحة الترحيب
  useEffect(() => {
    try {
      if (!window.sessionStorage.getItem("wird:welcomed-session")) {
        navigate({ to: "/welcome", replace: true });
      }
    } catch {
      /* تجاهل */
    }
  }, [navigate]);

  const streak = useMemo(() => readingStreak(entries.map((e) => e.at)), [entries]);
  const [editing, setEditing] = useState(false);
  const [surah, setSurah] = useState(1);
  const [ayah, setAyah] = useState(1);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [khatmahSaved, setKhatmahSaved] = useState(false);

  const ayahCount = useMemo(() => getSurah(surah).ayahs, [surah]);

  const openEditor = () => {
    setSurah(last?.surah ?? 1);
    setAyah(last?.ayah ?? 1);
    setNote("");
    setSaved(false);
    setKhatmahSaved(false);
    setEditing(true);
  };

  const save = () => {
    const safeAyah = Math.min(Math.max(Math.trunc(ayah) || 1, 1), getSurah(surah).ayahs);
    addEntry(surah, safeAyah, note);

    // إتمام المصحف (سورة الناس) → تسجيل ختمة
    const finished = surah === 114 && safeAyah >= getSurah(114).ayahs;
    if (finished) addKhatmah();
    setKhatmahSaved(finished);

    setEditing(false);
    setSaved(true);
  };

  const startNewKhatmah = () => {
    if (!window.confirm("هل تريد بدء ختمة جديدة من سورة الفاتحة؟ سيبقى سجلك السابق محفوظًا.")) return;
    addEntry(1, 1, "بداية ختمة جديدة");
    setKhatmahSaved(false);
    setEditing(false);
    setSaved(true);
  };

  return (
    <main className="pattern-cream screen-fill mx-auto flex flex-col overflow-x-hidden sm:max-w-[26rem] min-[700px]:max-w-none!">
      <WirdHeader />

      <section className="relative z-10 -mt-7 flex min-h-0 flex-1 flex-col justify-between px-3 pb-2 min-[380px]:px-4 tall:-mt-8 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-5xl min-[700px]:gap-5 min-[700px]:px-8 min-[700px]:pb-12">
        <div className="shadow-raised pattern-cream relative translate-y-0 rounded-[1.75rem] border-2 border-gold/55 px-3 py-2 text-center text-card-foreground transition-transform tall:rounded-[2rem] tall:p-3 min-[700px]:mx-auto min-[700px]:flex min-[700px]:min-h-52 min-[700px]:w-full min-[700px]:flex-col min-[700px]:justify-center min-[700px]:p-6">
          {["top-1.5 right-1.5","top-1.5 left-1.5","bottom-1.5 right-1.5","bottom-1.5 left-1.5"].map((pos) => (
            <Ornament key={pos} className={`pointer-events-none absolute ${pos} h-4 w-4 text-gold/70 tall:h-5 tall:w-5`} />
          ))}
          <OrnamentDivider />

          {loaded && streak > 0 && (
            <p className="mx-auto mt-0.5 w-fit rounded-full border border-gold/50 bg-secondary px-3 text-[0.7rem] font-bold text-primary tall:text-xs">
              📖 {streak} {streak === 1 ? "يوم" : streak === 2 ? "يومان" : streak <= 10 ? "أيام" : "يومًا"} متتالية
            </p>
          )}

          <p className="mt-0.5 text-xs font-bold text-muted-foreground tall:mt-1 tall:text-sm">
            آخر ما وصلت إليه
          </p>

          {!loaded ? (
            <div className="mt-2 h-12 animate-pulse rounded-2xl bg-muted" />
          ) : last ? (
            <>
              <p className="font-display mx-auto mt-0.5 w-fit max-w-full rounded-[2rem] border border-gold/60 bg-card px-5 text-[2.1rem] font-bold leading-tight text-primary shadow-[inset_0_0_0_3px_var(--card),inset_0_0_0_4px_color-mix(in_oklab,var(--gold)_35%,transparent)] tall:px-7 tall:text-[2.7rem]">
                سورة {getSurah(last.surah).name}
              </p>
              <p className="text-[1.7rem] font-bold leading-tight text-primary tall:text-[2.1rem]">
                الآية <span className="text-[2.5rem] tall:text-[3.2rem]">{last.ayah}</span>
                <span className="mr-2 text-[1rem] font-medium text-muted-foreground tall:text-lg">
                  من {getSurah(last.surah).ayahs}
                </span>
              </p>
              <OrnamentDivider className="my-0.5" />
              <p className="inline-block rounded-full border-2 border-gold/60 bg-sage px-5 py-0.5 text-[1.1rem] text-primary font-bold text-secondary-foreground tall:px-7 tall:py-1 tall:text-2xl">
                الجزء {getJuz(last.surah, last.ayah)}
              </p>

              <p className="mt-1 text-[0.65rem] text-muted-foreground tall:text-xs">
                {formatDate(last.at)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm font-medium leading-relaxed tall:text-xl">
              لم تسجّل موضعك بعد — ابدأ الآن وسجّل أول موضع.
            </p>
          )}

          {saved && (
            <p className="mt-2 rounded-xl border border-gold/40 bg-secondary px-3 py-1 text-[0.7rem] text-secondary-foreground tall:text-sm">
              {khatmahSaved
                ? "تمت الختمة، تقبّل الله منك — سُجّلت في عدّاد الختمات."
                : "تم حفظ الموضع، بارك الله فيك."}
            </p>
          )}

          <button
            onClick={openEditor}
            className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-gold/60 bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.98] tall:mt-2 tall:gap-3 tall:py-2 tall:text-base"
          >
            <Ornament className="h-4 w-4 text-gold-soft tall:h-6 tall:w-6" />
            حدد للمتابعة
          </button>
          <Link
            to="/mushaf"
            className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary/50 bg-card px-4 py-1.5 text-sm font-bold text-primary tall:mt-2 tall:py-2 tall:text-base"
          >
            📖 اقرأ من المصحف
          </Link>
        </div>

        <div className="contents min-[700px]:grid min-[700px]:min-h-[38dvh] min-[700px]:w-full min-[700px]:grid-cols-2 min-[700px]:grid-rows-[repeat(4,minmax(auto,1fr))] min-[700px]:gap-5">
          <div className="pattern-cream mt-1 grid grid-cols-3 divide-x divide-gold/30 rounded-2xl border border-gold/40 text-center tall:mt-2 tall:rounded-3xl min-[700px]:col-start-2 min-[700px]:row-start-1 min-[700px]:h-full min-[700px]:w-full min-[700px]:items-center min-[700px]:py-3">
            {[
              { value: daysTracked, label: "أيام المتابعة" },
              { value: entries.length, label: "مرات التسجيل" },
              { value: khatmahCount, label: "الخَتمات" },
            ].map((s) => (
              <div key={s.label} className="px-1.5 py-1 tall:py-1.5">
                <p className="text-2xl font-bold text-primary tall:text-3xl">{s.value}</p>
                <p className="text-[0.68rem] text-muted-foreground tall:mt-1 tall:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="contents min-[700px]:col-start-1 min-[700px]:row-span-4 min-[700px]:row-start-1 min-[700px]:block min-[700px]:min-w-0">
            {loaded && <ProgressPanel entries={entries} last={last} />}
          </div>

          <div className="contents min-[700px]:col-start-2 min-[700px]:row-start-2 min-[700px]:block min-[700px]:min-w-0">
            <ReminderCard />
          </div>

          <div className="mt-1 grid grid-cols-3 gap-1 tall:mt-2 tall:gap-2 min-[700px]:col-start-2 min-[700px]:row-start-3 min-[700px]:h-full min-[700px]:mt-0 min-[700px]:gap-3">
            <Link
              to="/more"
              className="pattern-cream flex items-center justify-center gap-1 rounded-2xl border border-gold/40 px-1 py-1 text-[0.8rem] font-bold text-primary tall:rounded-3xl tall:py-2 tall:text-base"
            >
              ✨ المزيد
            </Link>
            <Link
              to="/history"
              className="pattern-cream flex items-center justify-center gap-1.5 rounded-2xl border border-gold/40 px-2 py-1 text-[0.8rem] font-bold text-primary tall:rounded-3xl tall:py-2 tall:text-base"
            >
              <Ornament className="h-4 w-4 text-gold tall:h-5 tall:w-5" />
              سجل القراءة
            </Link>
            <Link
              to="/settings"
              className="pattern-cream flex items-center justify-center gap-1.5 rounded-2xl border border-gold/40 px-2 py-1 text-[0.8rem] font-bold text-primary tall:rounded-3xl tall:py-2 tall:text-base"
            >
              <Ornament className="h-4 w-4 text-gold tall:h-5 tall:w-5" />
              الإعدادات
            </Link>
          </div>

          <Link
            to="/contact"
            className="pattern-cream mt-1 flex items-center justify-center gap-1.5 rounded-2xl border border-gold/40 px-2 py-1 text-[0.8rem] font-bold text-primary tall:mt-2 tall:rounded-3xl tall:py-2 tall:text-base min-[700px]:col-start-2 min-[700px]:row-start-4 min-[700px]:h-full min-[700px]:mt-0 min-[700px]:min-h-14"
          >
            <Ornament className="h-4 w-4 text-gold tall:h-5 tall:w-5" />
            تواصل مع الإدارة
          </Link>
        </div>

        <button
          onClick={() => {
            try {
              window.sessionStorage.removeItem("wird:welcomed-session");
            } catch {
              /* تجاهل */
            }
            navigate({ to: "/welcome", replace: true });
          }}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-destructive/40 bg-destructive-soft px-2 py-1 text-[0.8rem] font-bold text-destructive-soft-foreground tall:mt-2 tall:rounded-3xl tall:py-2 tall:text-base min-[700px]:mx-auto min-[700px]:max-w-lg"
        >
          <Ornament className="h-4 w-4 text-gold tall:h-5 tall:w-5" />
          صفحة الترحيب
        </button>

        <p className="mt-1 flex items-center justify-center gap-2 text-center text-[0.6rem] leading-3.5 text-muted-foreground tall:mt-3 tall:text-xs">
          <Ornament className="h-3.5 w-3.5 shrink-0 text-gold tall:h-4 tall:w-4" />
          بياناتك محفوظة على هذا الجهاز فقط، فلا تتداخل مع قراءة أي شخص آخر.
        </p>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 px-3 pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] min-[380px]:px-4">
          <div className="pattern-cream max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem)] w-full max-w-[26rem] overflow-y-auto rounded-[2rem] border-2 border-gold/50 p-5 text-card-foreground min-[380px]:p-6 min-[700px]:max-w-xl">
            <OrnamentDivider />
            <h2 className="mt-3 text-center text-lg font-bold text-primary">حدد للمتابعة</h2>

            <label
              className="mt-5 block text-center text-xl font-bold text-primary"
              htmlFor="surah"
            >
              السورة
            </label>
            <select
              id="surah"
              value={surah}
              onChange={(e) => {
                const next = Number(e.target.value);
                setSurah(next);
                setAyah((a) => Math.min(a, getSurah(next).ayahs));
              }}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-4 text-center text-2xl font-bold text-primary"
            >
              {SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-center text-xl font-bold text-primary" htmlFor="ayah">
              رقم الآية (1 - {ayahCount})
            </label>
            <input
              id="ayah"
              type="number"
              min={1}
              max={ayahCount}
              value={ayah}
              onChange={(e) => setAyah(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-4 text-center text-2xl font-bold text-primary"
            />

            <label className="mt-4 block text-center text-lg font-bold text-primary" htmlFor="note">
              ملاحظة (اختياري)
            </label>
            <input
              id="note"
              type="text"
              maxLength={120}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب ملاحظة"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-base"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={save}
                className="flex-1 rounded-full border-2 border-gold/60 bg-primary px-4 py-3 font-bold text-primary-foreground"
              >
                حفظ
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-full border border-border px-6 py-3 font-medium"
              >
                إلغاء
              </button>
            </div>

            <div className="mt-5 border-t border-gold/30 pt-4">
              <button
                onClick={startNewKhatmah}
                className="btn-turquoise-3d w-full rounded-full px-4 py-2.5 text-sm font-bold"
              >
                ابدأ ختمة جديدة
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
