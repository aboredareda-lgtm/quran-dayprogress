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
    <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-gold/40 bg-muted">
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
    <div className="mt-3 space-y-3 tall:mt-4">
      {/* الهدف اليومي */}
      <div className="pattern-cream rounded-3xl border border-gold/40 p-4 text-card-foreground">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-primary">
            <Ornament className="h-5 w-5 text-gold" />
            وِردك اليوم
          </span>
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="rounded-full border border-gold/50 bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground"
          >
            الهدف: {goal} آية
          </button>
        </div>

        <Bar percent={goalPercent} />

        <p className="mt-2 text-sm">
          قرأت <span className="font-bold text-primary">{today}</span> آية من {goal}
          {today >= goal && (
            <span className="mr-2 font-bold text-primary">— أتممت وِردك، أحسنت!</span>
          )}
        </p>

        {pickerOpen && (
          <div className="mt-3 flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  updateGoal(o.value);
                  setPickerOpen(false);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
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
      </div>

      {/* التقدّم في المصحف */}
      <div className="pattern-cream rounded-3xl border border-gold/40 p-4 text-card-foreground">
        <div className="flex items-center justify-between font-bold text-primary">
          <span className="flex items-center gap-2">
            <Ornament className="h-5 w-5 text-gold" />
            تقدّمك في المصحف
          </span>
          <span className="text-lg">{overall}%</span>
        </div>

        <Bar percent={overall} />

        <p className="mt-2 text-xs text-muted-foreground">
          {last
            ? `على هذا الهدف تُتِمّ ختمتك بعد نحو ${remainingDays} يومًا بإذن الله.`
            : "سجّل موضعك ليبدأ حساب تقدّمك في المصحف."}
        </p>
      </div>

      {/* السلسلة */}
      <div className="pattern-cream flex items-center justify-between rounded-3xl border border-gold/40 px-5 py-3.5 text-card-foreground">
        <span className="flex items-center gap-2 font-bold text-primary">
          <Ornament className="h-5 w-5 text-gold" />
          أيام متواصلة
        </span>
        <span className="font-display text-2xl font-bold text-primary">{streak}</span>
      </div>
    </div>
  );
}
