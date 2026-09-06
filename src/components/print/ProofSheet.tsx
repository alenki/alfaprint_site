'use client';

import { motion } from 'motion/react';
import { StampVPechat } from '@/components/print/StampVPechat';
import { useRevealProps } from '@/components/type/PrintReveal';
import type { Review } from '@/content/reviews';
import { PROOFS } from '@/content/site';

/**
 * ЛИСТ ЦВЕТОПРОБЫ.
 *
 * Чистый #FFFFFF, белее грунта: вот зачем бумага не белая. Ни скруглений,
 * ни теней; лист отделён от грунта одной волосяной линией и тоном.
 *
 * Три листа сняты с одного печатного листа и делят общие линии реза, поэтому
 * зазора между ними нет. Карточек с отступами на этом сайте не бывает.
 *
 * Имя автора выводится ТОЛЬКО если клиент его прислал. Пока поле пустое,
 * подпись состоит из одной метки «Яндекс.Карты»: выдумывать имена нельзя.
 */
export function ProofSheet({ review, index }: { review: Review; index: number }) {
  const reveal = useRevealProps(index * 0.09);

  /**
   * Пропорция не задаётся: цитаты короткие, и жёсткий портрет 4:5 оставлял
   * под каждой полполосы белого. Высоту определяет самый длинный лист, а
   * сетка растягивает под него остальные, как на настоящем спуске.
   */
  return (
    <motion.figure
      className="group rule-r relative min-h-[clamp(320px,24vw,480px)]"
      {...reveal}
    >
      {/* Призрак-контур: лист сдвинут относительно своей формы */}
      <span
        aria-hidden
        className="proof-ghost pointer-events-none absolute inset-0 border border-[var(--color-rubine-26)]"
      />

      <div className="relative flex h-full flex-col bg-[var(--color-proof)] p-[clamp(20px,2.2vw,52px)]">
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

        <blockquote className="font-display mt-[clamp(24px,2.2vw,48px)] flex-1 text-[length:var(--text-quote)] font-semibold leading-[1.28] tracking-[-0.012em] text-[var(--color-ink)]">
          {review.quote}
        </blockquote>

        <figcaption className="mt-6">
          {review.author && (
            <p className="text-[13px] font-medium text-[var(--color-ink-70)]">
              {review.author}
              {review.date ? ` · ${review.date}` : ''}
            </p>
          )}
          <p className="t-micro mt-1 text-[var(--color-ink-62)]">{PROOFS.source}</p>
        </figcaption>

        {/* Галочка утверждения и штамп */}
        <div className="pointer-events-none absolute bottom-[clamp(16px,1.8vw,40px)] right-[clamp(16px,1.8vw,40px)] flex flex-col items-end gap-2">
          <motion.svg
            viewBox="0 0 24 22"
            className="h-11 w-12"
            fill="none"
            aria-hidden
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: '-12% 0px' }}
          >
            <motion.path
              d="M2 11.5 L8.5 19.5 L22 1.5"
              stroke="var(--color-rubine)"
              strokeWidth="3"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              pathLength={1}
              variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
              transition={{ duration: 0.62, delay: 0.09 * index, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.svg>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-12% 0px' }}
            transition={{ duration: 0.24, delay: 0.09 * index + 0.62 }}
            className="flex justify-end"
          >
            <StampVPechat seed={index} />
          </motion.div>
        </div>
      </div>
    </motion.figure>
  );
}
