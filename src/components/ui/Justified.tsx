'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ВЫКЛЮЧКА ПО ОСИ ШИРИНЫ

   Наборщик выключает строку в формат: подгоняет её так, чтобы она встала
   ровно от края до края. Веками это делали шпациями — то есть портили
   межбуквенные пробелы.

   Roboto Serif — переменная гарнитура с осью wdth (50…150). Значит, строку
   можно выключить не пробелами, а самим рисунком буквы: сузить или расширить
   очко, оставив трекинг нетронутым. Это то, чего в металле сделать было
   нельзя.

   Для каждой строки бинарным поиском подбирается своя ширина, пока строка
   не совпадёт с форматом полосы. Замеры идут на одном скрытом узле, поэтому
   видимый текст не дёргается; пересчёт — только при изменении размера окна.
   ═══════════════════════════════════════════════════════════════════════════ */

const MIN_WDTH = 50;
const MAX_WDTH = 150;
const ITERATIONS = 11;

type Props = {
  lines: string[];
  className?: string;
  lineClassName?: string;
  /** Оптическая ось — на крупном кегле всегда 144 */
  opsz?: number;
  weight?: number;
  /** Обёртка для каждой строки, например компонент приводки */
  renderLine?: (line: string, index: number) => React.ReactNode;
  /** Доступный текст целиком — h1 обязан читаться скринридером как фраза */
  srText?: string;
};

export function Justified({
  lines,
  className,
  lineClassName,
  opsz = 144,
  weight = 900,
  renderLine,
  srText,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const proberRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<number[]>(() => lines.map(() => 100));

  const measure = useCallback(() => {
    const host = hostRef.current;
    const probe = proberRef.current;
    if (!host || !probe) return;

    const target = host.clientWidth;
    if (target < 40) return;

    // Пробник наследует кегль полосы — сравниваем подобное с подобным
    const cs = getComputedStyle(host);
    probe.style.fontFamily = cs.fontFamily;
    probe.style.fontSize = cs.fontSize;
    probe.style.fontWeight = String(weight);
    probe.style.letterSpacing = cs.letterSpacing;

    const next = lines.map((line) => {
      probe.textContent = line;
      let lo = MIN_WDTH;
      let hi = MAX_WDTH;
      for (let i = 0; i < ITERATIONS; i++) {
        const mid = (lo + hi) / 2;
        probe.style.fontVariationSettings = `'opsz' ${opsz}, 'wdth' ${mid}, 'GRAD' 0`;
        if (probe.getBoundingClientRect().width > target) hi = mid;
        else lo = mid;
      }
      return Math.round(lo * 10) / 10;
    });

    setWidths((prev) =>
      prev.length === next.length && prev.every((v, i) => Math.abs(v - next[i]) < 0.2)
        ? prev
        : next,
    );
  }, [lines, opsz, weight]);

  useLayoutEffect(() => {
    let cancelled = false;
    // Мерить можно только по загруженной гарнитуре, иначе подберём ширину
    // для запасного шрифта и строка развалится при подмене.
    const run = () => !cancelled && measure();
    if (document.fonts?.status === 'loaded') run();
    else document.fonts?.ready.then(run);
    return () => {
      cancelled = true;
    };
  }, [measure]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === 'undefined') return;
    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    ro.observe(host);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [measure]);

  return (
    <div ref={hostRef} className={cn('relative w-full', className)}>
      {srText && <span className="sr-only">{srText}</span>}

      {/* Скрытый пробник: живёт вне потока, ничего не сдвигает */}
      <span
        ref={proberRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 whitespace-nowrap opacity-0"
        style={{ visibility: 'hidden' }}
      />

      {lines.map((line, i) => (
        <span
          key={line + i}
          aria-hidden={srText ? true : undefined}
          className={cn('block whitespace-nowrap', lineClassName)}
          style={{
            fontVariationSettings: `'opsz' ${opsz}, 'wdth' ${widths[i] ?? 100}, 'GRAD' 0`,
            fontWeight: weight,
          }}
        >
          {renderLine ? renderLine(line, i) : line}
        </span>
      ))}
    </div>
  );
}
