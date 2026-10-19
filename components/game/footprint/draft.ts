"use client";

import { useEffect, useState } from "react";

export function useDraft<T>(id: string, initial: T) {
  const key = `eth-fp-${id}`;
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* keep the empty dossier */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, ready, value]);
  return [value, setValue] as const;
}

export function clearDraft(id: string) {
  localStorage.removeItem(`eth-fp-${id}`);
}
