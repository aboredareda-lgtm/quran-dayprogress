import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SURAHS, getSurah, getJuz } from "@/lib/surahs";
import { useReadingLog } from "@/hooks/useReadingLog";
import { useKhatmahs } from "@/hooks/useKhatmahs";
import { Ornament, OrnamentDivider } from "@/components/Ornament";
import { WirdHeader } from "@/components/WirdHeader";
import { ProgressPanel } from "@/components/ProgressPanel";
import { ReminderCard } from "@/components/ReminderCard";
import mushafImg from "@/assets/home-mushaf.webp";

const tiles = [
  { icon: "🕌", label: "أوقات الصلاة", to: "/prayer", bg: "bg-secondary" },
  { icon: "🧭", label: "اتجاه القبلة", to: "/qibla", bg: "bg-muted" },
  { icon: "📋", label: "خطة الختمة", to: "/plan", bg: "bg-secondary" },
  { icon: "❤️", label: "آياتي المفضلة", to: "/favorites", bg: "bg-destructive-soft" },
  { icon: "🏠", label: "صفحة الترحيب", bg: "bg-secondary" },
  { icon: "⚙️", label: "الإعدادات", to: "/settings", bg: "bg-muted" },
  { icon: "🔔", label: "تذكير الورد", bg: "bg-sage" },
  { icon: "📚", label: "سجل القراءة", to: "/history", bg: "bg-muted" },
] as const;


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

  const [editing, setEditing] = useState(false);
  const [surah, setSurah] = useState(1);
  const [ayah, setAyah] = useState(1);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [khatmahSaved, setKhatmahSaved] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const goWelcome = () => {
    try {
      window.sessionStorage.removeItem("wird:welcomed-session");
    } catch {
      /* تجاهل */
    }
    navigate({ to: "/welcome", replace: true });
  };

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
    <main className="pattern-cream mx-auto flex min-h-dvh flex-col overflow-x-hidden sm:max-w-[26rem]">
      <WirdHeader />

      <section className="relative z-10 -mt-5 flex flex-col gap-1.5 px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] min-[380px]:px-4 tall:-mt-8">
        {/* آخر ما وصلت إليه */}
        <div className="shadow-raised relative rounded-[1.75rem] border-2 border-gold/55 bg-card p-3 text-card-foreground">
          <div className="flex gap-2">
            <div className="flex w-[22%] shrink-0 flex-col items-center justify-center">
              <img src={mushafImg} alt="" width={240} height={240} className="w-full" />
            </div>
            <div className="min-w-0 flex-1 text-center">
              <p className="mx-auto w-fit rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-secondary-foreground tall:text-sm">
                📖 آخر ما وصلت إليه
              </p>
              {!loaded ? (
                <div className="mt-2 h-24 animate-pulse rounded-2xl bg-muted" />
              ) : last ? (
                <>
                  <p className="font-display mx-auto mt-1.5 w-fit max-w-full rounded-[2rem] border-2 border-gold/60 bg-card px-4 text-[2.4rem] font-bold leading-tight text-primary shadow-[inset_0_0_0_3px_var(--card),inset_0_0_0_4px_color-mix(in_oklab,var(--gold)_35%,transparent)] tall:text-[2.9rem]">
                    سورة {getSurah(last.surah).name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                    <p className="text-[1.9rem] font-extrabold leading-tight text-primary tall:text-[2.3rem]">
                      الآية {last.ayah}
                      <span className="mr-1 text-[1.1rem] font-bold text-muted-foreground">
                        من {getSurah(last.surah).ayahs}
                      </span>
                    </p>
                    <p className="w-fit rounded-full border-2 border-gold/60 bg-primary px-4 py-0.5 text-[1.4rem] font-bold text-primary-foreground tall:text-[1.6rem]">
                      الجزء {getJuz(last.surah, last.ayah)}
                    </p>
                  </div>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground tall:text-xs">
                    {formatDate(last.at)}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-base font-medium leading-relaxed">
                  لم تسجّل موضعك بعد — ابدأ الآن وسجّل أول موضع.
                </p>
              )}
            </div>
          </div>

          {saved && (
            <p className="mt-2 rounded-xl border border-gold/40 bg-secondary px-3 py-1 text-center text-xs text-secondary-foreground">
              {khatmahSaved
                ? "تمت الختمة، تقبّل الله منك — سُجّلت في عدّاد الختمات."
                : "تم حفظ الموضع، بارك الله فيك."}
            </p>
          )}

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={openEditor}
              className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-gold/60 bg-primary px-2 py-2 text-sm font-bold text-primary-foreground tall:text-base"
            >
              ▶ حدد للمتابعة
            </button>
            <Link
              to="/mushaf"
              className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-primary/50 bg-card px-2 py-2 text-sm font-bold text-primary tall:text-base"
            >
              📖 اقرأ من المصحف
            </Link>
          </div>
        </div>

        {/* الأرقام */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: "📅", value: daysTracked, label: "أيام المتابعة" },
            { icon: "📊", value: entries.length, label: "مرات التسجيل" },
            { icon: "⭐", value: khatmahCount, label: "الخَتمات" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gold/40 bg-card px-1 py-1">
              
              <p className="text-[0.75rem] text-muted-foreground tall:text-sm">
                <span className="ml-1 text-lg font-bold text-primary">{s.value}</span>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {loaded && <ProgressPanel entries={entries} last={last} />}

        {/* الاختصارات */}
        <div className="grid grid-cols-4 gap-1.5">
          {tiles.map((t) => {
            const cls = "flex flex-col items-center justify-center gap-0.5 rounded-xl border border-gold/30 px-0.5 py-1 text-center text-[0.7rem] font-bold leading-tight text-primary tall:text-xs";
            const inner = (
              <>
                <span className="text-base leading-none">{t.icon}</span>
                {t.label}
              </>
            );
            if ("to" in t) {
              return (
                <Link key={t.label} to={t.to} className={`${cls} ${t.bg}`}>
                  {inner}
                </Link>
              );
            }
            return (
              <button
                key={t.label}
                onClick={t.label === "تذكير الورد" ? () => setShowReminder((v) => !v) : goWelcome}
                className={`${cls} ${t.bg}`}
              >
                {inner}
              </button>
            );
          })}
        </div>

        {showReminder && <ReminderCard />}

        <Link
          to="/contact"
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-gold/60 bg-primary px-3 py-2 text-base font-bold text-primary-foreground"
        >
          💬 تواصل مع الإدارة
        </Link>

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
