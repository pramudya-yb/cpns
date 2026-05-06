import { useState, useEffect } from "react";

export function useLocalStorageBoolean(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      return localStorage.getItem(key) === "true" ? true : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}
