/** Preserve the bundled Uthmani text, isolating only Ibrahim's small-ya spelling. */
export function splitQuranDisplayText(text: string) {
  return text.split(/(إِبْرَٰهِۦم[^\s]*)/u).filter(Boolean).map((part) => ({
    text: part,
    isIbrahim: part.startsWith("إِبْرَٰهِۦم"),
  }));
}