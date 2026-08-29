import { createFileRoute, Link } from "@tanstack/react-router";
import { getSurah, getJuz } from "@/lib/surahs";
import { useReadingLog } from "@/hooks/useReadingLog";

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
  const { entries, loaded, removeEntry, clearAll } = useReadingLog();

  return (
    <main className="pattern-cream min-h-screen pb-16">
      <header className="bg-gradient-calm pattern-arch px-5 pb-8 pt-10 text-primary-foreground">
        <Link to="/" className="text-sm text-gold-soft">
          → عودة للرئيسية
        </Link>
        <h1 className="font-display mt-3 text-3xl font-bold">سجل القراءة</h1>
      </header>

      <section className="px-5 pt-6">
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
                  className="pattern-cream flex items-center justify-between rounded-3xl border border-gold/40 p-4 text-card-foreground"

                  <div>
                    <p className="font-display text-lg font-bold text-primary">
                      سورة {getSurah(e.surah).name}
                    </p>
                    <p className="text-sm">
                      الآية {e.ayah} · الجزء {getJuz(e.surah, e.ayah)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(e.at)}</p>
                  </div>
                  <button
                    onClick={() => removeEntry(e.id)}
                    className="rounded-xl border border-border px-3 py-2 text-xs text-destructive"
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={clearAll}
              className="mt-6 w-full rounded-2xl border border-border px-4 py-3 text-sm text-destructive"
            >
              حذف كل السجل
            </button>
          </>
        )}
      </section>
    </main>
  );
}
