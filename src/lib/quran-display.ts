/** Preserve the bundled Uthmani text; Ibrahim gets a display form matching the King Fahd Madinah Mushaf. */
export function splitQuranDisplayText(text: string) {
  return text.split(/(إِبْرَٰهِۦم[^\s]*)/u).filter(Boolean).map((part) => {
    const isIbrahim = part.startsWith("إِبْرَٰهِۦم");
    return {
      text: part,
      isIbrahim,
      display: isIbrahim ? part.replace("هِۦم", "هِـۧم") : part,
    };
  });
}
