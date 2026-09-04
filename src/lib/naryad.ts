'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   НАРЯД

   Один наряд на всю страницу. Каталог производства и пульт заказа — не две
   секции, а один механизм: клик по строке каталога дописывает наряд и
   возвращает к нему.

   Никакого контекста и никакого стора: одно событие на window. Пульт —
   единственный слушатель, каталог — единственный отправитель.
   ═══════════════════════════════════════════════════════════════════════════ */

export type NaryadPatch = {
  /** slug возможности из CAPABILITIES */
  chto?: string;
  tirazh?: string;
  srok?: string;
};

const EVENT = 'alfa:naryad';

export function fillNaryad(patch: NaryadPatch) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<NaryadPatch>(EVENT, { detail: patch }));
  const target = document.getElementById('naryad');
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function useNaryadPatch(apply: (patch: NaryadPatch) => void) {
  const [ref] = useState(() => ({ current: apply }));
  ref.current = apply;

  useEffect(() => {
    const on = (e: Event) => ref.current((e as CustomEvent<NaryadPatch>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [ref]);
}

/* ───────────────────────────────────────────────────────────────────────────
   Номер наряда. Детерминированный: одинаковый на сервере и в браузере,
   иначе React пожалуется на расхождение разметки.
   ─────────────────────────────────────────────────────────────────────────── */

export function naryadNumber(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `А-${String(h % 9000 + 1000)}`;
}
