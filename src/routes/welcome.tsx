import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";


import welcomeCover from "@/assets/welcome-cover.png.asset.json";

export const WELCOME_KEY = "wird:welcomed";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "أهلاً بك في الوِرد اليومي" },
      {
        name: "description",
        content: "ابدأ متابعة وردك اليومي من القرآن الكريم، وسجّل آخر سورة وآية وصلت إليها.",
      },
      { property: "og:title", content: "أهلاً بك في الوِرد اليومي" },
      {
        property: "og:description",
        content: "رفيقك لمتابعة قراءة القرآن الكريم — ابدأ المتابعة الآن.",
      },
    ],
  }),
  component: Welcome,
});

const POS_KEY = "wird:welcome-btn-pos";

function Welcome() {
  const navigate = useNavigate();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(POS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { x: number; y: number };
        if (typeof p?.x === "number" && typeof p?.y === "number") {
          setPos(p);
        }
      }
    } catch {
      /* تجاهل */
    }
  }, []);

  const start = () => {
    try {
      window.localStorage.setItem(WELCOME_KEY, "1");
      window.sessionStorage.setItem("wird:welcomed-session", "1");
    } catch {
      /* تجاهل */
    }
    navigate({ to: "/" });
  };

  return (
    <main className="bg-gradient-calm fixed inset-0 flex h-[100dvh] w-full flex-col overflow-hidden">
      <img
        src={welcomeCover.url}
        alt="الوِرد اليومي — رفيقك لمتابعة قراءة القرآن الكريم"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-center"
      />

      {/* تدرّج يخفي شريط الصورة السفلي */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-[5] h-[20%] bg-gradient-to-t from-background via-background/85 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-[19%] z-10 w-full px-5">
        <button
          onClick={start}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          className="shadow-soft mx-auto block w-[52%] rounded-full border-2 border-gold/70 bg-primary px-4 py-2 text-center font-display text-base font-bold tracking-wide text-primary-foreground select-none active:scale-[0.98]"
        >
          ابدأ المتابعة
        </button>
      </div>
    </main>
  );
}


