type Props = { className?: string };

/** زخرفة نجمة ثمانية ذهبية */
export function Ornament({ className }: Props) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="none">
      <path
        d="M16 1.5 20 6h6v6l4.5 4-4.5 4v6h-6l-4 4.5L12 26H6v-6l-4.5-4L6 12V6h6l4-4.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="16" cy="16" r="4.2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** فاصل ذهبي مع زخرفة في المنتصف */
export function OrnamentDivider({ className = "" }: Props) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/60" />
      <Ornament className="h-6 w-6 text-gold" />
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/60" />
    </div>
  );
}
