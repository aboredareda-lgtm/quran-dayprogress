const APP_ATTRIBUTION = "هذه الرسالة مُرسلة من تطبيق الورد اليومي";

export function createContactMailto(recipient: string, subject: string, body: string) {
  const message = body ? `${body}\n\n${APP_ATTRIBUTION}` : APP_ATTRIBUTION;
  return `mailto:${recipient}?subject=${encodeURIComponent(subject || "ملاحظة على تطبيق الوِرد")}&body=${encodeURIComponent(message)}`;
}