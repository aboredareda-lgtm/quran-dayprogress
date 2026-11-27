import { Capacitor } from "@capacitor/core";
import { Ornament } from "@/components/Ornament";
import { useAdhanAlerts } from "@/hooks/useAdhanAlerts";
import { ADHAN_PRAYERS } from "@/lib/adhan-alerts";
import type { PrayerTimes } from "@/lib/worship";

const fmt = (d: Date) => new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "2-digit" }).format(d);

export function AdhanCard({ times }: { times: PrayerTimes }) {
  const { settings, toggle, error } = useAdhanAlerts();
  return (
    <div className="pattern-cream mt-4 rounded-3xl border border-gold/40 p-4 text-card-foreground">
      <span className="flex items-center gap-2 text-sm font-bold text-primary">
        <Ornament className="h-4 w-4 shrink-0 text-gold" />
        تنبيه الأذان
      </span>
        <ul className="mt-3 space-y-2">
          {ADHAN_PRAYERS.map(([key, name]) => (
            <li key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold">
                {name} <span className="ms-1 font-normal text-muted-foreground">{fmt(times[key])}</span>
              </span>
              <button
                onClick={() => void toggle(key)}
                aria-pressed={settings[key]}
                aria-label={`تنبيه صلاة ${name}`}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
                  settings[key] ? "border-gold/60 bg-primary text-primary-foreground" : "border-gold/50 bg-secondary text-secondary-foreground"
                }`}
              >
                {settings[key] ? "مُفعَّل" : "معطّل"}
              </button>
            </li>
          ))}
        </ul>
      {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
      {!Capacitor.isNativePlatform() && (
        <p className="mt-2 text-xs text-muted-foreground">في نسخة الويب، يعمل التنبيه أثناء فتح الصفحة فقط.</p>
      )}
    </div>
  );
}
