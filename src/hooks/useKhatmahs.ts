import { khatmahsSchema } from "@/lib/backup-schema";
import { useCallback, useEffect, useState } from "react";

export type Khatmah = {
  id: string;
  at: string; // ISO
};

const KEY = "wird:khatmahs";

function read(): Khatmah[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = khatmahsSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

/** عدّاد الخَتمات: كم مرة أُكمل المصحف، مع تاريخ كل خَتمة */
export function useKhatmahs() {
  const [khatmahs, setKhatmahs] = useState<Khatmah[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setKhatmahs(read());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Khatmah[]) => {
    setKhatmahs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* تجاهل */
    }
  }, []);

  const addKhatmah = useCallback(() => {
    const item: Khatmah = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
    };
    persist([item, ...read()]);
    return item;
  }, [persist]);

  const removeKhatmah = useCallback(
    (id: string) => persist(read().filter((k) => k.id !== id)),
    [persist],
  );

  return { khatmahs, count: khatmahs.length, loaded, addKhatmah, removeKhatmah };
}
