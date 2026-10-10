import { useUserName } from "@/hooks/useUserName";
import { Ornament } from "@/components/Ornament";
import headerImg from "@/assets/home-header.jpg";

/** ترويسة الوِرد اليومي: صورة المسجد النبوي + بسملة + العنوان */
export function WirdHeader() {
  const { name } = useUserName();
  return (
    <header
      className="safe-top relative overflow-hidden bg-cover bg-bottom px-4 pb-7 text-center text-primary tall:pb-9 sm:px-5"
      style={{ backgroundImage: `url(${headerImg})` }}
    >
      <div className="relative mt-1 flex items-center justify-center gap-2 tall:mt-2">
        <Ornament className="h-4 w-4 shrink-0 text-gold tall:h-5 tall:w-5" />
        <p className="font-display text-[1.05rem] font-bold leading-tight tall:text-[1.35rem]">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <Ornament className="h-4 w-4 shrink-0 text-gold tall:h-5 tall:w-5" />
      </div>

      <h1 className="font-display relative mt-0.5 text-[2.1rem] font-bold leading-tight tall:text-[2.7rem]">
        الوِرد اليومي
      </h1>
      {name && (
        <p className="relative mx-auto w-fit rounded-full bg-card/80 px-3 text-base font-bold text-primary tall:text-lg">أهلًا يا {name}</p>
      )}
    </header>
  );
}
