import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSurah } from "@/lib/surahs";
import { useFavorites } from "@/hooks/useLocalList";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "آياتي المفضلة — الوِرد اليومي" },
      { name: "description", content: "الآيات التي حفظتها في المفضلة للرجوع إليها." },
      { property: "og:title", content: "آياتي المفضلة — الوِرد اليومي" },
      { property: "og:description", content: "ارجع بسهولة إلى الآيات التي تحبها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Favorites,
});

const toAr = (n: number) => n.toLocaleString("ar-EG");

function Favorites() {
  const { favorites, toggle } = useFavorites();
  const [quran, setQuran] = useState<string[][] | null>(null);
  useEffect(() => {
    fetch("/quran.json").then((r) => r.json()).then(setQuran).catch(() => {});
  }, []);

  return (
    <main className="pattern-cream min-h-dvh px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]" dir="rtl">
      <div className="mx-auto max-w-xl">
        <Link to="/more" className="inline-block rounded-full border border-gold/50 bg-card px-4 py-1.5 text-sm font-bold text-primary">
          رجوع
        </Link>
        <h1 className="mt-4 text-center text-2xl font-bold text-primary">⭐ آياتي المفضلة</h1>
        {favorites.length === 0 ? (
          <p className="mt-8 text-center text-muted-foreground">
            لا توجد آيات بعد. اضغط ☆ بجانب أي آية في المصحف لإضافتها.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3">
            {favorites.map((f) => (
              <li key={`${f.surah}-${f.ayah}`} className="rounded-2xl border-2 border-gold/40 bg-card p-4">
                <p className="text-sm font-bold text-primary">
                  سورة {getSurah(f.surah).name} — الآية {toAr(f.ayah)}
                </p>
                {quran && (
                  <p className="mt-2 text-xl leading-loose text-foreground" style={{ fontFamily: "'Amiri Quran', serif" }}>
                    {quran[f.surah - 1]?.[f.ayah - 1]}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Link
                    to="/mushaf"
                    search={{ s: f.surah, a: f.ayah }}
                    className="btn-turquoise-3d rounded-full px-4 py-1.5 text-sm font-bold"
                  >
                    افتح في المصحف
                  </Link>
                  <button onClick={() => toggle(f.surah, f.ayah)} className="rounded-full border border-border px-4 py-1.5 text-sm">
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
