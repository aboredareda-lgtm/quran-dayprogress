const Star = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" className={`absolute h-6 w-6 text-gold ${className}`} aria-hidden="true">
    <path fill="currentColor" d="M12 1l2.6 5.4L20 4l-2.4 5.4L23 12l-5.4 2.6L20 20l-5.4-2.4L12 23l-2.6-5.4L4 20l2.4-5.4L1 12l5.4-2.6L4 4l5.4 2.4z" />
  </svg>
);

const Lantern = ({ side }: { side: string }) => (
  <svg viewBox="0 0 20 44" className={`absolute top-1/2 h-14 w-6 -translate-y-1/2 text-gold drop-shadow-[0_0_6px_var(--gold)] ${side}`} aria-hidden="true">
    <line x1="10" y1="0" x2="10" y2="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 8h8l3 6v16l-3 6H6l-3-6V14z" fill="currentColor" opacity=".35" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="10" cy="22" rx="3" ry="6" fill="currentColor" opacity=".9" />
    <path d="M7 36h6l-3 6z" fill="currentColor" />
  </svg>
);

export function CityFrame({ city, country }: { city: string | null; country: string | null }) {
  return (
    <div className="city-frame relative mt-5 px-8 pb-6 pt-10 text-center">
      <Star className="right-2 top-2" />
      <Star className="left-2 top-2" />
      <Star className="bottom-2 right-2" />
      <Star className="bottom-2 left-2" />
      <Lantern side="right-1" />
      <Lantern side="left-1" />
      <div className="city-frame-arch px-4 pb-5 pt-10">
        <p className="text-4xl font-bold text-gold drop-shadow">{city ?? "مدينتك"}</p>
        <div className="mx-auto my-2 flex items-center justify-center gap-2 text-gold">
          <span className="h-px w-14 bg-gold/70" />
          <span aria-hidden="true">✦</span>
          <span className="h-px w-14 bg-gold/70" />
        </div>
        <p className="text-sm text-primary-foreground/90">{country ?? "يُعرف الاسم بعد تحديد الموقع"}</p>
      </div>
    </div>
  );
}
