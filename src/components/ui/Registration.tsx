'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/hooks';

/* ═══════════════════════════════════════════════════════════════════════════
   ПРИВОДКА

   Грамматика всего сайта. Заголовок существует в трёх формах: голубой,
   пурпурной и чёрной. Голубая и пурпурная разведены на несколько пикселей —
   лист ещё в машине. Под взглядом формы сходятся, и остаётся один чёрный
   оттиск.

   Чёрный слой — настоящий текстовый узел: его читает скринридер и его
   выделяет мышь. Цветные слои aria-hidden и никогда не кликабельны.

   В покое (prefers-reduced-motion) цветных форм нет вовсе: всё уже
   в приводке — сходиться нечему.
   ═══════════════════════════════════════════════════════════════════════════ */

type Props = {
  children: ReactNode;
  /** Разведение форм в пикселях до приводки */
  offset?: number;
  /** Задержка перед схождением, с */
  delay?: number;
  /** Длительность схождения, с */
  duration?: number;
  /** Сходиться сразу при монтировании, не дожидаясь появления в кадре */
  immediate?: boolean;
  as?: ElementType;
  className?: string;
  /** Насколько глубоко элемент должен войти в кадр */
  margin?: string;
};

export function Registration({
  children,
  offset = 7,
  delay = 0,
  duration = 0.9,
  immediate = false,
  as: Tag = 'span',
  className,
  margin = '-12% 0px -12% 0px',
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, {
    once: true,
    margin: margin as `${number}px`,
  });

  const registered = reduced || immediate || inView;

  // В покое — обычный текст, без слоёв и без блендинга.
  if (reduced) {
    return (
      <Tag ref={ref} className={className}>
        {children}
      </Tag>
    );
  }

  const plate = (color: string, dx: number, dy: number, i: number) => (
    <motion.span
      key={i}
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
      style={{ color, mixBlendMode: 'multiply' }}
      initial={{ x: dx, y: dy }}
      animate={registered ? { x: 0, y: 0 } : { x: dx, y: dy }}
      transition={{
        duration,
        delay: delay + i * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.span>
  );

  return (
    <Tag ref={ref} className={cn('relative isolate inline-block', className)}>
      {plate('var(--color-proc-c)', -offset, offset * 0.42, 0)}
      {plate('var(--color-proc-m)', offset * 0.86, -offset * 0.3, 1)}
      <span className="relative">{children}</span>
    </Tag>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   ПРИВОДКА ПО НАВЕДЕНИЮ
   Для строк каталога: в покое строка разведена на сотые доли кегля, под
   курсором — сходится. Управляется CSS-переменной родителя, поэтому на
   движение мыши React не перерисовывается ни разу.
   ───────────────────────────────────────────────────────────────────────── */

export function RegistrationHover({
  children,
  offset = '0.024em',
  className,
}: {
  children: ReactNode;
  /**
   * Разведение форм — в em, а не в пикселях. Приводка уходит на долю кегля,
   * поэтому на строке в 48 пунктов и на строке в 14 она читается одинаково:
   * как цветной волосок по краю очка, а не как вторая копия буквы.
   * Настоящий брак приводки на листе выглядит именно так.
   */
  offset?: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <span className={className}>{children}</span>;

  return (
    <span
      className={cn('reg-hover relative isolate inline-block', className)}
      style={{ ['--reg' as string]: offset }}
    >
      <span
        aria-hidden
        className="reg-c pointer-events-none absolute inset-0 select-none"
      >
        {children}
      </span>
      <span
        aria-hidden
        className="reg-m pointer-events-none absolute inset-0 select-none"
      >
        {children}
      </span>
      <span className="relative">{children}</span>
    </span>
  );
}
