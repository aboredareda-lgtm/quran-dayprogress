import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, ChevronLeft, Home, LayoutGrid, Moon, Sun, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserName } from "@/hooks/useUserName";
import { useDailyGoal, GOAL_OPTIONS } from "@/hooks/useDailyGoal";
import type { ReadingEntry } from "@/hooks/useReadingLog";
import { getSurah, getJuz } from "@/lib/surahs";
import { ayahsReadToday, mushafPercent, daysToFinish } from "@/lib/progress";
import { prayerTimes, type PrayerTimes } from "@/lib/worship";
import mosque from "@/assets/followup-mosque-clean.jpg";
import morningImage from "@/assets/followup-morning-clean.jpg";
import eveningImage from "@/assets/followup-evening-clean.jpg";
import realMushaf from "@/assets/real-mushaf.webp";
import mushaf from "@/assets/home-mushaf.webp";

const prayers: [keyof PrayerTimes, string, string][] = [["fajr", "الفجر", "🌤️"], ["sunrise", "الشروق", "🌅"], ["dhuhr", "الظهر", "☀️"], ["asr", "العصر", "☀️"], ["maghrib", "المغرب", "🌅"], ["isha", "العشاء", "🌙"]];
const shortcuts = [
  { label: "أوقات الصلاة", icon: "🕌", to: "/prayer", tone: "mint" },
  { label: "اتجاه القبلة", icon: "🧭", to: "/qibla", tone: "paper" },
  { label: "خطة الختمة", icon: "📋", to: "/plan", tone: "lilac" },
  { label: "آياتي المفضلة", icon: "❤️", to: "/favorites", tone: "rose" },
  { label: "صفحة الترحيب", icon: "🏠", tone: "mint" },
  { label: "الإعدادات", icon: "⚙️", to: "/settings", tone: "silver" },
  { label: "تذكير الورد", icon: "🔔", tone: "honey" },
  { label: "سجل القراءة", icon: "📚", to: "/history", tone: "sky" },
] as const;

