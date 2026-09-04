'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Registration, RegistrationHover } from '@/components/ui/Registration';
import { RegistrationMark } from '@/components/ui/PrintMarks';
import { COMPANY, CONTACTS, REVIEWS } from '@/content/site';
import { useFinePointer, usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ПОЛОСА ВОСЬМАЯ — ОТЗЫВЫ

   Оценку типографии ставит не типография. 4,8 из 5 по сорока четырём
   отзывам на Яндекс.Картах — это единственная цифра на сайте, которую мы
   не считали сами, поэтому она набрана как шапка журнала, а не как плашка
   со звёздочками.

   Каждый отзыв ведёт своя фраза — выноска, набранная широкой дидоной.
   Ниже идёт тот же отзыв целиком, и фраза выноски внутри него напечатана
   плотнее остального текста: видно, откуда её вынули. Ничего не сокращено
   и не переписано.

   Отзывы стоят на разных колонках двенадцатидольной сетки — полоса читается
   разворотом, а не лентой. Между ними только волосяная линия.
   ═══════════════════════════════════════════════════════════════════════════ */

/* 4.8 → «4,8». Запятая, а не точка, и без Intl — чтобы сервер и клиент
   напечатали одно и то же. */
const RATING = String(COMPANY.rating).replace('.', ',');

/* Позиция каждого отзыва на сетке. Классы записаны целиком — Tailwind
   читает исходник строками и собранных на лету имён не видит. */
const COLUMN = [
  'md:col-start-1 md:col-span-7',
  'md:col-start-6 md:col-span-7',
  'md:col-start-2 md:col-span-7',
  'md:col-start-5 md:col-span-8',
];

/** Разрезает отзыв по фразе выноски: до / сама фраза / после. */
function splitPull(text: string, pull: string) {
  const at = text.indexOf(pull);
  if (at < 0) return [text, '', ''] as const;
  return [text.slice(0, at), pull, text.slice(at + pull.length)] as const;
}

/** Подъём при входе в кадр. В покое — сразу конечное состояние. */
function rise(shown: boolean, reduced: boolean, delay: number) {
  const from = reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 };
  return {
    initial: from,
    animate: shown || reduced ? { opacity: 1, y: 0 } : from,
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] as const },
  };
}

export function Reviews() {
  const mastRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const mastShown = useInView(mastRef, { once: true, margin: '-18% 0px -18% 0px' });

  return (
    <section
      id="otzyvy"
      aria-labelledby="otzyvy-zagolovok"
      className="relative px-gutter py-section"
    >
      {/* ── Служебная строка полосы ──────────────────────────────────────── */}
      <div className="t-meta flex items-start justify-between gap-6 text-ink-48">
        <span>Полоса 08 · Отзывы</span>
        <span className="text-right">Источник · Яндекс.Карты</span>
      </div>

      {/* ── Шапка: одна цифра размером с заголовок ───────────────────────── */}
      <motion.div
        ref={mastRef}
        className="mt-10 grid grid-cols-1 items-end gap-x-6 gap-y-8 md:mt-14 md:grid-cols-12"
        {...rise(mastShown, reduced, 0)}
      >
        <h2
          id="otzyvy-zagolovok"
          className="flex items-end gap-4 sm:gap-7 md:col-span-6 lg:col-span-5"
        >
          <span className="sr-only">
            Отзывы. {RATING} из 5 по {COMPANY.reviewCount} отзывам на Яндекс.Картах
          </span>

          <span aria-hidden className="t-display text-[clamp(5rem,19vw,14rem)] leading-[0.76]">
            <Registration offset={reduced ? 0 : 14} duration={1.1} delay={0.05}>
              {RATING}
            </Registration>
          </span>

          {/* Моношрифт стоит на той же линии шрифта, что и цифра */}
          <span aria-hidden className="mb-[0.6rem] flex flex-col gap-3 md:mb-[0.9rem]">
            <span className="t-meta text-ink">из 5</span>
            <span className="block h-px w-10 bg-ink-16" />
            <span className="t-meta tab-nums max-w-[9rem] leading-[1.5] text-ink-48">
              {COMPANY.reviewCount} отзыва на Яндекс.Картах
            </span>
          </span>
        </h2>

        <p className="t-lead text-ink-72 md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
          Оценку ставят клиенты, а не мы. Ниже — четыре отзыва целиком: без
          сокращений, без правки, с именами и датами.
        </p>
      </motion.div>

      {/* ── Отзывы ───────────────────────────────────────────────────────── */}
      <div className="mt-16 md:mt-24">
        {REVIEWS.map((review, i) => (
          <Entry key={review.author} review={review} index={i} reduced={reduced} />
        ))}
      </div>

      {/* ── Выход на источник ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-ink-16 pt-7">
        <RegistrationMark size={13} strokeWidth={1} className="shrink-0 text-rubine" />
        <a
          href={CONTACTS.maps}
          target="_blank"
          rel="noreferrer"
          data-cursor="Яндекс.Карты"
          className="group t-meta inline-flex items-baseline gap-3"
        >
          <span className="underline-ink pb-px">
            Все {COMPANY.reviewCount} отзыва на Яндекс.Картах
          </span>
          <span
            aria-hidden
            className="transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
          >
            →
          </span>
        </a>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   ОТДЕЛЬНЫЙ ОТЗЫВ
   Свой наблюдатель кадра у каждого: до нижних отзывов страница доходит
   нескоро, и запускать их заранее — значит показать пустое место.
   ─────────────────────────────────────────────────────────────────────────*/

function Entry({
  review,
  index,
  reduced,
}: {
  review: (typeof REVIEWS)[number];
  index: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref, { once: true, margin: '-14% 0px -14% 0px' });
  const fine = useFinePointer();

  const [before, pull, after] = splitPull(review.text, review.pull);

  return (
    <article
      ref={ref}
      className="group grid grid-cols-1 border-t border-ink-16 pb-14 pt-8 md:grid-cols-12 md:pb-20 md:pt-11"
    >
      <div className={cn('flex flex-col', COLUMN[index % COLUMN.length])}>
        {/* Выноска — заголовок отзыва. Сходится в приводку под курсором;
            на касании сводить нечем, поэтому там она сразу в приводке. */}
        <motion.h3
          className="t-didone text-balance text-[clamp(1.55rem,4.2vw,3.15rem)]"
          {...rise(shown, reduced, 0)}
        >
          {fine ? <RegistrationHover>{review.pull}</RegistrationHover> : review.pull}
        </motion.h3>

        <motion.p className="t-body mt-6" {...rise(shown, reduced, 0.09)}>
          {before}
          {pull && <span className="text-ink">{pull}</span>}
          {after}
        </motion.p>

        <motion.p
          className="t-meta mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-48"
          {...rise(shown, reduced, 0.18)}
        >
          <span className="tab-nums text-ink-32">
            {String(index + 1).padStart(2, '0')}/{String(REVIEWS.length).padStart(2, '0')}
          </span>
          <span className="text-ink">{review.author}</span>
          <span className="text-ink-32">·</span>
          <span>{review.date}</span>
        </motion.p>
      </div>
    </article>
  );
}
