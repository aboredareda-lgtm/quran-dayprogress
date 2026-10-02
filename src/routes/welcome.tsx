import { createFileRoute, useNavigate } from "@tanstack/react-router";

import welcomeCover from "@/assets/welcome-cover.png";
import welcomeCoverIpad from "@/assets/welcome-cover-ipad.png";

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

function Welcome() {
  const navigate = useNavigate();

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
    <main className="fixed inset-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#e9e6de]">
      <div className="relative h-full w-full max-w-[56.28dvh] shrink-0 min-[700px]:max-w-[75dvh]">
        <picture className="block h-full w-full">
          <source media="(min-width: 700px)" srcSet={welcomeCoverIpad} />
          <img
            src={welcomeCover}
            alt="الوِرد اليومي — رفيقك لمتابعة قراءة القرآن الكريم"
            className="pointer-events-none block h-full w-full object-cover object-center select-none"
          />
        </picture>
        <button
          type="button"
          onClick={start}
          aria-label="ابدأ القراءة"
          className="absolute inset-x-[10%] bottom-[4%] z-10 h-[8%] appearance-none rounded-full border-0 bg-transparent p-0 shadow-none focus-visible:outline-4 focus-visible:outline-gold"
        >
          <span className="sr-only">ابدأ القراءة</span>
        </button>
      </div>
    </main>
  );
}
