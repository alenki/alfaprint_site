'use client';

import { useEffect, useRef, useState } from 'react';
import { IMPRINT } from '@/content/site';

/**
 * СЛЕПОЕ (БЛИНТОВОЕ) ТИСНЕНИЕ.
 *
 * Слово во весь вылет, мелом на восьми процентах — почти не видно.
 * В полную краску видна только рубиновая галочка на месте правой диагонали
 * «А». Последнее, что остаётся на экране, — знак.
 *
 * Галочка лежит ОТДЕЛЬНЫМ слоем: внутри элемента с opacity .08 она никогда
 * не смогла бы стать ярче фона.
 *
 * Терминология: это блинт — углублённое слепое тиснение. Конгрев — рельеф
 * наружу, другой процесс; на сайте типографии такую ошибку заметит их же
 * печатник.
 */
export function EmbossWord() {
  const word = IMPRINT.emboss;
  const aRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ left: number; top: number; w: number; h: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = aRef.current;
      const host = el?.offsetParent as HTMLElement | null;
      if (!el || !host) return;
      const a = el.getBoundingClientRect();
      const h = host.getBoundingClientRect();

      /**
       * Галочка обязана встать ровно на правую диагональ «А», а не рядом.
       * В знаке буква занимает x 4…96 и y 8…92 внутри viewBox 120×100 —
       * пересчитываем эти координаты в габарит реальной литеры.
       * Высоту берём по прописной (≈0,71 em), а не по строке: строка выше
       * буквы, и по ней галочка уехала бы вниз.
       */
      const fs = parseFloat(getComputedStyle(el).fontSize) || a.height;
      const cap = fs * 0.71;
      const sx = a.width / 92;
      const sy = cap / 84;

      setBox({
        left: a.left - h.left - 4 * sx,
        top: a.bottom - h.top - cap - 8 * sy,
        w: 120 * sx,
        h: 100 * sy,
      });
    };

    Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 900)),
    ]).then(measure);

    const ro = new ResizeObserver(measure);
    if (aRef.current) ro.observe(aRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="relative select-none overflow-hidden" aria-hidden>
      <p
        className="whitespace-nowrap text-center font-display leading-[0.82] tracking-[-0.04em]"
        style={{
          fontSize: 'var(--text-emboss)',
          fontWeight: 800,
          color: 'var(--color-chalk)',
          opacity: 0.08,
        }}
      >
        <span ref={aRef} className="inline-block">
          {word.slice(0, 1)}
        </span>
        {word.slice(1)}
      </p>

      {/* Единственное, что напечатано в полную краску. */}
      {box && (
        <svg
          viewBox="0 0 120 100"
          className="plate-r pointer-events-none absolute overflow-visible"
          style={{
            ['--gain' as string]: 0.5,
            left: box.left,
            top: box.top,
            width: box.w,
            height: box.h,
          }}
        >
          <path
            d="M27 54 L52 81 L114 8"
            stroke="var(--color-rubine)"
            strokeWidth="16"
            fill="none"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
        </svg>
      )}
    </div>
  );
}
