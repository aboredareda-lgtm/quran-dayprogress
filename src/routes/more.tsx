import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "المزيد — الوِرد اليومي" },
      { name: "description", content: "القبلة وأوقات الصلاة وخطة الختمة والآيات المفضلة." },
      { property: "og:title", content: "المزيد — الوِرد اليومي" },
      { property: "og:description", content: "أدوات إضافية للقارئ: القبلة، الصلاة، الخطة، المفضلة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: More,
});

const items = [
  { to: "/prayer", label: "🕌 أوقات الصلاة" },
  { to: "/qibla", label: "🕋 اتجاه القبلة" },
  { to: "/plan", label: "📅 خطة الختمة" },
  { to: "/favorites", label: "⭐ آياتي المفضلة" },
] as const;

function More() {
  return (
    <main className="pattern-cream min-h-dvh px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]" dir="rtl">
      <div className="mx-auto max-w-md">
        <Link to="/" className="inline-block rounded-full border border-gold/50 bg-card px-4 py-1.5 text-sm font-bold text-primary">
          رجوع
        </Link>
        <h1 className="mt-4 text-center text-2xl font-bold text-primary">المزيد</h1>
        <div className="mt-6 grid gap-3">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="rounded-2xl border-2 border-gold/50 bg-card px-4 py-4 text-center text-lg font-bold text-primary"
            >
              {i.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
