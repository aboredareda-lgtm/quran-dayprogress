import { monthlyStats } from "@/lib/progress";
import type { ReadingEntry } from "@/hooks/useReadingLog";
import { Ornament } from "@/components/Ornament";

function formatDay(day: string) {
  return new Intl.DateTimeFormat("ar", { day: "numeric", month: "long" }).format(
    new Date(`${day}T00:00:00`),
  );
}

/** إحصائية الشهر الحالي */
export function MonthlyStats({ entries }: { entries: ReadingEntry[] }) {
  const { days, ayahs, bestDay } = monthlyStats(entries);
  const monthName = new Intl.DateTimeFormat("ar", { month: "long" }).format(new Date());

  return (
    <div className="pattern-cream rounded-3xl border border-gold/40 p-4 text-card-foreground">
      <p className="flex items-center gap-2 text-sm font-bold text-primary">
        <Ornament className="h-4 w-4 shrink-0 text-gold" />
        إحصائية شهر {monthName}
      </p>

      <div className="mt-3 grid grid-cols-2 divide-x divide-gold/30 text-center">
        <div>
          <p className="text-3xl font-bold text-primary">{days}</p>
          <p className="text-xs text-muted-foreground">أيام القراءة</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{ayahs}</p>
          <p className="text-xs text-muted-foreground">مجموع الآيات</p>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {bestDay
          ? `أكثر يوم قراءة: ${formatDay(bestDay.day)} بـ ${bestDay.ayahs} آية.`
          : "لا توجد قراءة مسجّلة هذا الشهر بعد."}
      </p>
    </div>
  );
}
