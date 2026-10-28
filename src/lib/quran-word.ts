export const NABIYYIN = "ٱلنَّبِيِّـۧنَ";

// Splits only for display; joining the parts always returns the official text.
export function splitNabiyyin(text: string): string[] {
  return text.split(/(ٱلنَّبِيِّـۧنَ)/u).filter(Boolean);
}
