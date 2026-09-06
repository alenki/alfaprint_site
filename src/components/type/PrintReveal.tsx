'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * ЕДИНСТВЕННЫЙ ГЛАГОЛ ПОЯВЛЕНИЯ ТЕКСТА НА САЙТЕ.
 *
 * Текст не выезжает сбоку и не проявляется через opacity, он ПЕЧАТАЕТСЯ:
 * ракель проходит снизу вверх, и там, где он прошёл, лежит краска.
 * Через opacity входят только холсты и плашки: краска либо есть, либо нет.
 *
 * При prefers-reduced-motion ракель заменяется простым проявлением за 200 мс.
 * Motion сам по себе гасит только трансформы, а clip-path нет, поэтому
 * подмену делаем руками: ни одна строка не должна остаться под маской.
 *
 * И ПОЭТОМУ ЖЕ ВЕТКА «БЕЗ ДВИЖЕНИЯ» ВСЁ РАВНО ОБЪЯВЛЯЕТ clipPath.
 * usePrefersReducedMotion честно отдаёт false на первом рендере (иначе
 * гидратация разъезжается), и Motion успевает записать в стиль узла
 * inset(102% 0 0 0). Эффект переключает ветку, ветка про clip-path больше не
 * знает, и снятая маска остаётся в стиле НАВСЕГДА. На листе это выглядело
 * так: у читателя с «уменьшить движение» весь текст сайта не появлялся вовсе,
 * во всех восьми полосах. Объявленный здесь inset(0% 0 0 0) заставляет Motion
 * перезаписать маску. Убирать эти две строки нельзя.
 */
export function PrintReveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'span' | 'li' | 'p';
}) {
  const Tag = motion[as];
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <Tag
        data-reveal
        className={cn(className)}
        initial={{ opacity: 0, clipPath: 'inset(0% 0 0 0)' }}
        whileInView={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.2, delay: 0 }}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      data-reveal
      className={cn(className)}
      initial={{ clipPath: 'inset(102% 0 0 0)' }}
      whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.42, delay, ease: [0.65, 0, 0.35, 1] }}
    >
      {children}
    </Tag>
  );
}

/**
 * Тот же глагол появления для компонентов, которым нужны свои задержки.
 * Возвращает готовый набор пропсов Motion, уже с учётом reduced-motion.
 */
export function useRevealProps(delay = 0) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return {
      'data-reveal': true,
      initial: { opacity: 0, clipPath: 'inset(0% 0 0 0)' },
      whileInView: { opacity: 1, clipPath: 'inset(0% 0 0 0)' },
      viewport: { once: true, margin: '-12% 0px' } as const,
      transition: { duration: 0.2 },
    };
  }

  return {
    'data-reveal': true,
    initial: { clipPath: 'inset(102% 0 0 0)' },
    whileInView: { clipPath: 'inset(0% 0 0 0)' },
    viewport: { once: true, margin: '-12% 0px' } as const,
    transition: { duration: 0.42, delay, ease: [0.65, 0, 0.35, 1] as const },
  };
}
