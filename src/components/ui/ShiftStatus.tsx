'use client';

import { useEffect, useState } from 'react';
import { getShift, NEUTRAL_SHIFT, type Shift } from '@/lib/clock';

/**
 * ЧАСЫ ЦЕХА.
 *
 * Единственный источник времени на сайте, и считает он по Europe/Moscow,
 * а не по часам посетителя: гость из Новосибирска не должен видеть
 * «закрыто» в три часа дня. Наружу идёт только подсветка сегодняшней
 * строки в §08: обещаний живой строкой сайт больше не печатает.
 *
 * На сервере выводится нейтральный вариант, гидратация не ломается.
 */
export function useShift() {
  const [shift, setShift] = useState<Shift>(NEUTRAL_SHIFT);

  useEffect(() => {
    const tick = () => setShift(getShift());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return shift;
}
