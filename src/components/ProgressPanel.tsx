import { useState } from "react";
import { Ornament } from "@/components/Ornament";
import { GOAL_OPTIONS, useDailyGoal } from "@/hooks/useDailyGoal";
import type { ReadingEntry } from "@/hooks/useReadingLog";
import {
  ayahsReadToday,
  currentStreak,
  daysToFinish,
  mushafPercent,
} from "@/lib/progress";

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

  const streak = currentStreak(entries);
  const today = ayahsReadToday(entries);
  const goalPercent = Math.round((today / goal) * 100);
  const overall = last ? mushafPercent(last.surah, last.ayah) : 0;
  const remainingDays = last ? daysToFinish(last.surah, last.ayah, goal) : 0;

  return (
    <div className="pattern-cream mt-1.5 rounded-2xl border border-gold/40 p-2.5 text-card-foreground tall:mt-4 tall:rounded-3xl tall:p-4">
      {/* الهدف اليومي */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-primary tall:text-base">
          <Ornament className="h-4 w-4 shrink-0 text-gold tall:h-5 tall:w-5" />
          وِردك اليوم
        </span>
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="shrink-0 rounded-full border border-gold/50 bg-secondary px-2.5 py-1 text-[0.7rem] font-bold text-secondary-foreground tall:px-3 tall:text-xs"
        >
          الهدف: {goal} آية
        </button>
      </div>

      <Bar percent={goalPercent} />

      <p className="mt-1 text-[0.72rem] tall:mt-2 tall:text-sm">
        قرأت <span className="font-bold text-primary">{today}</span> آية من {goal}
        {today >= goal && <span className="mr-2 font-bold text-primary">— أحسنت!</span>}
      </p>

      {pickerOpen && (
        <div className="mt-2 flex flex-wrap gap-1.5 tall:mt-3 tall:gap-2">
          {GOAL_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                updateGoal(o.value);
                setPickerOpen(false);
              }}
              className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-bold tall:px-3 tall:py-1.5 tall:text-xs ${
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

      <div className="mt-2 h-px w-full bg-gold/30 tall:mt-4" />

      {/* التقدّم في المصحف */}
      <div className="mt-1.5 flex items-center justify-between gap-2 text-sm font-bold text-primary tall:mt-3 tall:text-base">
        <span className="flex min-w-0 items-center gap-2">
          <Ornament className="h-4 w-4 shrink-0 text-gold tall:h-5 tall:w-5" />
          تقدّمك في المصحف
        </span>
        <span className="shrink-0 text-base tall:text-lg">{overall}%</span>
      </div>

      <Bar percent={overall} />

      <div className="mt-1.5 flex items-center justify-between gap-2 tall:mt-2">
        <p className="min-w-0 text-[0.68rem] leading-4 text-muted-foreground tall:text-xs">
          {last
            ? `ختمتك بعد نحو ${remainingDays} يومًا بإذن الله.`
            : "سجّل موضعك ليبدأ حساب تقدّمك."}
        </p>
        <span className="shrink-0 rounded-full border border-gold/40 bg-secondary px-2.5 py-0.5 text-[0.68rem] font-bold text-secondary-foreground tall:text-xs">
          {streak} أيام متواصلة
        </span>
      </div>
    </div>
  );
}
