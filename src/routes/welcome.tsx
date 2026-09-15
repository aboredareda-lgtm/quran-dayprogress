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
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number; moved: boolean } | null>(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(POS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as { x: number; y: number };
        if (typeof p?.x === "number" && typeof p?.y === "number") {
          posRef.current = p;
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

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: posRef.current.x,
      baseY: posRef.current.y,
      moved: false,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    const next = { x: d.baseX + dx, y: d.baseY + dy };
    posRef.current = next;
    setPos(next);
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (d?.moved) {
      try {
        window.localStorage.setItem(POS_KEY, JSON.stringify(posRef.current));
      } catch {
        /* تجاهل */
      }
      return;
    }
    start();
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

      <div className="relative z-10 mt-auto w-full px-5 pb-[calc(env(safe-area-inset-bottom)+4.5rem)]">
        <button
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          className={`shadow-soft mx-auto block w-[72%] touch-none rounded-full border-2 border-gold/70 bg-primary px-5 py-3 text-center font-display text-xl font-bold tracking-wide text-primary-foreground select-none active:scale-[0.98] ${dragging ? "opacity-90" : ""}`}
        >
          ابدأ المتابعة
        </button>
      </div>
    </main>
  );
}

