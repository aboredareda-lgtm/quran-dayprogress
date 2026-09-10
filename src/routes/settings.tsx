import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Ornament } from "@/components/Ornament";
import { useKhatmahs } from "@/hooks/useKhatmahs";
import { useTheme } from "@/hooks/useTheme";
import { downloadBackup, restoreBackup } from "@/lib/backup";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — وِرد" },
      {
        name: "description",
        content:
          "الوضع الليلي، عدّاد الخَتمات، والنسخة الاحتياطية لسجل قراءتك في تطبيق الوِرد.",
      },
      { property: "og:title", content: "الإعدادات — وِرد" },
      {
        property: "og:description",
        content: "اضبط الوضع الليلي، وسجّل ختماتك، واحفظ نسخة احتياطية من سجلك.",
      },
    ],
  }),
  component: Settings;
});

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(new Date(iso));
}

function Settings() {
  const { theme, toggle } = useTheme();
  const { khatmahs, count, addKhatmah, removeKhatmah } = useKhatmahs();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onRestore = async (file: File | undefined) => {
    if (!file) return;
    try {
      const n = await restoreBackup(file);
      setMessage(`تمت استعادة النسخة (${n} عنصرًا). سيُحدَّث التطبيق الآن.`);
      setTimeout(() => window.location.assign("/"), 1200);
    } catch {
      setMessage("الملف غير صالح — اختر ملف نسخة احتياطية من هذا التطبيق.");
    }
  };

  return (
    <main className="pattern-cream screen-fill mx-auto overflow-x-hidden sm:max-w-[26rem]">
      <header className="bg-gradient-calm pattern-arch safe-top px-4 pb-8 text-primary-foreground min-[380px]:px-5">
        <Link to="/" className="text-sm text-gold-soft">
          → عودة للرئيسية
        </Link>
        <h1 className="font-display mt-3 text-3xl font-bold">الإعدادات</h1>
      </header>

      <section className="space-y-3 px-3 pt-6 min-[380px]:px-5">
        {/* الوضع الليلي */}
        <div className="pattern-cream flex items-center justify-between gap-3 rounded-3xl border border-gold/40 p-4 text-card-foreground">
          <span className="flex items-center gap-2 text-sm font-bold text-primary">
            <Ornament className="h-4 w-4 shrink-0 text-gold" />
            الوضع الليلي
          </span>
          <button
            onClick={toggle}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold ${
              theme === "dark"
                ? "border-gold/60 bg-primary text-primary-foreground"
                : "border-gold/50 bg-secondary text-secondary-foreground"
            }`}
          >
            {theme === "dark" ? "مُفعَّل" : "معطّل"}
          </button>
        </div>

        {/* عدّاد الخَتمات */}
        <div className="pattern-cream rounded-3xl border border-gold/40 p-4 text-card-foreground">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-bold text-primary">
              <Ornament className="h-4 w-4 shrink-0 text-gold" />
              عدّاد الخَتمات
            </span>
            <span className="text-3xl font-bold text-primary">{count}</span>
          </div>

          <button
            onClick={addKhatmah}
            className="mt-3 w-full rounded-full border-2 border-gold/60 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground active:scale-[0.98]"
          >
            تسجيل ختمة جديدة
          </button>

          {khatmahs.length > 0 && (
            <ul className="mt-3 space-y-2">
              {khatmahs.map((k, i) => (
                <li
                  key={k.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gold/30 px-3 py-2 text-sm"
                >
                  <span>
                    الختمة {khatmahs.length - i} · {formatDate(k.at)}
                  </span>
                  <button
                    onClick={() => removeKhatmah(k.id)}
                    className="rounded-xl border border-border px-3 py-1 text-xs text-destructive"
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* النسخة الاحتياطية */}
        <div className="pattern-cream rounded-3xl border border-gold/40 p-4 text-card-foreground">
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <Ornament className="h-4 w-4 shrink-0 text-gold" />
            النسخة الاحتياطية
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            احفظ ملفًا يحتوي سجلك وإعداداتك، واستعده على أي جوال آخر.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                downloadBackup();
                setMessage("تم حفظ ملف النسخة الاحتياطية.");
              }}
              className="flex-1 rounded-full border-2 border-gold/60 bg-primary px-3 py-3 text-sm font-bold text-primary-foreground"
            >
              حفظ نسخة
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-full border-2 border-gold/50 bg-secondary px-3 py-3 text-sm font-bold text-secondary-foreground"
            >
              استعادة نسخة
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void onRestore(e.target.files?.[0])}
          />
        </div>

        {message && (
          <p className="rounded-2xl border border-gold/40 bg-secondary px-4 py-2 text-center text-xs text-secondary-foreground">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
