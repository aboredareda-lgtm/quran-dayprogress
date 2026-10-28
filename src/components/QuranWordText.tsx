// Keep source text byte-for-byte; the scoped font only changes the drawn yeh.
export function QuranWordText({ text }: { text: string }) {
  return <>{text.split(/(ٱلنَّبِيِّـۧنَ)/u).map((part, index) =>
    part === "ٱلنَّبِيِّـۧنَ"
      ? <span key={index} className="quran-nabiyyin">{part}</span>
      : part,
  )}</>;
}