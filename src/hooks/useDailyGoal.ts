import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wird:daily-goal-juz";
export const DEFAULT_GOAL = 1;

/** خيارات الهدف اليومي بالأجزاء، مع إبقاء إعداد الآيات القديم دون تغيير. */
export const GOAL_OPTIONS = [
  { value: 0.5, label: "نصف جزء" },
  { value: 1, label: "جزء واحد" },
  { value: 2, label: "جزآن" },
] as const;

export function useDailyGoal() {
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? Number(raw) : NaN;
      if (GOAL_OPTIONS.some(option => option.value === parsed)) setGoal(parsed);
    } catch {
      /* تجاهل */
    }
    setLoaded(true);
  }, []);

  const updateGoal = useCallback((next: number) => {
    if (!GOAL_OPTIONS.some(option => option.value === next)) return;
    const safe = next;
    setGoal(safe);
    try {
      localStorage.setItem(STORAGE_KEY, String(safe));
    } catch {
      /* تجاهل */
    }
  }, []);

  return { goal, updateGoal, loaded };
}

