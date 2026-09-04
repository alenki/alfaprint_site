'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useFinePointer, usePrefersReducedMotion } from '@/lib/hooks';

/* ═══════════════════════════════════════════════════════════════════════════
   ЛУПА ПЕЧАТНИКА

   Курсор — крест приводки. На интерактивном элементе он разворачивается
   в чёрный кружок с подписью: так печатник наводит лупу на нужный участок
   листа.

   Позиция пишется в motion-значения, а не в state React: ни одного
   перерендера на движение мыши. Подпись меняется редко — её можно в state.
   ═══════════════════════════════════════════════════════════════════════════ */

export function Cursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 1100, damping: 60, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 1100, damping: 60, mass: 0.35 });

  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!fine) return;
    document.documentElement.classList.add('cursor-hidden');
    return () => document.documentElement.classList.remove('cursor-hidden');
  }, [fine]);

  useEffect(() => {
    if (!fine) return;

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);

      const el = (e.target as HTMLElement)?.closest?.(
        '[data-cursor],a,button,input,textarea,select,label,[role="button"]',
      ) as HTMLElement | null;

      if (!el) {
        if (active) setActive(false);
        if (label) setLabel(null);
        return;
      }
      const next = el.getAttribute('data-cursor');
      if (!active) setActive(true);
      if (next !== label) setLabel(next);
    };

    const leave = () => setVisible(false);
    const enter = () => setVisible(true);
    const pressDown = () => setDown(true);
    const pressUp = () => setDown(false);

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('pointerenter', enter);
    window.addEventListener('pointerdown', pressDown, { passive: true });
    window.addEventListener('pointerup', pressUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointerenter', enter);
      window.removeEventListener('pointerdown', pressDown);
      window.removeEventListener('pointerup', pressUp);
    };
  }, [fine, x, y, active, label, visible]);

  // Кольцо чуть отстаёт от креста — как лупа, которую ведут за ручку
  const ringX = useTransform(sx, (v) => v);
  const ringY = useTransform(sy, (v) => v);

  if (!fine || reduced) return null;

  return (
    <>
      {/* Крест — без пружины, точно под указателем */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 21 21"
          className="-translate-x-1/2 -translate-y-1/2"
          fill="none"
        >
          <path
            d="M10.5 0v6.6M10.5 14.4V21M0 10.5h6.6M14.4 10.5H21"
            stroke="#ffffff"
            strokeWidth="1"
          />
          <circle cx="10.5" cy="10.5" r="1" fill="#ffffff" />
        </svg>
      </motion.div>

      {/* Кольцо / плашка с подписью */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[99]"
        style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0 }}
      >
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink-32"
          animate={{
            width: label ? 'auto' : active ? 46 : 30,
            height: label ? 30 : active ? 46 : 30,
            backgroundColor: label ? 'var(--color-ink)' : 'rgba(22,18,15,0)',
            borderColor: label ? 'var(--color-ink)' : 'var(--color-ink-32)',
            scale: down ? 0.86 : 1,
          }}
          transition={{ type: 'spring', stiffness: 520, damping: 34, mass: 0.5 }}
          style={{ paddingInline: label ? 14 : 0 }}
        >
          {label && (
            <span className="t-meta whitespace-nowrap text-paper">{label}</span>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
