import { useCallback, useEffect, useState } from "react";

export type ReadingEntry = {
  id: string;
  surah: number;
  ayah: number;
  at: string; // ISO timestamp
  /** ملاحظة قصيرة اختيارية */
  note?: string;
};

const STORAGE_KEY = "quran-reading-log-v1";

function read(): ReadingEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ReadingEntry[]) : [];
  } catch {
    return [];
  }
}

export function useReadingLog() {
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(read());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: ReadingEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const addEntry = useCallback(
    (surah: number, ayah: number, note?: string) => {
      const entry: ReadingEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        surah,
        ayah,
        at: new Date().toISOString(),
        ...(note && note.trim() ? { note: note.trim() } : {}),
      };
      persist([entry, ...read()]);
      return entry;
    },
    [persist],
  );

  const updateEntry = useCallback(
    (id: string, patch: { surah?: number; ayah?: number; note?: string }) => {
      persist(
        read().map((e) => {
          if (e.id !== id) return e;
          const next: ReadingEntry = {
            id: e.id,
            at: e.at,
            surah: patch.surah ?? e.surah,
            ayah: patch.ayah ?? e.ayah,
          };
          const note = patch.note?.trim();
          if (note) next.note = note;
          return next;
        }),
      );

    },
    [persist],
  );

  const removeEntry = useCallback(
    (id: string) => {
      persist(read().filter((e) => e.id !== id));
    },
    [persist],
  );

  const clearAll = useCallback(() => persist([]), [persist]);

  const last = entries[0] ?? null;
  const daysTracked = new Set(entries.map((e) => e.at.slice(0, 10))).size;

  return {
    entries,
    last,
    daysTracked,
    loaded,
    addEntry,
    updateEntry,
    removeEntry,
    clearAll,
  };
}
