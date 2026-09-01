import { type LoanMember, paidOf, progressOf, remainingOf } from "@/hooks/useLoans";

const money = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 });

type Props = {
  member: LoanMember;
  onQuickPay: () => void;
  onCustomPay: () => void;
  onHistory: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function MemberLoanCard({
  member,
  onQuickPay,
  onCustomPay,
  onHistory,
  onEdit,
  onDelete,
}: Props) {
  const paid = paidOf(member);
  const remaining = remainingOf(member);
  const percent = progressOf(member);

  return (
    <div className="shadow-soft overflow-hidden rounded-[2.5rem] border-b-8 border-primary bg-card transition-transform hover:-translate-y-1">
      {/* ترويسة البطاقة */}
      <div className="bg-gradient-calm relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <svg viewBox="0 0 100 100" aria-hidden className="h-full w-full fill-current text-primary-foreground">
            <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold tracking-wider text-gold">عضو الجمعية</p>
            <h2 className="truncate text-xl font-bold text-primary-foreground">{member.name}</h2>
          </div>
          <div className="shrink-0 rounded-xl border border-gold/70 bg-gold p-2 shadow-inner">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* المبالغ */}
      <div className="p-6">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-muted-foreground">المبلغ المتبقي</p>
          <p className="mt-1 text-4xl font-bold text-primary">
            {money.format(remaining)} <span className="text-lg font-medium text-gold">ر.س</span>
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gold/35 bg-secondary/60 p-3 text-center">
            <p className="mb-1 text-[11px] text-muted-foreground">إجمالي القرض</p>
            <p className="font-bold text-primary">{money.format(member.total)} ر.س</p>
          </div>
          <div className="rounded-2xl border border-gold/35 bg-secondary/60 p-3 text-center">
            <p className="mb-1 text-[11px] text-muted-foreground">تم سداده</p>
            <p className="font-bold text-primary">{money.format(paid)} ر.س</p>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-[11px] font-bold text-muted-foreground">
            <span>التقدم المحرز</span>
            <span>{percent}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted p-[2px]">
            <div
              className="h-full rounded-full bg-gradient-to-l from-gold to-gold-soft"
              style={{ width: `${percent}%` }}
            />
          </div>
          {member.installment > 0 && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              القسط الشهري: {money.format(member.installment)} ر.س
            </p>
          )}
        </div>

        {/* الأزرار */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onQuickPay}
              className="rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-[0_4px_0_var(--foreground)] transition-all active:translate-y-1 active:shadow-none"
            >
              سداد سريع
            </button>
            <button
              onClick={onCustomPay}
              className="rounded-2xl border-2 border-primary bg-card py-3 text-sm font-bold text-primary shadow-[0_4px_0_var(--primary)] transition-all active:translate-y-1 active:shadow-none"
            >
              سداد مخصص
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={onHistory}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gold/40 bg-secondary/50 py-2 text-primary"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01"
                />
              </svg>
              <span className="text-[11px] font-bold">السجل</span>
            </button>
            <button
              onClick={onEdit}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gold/40 bg-secondary/50 py-2 text-primary"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-[11px] font-bold">تعديل</span>
            </button>
            <button
              onClick={onDelete}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-destructive/25 bg-destructive/10 py-2 text-destructive"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="text-[11px] font-bold">حذف</span>
            </button>
          </div>
        </div>
      </div>

      <div className="h-2 w-full bg-gold" />
    </div>
  );
}
