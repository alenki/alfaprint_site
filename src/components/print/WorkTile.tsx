'use client';

import { motion } from 'motion/react';
import { ARCHETYPES } from '@/components/print/archetypes';
import { useRevealProps } from '@/components/type/PrintReveal';
import type { Work } from '@/content/works';
import { cn } from '@/lib/cn';

/**
 * ПЛИТКА СПУСКА.
 *
 * Плитки не разделены зазором — они делят общую волосяную линию, как полосы
 * на печатном листе.
 *
 * Плейсхолдер здесь — леса, а не постоянное решение: как только у плитки
 * появится photo, вместо вектора встанет снимок, а рамка, подпись, ховер,
 * разведение форм и стагер продолжат работать без единой правки вёрстки.
 */
export function WorkTile({ work, index }: { work: Work; index: number }) {
  const Art = ARCHETYPES[work.archetype];
  const reveal = useRevealProps((index % 3) * 0.06);

  return (
    <motion.figure
      className={cn(
        'group relative flex flex-col border-b border-r border-[var(--color-ink-32)]',
        // Пропорция одиночной плитки 1 : 1,15. Двойная плитка обязана иметь
        // ту же высоту, иначе ряд спуска развалится.
        work.span === 2 ? 'col-span-2 aspect-[1.739/1]' : 'col-span-1 aspect-[1/1.15]'
      )}
      {...reveal}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '380px' }}
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

      <figcaption className="hairline-t flex items-end justify-between gap-3 bg-[var(--color-paper)] px-3 py-2.5">
        <div className="min-w-0">
          <p className="t-micro truncate opacity-100">{work.caption[0]}</p>
          <p className="t-micro truncate opacity-60">{work.caption[1]}</p>
        </div>
        <span className="t-micro shrink-0 translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-70">
          Смотреть →
        </span>
      </figcaption>
    </motion.figure>
  );
}
