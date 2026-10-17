import { createFileRoute, useNavigate } from "@tanstack/react-router";

import welcomeCoverAsset from "@/assets/welcome-cover-new.jpg.asset.json";
// Capacitor's offline app cannot serve CDN asset paths; keep a bundled fallback.
import welcomeCoverOffline from "@/assets/welcome-cover-new.jpg";
import { Button } from "@/components/ui/button";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <div className="welcome-frame absolute inset-0">
        <img
          src={welcomeCoverAsset.url}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = welcomeCoverOffline;
          }}
          alt="الوِرد اليومي — رفيقك لمتابعة قراءة القرآن الكريم"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
        />
        <div
          className="welcome-btn absolute inset-x-0 z-10 mx-auto w-[78%] max-w-[22rem]"
          style={{ top: "min(calc(50% + 0.36 * max(100dvh, 100vw * 2.1875) + 1rem), calc(100% - env(safe-area-inset-bottom) - 4rem))" }}
        >
          <Button
            type="button"
            onClick={start}
            className="btn-turquoise-3d block h-auto min-h-14 w-full select-none rounded-full px-3 py-3 text-center font-display text-2xl font-bold"
          >
            ابْدَأِ المُتَابَعَةَ
          </Button>
        </div>
      </div>
    </main>
  );
}
