'use client';

import { motion } from 'motion/react';
import { ARCHETYPES } from '@/components/print/archetypes';
import { useRevealProps } from '@/components/type/PrintReveal';
import type { Work } from '@/content/works';
import { cn } from '@/lib/cn';

/**
 * ПЛИТКА СПУСКА.
 *
 * Плитки не разделены зазором: они делят общую волосяную линию, как полосы
 * на печатном листе.
 *
 * ── СПУСК ─────────────────────────────────────────────────────────────────
 * Ширина плитки это решение спуска, а не свойство изделия, поэтому она считается
 * от места в ряду, а не берётся из works.ts. Девять плиток обязаны лечь без
 * дырок при любом числе колонок, а число колонок меняется трижды:
 *
 *   2 колонки · широкая первая:            2 + 8×1 = 10 = 5 рядов
 *   3 колонки · все одинарные:                  9×1 =  9 = 3 ряда
 *   4 колонки · широкие 1-я, 5-я и 9-я: 3×2 + 6×1 = 12 = 3 ряда
 *
 * Дырка в конце спуска это не «так вышло», это брак приладки.
 *
 * Плейсхолдер здесь это леса, а не постоянное решение: как только у плитки
 * появится photo, вместо вектора встанет снимок, а рамка, подпись, ховер,
 * разведение форм и стагер продолжат работать без единой правки вёрстки.
 */

/**
 * Пропорция одиночной плитки 1 : 1,12; двойная обязана дать ту же высоту
 * ряда, иначе спуск разваливается: 2 ширины / 1,12 = 1,786.
 *
 * Классы записаны целиком, а не собраны из кусков: Tailwind ищет в исходнике
 * готовые имена, и `md:${SINGLE}` он просто не увидит.
 */
function imposition(index: number) {
  if (index === 0) {
    return 'col-span-2 aspect-[1.786/1] md:col-span-1 md:aspect-[1/1.12] lg:col-span-2 lg:aspect-[1.786/1]';
  }
  if (index === 4 || index === 8) {
    return 'aspect-[1/1.12] lg:col-span-2 lg:aspect-[1.786/1]';
  }
  return 'aspect-[1/1.12]';
}

export function WorkTile({ work, index }: { work: Work; index: number }) {
  const Art = ARCHETYPES[work.archetype];
  const reveal = useRevealProps((index % 3) * 0.06);

  return (
    <motion.figure
      className={cn(
        'group relative flex flex-col border-b border-r border-[var(--rule)]',
        imposition(index)
      )}
      {...reveal}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '360px' }}
    >
      {/* min-h-0 обязателен: без него flex-элемент растёт под содержимое
          и ломает заданную пропорцию плитки. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[var(--color-paper-lo)] p-[7%]">
        {work.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.photo}
            alt={work.caption[0]}
            className="h-full w-full object-cover"
            style={{ filter: 'grayscale(1) contrast(1.06)' }}
          />
        ) : (
          <div className="tile-art h-full w-full">
            <Art content={work.content} />
          </div>
        )}
      </div>

      {/* Подписная планка несёт спецификацию, и её нельзя обрезать многоточием:
          «САТИН · ТЕРМОПЕРЕНОС · ОТ 4 ₽» и есть содержание плитки. Поэтому
          здесь трекинг уже общего моношрифтового, а строка переносится. */}
      <figcaption className="rule-t flex items-end justify-between gap-3 bg-[var(--color-paper-hi)] px-[clamp(8px,0.8vw,16px)] py-2.5">
        <div className="min-w-0 font-[family-name:var(--font-mono)] text-[10px] uppercase leading-[1.35] tracking-[0.05em] tabular-nums">
          <p className="fg">{work.caption[0]}</p>
          <p className="fg-56">{work.caption[1]}</p>
        </div>
        <span className="t-micro fg-56 shrink-0 translate-x-1 self-end opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          Смотреть →
        </span>
      </figcaption>
    </motion.figure>
  );
}
