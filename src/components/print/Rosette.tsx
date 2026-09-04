'use client';

import { useEffect, useRef, useState } from 'react';
import { Screen } from '@/components/print/Screen';
import { RASTR } from '@/content/site';
import { useFinePointer, usePrefersReducedMotion } from '@/lib/hooks';

/**
 * РОЗЕТКА И ЛУПА.
 *
 * Два статических холста одного размера: нижний с шагом 7 px, верхний —
 * с шагом 42 px. Верхний обрезан кругом по координатам указателя.
 * Перерисовки нет вообще: меняется одно свойство clip-path, поэтому
 * шестьдесят кадров в секунду держатся и на слабом железе.
 *
 * Честная формулировка: розетка и муар задаются углами и шагом и существуют
 * всегда — лупа их показывает. Уход приводки сдвигает фазу розетки: она из
 * закрытой становится раскрытой. Смещение муар не «рождает».
 *
 * Математика (проверяемая):
 *   шаг 7 px · лупа ×6 → 42 px · апертура 260 px → 6,2 периода — видны
 *   отдельные точки и обе решётки; период биения 42 / (2·sin15°) ≈ 81 px,
 *   то есть 3,2 биения в апертуре — узор читается.
 */
export function Rosette() {
  const hostRef = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [aperture, setAperture] = useState(130);

  useEffect(() => {
    setAperture(window.innerWidth < 768 ? 48 : 130);
  }, []);

  // На тач лупа сама плывёт по фигуре Лиссажу — иначе её никто не найдёт.
  useEffect(() => {
    if (fine || reduced) return;
    const host = hostRef.current;
    if (!host) return;
    let raf = 0;
    const start = performance.now();
    const drift = (t: number) => {
      const s = (t - start) / 1000;
      const x = 50 + 26 * Math.sin(s / 6.1);
      const y = 45 + 18 * Math.sin(s / 4.3);
      host.style.setProperty('--mx', `${x}%`);
      host.style.setProperty('--my', `${y}%`);
      raf = requestAnimationFrame(drift);
    };
    raf = requestAnimationFrame(drift);
    return () => cancelAnimationFrame(raf);
  }, [fine, reduced]);

  useEffect(() => {
    const onDelta = (e: Event) => {
      const mm = (e as CustomEvent<{ mm: number }>).detail?.mm ?? 0;
      setOpen(mm > 1.2);
    };
    window.addEventListener('alfa:delta', onDelta);
    return () => window.removeEventListener('alfa:delta', onDelta);
  }, []);

  return (
    <div
      ref={hostRef}
      data-loupe
      className="relative isolate h-full w-full overflow-hidden"
      style={{
        cursor: fine ? 'none' : undefined,
        ...(reduced ? ({ ['--mx' as string]: '62%', ['--my' as string]: '40%' }) : null),
      }}
    >
      {/* Общий план: две формы в приводке */}
      <div className="absolute inset-0" style={{ mixBlendMode: 'multiply' }}>
        <Screen pitch={7} angle={45} colour="rgba(18,17,16,0.28)" fit={0.52} anchorY={0.66} />
      </div>
      <div className="plate-r absolute inset-0" style={{ mixBlendMode: 'multiply' }}>
        <Screen pitch={7} angle={15} colour="rgba(213,0,50,0.30)" fit={0.52} anchorY={0.66} />
      </div>

      {/* Макро: тот же кадр в шесть раз крупнее, обрезанный лупой */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          clipPath: `circle(${aperture}px at var(--mx) var(--my))`,
          background: 'var(--color-paper-hi)',
        }}
      >
        <div className="absolute inset-0" style={{ mixBlendMode: 'multiply' }}>
          <Screen pitch={42} angle={45} colour="rgba(18,17,16,0.62)" fit={0.52} anchorY={0.66} />
        </div>
        <div className="plate-r absolute inset-0" style={{ mixBlendMode: 'multiply' }}>
          <Screen pitch={42} angle={15} colour="rgba(213,0,50,0.68)" fit={0.52} anchorY={0.66} />
        </div>
      </div>

      {/* Кольцо лупы и подпись */}
      <div
        className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-ink-32)]"
        style={{
          left: 'var(--mx)',
          top: 'var(--my)',
          width: aperture * 2,
          height: aperture * 2,
          borderRadius: '50%',
        }}
      />
      <p
        className="t-micro pointer-events-none absolute whitespace-nowrap"
        style={{
          left: 'var(--mx)',
          top: 'var(--my)',
          transform: `translate(${aperture - 10}px, ${aperture - 4}px)`,
          color: open ? 'var(--color-rubine)' : 'var(--color-ink-62)',
        }}
      >
        {open ? 'Розетка раскрыта' : '× 6 · 45° / 15°'}
      </p>

      <p className="t-micro absolute bottom-5 right-6 text-[var(--color-ink-62)]">
        {RASTR.rosetteSpec}
      </p>
    </div>
  );
}
