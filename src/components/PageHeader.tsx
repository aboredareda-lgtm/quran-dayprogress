import { Link } from "@tanstack/react-router";
import { OrnamentDivider } from "@/components/Ornament";

type Props = {
  title: string;
  back?: "/" | "/settings";
  backLabel?: string;
};

/** رأس الصفحات: خلفية زمردية مع محراب ذهبي */
export function PageHeader({ title, back = "/", backLabel = "عودة للرئيسية" }: Props) {
  return (
    <header className="bg-gradient-calm pattern-emerald safe-top relative overflow-hidden px-4 pb-4 text-on-emerald">
      <Link to={back} className="relative z-10 text-sm text-gold-soft">
        → {backLabel}
      </Link>
      <div className="relative mx-auto mt-2 max-w-xs">
        <svg viewBox="0 0 300 120" className="absolute inset-0 h-full w-full text-gold drop-shadow-[0_6px_6px_oklch(0_0_0/0.55)]" aria-hidden preserveAspectRatio="none">
          <path
            d="M6 118V70C6 50 26 42 48 40 78 38 100 26 120 12 135 2 150 0 150 0s15 2 30 12c20 14 42 26 72 28 22 2 42 10 42 30v48"
            fill="oklch(0.2 0.045 160 / 0.55)"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M14 118V72c0-15 16-22 36-24 30-2 54-14 74-28 13-9 26-12 26-12s13 3 26 12c20 14 44 26 74 28 20 2 36 9 36 24v46"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1"
          />
        </svg>
        <div className="relative px-6 pt-10 pb-3 text-center">
          <h1 className="font-display text-3xl font-bold text-gold-soft [text-shadow:0_2px_0_oklch(0.4_0.08_70),0_4px_8px_oklch(0_0_0/0.5)]">{title}</h1>
          <OrnamentDivider className="mt-1" />
        </div>
      </div>
    </header>
  );
}

/** بطاقة آية مزخرفة */
export function VerseCard({ verse, source }: { verse: string; source: string }) {
  return (
    <div className="islamic-card mx-auto mt-4 max-w-md px-5 py-3 text-center">
      <p className="font-display text-xl leading-9 text-primary">﴿{verse}﴾</p>
      <p className="text-xs text-muted-foreground">{source}</p>
    </div>
  );
}
