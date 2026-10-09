import { createFileRoute, useNavigate } from "@tanstack/react-router";

// Bundled locally (not the Lovable asset URL) so the cover also loads in the
// offline iOS app, where /__l5e/ asset paths are not served.
import welcomeCover from "@/assets/welcome-cover-2.jpg";
import { readUserName } from "@/hooks/useUserName";

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
    navigate({ to: readUserName() ? "/" : "/name" });
  };

  return (
    <main className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-card">
      {/* الجوال: الصورة تملأ الشاشة. الشاشات العريضة: الصورة كاملة بطول الشاشة في المنتصف. */}
      <div className="absolute inset-0 [@media(min-aspect-ratio:3/4)]:relative [@media(min-aspect-ratio:3/4)]:mx-auto [@media(min-aspect-ratio:3/4)]:h-full [@media(min-aspect-ratio:3/4)]:aspect-[1/2.184]">
        <img
          src={welcomeCover}
          alt="الوِرد اليومي — رفيقك لمتابعة قراءة القرآن الكريم"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
        />
        <div
          className="absolute inset-x-0 z-10 mx-auto w-[78%] max-w-[22rem] [@media(min-aspect-ratio:3/4)]:top-[75%]!"
          style={{ top: "min(calc(50% + 0.25 * max(100dvh, 100vw * 2.184)), calc(100% - env(safe-area-inset-bottom) - 4.5rem))" }}
        >
          <button
            type="button"
            onClick={start}
            className="btn-turquoise-3d block w-full rounded-full px-3 py-3 text-center font-display text-lg font-bold tracking-wide select-none"
          >
            ابدأ المتابعة
          </button>
        </div>
      </div>
    </main>
  );
}
