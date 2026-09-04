'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * ПОКОЙ
 *
 * CSS-правило `prefers-reduced-motion` глушит переходы и @keyframes, но не
 * трогает анимации, которые motion считает в JS. MotionConfig с
 * reducedMotion="user" закрывает эту дыру: при системной настройке
 * «уменьшить движение» перестают анимироваться сдвиги и масштабы, а
 * прозрачность остаётся — содержимое проявляется, но никуда не едет.
 *
 * Ни один блок при этом не может остаться невидимым: opacity доигрывает
 * всегда.
 */
export function Motion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
