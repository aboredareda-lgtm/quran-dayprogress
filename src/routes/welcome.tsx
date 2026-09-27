import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";


import welcomeCover from "@/assets/welcome-cover-2.jpg.asset.json";

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
    <main className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-card">
      <img
        src={welcomeCover.url}
        alt="الوِرد اليومي — رفيقك لمتابعة قراءة القرآن الكريم"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
      />
      <div
        className="absolute inset-x-0 z-10 mx-auto w-full max-w-[26rem] px-8"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 12%)" }}
      >
        <button
          onClick={start}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          className="btn-turquoise-3d block w-full rounded-full px-4 py-4 text-center font-display text-xl font-bold tracking-wide select-none"
        >
          ابدأ المتابعة
        </button>
      </div>
    </main>
  );
}


