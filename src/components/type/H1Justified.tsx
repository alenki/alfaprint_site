'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { justifyLines } from '@/lib/justify';
import { cn } from '@/lib/cn';
import { useMediaQuery } from '@/lib/hooks';

/**
 * ЗАГОЛОВОК, ВЫКЛЮЧЕННЫЙ В ФОРМАТ.
 *
 * Строки дотягиваются до меры подбором ширины буквы, а не трекингом и не
 * разным кеглем. До гидратации строки стоят на wdth=100 — скачок меньше 3 %.
 *
 * Два авторских массива строк вместо <br>: перенос — решение наборщика,
 * а не случайность вьюпорта.
 */
export function H1Justified({
  linesDesktop,
  linesMobile,
  className,
  as: Tag = 'h1',
}: {
  linesDesktop: readonly string[];
  linesMobile: readonly string[];
  className?: string;
  as?: 'h1' | 'h2' | 'div';
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(width < 768px)');
  const lines = isMobile ? linesMobile : linesDesktop;

  const [wdth, setWdth] = useState<number[] | null>(null);
  const [scale, setScale] = useState(1);

  const run = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;
    const target = host.getBoundingClientRect().width;
    if (target < 40) return;

    const cs = getComputedStyle(host);
    const res = justifyLines([...lines], target, {
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      fontSize: cs.fontSize,
      letterSpacing: cs.letterSpacing,
    });
    setWdth(res.wdth);
    setScale(res.scale);
  }, [lines]);

  useLayoutEffect(() => {
    let cancelled = false;
    let t: ReturnType<typeof setTimeout>;

    const start = () => {
      if (!cancelled) run();
    };

    /**
     * Мерить строки, пока не приехала гарнитура, бессмысленно: Georgia уже
     * стального рисунка, и выключка ляжет по чужой ширине. Поэтому меряем
     * дважды — по таймауту, чтобы что-то стояло на экране, и обязательно
     * ещё раз, когда шрифт действительно встал.
     */
    Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 900)),
    ]).then(start);

    document.fonts?.ready.then(start);

    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(run, 120);
    });
    ro.observe(host);

    return () => {
      cancelled = true;
      clearTimeout(t);
      ro.disconnect();
    };
  }, [run]);

  useEffect(() => {
    setWdth(null);
  }, [isMobile]);

  return (
    <Tag ref={hostRef as never} className={cn('t-h1', className)}>
      {lines.map((line, i) => (
        <span
          key={line + i}
          className="block whitespace-pre"
          style={{
            fontVariationSettings: `"wdth" ${wdth?.[i] ?? 100}`,
            fontSize: scale === 1 ? undefined : `${scale * 100}%`,
          }}
        >
          {line}
        </span>
      ))}
    </Tag>
  );
}
