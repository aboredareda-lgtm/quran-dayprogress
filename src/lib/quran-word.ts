export const NABIYYIN = "\u0671\u0644\u0646\u0651\u064E\u0628\u0650\u064A\u0651\u0650\u0640\u06E7\u0646\u064E";

// Splits only for display; joining the parts always returns the official text.
export function splitNabiyyin(text: string): string[] {
  return text.split(new RegExp(`((?:[وب][\\u064E\\u0650])?${NABIYYIN})`, "u")).filter(Boolean);
}
