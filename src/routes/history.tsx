import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SURAHS, getSurah, getJuz } from "@/lib/surahs";
import { useReadingLog } from "@/hooks/useReadingLog";
import { MonthlyStats } from "@/components/MonthlyStats";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "سجل القراءة — وِرد" },
      {
        name: "description",
        content: "استعرض جميع المواضع التي سجّلتها في قراءتك للقرآن الكريم على هذا الجهاز.",
      },
      { property: "og:title", content: "سجل القراءة — وِرد" },
      {
        property: "og:description",
        content: "كل مواضع قراءتك المسجّلة بالتاريخ والوقت.",
      },
    ],
  }),
  component: History,
});

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}

function History() {
  const { entries, loaded, updateEntry, removeEntry, clearAll } = useReadingLog();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [surah, setSurah] = useState(1);
  const [ayah, setAyah] = useState(1);
  const [note, setNote] = useState("");

  const startEdit = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    setSurah(entry.surah);
    setAyah(entry.ayah);
    setNote(entry.note ?? "");
    setEditingId(id);
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateEntry(editingId, {
      surah,
      ayah: Math.min(Math.max(ayah, 1), getSurah(surah).ayahs),
      note,
    });
    setEditingId(null);
  };

  return (
    <main className="pattern-cream screen-fill mx-auto overflow-x-hidden sm:max-w-[26rem]">
      <header className="bg-gradient-calm pattern-arch safe-top px-4 pb-8 text-primary-foreground min-[380px]:px-5">
        <Link to="/" className="text-sm text-gold-soft">
          → عودة للرئيسية
        </Link>
        <h1 className="font-display mt-3 text-3xl font-bold">سجل القراءة</h1>
      </header>

      <section className="space-y-3 px-3 pt-6 min-[380px]:px-5">
        {loaded && <MonthlyStats entries={entries} />}

        {!loaded ? (
          <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        ) : entries.length === 0 ? (
          <p className="pattern-cream rounded-3xl border border-gold/40 p-6 text-center text-sm text-muted-foreground">
            لا توجد مواضع مسجّلة بعد.
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="pattern-cream rounded-3xl border border-gold/40 p-4 text-card-foreground"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-bold text-primary">
                        سورة {getSurah(e.surah).name}
                      </p>
                      <p className="text-sm">
                        الآية {e.ayah} · الجزء {getJuz(e.surah, e.ayah)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(e.at)}</p>
                      {e.note && (
                        <p className="mt-2 rounded-xl border border-gold/30 bg-secondary px-3 py-1.5 text-xs text-secondary-foreground">
                          {e.note}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        onClick={() => startEdit(e.id)}
                        className="rounded-xl border border-gold/50 px-3 py-2 text-xs font-bold text-primary"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => removeEntry(e.id)}
                        className="rounded-xl border border-border px-3 py-2 text-xs text-destructive"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={clearAll}
              className="mt-3 w-full rounded-2xl border border-border px-4 py-3 text-sm text-destructive"
            >
              حذف كل السجل
            </button>
          </>
        )}
      </section>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 px-3 pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] min-[380px]:px-4">
          <div className="pattern-cream max-h-[calc(100dvh-2rem)] w-full max-w-[26rem] overflow-y-auto rounded-[2rem] border-2 border-gold/50 p-5 text-card-foreground">
            <h2 className="text-center text-lg font-bold text-primary">تعديل الموضع</h2>

            <label className="mt-4 block text-center text-lg font-bold text-primary" htmlFor="edit-surah">
              السورة
            </label>
            <select
              id="edit-surah"
              value={surah}
              onChange={(e) => {
                const next = Number(e.target.value);
                setSurah(next);
                setAyah((a) => Math.min(a, getSurah(next).ayahs));
              }}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-xl font-bold text-primary"
            >
              {SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-center text-lg font-bold text-primary" htmlFor="edit-ayah">
              رقم الآية (1 - {getSurah(surah).ayahs})
            </label>
            <input
              id="edit-ayah"
              type="number"
              min={1}
              max={getSurah(surah).ayahs}
              value={ayah}
              onChange={(e) => setAyah(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-xl font-bold text-primary"
            />

            <label className="mt-4 block text-center text-lg font-bold text-primary" htmlFor="edit-note">
              ملاحظة (اختياري)
            </label>
            <input
              id="edit-note"
              type="text"
              maxLength={120}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="تدبّر، أو: مع التفسير"
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-base"
            />

            <div className="mt-5 flex gap-3">
              <button
                onClick={saveEdit}
                className="flex-1 rounded-full border-2 border-gold/60 bg-primary px-4 py-3 font-bold text-primary-foreground"
              >
                حفظ التعديل
              </button>
              <button
                onClick={() => setEditingId(null)}
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
