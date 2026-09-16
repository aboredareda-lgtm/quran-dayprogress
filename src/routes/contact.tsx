import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Ornament, OrnamentDivider } from "@/components/Ornament";

const ADMIN_EMAIL = "aboreda.reda@gmail.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل مع الإدارة — وِرد" },
      {
        name: "description",
        content:
          "أرسل ملاحظاتك أو اقتراحاتك لإدارة تطبيق الوِرد عبر البريد الإلكتروني.",
      },
      { property: "og:title", content: "تواصل مع الإدارة — وِرد" },
      {
        property: "og:description",
        content: "في حال وجود أي ملاحظة أو اقتراح، تواصل مع إدارة التطبيق.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  const mailto = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    subject || "ملاحظة على تطبيق الوِرد",
  )}&body=${encodeURIComponent(body)}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ADMIN_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* تجاهل */
    }
  };

  return (
    <main className="pattern-cream screen-fill mx-auto overflow-x-hidden sm:max-w-[26rem]">
      <header className="bg-gradient-calm pattern-arch safe-top px-4 pb-8 text-on-emerald min-[380px]:px-5">
        <Link to="/" className="text-sm text-gold-soft">
          → عودة للرئيسية
        </Link>
        <h1 className="font-display mt-3 text-3xl font-bold">تواصل مع الإدارة</h1>
      </header>

      <section className="space-y-3 px-3 pt-6 min-[380px]:px-5">
        <div className="pattern-cream shadow-raised rounded-3xl border-2 border-gold/50 p-4 text-center text-card-foreground">
          <OrnamentDivider />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            في حال وجود أي ملاحظة أو اقتراح، تواصل معنا على البريد:
          </p>
          <p className="mt-2 text-lg font-bold text-primary" dir="ltr">
            {ADMIN_EMAIL}
          </p>
          <button
            onClick={copyEmail}
            className="mt-3 rounded-full border-2 border-gold/50 bg-secondary px-5 py-2 text-sm font-bold text-secondary-foreground"
          >
            {copied ? "تم نسخ البريد" : "نسخ البريد"}
          </button>
        </div>

        <div className="pattern-cream rounded-3xl border border-gold/40 p-4 text-card-foreground">
          <label className="block text-sm font-bold text-primary" htmlFor="subject">
            عنوان الملاحظة
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="مثال: اقتراح تحسين"
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-base"
          />

          <label className="mt-4 block text-sm font-bold text-primary" htmlFor="body">
            نص الملاحظة
          </label>
          <textarea
            id="body"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="اكتب ملاحظتك هنا…"
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-base"
          />

          <a
            href={mailto}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-gold/60 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
          >
            <Ornament className="h-4 w-4 text-gold-soft" />
            إرسال عبر البريد
          </a>

          <p className="mt-2 text-center text-[0.7rem] leading-5 text-muted-foreground">
            سيُفتح تطبيق البريد على جوالك مع رسالتك جاهزة للإرسال.
          </p>
        </div>
      </section>
    </main>
  );
}
