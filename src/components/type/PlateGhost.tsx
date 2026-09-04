import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

/**
 * РУБИНОВЫЙ ПРИЗРАК — дубль узла на форме R.
 *
 * При спокойном чтении его не существует: opacity считается из --miss.
 * При разгоне прокрутки из-под чёрного текста выезжает рубиновый след.
 * Ни строчки JS — весь эффект живёт в CSS.
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
        'plate-r plate-ghost pointer-events-none absolute inset-0 select-none text-[var(--color-rubine)]',
        className
      )}
    >
      {children}
    </span>
  );
}
