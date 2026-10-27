/** Preserve the bundled Uthmani text; display corrections follow the supplied Madinah Mushaf reference. */
export function splitQuranDisplayText(text: string) {
  return text.split(/(إِبْرَٰهِۦم[^\s]*|وَٱلنَّبِيِّۦنَ)/u).filter(Boolean).map((part) => {
    const isIbrahim = part.startsWith("إِبْرَٰهِۦم");
    const isNabiyyin = part === "وَٱلنَّبِيِّۦنَ";
    return {
      text: part,
      isIbrahim,
      isNabiyyin,
      display: isIbrahim ? part.replace("هِۦم", "هِـۧم") : part,
    };
  });
}
