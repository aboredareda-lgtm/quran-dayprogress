import { createFileRoute, useNavigate } from "@tanstack/react-router";
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


      <div className="relative z-10 mt-auto w-full px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
        <button
          onClick={start}
          className="shadow-soft w-full rounded-full border-2 border-gold/70 bg-primary px-6 py-4 text-xl font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          ابدأ المتابعة
        </button>
      </div>
    </main>
  );
}
