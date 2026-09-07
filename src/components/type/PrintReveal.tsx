'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * ХОД РАКЕЛЯ ОДНИМ ЧИСЛОМ. Один проход по одной строке, и он же общий срок
 * появления текста на сайте. Отдельной полосе разрешено пройти КОРОЧЕ (см.
 * §03, где имён пять и они идут внахлёст), но не иначе: глагол остаётся тем
 * же, меняется одна лишь скорость руки.
 */
export const PASS = 0.42;

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
      transition={{ duration: PASS, delay, ease: [0.65, 0, 0.35, 1] }}
    >
      {children}
    </Tag>
  );
}

/**
 * Тот же глагол появления для компонентов, которым нужны свои задержки.
 * Возвращает готовый набор пропсов Motion, уже с учётом reduced-motion.
 *
 * Второй довод это ХОД РАКЕЛЯ, и по умолчанию он общий. Укорачивать его
 * позволено там, где строк много и они идут очередью: пять имён §03 полным
 * ходом читались ожиданием конца, а не печатью. Ветки reduced-motion это не
 * касается: там движения нет вовсе, и укорачивать нечего.
 *
 * ПОД МАСКОЙ НЕ ДОЛЖНО БЫТЬ НИЧЕГО ШИРЕ ОБЁРТКИ: clip-path режет потомков по
 * своему боксу, и содержимое, вышедшее вбок, будет срезано обратно. Уводить
 * саму обёртку за обрез тоже нельзя: у body стоит overflow-x: clip, и элемент
 * с отрицательным левым краем IntersectionObserver считает невидимым НАВСЕГДА
 * (замерено на 1440: при x = 0 обёртка наблюдается, при x = −0,2 уже нет), а
 * значит whileInView не наступит и под маской останется пусто.
 */
export function useRevealProps(delay = 0, duration = PASS) {
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
    transition: { duration, delay, ease: [0.65, 0, 0.35, 1] as const },
  };
}
