import { useUserName } from "@/hooks/useUserName";
import { Ornament } from "@/components/Ornament";

/** ترويسة الوِرد اليومي: خلفية خضراء فاتحة + بسملة + العنوان */
export function WirdHeader() {
  const { name } = useUserName();
  return (
    <header className="bg-sage safe-top relative overflow-hidden px-4 pb-9 text-center text-primary tall:pb-11 sm:px-5">
      <div className="mt-1 flex items-center justify-center gap-2 tall:mt-2">
        <Ornament className="h-4 w-4 shrink-0 text-gold tall:h-5 tall:w-5" />
        <p className="font-display text-[1.05rem] font-bold leading-tight tall:text-[1.35rem]">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <Ornament className="h-4 w-4 shrink-0 text-gold tall:h-5 tall:w-5" />
      </div>

      <h1 className="font-display mt-0.5 text-[2rem] font-bold leading-tight tall:text-[2.6rem]">
        الوِرد اليومي
      </h1>
      {name && (
        <p className="text-sm font-bold tall:text-base">أهلًا يا {name}</p>
      )}
    </header>
  );
}
