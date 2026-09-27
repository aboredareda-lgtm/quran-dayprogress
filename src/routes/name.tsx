import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useUserName } from "@/hooks/useUserName";

export const Route = createFileRoute("/name")({
  head: () => ({
    meta: [
      { title: "اكتب اسمك — الوِرد اليومي" },
      { name: "description", content: "اكتب اسمك ليظهر في صفحة متابعة وردك اليومي." },
      { property: "og:title", content: "اكتب اسمك — الوِرد اليومي" },
      { property: "og:description", content: "خطوة واحدة قبل بدء متابعة وردك اليومي." },
    ],
  }),
  component: NamePage,
});

function NamePage() {
  const navigate = useNavigate();
  const { setName } = useUserName();
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setName(value);
    navigate({ to: "/" });
  };

  return (
    <main className="bg-gradient-calm pattern-emerald fixed inset-0 flex h-[100dvh] w-full items-center justify-center px-6 text-on-emerald">
      <form onSubmit={submit} className="w-full max-w-[22rem] space-y-6 text-center">
        <h1 className="font-display text-4xl font-bold text-gold-soft">ما اسمك؟</h1>
        <p className="text-sm opacity-90">سيظهر اسمك في أعلى صفحة المتابعة</p>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="اكتب اسمك هنا"
          maxLength={30}
          className="w-full rounded-2xl border-2 border-gold/60 bg-card px-4 py-3 text-center text-lg font-bold text-card-foreground outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="btn-turquoise-3d block w-full rounded-full px-4 py-3 font-display text-xl font-bold disabled:opacity-60"
        >
          دخول
        </button>
      </form>
    </main>
  );
}
