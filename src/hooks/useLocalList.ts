import { useCallback, useEffect, useState } from "react";

export type Favorite = { surah: number; ayah: number; at: string };
const FAV = "wird:favorites";

function readFavs(): Favorite[] {
  try {
    const v = JSON.parse(localStorage.getItem(FAV) || "[]");
    return Array.isArray(v)
      ? v.filter((f) => Number.isInteger(f?.surah) && Number.isInteger(f?.ayah))
      : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  useEffect(() => setFavorites(readFavs()), []);
  const save = (next: Favorite[]) => {
    setFavorites(next);
    try {
      localStorage.setItem(FAV, JSON.stringify(next));
    } catch {
      /* */
    }
  };
  const isFav = useCallback(
    (s: number, a: number) => favorites.some((f) => f.surah === s && f.ayah === a),
    [favorites],
  );
  const toggle = (s: number, a: number) => {
    const cur = readFavs();
    save(
      cur.some((f) => f.surah === s && f.ayah === a)
        ? cur.filter((f) => !(f.surah === s && f.ayah === a))
        : [{ surah: s, ayah: a, at: new Date().toISOString() }, ...cur],
    );
  };
  return { favorites, isFav, toggle };
}

export type KhatmahPlan = { days: number; start: string };
const PLAN = "wird:khatmah-plan";

export function useKhatmahPlan() {
  const [plan, setPlan] = useState<KhatmahPlan | null>(null);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(PLAN) || "null");
      if (v && Number.isInteger(v.days) && typeof v.start === "string") setPlan(v);
    } catch {
      /* */
    }
  }, []);
  const update = (next: KhatmahPlan | null) => {
    setPlan(next);
    try {
      if (next) localStorage.setItem(PLAN, JSON.stringify(next));
      else localStorage.removeItem(PLAN);
    } catch {
      /* */
    }
  };
  return { plan, setPlan: update };
}
