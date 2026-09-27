import { useEffect, useState } from "react";

export const NAME_KEY = "wird:user-name";

export function readUserName(): string {
  try {
    return window.localStorage.getItem(NAME_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function useUserName() {
  const [name, setNameState] = useState("");
  useEffect(() => setNameState(readUserName()), []);
  const setName = (v: string) => {
    const t = v.trim();
    try {
      window.localStorage.setItem(NAME_KEY, t);
    } catch {
      /* تجاهل */
    }
    setNameState(t);
  };
  return { name, setName };
}
