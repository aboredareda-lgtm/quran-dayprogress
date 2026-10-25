import { expect, it } from "bun:test";
import { createContactMailto } from "../src/lib/contact-email";

it("preserves the sender's subject and complete message while appending attribution", () => {
  const subject = "اقتراح & سؤال؟";
  const body = "السلام عليكم\nملاحظتي: أ & ب + ج # ١";
  const link = createContactMailto("admin@example.com", subject, body);
  const params = new URLSearchParams(link.slice(link.indexOf("?") + 1));
  const attributionOnly = new URLSearchParams(
    createContactMailto("admin@example.com", "", "").split("?")[1],
  ).get("body");
  expect(params.get("subject")).toBe(subject);
  expect(attributionOnly?.length).toBeGreaterThan(0);
  expect(params.get("body")).toBe(`${body}\n\n${attributionOnly}`);
  expect(link.startsWith("mailto:admin@example.com?")).toBe(true);
});