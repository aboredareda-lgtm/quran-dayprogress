import { useCallback, useEffect, useState } from "react";

export type LoanPayment = {
  id: string;
  amount: number;
  at: string; // ISO
};

export type LoanMember = {
  id: string;
  name: string;
  total: number;
  installment: number;
  payments: LoanPayment[];
};

const STORAGE_KEY = "loan-members-v1";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function read(): LoanMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as LoanMember[]).map((m) => ({
      ...m,
      payments: Array.isArray(m.payments) ? m.payments : [],
    }));
  } catch {
    return [];
  }
}

export function paidOf(m: LoanMember) {
  return m.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

export function remainingOf(m: LoanMember) {
  return Math.max(m.total - paidOf(m), 0);
}

export function progressOf(m: LoanMember) {
  if (!m.total) return 0;
  return Math.min(Math.round((paidOf(m) / m.total) * 100), 100);
}

export function useLoans() {
  const [members, setMembers] = useState<LoanMember[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMembers(read());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: LoanMember[]) => {
    setMembers(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const addMember = useCallback(
    (name: string, total: number, installment: number) => {
      const member: LoanMember = {
        id: newId(),
        name: name.trim() || "عضو",
        total,
        installment,
        payments: [],
      };
      persist([member, ...read()]);
      return member;
    },
    [persist],
  );

  const updateMember = useCallback(
    (id: string, patch: Partial<Pick<LoanMember, "name" | "total" | "installment">>) => {
      persist(read().map((m) => (m.id === id ? { ...m, ...patch } : m)));
    },
    [persist],
  );

  const removeMember = useCallback(
    (id: string) => {
      persist(read().filter((m) => m.id !== id));
    },
    [persist],
  );

  const addPayment = useCallback(
    (id: string, amount: number, at?: string) => {
      const payment: LoanPayment = {
        id: newId(),
        amount,
        at: at ?? new Date().toISOString(),
      };
      persist(
        read().map((m) =>
          m.id === id ? { ...m, payments: [payment, ...m.payments] } : m,
        ),
      );
    },
    [persist],
  );

  const removePayment = useCallback(
    (memberId: string, paymentId: string) => {
      persist(
        read().map((m) =>
          m.id === memberId
            ? { ...m, payments: m.payments.filter((p) => p.id !== paymentId) }
            : m,
        ),
      );
    },
    [persist],
  );

  return {
    members,
    loaded,
    addMember,
    updateMember,
    removeMember,
    addPayment,
    removePayment,
  };
}
