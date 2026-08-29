import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SURAHS, getSurah } from "@/lib/surahs";
import { useReadingLog } from "@/hooks/useReadingLog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "وِرد — متابعة قراءة القرآن" },
      {
        name: "description",
        content: "سجّل آخر سورة وآية وصلت إليها في قراءتك، والبيانات محفوظة على جوالك وحده.",
      },
      { property: "og:title", content: "وِرد — متابعة قراءة القرآن" },
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
    <main className="min-h-screen bg-background pb-16">
      <header className="bg-gradient-calm px-5 pb-20 pt-10 text-primary-foreground">
        <p className="text-sm opacity-80">بسم الله الرحمن الرحيم</p>
        <h1 className="font-display mt-2 text-3xl font-bold">وِرد</h1>
        <p className="mt-1 text-sm opacity-85">متابعة قراءتك للقرآن الكريم</p>
      </header>

      <section className="-mt-14 px-5">
        <div className="shadow-soft rounded-3xl border border-border bg-card p-6 text-card-foreground">
          <p className="text-sm text-muted-foreground">آخر ما وصلت إليه</p>

          {!loaded ? (
            <div className="mt-4 h-16 animate-pulse rounded-2xl bg-muted" />
          ) : last ? (
            <>
              <p className="font-display mt-3 text-3xl font-bold text-primary">
                سورة {getSurah(last.surah).name}
              </p>
              <p className="mt-1 text-lg">
                الآية <span className="font-bold">{last.ayah}</span> من {getSurah(last.surah).ayahs}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">{formatDate(last.at)}</p>
            </>
          ) : (
            <p className="mt-3 text-lg text-muted-foreground">
              لم تسجّل موضعك بعد — ابدأ الآن وسجّل أول موضع.
            </p>
          )}

          {saved && (
            <p className="mt-4 rounded-xl bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              تم حفظ الموضع، بارك الله فيك.
            </p>
          )}

          <button
            onClick={openEditor}
            className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 text-base font-bold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            تحديث الموضع
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-primary">{daysTracked}</p>
            <p className="mt-1 text-xs text-muted-foreground">أيام المتابعة</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-primary">{entries.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">مرات التسجيل</p>
          </div>
        </div>

        <Link
          to="/history"
          className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-sm font-medium text-card-foreground"
        >
          <span>سجل القراءة</span>
          <span aria-hidden className="text-muted-foreground">
            ←
          </span>
        </Link>

        <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">
          بياناتك محفوظة على هذا الجهاز فقط، فلا تتداخل مع قراءة أي شخص آخر.
        </p>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end bg-foreground/40 px-4 pb-4">
          <div className="w-full rounded-3xl bg-card p-6 text-card-foreground">
            <h2 className="text-lg font-bold">تحديث الموضع</h2>

            <label className="mt-5 block text-sm text-muted-foreground" htmlFor="surah">
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
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-base"
            >
              {SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm text-muted-foreground" htmlFor="ayah">
              رقم الآية (1 - {ayahCount})
            </label>
            <input
              id="ayah"
              type="number"
              min={1}
              max={ayahCount}
              value={ayah}
              onChange={(e) => setAyah(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-base"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={save}
                className="flex-1 rounded-2xl bg-primary px-4 py-3 font-bold text-primary-foreground"
              >
                حفظ
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-2xl border border-border px-5 py-3 font-medium"
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
