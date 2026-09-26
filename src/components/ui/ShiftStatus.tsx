'use client';

import { useEffect, useState } from 'react';
import { getShift, NEUTRAL_SHIFT, type Shift } from '@/lib/clock';

/**
 * ЧАСЫ РАБОТЫ.
 *
 * Единственный источник времени на сайте, и считает он по Europe/Moscow,
 * а не по часам посетителя: гость из Новосибирска не должен видеть
 * «закрыто» в три часа дня. Наружу идёт только подсветка сегодняшних
 * строк в §08 и на листе контактов: обещаний живой строкой сайт больше не
 * печатает. Перерыв смена знает (`pause`), но словами его не выводит: он
 * стоит в часах своей строкой.
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
