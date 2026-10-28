import { NABIYYIN, splitNabiyyin } from "@/lib/quran-word";

// Keep source text byte-for-byte; the scoped font only changes the drawn yeh.
export function QuranWordText({ text }: { text: string }) {
  return <>{splitNabiyyin(text).map((part, index) =>
    part.includes(NABIYYIN) ? <span key={index} className="quran-nabiyyin">{part}</span> : part,
  )}</>;
}
