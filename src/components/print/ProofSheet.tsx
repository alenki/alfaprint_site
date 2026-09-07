'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { useRevealProps } from '@/components/type/PrintReveal';
import type { Review } from '@/content/reviews';
import { PROOFS } from '@/content/site';

/**
 * ПОДПИСЬ НА ПОЛОСЕ.
 *
 * Листа больше нет. Раньше каждый отзыв стоял на своей белой плашке в
 * рамке: три карточки в коробках посреди полосы, набранной край в край.
 * Плашка и рамка сняты обе, отзыв лежит прямо на грунте, а делит отзывы
 * одна волосяная линия по разрезу. Ничего, кроме линии, между ними нет.
 *
 * Подпись читается слева направо в порядке важности: сначала имя
 * человека, потом место, где отзыв можно открыть и прочитать целиком.
 * Метка «Яндекс.Карты» ушла к правому краю колонки и больше не занимает
 * место подписи.
 *
 * Имя выводится ТОЛЬКО если оно стоит в карточке: выдумывать нельзя.
 */
export function ProofSheet({
  review,
  index,
  count,
}: {
  review: Review;
  index: number;
  count: number;
}) {
  const reveal = useRevealProps(index * 0.09);
  const first = index === 0;
  const last = index === count - 1;

  /**
   * Пропорция не задаётся: цитаты короткие, и жёсткий портрет 4:5 оставлял
   * под каждой полполосы белого. Высоту определяет самый длинный отзыв, а
   * сетка растягивает под него остальные, как на настоящем спуске.
   */
  return (
    <motion.figure
      className={cn(
        // Ростовая высота: в стопке ниже, на листе выше, но задана всегда.
        'relative flex flex-col py-[clamp(26px,2.2vw,48px)] min-h-[clamp(160px,28vw,200px)] md:min-h-[clamp(260px,20vw,400px)]',
        // Разрез: на телефоне колонки идут стопкой, и линия ложится поперёк.
        !first && 'max-md:rule-t md:rule-l',
        // Поля только у внутренних краёв: наружные держат поля полосы.
        !first && 'md:pl-[clamp(22px,2.4vw,52px)]',
        !last && 'md:pr-[clamp(22px,2.4vw,52px)]',
      )}
      {...reveal}
    >
      {/* Мини-шкала: шесть плашек K и шесть плашек R */}
      <div className="flex h-1.5 w-full" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => {
          const isK = i < 6;
          const t = (i % 6) / 5;
          return (
            <span
              key={i}
              className="h-full flex-1"
              style={{
                background: isK
                  ? `color-mix(in srgb, var(--color-ink) ${16 + t * 84}%, transparent)`
                  : `color-mix(in srgb, var(--color-rubine) ${16 + t * 84}%, transparent)`,
              }}
            />
          );
        })}
      </div>

      <blockquote className="font-display fg mt-[clamp(22px,2vw,44px)] flex-1 text-[length:var(--text-quote)] font-semibold leading-[1.28] tracking-[-0.012em]">
        {review.quote}
      </blockquote>

      {/* Имя слева, откуда взято справа: подпись, а не выходные данные. */}
      <figcaption className="mt-[clamp(22px,3vw,64px)] flex items-baseline gap-4">
        {review.author && (
          <span className="t-micro fg">
            {review.author}
            {review.date ? ` · ${review.date}` : ''}
          </span>
        )}
        <span className="t-micro fg-56 ml-auto">{PROOFS.source}</span>
      </figcaption>
    </motion.figure>
  );
}
