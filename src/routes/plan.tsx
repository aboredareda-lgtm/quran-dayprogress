import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getSurah } from "@/lib/surahs";
import { useReadingLog } from "@/hooks/useReadingLog";
import { useKhatmahPlan } from "@/hooks/useLocalList";
import { dailyPortion } from "@/lib/worship";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "خطة الختمة — الوِرد اليومي" },
      { name: "description", content: "اختر عدد أيام الختمة فيقسم البرنامج الورد عليك كل يوم." },
      { property: "og:title", content: "خطة الختمة — الوِرد اليومي" },
      { property: "og:description", content: "قسّم ختمتك على الأيام بسهولة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Plan,
});

const toAr = (n: number) => n.toLocaleString("ar-EG");
const pos = (p: { surah: number; ayah: number }) => `سورة ${getSurah(p.surah).name}، الآية ${toAr(p.ayah)}`;

function Plan() {
  const { last, loaded } = useReadingLog();
  const { plan, setPlan } = useKhatmahPlan();
  const [days, setDays] = useState(30);

  const portion = plan && loaded ? dailyPortion(plan, last) : null;

  return (
    <main className="pattern-cream min-h-dvh px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]" dir="rtl">
      <div className="mx-auto max-w-md">
        <Link to="/" className="inline-block rounded-full border border-gold/50 bg-card px-4 py-1.5 text-sm font-bold text-primary">
          رجوع
        </Link>
        <h1 className="mt-4 text-center text-2xl font-bold text-primary">📅 خطة الختمة</h1>

        {portion && plan ? (
          <div className="mt-6 rounded-3xl border-2 border-gold/50 bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">خطتك: ختمة في {toAr(plan.days)} يومًا</p>
            <p className="mt-3 text-lg font-bold text-primary">وِرد اليوم: {toAr(portion.perDay)} آية</p>
            <p className="mt-3 text-base">من {pos(portion.from)}</p>
            <p className="text-base">إلى {pos(portion.to)}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              الأيام الباقية: {toAr(portion.daysLeft)} — الآيات الباقية: {toAr(portion.remaining)}
            </p>
            <Link
              to="/mushaf"
              search={{ s: portion.from.surah, a: portion.from.ayah }}
              className="btn-turquoise-3d mt-5 inline-block rounded-full px-6 py-2 font-bold"
            >
              ابدأ ورد اليوم
            </Link>
            <button
              onClick={() => window.confirm("هل تريد إلغاء الخطة؟") && setPlan(null)}
              className="mt-4 block w-full rounded-full border border-border py-2 text-sm"
            >
              إلغاء الخطة
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border-2 border-gold/50 bg-card p-5 text-center">
            <p className="font-bold text-primary">في كم يومًا تريد أن تختم؟</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[7, 15, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`rounded-xl border-2 py-2 font-bold ${days === d ? "border-primary bg-primary text-primary-foreground" : "border-gold/40 text-primary"}`}
                >
                  {toAr(d)}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm text-muted-foreground" htmlFor="days">أو اكتب عدد الأيام</label>
            <input
              id="days"
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Math.min(365, Math.max(1, Number(e.target.value) || 1)))}
              className="mt-1 w-28 rounded-xl border border-input bg-background px-3 py-2 text-center text-xl font-bold text-primary"
            />
            <p className="mt-3 text-xs text-muted-foreground">تبدأ الخطة من آخر موضع وصلت إليه.</p>
            <button
              onClick={() => setPlan({ days, start: new Date().toISOString() })}
              className="btn-turquoise-3d mt-4 w-full rounded-full py-2.5 font-bold"
            >
              ابدأ الخطة
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
