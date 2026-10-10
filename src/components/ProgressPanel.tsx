import { useState } from "react";
import { Ornament } from "@/components/Ornament";
import { GOAL_OPTIONS, useDailyGoal } from "@/hooks/useDailyGoal";
import type { ReadingEntry } from "@/hooks/useReadingLog";
import { ayahsReadToday, daysToFinish, mushafPercent } from "@/lib/progress";

function Bar({ percent }: { percent: number }) {
  return (
    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full border border-gold/40 bg-muted tall:mt-2 tall:h-3">
      <div
        className="h-full rounded-full bg-gradient-calm transition-[width] duration-500"
        style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
      />
    </div>
  );
}

export function ProgressPanel({
  entries,
  last,
}: {
  entries: ReadingEntry[];
  last: ReadingEntry | null;
}) {
  const { goal, updateGoal } = useDailyGoal();
  const [pickerOpen, setPickerOpen] = useState(false);

  
  const today = ayahsReadToday(entries);
  const goalPercent = Math.round((today / goal) * 100);
  const overall = last ? mushafPercent(last.surah, last.ayah) : 0;
  const remainingDays = last ? daysToFinish(last.surah, last.ayah, goal) : 0;

  return (
    <div className="rounded-2xl border border-gold/40 bg-card px-3 py-1.5 text-card-foreground">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm font-bold text-primary">
          <Ornament className="h-4 w-4 shrink-0 text-gold" />
          وِردك اليوم: {today} / {goal} آية
          
        </span>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="shrink-0 rounded-full border border-gold/50 bg-secondary px-2 py-0.5 text-[0.68rem] font-bold text-secondary-foreground"
        >
          الهدف
        </button>
      </div>
      <Bar percent={goalPercent} />

      {pickerOpen && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {GOAL_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                updateGoal(o.value);
                setPickerOpen(false);
              }}
              className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-bold ${
                o.value === goal
                  ? "border-gold/70 bg-primary text-primary-foreground"
                  : "border-border text-card-foreground"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-1.5 flex items-center justify-between gap-2 text-sm font-bold text-primary">
        <span className="min-w-0 truncate">
          تقدّمك في المصحف
          {last && (
            <span className="mr-1 text-[0.7rem] font-medium text-muted-foreground">
              · الختمة بعد نحو {remainingDays} يومًا
            </span>
          )}
        </span>
        <span className="shrink-0">{overall}%</span>
      </div>
      <Bar percent={overall} />
    </div>
  );
}
