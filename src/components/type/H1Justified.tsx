'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { justifyLines } from '@/lib/justify';
import { cn } from '@/lib/cn';
import { useMediaQuery } from '@/lib/hooks';

/**
 * ЗАГОЛОВОК, ВЫКЛЮЧЕННЫЙ В ФОРМАТ.
 *
 * Строки дотягиваются до меры подбором ширины буквы, а не трекингом и не
 * разным кеглем. Два авторских массива строк вместо <br>: перенос это решение
 * наборщика, а не случайность вьюпорта.
 *
 * На формате во весь лист мера это вся полоса набора, поэтому кегль здесь
 * не фиксирован: `justifyLines` возвращает общий множитель, и он бывает
 * больше единицы. Макетный кегль из CSS остаётся победителем всегда, когда
 * он вообще позволяет выключить блок, множитель включается только там, где
 * иначе заголовок повис бы в левой половине листа.
 *
 * До измерения строки стоят на wdth=100 и кегле из clamp(), и это уже верный
 * рисунок, просто не выключенный, поэтому скачка при гидратации не видно.
 */
export function H1Justified({
  linesDesktop,
  linesMobile,
  plateR,
  className,
  as: Tag = 'h1',
}: {
  linesDesktop: readonly string[];
  linesMobile: readonly string[];
  /**
   * Слово, которое печатается ВТОРОЙ формой. Знак препинания сразу за ним
   * остаётся на форме K.
   *
   * На выключку не влияет никак: меряется по-прежнему целая строка, и
   * ширина литеры подбирается для неё же. Второй форме достаётся ровно
   * тот рисунок, который подобран для строки.
   */
  plateR?: string;
  className?: string;
  as?: 'h1' | 'h2' | 'div';
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(width < 768px)');
  const lines = isMobile ? linesMobile : linesDesktop;

  const [wdth, setWdth] = useState<number[] | null>(null);
  const [scale, setScale] = useState(1);
  /**
   * Трекинг, пересчитанный в em и возвращённый строкам.
   *
   * Без него выключка промахивалась мимо реза на 15 px, и промах был
   * СИСТЕМАТИЧЕСКИЙ. Причина: letter-spacing задан в em на .t-h1, то есть
   * вычисляется ОДИН РАЗ на хозяине (при кегле из clamp() это −4,89 px),
   * и наследуется строками уже готовым числом в пикселях. Но кегль строки
   * поднят множителем выключки до 180 px, а трекинг остался прежним: на
   * букве это 0,89 px, на строке из семнадцати знаков ровно 15,1 px,
   * и строка вылезала за обрез ровно настолько.
   *
   * Мерная линейка при этом считала честно, в em. Врал не замер, а набор.
   * Возвращая строке трекинг в em, мы восстанавливаем то, что и было
   * написано в дизайн-системе: кегль вырос, трекинг вырос вместе с ним.
   */
  const [trackEm, setTrackEm] = useState<number | null>(null);

  const run = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;
    const target = host.getBoundingClientRect().width;
    if (target < 40) return;

    const cs = getComputedStyle(host);
    const res = justifyLines([...lines], target, {
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      // Кегль берём с хозяина: множитель живёт на строках, поэтому хозяин
      // всегда несёт чистое значение из clamp(), и подбор не накапливается.
      fontSize: cs.fontSize,
      letterSpacing: cs.letterSpacing,
    });
    setWdth(res.wdth);
    setScale(res.scale);

    const basePx = parseFloat(cs.fontSize);
    const ls = parseFloat(cs.letterSpacing);
    setTrackEm(Number.isFinite(ls) && basePx > 0 ? ls / basePx : null);
  }, [lines]);

  useEffect(() => {
    let cancelled = false;
    let t: ReturnType<typeof setTimeout>;

    const start = () => {
      if (!cancelled) run();
    };

    /**
     * Мерить строки, пока не приехала гарнитура, бессмысленно: у Georgia
     * другой рисунок, и выключка ляжет по чужой ширине. Поэтому меряем
     * дважды: по таймауту, чтобы что-то стояло на экране, и обязательно
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

  // Смена набора строк (десктоп ↔ телефон) обнуляет прежнюю выключку:
  // чужие ширины на новых строках выглядят как брак вывода.
  useEffect(() => {
    setWdth(null);
    setScale(1);
  }, [isMobile]);

  return (
    <Tag ref={hostRef as never} className={cn('t-h1', className)}>
      {lines.map((line, i) => (
        <span
          key={line + i}
          className="block whitespace-pre"
          style={{
            fontVariationSettings: `"wdth" ${wdth?.[i] ?? 100}`,
            fontSize: scale === 1 ? undefined : `${(scale * 100).toFixed(3)}%`,
            // Трекинг обязан пересчитаться от кегля СТРОКИ, а не хозяина.
            letterSpacing: trackEm === null ? undefined : `${trackEm.toFixed(5)}em`,
          }}
        >
          {splitPlates(line, plateR)}
        </span>
      ))}
    </Tag>
  );
}

/**
 * Разводит строку по двум формам. Слово уходит на форму R, всё остальное,
 * включая знак препинания сразу за ним, остаётся на форме K.
 *
 * Строка, в которой слова нет, возвращается как была: §07 набирает тем же
 * компонентом и второй формы не заказывает.
 */
function splitPlates(line: string, word?: string) {
  if (!word) return line;
  const at = line.indexOf(word);
  if (at < 0) return line;

  return (
    <>
      {line.slice(0, at)}
      <span className="plate-word-r">{word}</span>
      {line.slice(at + word.length)}
    </>
  );
}
