import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MemberLoanCard } from "@/components/MemberLoanCard";
import { Ornament, OrnamentDivider } from "@/components/Ornament";
import { type LoanMember, useLoans } from "@/hooks/useLoans";

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "سداد القروض — بطاقات الأعضاء" },
      {
        name: "description",
        content:
          "تابع سداد قرض كل عضو ببطاقة واضحة: سداد سريع، سداد مخصص، سجل الدفعات، تعديل وحذف — والبيانات محفوظة على جوالك.",
      },
      { property: "og:title", content: "سداد القروض — بطاقات الأعضاء" },
      {
        property: "og:description",
        content: "بطاقة لكل عضو تعرض المتبقي ونسبة السداد مع أزرار السداد والسجل.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoansPage,
});

const money = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 });

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}

type Dialog =
  | { kind: "add" }
  | { kind: "edit"; member: LoanMember }
  | { kind: "pay"; member: LoanMember }
  | { kind: "history"; member: LoanMember }
  | { kind: "delete"; member: LoanMember }
  | null;

function LoansPage() {
  const { members, loaded, addMember, updateMember, removeMember, addPayment, removePayment } =
    useLoans();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const current =
    dialog && dialog.kind !== "add"
      ? (members.find((m) => m.id === dialog.member.id) ?? dialog.member)
      : null;

  return (
    <main className="pattern-cream screen-fill mx-auto w-full max-w-[26rem] overflow-x-hidden">
      <header className="bg-gradient-calm pattern-emerald safe-top px-5 pb-10 text-center text-primary-foreground">
        <Ornament className="mx-auto h-7 w-7 text-gold" />
        <h1 className="font-display mt-3 text-3xl font-bold">سداد القروض</h1>
        <p className="mt-2 text-sm text-primary-foreground/75">
          بطاقة لكل عضو مع أقساط الجمعية الشهرية
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-full border border-gold/50 px-5 py-2 text-sm font-bold text-gold"
        >
          → الوِرد اليومي
        </Link>
      </header>

      <section className="px-4 py-5">
        <button
          onClick={() => setDialog({ kind: "add" })}
          className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-gold/60 bg-primary px-5 py-4 text-lg font-bold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <Ornament className="h-6 w-6 text-gold-soft" />
          إضافة عضو
        </button>

        {!loaded ? (
          <div className="mt-5 h-64 animate-pulse rounded-[2.5rem] bg-muted" />
        ) : members.length === 0 ? (
          <div className="mt-5 rounded-[2rem] border border-gold/40 bg-card p-8 text-center">
            <OrnamentDivider />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              لا يوجد أعضاء بعد — أضف أول عضو وحدّد مبلغ القرض والقسط الشهري.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {members.map((m) => (
              <MemberLoanCard
                key={m.id}
                member={m}
                onQuickPay={() => {
                  if (m.installment > 0) {
                    addPayment(m.id, m.installment);
                    notify(`تم تسجيل قسط ${money.format(m.installment)} ر.س لـ${m.name}`);
                  } else {
                    setDialog({ kind: "pay", member: m });
                  }
                }}
                onCustomPay={() => setDialog({ kind: "pay", member: m })}
                onHistory={() => setDialog({ kind: "history", member: m })}
                onEdit={() => setDialog({ kind: "edit", member: m })}
                onDelete={() => setDialog({ kind: "delete", member: m })}
              />
            ))}
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs leading-6 text-muted-foreground">
          <Ornament className="h-4 w-4 shrink-0 text-gold" />
          بيانات القروض محفوظة على هذا الجهاز فقط.
        </p>
      </section>

      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit rounded-full border border-gold/50 bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          {toast}
        </div>
      )}

      {dialog?.kind === "add" && (
        <MemberForm
          title="إضافة عضو"
          onCancel={() => setDialog(null)}
          onSubmit={(name, total, installment) => {
            addMember(name, total, installment);
            setDialog(null);
            notify("تمت إضافة العضو");
          }}
        />
      )}

      {dialog?.kind === "edit" && current && (
        <MemberForm
          title="تعديل العضو"
          initial={current}
          onCancel={() => setDialog(null)}
          onSubmit={(name, total, installment) => {
            updateMember(current.id, { name, total, installment });
            setDialog(null);
            notify("تم تعديل بيانات العضو");
          }}
        />
      )}

      {dialog?.kind === "pay" && current && (
        <PaymentForm
          member={current}
          onCancel={() => setDialog(null)}
          onSubmit={(amount, date) => {
            addPayment(current.id, amount, new Date(date).toISOString());
            setDialog(null);
            notify(`تم تسجيل دفعة ${money.format(amount)} ر.س`);
          }}
        />
      )}

      {dialog?.kind === "history" && current && (
        <Sheet title={`سجل دفعات ${current.name}`} onClose={() => setDialog(null)}>
          {current.payments.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">لا توجد دفعات مسجّلة.</p>
          ) : (
            <ul className="max-h-[50vh] space-y-3 overflow-y-auto py-2">
              {current.payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border border-gold/35 bg-secondary/50 px-4 py-3"
                >
                  <div>
                    <p className="font-bold text-primary">{money.format(p.amount)} ر.س</p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.at)}</p>
                  </div>
                  <button
                    onClick={() => removePayment(current.id, p.id)}
                    className="rounded-full border border-destructive/30 px-4 py-1.5 text-xs font-bold text-destructive"
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      )}

      {dialog?.kind === "delete" && current && (
        <Sheet title="حذف العضو" onClose={() => setDialog(null)}>
          <p className="py-4 text-center leading-relaxed">
            سيتم حذف «{current.name}» وكل دفعاته. هل تريد المتابعة؟
          </p>
          <div className="mt-2 flex gap-3">
            <button
              onClick={() => {
                removeMember(current.id);
                setDialog(null);
                notify("تم حذف العضو");
              }}
              className="flex-1 rounded-full bg-destructive px-4 py-3 font-bold text-destructive-foreground"
            >
              حذف
            </button>
            <button
              onClick={() => setDialog(null)}
              className="rounded-full border border-border px-6 py-3 font-medium"
            >
              إلغاء
            </button>
          </div>
        </Sheet>
      )}
    </main>
  );
}

