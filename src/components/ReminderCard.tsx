import { useReminder } from "@/hooks/useReminder";
import { Ornament } from "@/components/Ornament";

export function ReminderCard() {
  const { reminder, loaded, permission, enable, disable, setTime } = useReminder();

  if (!loaded) return null;

  const unsupported = permission === "unsupported";
  const blocked = permission === "denied";

  return (
    <div className="pattern-cream mt-3 rounded-3xl border border-gold/40 p-4 text-center tall:mt-4">
      <Ornament className="mx-auto h-5 w-5 text-gold" />
      <p className="mt-2 text-lg font-bold text-primary">تذكير الوِرد اليومي</p>

      {unsupported ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          التذكير غير مدعوم في هذا المتصفح. أضف التطبيق إلى الشاشة الرئيسية لتفعيله.
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-center gap-3">
            <label htmlFor="reminder-time" className="text-sm font-medium text-muted-foreground">
              الوقت
            </label>
            <input
              id="reminder-time"
              type="time"
              value={reminder.time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-center text-xl font-bold text-primary"
            />
          </div>

          <button
            onClick={() => (reminder.enabled ? disable() : enable())}
            className={`mt-3 w-full rounded-full border-2 px-5 py-3 text-base font-bold transition-transform active:scale-[0.98] ${
              reminder.enabled
                ? "border-gold/50 bg-secondary text-secondary-foreground"
                : "border-gold/60 bg-primary text-primary-foreground"
            }`}
          >
            {reminder.enabled ? "التذكير مُفعَّل — إيقاف" : "تفعيل التذكير"}
          </button>

          {blocked && (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              الإشعارات محجوبة — اسمح بها من إعدادات المتصفح أو النظام.
            </p>
          )}
          {reminder.enabled && !blocked && (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              سيصلك تذكير يوميًا في الوقت المحدد ما دام التطبيق مضافًا إلى شاشتك.
            </p>
          )}
        </>
      )}
    </div>
  );
}
