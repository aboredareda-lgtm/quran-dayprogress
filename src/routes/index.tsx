import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SURAHS, getSurah, getJuz } from "@/lib/surahs";
import { useReadingLog } from "@/hooks/useReadingLog";
import { Ornament, OrnamentDivider } from "@/components/Ornament";
import { WirdHeader } from "@/components/WirdHeader";


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
  const { last, daysTracked, entries, loaded, addEntry } = useReadingLog();
  const [editing, setEditing] = useState(false);
  const [surah, setSurah] = useState(1);
  const [ayah, setAyah] = useState(1);
  const [saved, setSaved] = useState(false);

  const ayahCount = useMemo(() => getSurah(surah).ayahs, [surah]);

  const openEditor = () => {
    setSurah(last?.surah ?? 1);
    setAyah(last?.ayah ?? 1);
    setSaved(false);
    setEditing(true);
  };

  const save = () => {
    addEntry(surah, Math.min(Math.max(ayah, 1), getSurah(surah).ayahs));
    setEditing(false);
    setSaved(true);
  };

  return (
    <main className="pattern-cream screen-fill mx-auto w-full max-w-[26rem] overflow-x-hidden">
      <WirdHeader />


      <section className="relative z-10 -mt-14 px-4">
        <div className="shadow-soft pattern-cream rounded-[2rem] border-2 border-gold/45 p-6 text-center text-card-foreground">
          <OrnamentDivider />

          <p className="mt-4 text-base font-bold text-primary">آخر ما وصلت إليه</p>

          {!loaded ? (
            <div className="mt-4 h-16 animate-pulse rounded-2xl bg-muted" />
          ) : last ? (
            <>
              <p className="font-display mt-4 text-4xl font-bold leading-tight text-primary">
                سورة {getSurah(last.surah).name}
              </p>
              <p className="mt-3 text-2xl font-bold">
                الآية {last.ayah}
                <span className="mr-2 text-base font-medium text-muted-foreground">
                  من {getSurah(last.surah).ayahs}
                </span>
              </p>
              <p className="mt-4 inline-block rounded-full border-2 border-gold/60 bg-secondary px-7 py-2.5 text-3xl font-bold text-secondary-foreground">
                الجزء {getJuz(last.surah, last.ayah)}
              </p>

              <p className="mt-4 text-xs text-muted-foreground">{formatDate(last.at)}</p>
            </>
          ) : (
            <p className="mt-4 text-xl font-medium leading-relaxed">
              لم تسجّل موضعك بعد — ابدأ الآن وسجّل أول موضع.
            </p>
          )}

          {saved && (
            <p className="mt-4 rounded-xl border border-gold/40 bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              تم حفظ الموضع، بارك الله فيك.
            </p>
          )}

          <button
            onClick={openEditor}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border-2 border-gold/60 bg-primary px-5 py-4 text-lg font-bold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <Ornament className="h-6 w-6 text-gold-soft" />
            تحديث الموضع
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {[
            { value: daysTracked, label: "أيام المتابعة" },
            { value: entries.length, label: "مرات التسجيل" },
          ].map((s) => (
            <div
              key={s.label}
              className="pattern-cream rounded-3xl border border-gold/40 p-4 text-center"
            >
              <Ornament className="mx-auto h-5 w-5 text-gold" />
              <div className="mx-auto mt-2 h-px w-16 bg-gold/40" />
              <p className="mt-2 text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Link
          to="/history"
          className="pattern-cream mt-4 flex items-center justify-between rounded-3xl border border-gold/40 px-5 py-4 font-bold text-primary"
        >
          <span className="flex items-center gap-3">
            <Ornament className="h-6 w-6 text-gold" />
            <span className="h-6 w-px bg-gold/40" />
            سجل القراءة
          </span>
          <span aria-hidden className="text-primary">
            ←
          </span>
        </Link>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-6 text-muted-foreground">
          <Ornament className="h-4 w-4 shrink-0 text-gold" />
          بياناتك محفوظة على هذا الجهاز فقط، فلا تتداخل مع قراءة أي شخص آخر.
        </p>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end bg-foreground/50 px-4 pb-4">
          <div className="pattern-cream w-full rounded-[2rem] border-2 border-gold/50 p-6 text-card-foreground">
            <OrnamentDivider />
            <h2 className="mt-3 text-center text-lg font-bold text-primary">تحديث الموضع</h2>

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

            <label
              className="mt-5 block text-center text-xl font-bold text-primary"
              htmlFor="ayah"
            >
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
          </div>
        </div>
      )}
    </main>
  );
}
