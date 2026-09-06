'use client';

import { useEffect, useRef, useState } from 'react';
import { IMPRINT } from '@/content/site';

/**
 * СЛЕПОЕ (БЛИНТОВОЕ) ТИСНЕНИЕ.
 *
 * Слово во весь вылет, мелом на восьми процентах, почти не видно.
 * В полную краску видна только рубиновая галочка на месте правой диагонали
 * «А». Последнее, что остаётся на экране, это знак.
 *
 * ── ЧТО ИСПРАВЛЕНО ────────────────────────────────────────────────────────
 * Прежняя редакция считала место галочки через offsetParent и высоту
 * прописной, принимая нижнюю границу строчного бокса за базовую линию. Это
 * неверно: при интерлиньяже 0,82 бокс мельче кегля, и галочка уезжала на
 * соседнюю литеру. Теперь измеряется РОВНО ОДИН элемент, сама литера «А»,
 * а галочка лежит внутри неё, в её собственных координатах: viewBox равен
 * пиксельному габариту литеры, поэтому масштаб единичный и промахнуться
 * попросту негде.
 *
 * Восемь процентов задаются ЦВЕТОМ слова, а не opacity на контейнере:
 * внутри полупрозрачного элемента галочка никогда не смогла бы стать ярче
 * фона, а она обязана быть в полную краску.
 *
 * Терминология: это блинт, углублённое слепое тиснение. Конгрев это рельеф
 * наружу, другой процесс; на сайте типографии такую ошибку заметит их же
 * печатник.
 */
export function EmbossWord() {
  const word = IMPRINT.emboss;
  const letterRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = letterRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setBox({ w: r.width, h: r.height });
    };

    Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 900)),
    ]).then(measure);

    const el = letterRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative select-none overflow-hidden" aria-hidden>
      <p
        className="font-display whitespace-nowrap text-center leading-[0.82] tracking-[-0.04em]"
        style={{
          fontSize: 'var(--text-emboss)',
          fontWeight: 800,
          color: 'rgba(237, 235, 230, 0.08)',
        }}
      >
        <span ref={letterRef} className="relative inline-block">
          {word.slice(0, 1)}
          {/* Единственное, что напечатано в полную краску. */}
          {box && (
            <svg
              viewBox={`0 0 ${box.w} ${box.h}`}
              className="plate-r absolute inset-0 h-full w-full"
              style={{ ['--gain' as string]: 0.5 }}
              fill="none"
            >
              <path
                d={`M${box.w * 0.17} ${box.h * 0.5} L${box.w * 0.42} ${box.h * 0.82} L${box.w} ${box.h * 0.05}`}
                stroke="var(--color-rubine)"
                strokeWidth={box.h * 0.13}
                strokeLinecap="butt"
                strokeLinejoin="miter"
              />
            </svg>
          )}
        </span>
        {word.slice(1)}
      </p>
    </div>
  );
}