export function FollowupDashboard({ last, entries, daysTracked, khatmahCount, loaded, onEdit, onDeleteNote, onWelcome, onReminder }: {
  last: ReadingEntry | null; entries: ReadingEntry[]; daysTracked: number; khatmahCount: number; loaded: boolean;
  onEdit: () => void; onDeleteNote: () => void; onWelcome: () => void; onReminder: () => void; onRevert?: () => void;
}) {
  const { name } = useUserName();
  const { goal, updateGoal } = useDailyGoal();
  const [goalOpen, setGoalOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    const refresh = () => {
      setNow(new Date());
      try {
        const value = JSON.parse(localStorage.getItem("wird:prayer-location") || "null");
        if (value && Number.isFinite(value.lat) && Number.isFinite(value.lng)) setLocation(value);
      } catch { /* keep location private on device */ }
    };
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  const times = now && location ? prayerTimes(now, location.lat, location.lng) : null;
  const next = now && times ? prayers.find(([key]) => key !== "sunrise" && times[key] > now)?.[0] : null;
  const today = ayahsReadToday(entries);
  const progress = last ? mushafPercent(last.surah, last.ayah) : 0;
  return <div className="followup-dashboard" dir="rtl">
    <header className="followup-header">
      <img src={mosque} alt="المسجد النبوي والنخيل" className="followup-mosque" />
      <p className="followup-bismillah font-display">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <div className="followup-greeting"><h1>{name ? `أهلًا يا ${name}` : "الوِرد اليومي"}</h1><p>🌿 جعل الله يومك مباركًا بالخير والطاعة</p></div>
    </header>
    <div className="followup-content">
      <section className="followup-panel followup-position" aria-label="آخر ما وصلت إليه">
        <div className="followup-position-actions">
          <Button onClick={onEdit} className="followup-read-action followup-resume"><span className="followup-resume-icon" aria-hidden="true">▶</span><span className="followup-resume-label">متابعة القراءة</span></Button>
          <Button asChild variant="secondary" className="followup-read-action followup-read-paper"><Link to="/mushaf"><img src={realMushaf} alt="" width={240} height={240} className="followup-real-mushaf" />اقرأ من المصحف</Link></Button>
        </div>
        <div className="followup-position-data">
          {!loaded ? <p>…</p> : last ? <>
            <h2 className="followup-surah font-display">سورة {getSurah(last.surah).name}</h2>
            <p className="followup-ayah">الآية <strong>{last.ayah}</strong> <small>من {getSurah(last.surah).ayahs}</small></p>
            <p className="followup-juz">الجزء {getJuz(last.surah, last.ayah)}</p>
            <p className="followup-saved-date"><CalendarDays />{new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(last.at))}</p>
            {last.note && <p className="followup-note">📝 {last.note}</p>}
          </> : <><h2 className="followup-surah font-display">آخر ما وصلت إليه</h2><p className="text-sm leading-7">لم تسجّل موضعك بعد</p><Button variant="secondary" onClick={onEdit}>حدد للمتابعة</Button></>}
        </div>
        <div className="followup-book-area"><span className="followup-last-label">آخر ما وصلت إليه 📖</span><Button asChild variant="ghost" className="followup-book-link"><Link to="/mushaf" aria-label="القراءة من المصحف" title="القراءة من المصحف"><img src={mushaf} alt="مصحف مفتوح" /></Link></Button>{last?.note && <Button variant="destructive" className="followup-delete-note" onClick={onDeleteNote}>حذف الملاحظة 🗑</Button>}</div>
      </section>
      <div className="followup-adhkar-grid">
        {(["morning", "evening"] as const).map(period => <Button asChild variant="ghost" className={`followup-adhkar ${period}`} key={period}><Link to="/adhkar" search={{ period }}><img src={period === "morning" ? morningImage : eveningImage} alt="" /><div><h2>{period === "morning" ? "أذكار الصباح ☀️" : "أذكار المساء 🌙"}</h2><p>{period === "morning" ? "ابدأ يومك بذكر الله" : "اختم يومك بذكر الله"}</p></div><span className="followup-adhkar-cta">قراءة أذكار {period === "morning" ? "الصباح" : "المساء"}<ChevronLeft /></span></Link></Button>)}
      </div>
      <section className="followup-panel followup-prayers" aria-label="مواقيت الصلاة اليوم">
        <Button asChild variant="ghost" className="followup-section-title"><Link to="/prayer"><ChevronLeft />🕌 مواقيت الصلاة اليوم</Link></Button>
        <div className="followup-prayer-body"><div className="followup-prayer-grid">{prayers.map(([key, label, icon]) => <Link to="/prayer" key={key} className={`followup-prayer ${next === key ? "is-next" : ""}`}><span>{icon}</span><b>{label}</b><time>{times ? new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "2-digit" }).format(times[key]) : "—"}</time></Link>)}</div><div className="followup-calendar"><CalendarDays /><strong>{now?.getDate() ?? "—"}</strong><span>{now ? new Intl.DateTimeFormat("ar", { month: "long", year: "numeric" }).format(now) : ""}</span><span>{now ? new Intl.DateTimeFormat("ar", { weekday: "long" }).format(now) : ""}</span></div></div>
        {!times && <Link to="/prayer" className="followup-location-link">حدد موقعك لعرض أوقات الصلاة</Link>}
      </section>
      <div className="followup-summary-grid">
        <section className="followup-panel followup-statistics"><h2>📊 متابعتك</h2><div className="followup-rings">{[{ value: daysTracked, label: "أيام المتابعة", icon: <BookOpen /> }, { value: entries.length, label: "مرات التسجيل", icon: <CalendarDays /> }, { value: khatmahCount, label: "الختمات", icon: <Trophy /> }].map(item => <div key={item.label}><span className="followup-ring"><strong>{item.value}</strong>{item.icon}</span><b>{item.label}</b></div>)}</div></section>
        <section className="followup-panel followup-goal"><Button variant="ghost" onClick={() => setGoalOpen(!goalOpen)} className="followup-goal-title"><Target />وردك اليوم</Button><strong>{today} / {goal} آية</strong><progress max={goal} value={Math.min(today, goal)} /><span>{progress}%</span><b>🌿 تقدمك في المصحف</b><small>{last ? `الختمة بعد نحو ${daysToFinish(last.surah, last.ayah, goal)} يومًا إن شاء الله` : "بارك الله في قراءتك"}</small>{goalOpen && <div className="flex flex-wrap justify-center gap-1">{GOAL_OPTIONS.map(option => <Button key={option.value} size="sm" variant="secondary" onClick={() => { updateGoal(option.value); setGoalOpen(false); }}>{option.label}</Button>)}</div>}</section>
      </div>
      <nav className="followup-shortcuts" aria-label="اختصارات التطبيق">{shortcuts.map(item => "to" in item ? <Button asChild variant="ghost" key={item.label} className={`followup-shortcut ${item.tone}`}><Link to={item.to}><span>{item.icon}</span>{item.label}</Link></Button> : <Button variant="ghost" key={item.label} className={`followup-shortcut ${item.tone}`} onClick={item.label === "تذكير الورد" ? onReminder : onWelcome}><span>{item.icon}</span>{item.label}</Button>)}</nav>
      <Button asChild className="followup-contact"><Link to="/contact"><ChevronLeft />💬 تواصل معنا</Link></Button>
      <nav className="followup-bottom" aria-label="التنقل السفلي"><Button variant="ghost" aria-current="page"><Home />الرئيسية</Button><Button asChild variant="ghost"><Link to="/mushaf"><BookOpen />المصحف</Link></Button><Button asChild variant="ghost"><Link to="/adhkar"><Moon />الأذكار</Link></Button><Button asChild variant="ghost"><Link to="/plan"><Target />الختمة</Link></Button><Button asChild variant="ghost"><Link to="/settings"><LayoutGrid />المزيد</Link></Button></nav>
    </div>
  </div>;
}