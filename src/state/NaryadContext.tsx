'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * НАРЯД — то, что посетитель собирает, отмечая строки каталога.
 * Ни одного обязательного поля, ни одной валидационной стены: наряд уходит
 * в WhatsApp настолько заполненным, насколько его заполнили.
 */

export type NaryadItem = { id: string; title: string };

export type NaryadState = {
  items: NaryadItem[];
  qty: number;
  deadline: string;
  contact: string;
  freeText: string;
};

type NaryadApi = NaryadState & {
  toggle: (item: NaryadItem) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  setQty: (n: number) => void;
  setDeadline: (d: string) => void;
  setContact: (c: string) => void;
  setFreeText: (t: string) => void;
};

const Ctx = createContext<NaryadApi | null>(null);

export function NaryadProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NaryadItem[]>([]);
  const [qty, setQty] = useState(1000);
  const [deadline, setDeadline] = useState('');
  const [contact, setContact] = useState('');
  const [freeText, setFreeText] = useState('');

  const toggle = useCallback((item: NaryadItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const value = useMemo<NaryadApi>(
    () => ({
      items,
      qty,
      deadline,
      contact,
      freeText,
      toggle,
      remove,
      has: (id) => items.some((i) => i.id === id),
      setQty,
      setDeadline,
      setContact,
      setFreeText,
    }),
    [items, qty, deadline, contact, freeText, toggle, remove]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNaryad() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNaryad вне NaryadProvider');
  return ctx;
}
