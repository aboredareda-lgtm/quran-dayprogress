import { useState } from "react";
import { useReminder } from "@/hooks/useReminder";
import { Ornament } from "@/components/Ornament";

export function ReminderCard() {
  const { reminder, loaded, permission, enable, disable, setTime } = useReminder();
  const [open, setOpen] = useState(false);

  if (!loaded) return null;

  const unsupported = permission === "unsupported";
  const blocked = permission === "denied";

  return (
    <div className="pattern-cream mt-1 rounded-2xl border border-gold/40 px-3 py-1.5 tall:mt-2 tall:rounded-3xl tall:px-4 tall:py-2.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2"
      >
        <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-primary tall:text-base">
          <Ornament className="h-4 w-4 shrink-0 text-gold tall:h-5 tall:w-5" />
          تذكير الوِرد اليومي
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-gold/40 bg-secondary px-2.5 py-0.5 text-[0.68rem] font-bold text-secondary-foreground tall:text-xs">
            {unsupported ? "غير مدعوم" : reminder.enabled ? reminder.time : "معطّل"}
          </span>
          <span aria-hidden className="text-xs text-primary">
            {open ? "▲" : "▼"}
          </span>
        </span>
      </button>

      {open && (
        <div className="mt-2 text-center">
          {unsupported ? (
            <p className="text-[0.68rem] leading-4 text-muted-foreground tall:text-xs">
              التذكير غير مدعوم في هذا المتصفح. أضف التطبيق إلى الشاشة الرئيسية لتفعيله.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 tall:gap-3">
                <label
                  htmlFor="reminder-time"
                  className="text-xs font-medium text-muted-foreground tall:text-sm"
                >
                  الوقت
                </label>
                <input
                  id="reminder-time"
                  type="time"
                  value={reminder.time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-lg border border-input bg-background px-2 py-1 text-center text-base font-bold text-primary tall:rounded-xl tall:px-3 tall:py-2 tall:text-xl"
                />
              </div>

              <button
                onClick={() => (reminder.enabled ? disable() : enable())}
                className={`mt-2 w-full rounded-full border-2 px-4 py-2 text-sm font-bold transition-transform active:scale-[0.98] tall:mt-3 tall:px-5 tall:py-3 tall:text-base ${
                  reminder.enabled
                    ? "border-gold/50 bg-secondary text-secondary-foreground"
                    : "border-gold/60 bg-primary text-primary-foreground"
                }`}
              >
                {reminder.enabled ? "التذكير مُفعَّل — إيقاف" : "تفعيل التذكير"}
              </button>

              {blocked && (
                <p className="mt-1.5 text-[0.68rem] leading-4 text-muted-foreground tall:text-xs">
                  الإشعارات محجوبة — اسمح بها من إعدادات المتصفح أو النظام.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
