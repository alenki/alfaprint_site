'use client';

import { useEffect, useRef, useState } from 'react';
import { SECTIONS } from '@/content/site';

/**
 * КОНТРОЛЬНАЯ ШКАЛА — прогресс, взятый из печатного производства,
 * а не из UI-кита.
 *
 * Двадцать растровых ступеней встык: десять плашек K и десять плашек R.
 * Заполненная часть — это прочитанная доля листа. Ступени кликабельны.
 *
 * Над шкалой — единственное место на сайте, где эффект назван вслух:
 * Δ в миллиметрах и слово состояния. Больше механику нигде не объясняют.
 */

const STEPS = 20;

export function ControlStrip() {
  const [section, setSection] = useState<{ n: string; title: string }>({
    n: '01',
    title: SECTIONS[0].title,
  });
  const [delta, setDelta] = useState(0);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onSection = (e: Event) => {
      const d = (e as CustomEvent<{ n: string; title: string }>).detail;
      if (d) setSection({ n: d.n, title: d.title });
    };
    const onDelta = (e: Event) => {
      const mm = (e as CustomEvent<{ mm: number }>).detail?.mm ?? 0;
      setDelta(mm);
    };
    window.addEventListener('alfa:section', onSection);
    window.addEventListener('alfa:delta', onDelta);
    return () => {
      window.removeEventListener('alfa:section', onSection);
      window.removeEventListener('alfa:delta', onDelta);
    };
  }, []);

  const state = delta < 0.3 ? 'В приводке' : delta <= 1.2 ? 'Допуск' : 'Уход';
  const hot = delta > 1.2;

  const jump = (i: number) => {
    const y = ((i + 0.5) / STEPS) * (document.body.scrollHeight - window.innerHeight);
    window.dispatchEvent(new CustomEvent('alfa:scrollto', { detail: { y } }));
  };

  return (
    <div className="controlstrip fixed inset-x-0 bottom-0 z-55 hidden md:block">
      {/* Служебная строка */}
      <div className="trim flex h-[var(--striplabel-h)] items-center justify-between">
        <nav aria-label="Разделы" className="t-micro opacity-70">
          {section.n} / 08 · {section.title}
        </nav>
        <p className="t-micro flex items-center gap-2" aria-hidden>
          <span className="opacity-70">Δ {delta.toFixed(2).replace('.', ',')} мм</span>
          <span
            className="inline-block h-1 w-1 transition-colors duration-200"
            style={{ background: hot ? 'var(--color-rubine)' : 'currentColor', opacity: hot ? 1 : 0.4 }}
          />
          <span style={{ opacity: delta < 0.3 ? 0.6 : 1 }}>{state}</span>
        </p>
      </div>

      {/* Двадцать ступеней */}
      <div className="relative h-[var(--strip-h)] w-full">
        <div className="absolute inset-0 flex opacity-[0.28]">
          {Array.from({ length: STEPS }, (_, i) => (
            <Step key={i} i={i} />
          ))}
        </div>
        <div
          ref={fillRef}
          className="absolute inset-0 flex origin-left"
          style={{ transform: 'scaleX(var(--progress, 0))' }}
        >
          {Array.from({ length: STEPS }, (_, i) => (
            <Step key={i} i={i} />
          ))}
        </div>
        {/* Хит-зона 24 px по высоте — WCAG 2.5.8 */}
        <div className="absolute inset-x-0 bottom-0 flex h-6">
          {Array.from({ length: STEPS }, (_, i) => (
            <button
              key={i}
              type="button"
              className="h-full flex-1"
              onClick={() => jump(i)}
              aria-label={`Перейти к ${Math.round(((i + 0.5) / STEPS) * 100)} % страницы`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Ступень: первые десять — растр K, вторые десять — растр R. */
function Step({ i }: { i: number }) {
  const isK = i < 10;
  const t = (i % 10) / 9;
  const bg = isK
    ? `color-mix(in srgb, var(--color-ink) ${14 + t * 86}%, transparent)`
    : `color-mix(in srgb, var(--color-rubine) ${15 + t * 85}%, transparent)`;
  return <div className="h-full flex-1" style={{ background: bg }} />;
}
