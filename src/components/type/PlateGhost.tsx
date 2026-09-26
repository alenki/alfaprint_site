import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

/**
 * СИНИЙ ПРИЗРАК: дубль узла на форме R.
 *
 * При спокойном чтении его не существует: opacity считается из --miss.
 * При разгоне прокрутки из-под чёрного текста выезжает синий след.
 * Ни строчки JS: весь эффект живёт в CSS.
 *
 * Краска это `--accent` грунта, на котором призрак стоит: на бумаге синяя с
 * логотипа, на тёмно-синем светлая синяя (синяя с логотипа там даёт 1,71:1 и
 * призрака не было бы видно). Вне грунта остаётся синяя с логотипа.
 *
 * Всегда aria-hidden и никогда не перехватывает события.
 */
export function PlateGhost({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'plate-r plate-ghost pointer-events-none absolute inset-0 select-none text-[var(--accent,var(--color-rubine))]',
        className
      )}
    >
      {children}
    </span>
  );
}
