import logoMark from "@/assets/logo-mark.png";
import mushafMark from "@/assets/mushaf-mark.png";

/** ترويسة الوِرد اليومي: قوس مسجد بزخرفة ذهبية + بسملة + العنوان */
export function WirdHeader() {
  return (
    <header className="bg-gradient-calm pattern-emerald safe-top relative min-h-[8rem] overflow-hidden px-4 pb-12 tall:min-h-[10.5rem] tall:pb-16 text-center text-primary-foreground sm:px-5">
      {/* قوس المحراب */}
      <svg
        viewBox="0 0 320 260"
        aria-hidden
        className="pointer-events-none absolute -top-2 right-1/2 h-[105px] w-[160px] translate-x-1/2 text-gold/45 tall:h-[150px] tall:w-[230px]"
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
        className="absolute left-2 top-3 h-9 w-12 shrink-0 object-contain drop-shadow-[0_2px_8px_oklch(0.15_0.03_160/0.55)] min-[380px]:left-3 tall:h-14 tall:w-16"
      />

      {/* اللوجو على الطرف الأيمن */}
      <img
        src={logoMark}
        alt="لوجو التطبيق"
        className="absolute right-2 top-2 h-12 w-9 shrink-0 object-contain drop-shadow-[0_2px_8px_oklch(0.15_0.03_160/0.5)] min-[380px]:right-3 tall:h-16 tall:w-12"
      />

      <p className="font-display mx-auto mt-1 max-w-[9rem] text-sm leading-tight text-gold-soft drop-shadow-sm min-[380px]:max-w-[13rem] tall:mt-3 tall:text-[1.3rem]">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>

      <h1 className="font-display mt-1.5 text-[1.45rem] font-bold leading-none drop-shadow-[0_2px_6px_oklch(0.15_0.03_160/0.6)] tall:mt-3 tall:text-[2.1rem]">
        الوِرد اليومي
      </h1>
    </header>
  );
}
