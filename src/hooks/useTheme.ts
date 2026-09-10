import { useCallback, useEffect, useState } from "react";

const KEY = "wird:theme";
export type Theme = "light" | "dark";

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

/** الوضع الليلي — محفوظ على الجهاز */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let next: Theme = "light";
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === "dark" || raw === "light") next = raw;
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) next = "dark";
    } catch {
      /* تجاهل */
    }
    setTheme(next);
    apply(next);
    setLoaded(true);
  }, []);

  const setAndPersist = useCallback((next: Theme) => {
    setTheme(next);
    apply(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* تجاهل */
    }
  }, []);

  const toggle = useCallback(
    () => setAndPersist(theme === "dark" ? "light" : "dark"),
    [theme, setAndPersist],
  );

  return { theme, loaded, setTheme: setAndPersist, toggle };
}
