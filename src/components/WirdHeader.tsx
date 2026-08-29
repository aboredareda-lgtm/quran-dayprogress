import logoMark from "@/assets/logo-mark.png";
import mushafMark from "@/assets/mushaf-mark.png";

/** ترويسة الوِرد اليومي: قوس مسجد بزخرفة ذهبية + بسملة + العنوان */
export function WirdHeader() {
  return (
    <header className="bg-gradient-calm pattern-emerald relative overflow-hidden px-5 pb-28 pt-8 text-center text-primary-foreground">
      {/* قوس المحراب */}
      <svg
        viewBox="0 0 320 260"
        aria-hidden
        className="pointer-events-none absolute -top-2 right-1/2 h-[230px] w-[330px] translate-x-1/2 text-gold/45"
        fill="none"
      >
        <path
          d="M20 260V132C20 78 66 32 112 18c18-5 26-14 48-18 22 4 30 13 48 18 46 14 92 60 92 114v128"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M40 260V138c0-46 40-86 80-98 12-4 18-11 40-14 22 3 28 10 40 14 40 12 80 52 80 98v122"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>

      {/* لوجو المصحف على الطرف الأيسر */}
      <img
        src={mushafMark}
        alt="لوجو المصحف"
        className="absolute left-3 top-5 h-20 w-24 object-contain drop-shadow-[0_2px_8px_oklch(0.15_0.03_160/0.55)]"
      />


      {/* اللوجو على الطرف الأيمن */}
      <img
        src={logoMark}
        alt="لوجو التطبيق"
        className="absolute right-3 top-4 h-24 w-20 object-contain drop-shadow-[0_2px_8px_oklch(0.15_0.03_160/0.5)]"
      />

      <p className="font-display mx-auto mt-8 max-w-[14rem] text-[1.9rem] leading-tight text-gold-soft drop-shadow-sm">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>

      <h1 className="font-display mt-7 text-[3.1rem] font-bold leading-none tracking-tight drop-shadow-[0_2px_6px_oklch(0.15_0.03_160/0.6)]">
        الوِرد اليومي
      </h1>
    </header>
  );
}
