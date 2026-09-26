'use client';

import { useEffect, useRef } from 'react';
import { drawScreen, drawWhenIdle } from '@/lib/halftone';
import { cn } from '@/lib/cn';

/**
 * ОДИН РАСТРОВЫЙ ЭКРАН. Рисуется ровно один раз, при ресайзе с дебаунсом.
 * Форма K идёт под 45°, форма R под 15°. Разница углов и даёт розетку.
 */
export function Screen({
  pitch,
  angle,
  colour,
  word = 'Legko',
  fit,
  anchorY,
  zoom,
  className,
}: {
  pitch: number;
  angle: number;
  colour: string;
  word?: string;
  fit?: number;
  anchorY?: number;
  zoom?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const paint = () => drawScreen(canvas, { pitch, angle, colour, word, fit, anchorY, zoom });
    drawWhenIdle(paint);

    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(paint, 200);
    });
    ro.observe(canvas);

    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [pitch, angle, colour, word, fit, anchorY, zoom]);

  return <canvas ref={ref} className={cn('font-display h-full w-full', className)} aria-hidden />;
}
