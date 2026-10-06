import { useUserName } from "@/hooks/useUserName";
import { Ornament } from "@/components/Ornament";

/** ترويسة الوِرد اليومي: خلفية خضراء فاتحة + بسملة + العنوان */
export function WirdHeader() {
  const { name } = useUserName();
  return (
    <header className="bg-sage safe-top relative overflow-hidden px-4 pb-9 text-center text-primary tall:pb-11 sm:px-5">
      <svg viewBox="0 0 320 200" aria-hidden fill="none" className="pointer-events-none absolute inset-x-0 top-[env(safe-area-inset-top)] mx-auto h-[7.5rem] w-[15rem] text-gold/60 tall:h-[9.5rem] tall:w-[19rem]">
        <path d="M10 200V110C10 60 60 30 110 18c20-5 32-12 50-18 18 6 30 13 50 18 50 12 100 42 100 92v90" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="relative mt-1 flex items-center justify-center gap-2 tall:mt-2">
        <Ornament className="h-4 w-4 shrink-0 text-gold tall:h-5 tall:w-5" />
        <p className="font-display text-[1.05rem] font-bold leading-tight tall:text-[1.35rem]">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <Ornament className="h-4 w-4 shrink-0 text-gold tall:h-5 tall:w-5" />
      </div>

      <h1 className="font-display relative mt-0.5 text-[2rem] font-bold leading-tight tall:text-[2.6rem]">
        الوِرد اليومي
      </h1>
      {name && (
        <p className="relative text-sm font-bold tall:text-base">أهلًا يا {name}</p>
      )}
    </header>
  );
}
