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
        'group @container relative flex flex-col border-b border-r border-[var(--rule)]',
        imposition(index)
      )}
      {...reveal}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '360px' }}
    >
      {/* min-h-0 обязателен: без него flex-элемент растёт под содержимое
          и ломает заданную пропорцию плитки. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[var(--color-paper-lo)] p-[7%] @max-[220px]:p-[5%]">
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
          здесь трекинг уже общего моношрифтового, а строка переносится.

          НА УЗКОЙ МЕРЕ НАБИРАЕТСЯ ДРУГАЯ ПОДПИСЬ, А НЕ ОБРЕЗАННАЯ ЭТА.
          В два столбца на телефоне плитке достаётся около 195 px, и полная
          спецификация ложится в них восемью строками. Планка стоит ВНУТРИ
          заданной пропорции, растёт она за счёт оттиска, и восемь строк
          оставляют изделию полсотни пикселей. Поэтому там встаёт `short`:
          имя и тираж, ровно две строки, и высота ряда снова известна заранее.

          Меряет это ПЛИТКА, а не экран (@container). Мера плитки меняется
          пять раз на трёх изломах сетки, и медиазапрос не отличает одинарную
          плитку в четыре колонки от двойной. Порог 220 px выбран так, что
          переключается один только двухколонный телефон: у md одинарная
          256 px, у lg 256 px и шире, а нулевая плитка и на телефоне идёт во
          всю меру и спецификацию несёт наравне с настольной. */}
      <figcaption className="rule-t bg-[var(--color-paper-hi)] px-[clamp(8px,0.8vw,16px)] py-2.5">
        <div className="min-w-0 font-[family-name:var(--font-mono)] text-[10px] uppercase leading-[1.35] tracking-[0.05em] tabular-nums">
          <div className="@max-[220px]:hidden">
            <p className="fg">{work.caption[0]}</p>
            <p className="fg-56">{work.caption[1]}</p>
          </div>
          <div className="hidden @max-[220px]:block">
            <p className="fg">{work.short[0]}</p>
            <p className="fg-56">{work.short[1]}</p>
          </div>
        </div>
      </figcaption>
    </motion.figure>
  );
}
