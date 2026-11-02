/** Umm al-Qura calendar, using the calendar day on the reader's device. */
export function formatWelcomeDate(date: Date) {
  return {
    day: new Intl.DateTimeFormat("ar-SA", { weekday: "long" }).format(date),
    hijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date),
  };
}