function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/50 px-4 pb-4">
      <div className="pattern-cream w-full rounded-[2rem] border-2 border-gold/50 p-6 text-card-foreground">
        <OrnamentDivider />
        <h2 className="mt-3 text-center text-lg font-bold text-primary">{title}</h2>
        {children}
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-border py-3 font-medium"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}

const fieldClass =
  "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3.5 text-center text-xl font-bold text-primary";
const labelClass = "mt-4 block text-center text-lg font-bold text-primary";

function MemberForm({
  title,
  initial,
  onCancel,
  onSubmit,
}: {
  title: string;
  initial?: LoanMember;
  onCancel: () => void;
  onSubmit: (name: string, total: number, installment: number) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [total, setTotal] = useState(String(initial?.total ?? ""));
  const [installment, setInstallment] = useState(String(initial?.installment ?? ""));

  const valid = name.trim().length > 0 && Number(total) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/50 px-4 pb-4">
      <div className="pattern-cream w-full rounded-[2rem] border-2 border-gold/50 p-6 text-card-foreground">
        <OrnamentDivider />
        <h2 className="mt-3 text-center text-lg font-bold text-primary">{title}</h2>

        <label className={labelClass} htmlFor="name">
          اسم العضو
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />

        <label className={labelClass} htmlFor="total">
          إجمالي القرض (ر.س)
        </label>
        <input
          id="total"
          type="number"
          min={0}
          inputMode="numeric"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          className={fieldClass}
        />

        <label className={labelClass} htmlFor="installment">
          القسط الشهري (ر.س)
        </label>
        <input
          id="installment"
          type="number"
          min={0}
          inputMode="numeric"
          value={installment}
          onChange={(e) => setInstallment(e.target.value)}
          className={fieldClass}
        />

        <div className="mt-6 flex gap-3">
          <button
            disabled={!valid}
            onClick={() => onSubmit(name, Number(total) || 0, Number(installment) || 0)}
            className="flex-1 rounded-full border-2 border-gold/60 bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50"
          >
            حفظ
          </button>
          <button
            onClick={onCancel}
            className="rounded-full border border-border px-6 py-3 font-medium"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({
  member,
  onCancel,
  onSubmit,
}: {
  member: LoanMember;
  onCancel: () => void;
  onSubmit: (amount: number, date: string) => void;
}) {
  const [amount, setAmount] = useState(
    member.installment > 0 ? String(member.installment) : "",
  );
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/50 px-4 pb-4">
      <div className="pattern-cream w-full rounded-[2rem] border-2 border-gold/50 p-6 text-card-foreground">
        <OrnamentDivider />
        <h2 className="mt-3 text-center text-lg font-bold text-primary">
          سداد مخصص — {member.name}
        </h2>

        <label className={labelClass} htmlFor="amount">
          مبلغ الدفعة (ر.س)
        </label>
        <input
          id="amount"
          type="number"
          min={1}
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={fieldClass}
        />

        <label className={labelClass} htmlFor="date">
          تاريخ الدفعة
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={fieldClass}
        />

        <div className="mt-6 flex gap-3">
          <button
            disabled={!(Number(amount) > 0)}
            onClick={() => onSubmit(Number(amount), date)}
            className="flex-1 rounded-full border-2 border-gold/60 bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-50"
          >
            حفظ
          </button>
          <button
            onClick={onCancel}
            className="rounded-full border border-border px-6 py-3 font-medium"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
