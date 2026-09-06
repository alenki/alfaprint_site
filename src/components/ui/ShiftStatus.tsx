'use client';

import { useEffect, useState } from 'react';
import { getShift, NEUTRAL_SHIFT, type Shift } from '@/lib/clock';

/**
 * ЖИВАЯ СТРОКА СМЕНЫ.
 *
 * Единственный источник времени на сайте, и считает он по Europe/Moscow,
 * а не по часам посетителя: гость из Новосибирска не должен видеть
 * «закрыто» в три часа дня.
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

export function ShiftPromise({ className }: { className?: string }) {
  const shift = useShift();
  return <p className={className}>{shift.promise}</p>;
}

export function ShiftCountdown({ className }: { className?: string }) {
  const shift = useShift();
  if (!shift.countdown) return null;
  return (
    <p className={className} aria-live="off">
      {shift.countdown}
    </p>
  );
}
