/** Calendar day on the user's device, independent of UTC midnight. */
export function localDayKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
