/** Ibrahim Al-Akhdar recitation, one file per ayah (requires internet). */
export function recitationUrl(surah: number, ayah: number): string {
  const pad = (n: number) => String(n).padStart(3, "0");
  return `https://everyayah.com/data/Ibrahim_Akhdar_32kbps/${pad(surah)}${pad(ayah)}.mp3`;
}
