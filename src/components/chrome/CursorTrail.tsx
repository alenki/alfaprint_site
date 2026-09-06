'use client';

import { useEffect, useRef } from 'react';
import { attachTrail } from '@/lib/trail';
import { useFinePointer, useMounted, usePrefersReducedMotion } from '@/lib/hooks';

/**
 * СЛЕД КУРСОРА: разметка.
 *
 * Один холст во весь вьюпорт и больше ничего. Системный указатель на месте:
 * этот слой ничего не подменяет и ничего не гасит, он только тянет за
 * указателем линию. Считает и рисует src/lib/trail.ts, кадр даёт
 * единственный rAF-цикл сайта.
 *
 * ЧЕГО ЗДЕСЬ НЕТ. Ни одного слушателя: pointermove на сайте один, он живёт
 * в PlateProvider и кормит след оттуда, а размер холста слушает сам модуль.
 *
 * ЧЕГО НЕТ ДО ГИДРАТАЦИИ. Сервер отдаёт пустоту, и первый клиентский рендер
 * тоже: оба хука честно возвращают false до эффекта, поэтому деревья
 * совпадают побайтно. След это украшение, и без JS его просто нет: указатель
 * при этом остаётся ровно тем, что отдала система.
 *
 * КОМУ НЕ ПОКАЗЫВАЕМ. Пальцу (следить не за чем) и тем, кто просил
 * уменьшить движение: линия за курсором это чистое движение и ничего
 * кроме. Оба отказа отсекают слой целиком, а не гасят его прозрачностью.
 */
export function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mounted = useMounted();
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const on = mounted && fine && !reduced;

  useEffect(() => {
    const node = ref.current;
    if (!on || !node) return;
    return attachTrail(node);
  }, [on]);

  if (!on) return null;

  return <canvas ref={ref} aria-hidden className="trail" />;
}
