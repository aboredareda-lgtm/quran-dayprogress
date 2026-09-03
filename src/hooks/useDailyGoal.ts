import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wird:daily-goal-ayahs";
export const DEFAULT_GOAL = 50;

/** خيارات الهدف اليومي بعدد الآيات */
export const GOAL_OPTIONS = [
  { value: 10, label: "١٠ آيات" },
  { value: 20, label: "٢٠ آية" },
  { value: 50, label: "٥٠ آية" },
  { value: 104, label: "نصف جزء" },
  { value: 208, label: "جزء كامل" },
] as const;

export function useDailyGoal() {
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? Number(raw) : NaN;
      if (Number.isFinite(parsed) && parsed > 0) setGoal(parsed);
    } catch {
      /* تجاهل */
    }
    setLoaded(true);
  }, []);

  const updateGoal = useCallback((next: number) => {
    const safe = Math.min(Math.max(Math.round(next), 1), TOTAL_MAX);
    setGoal(safe);
    try {
      localStorage.setItem(STORAGE_KEY, String(safe));
    } catch {
      /* تجاهل */
    }
  }, []);

  return { goal, updateGoal, loaded };
}

const TOTAL_MAX = 6236;
