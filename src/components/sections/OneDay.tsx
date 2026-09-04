'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Registration } from '@/components/ui/Registration';
import { RegistrationMark } from '@/components/ui/PrintMarks';
import { CONTACTS, REVIEWS } from '@/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ПОЛОСА ВТОРАЯ — ЗА ОДИН ДЕНЬ

   «Работаем быстро» ничего не значит: так пишут все. Значит только дата,
   имя и часы. Поэтому здесь не обещание, а протокол одного наряда от
   13 августа — того самого, про который Залим Бекулов написал на Картах.

   Четыре события лежат на одной линейке. Линейка — это ход печатного дня:
   она прочерчивается слева направо по мере прокрутки, и каждый крест
   приводки защёлкивается ровно в тот момент, когда линия до него доходит.
   На узком экране линейка та же, только повёрнута: день идёт сверху вниз.

   Внизу — единственная фраза, ради которой написана вся полоса.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Отзыв, из которого взят этот день. Автор и дата — из общего источника. */
const REVIEW = REVIEWS[1];

/** Дословная выдержка из REVIEW.text — первые две фразы, без похвал в конце. */
const QUOTE =
  'За один день они составили мне дизайн, подготовили пробный макет ' +
  'на подтверждение и изготовили 50 экземпляров. Вот это называется сервис!';

type Beat = {
  time: string;
  /** Сколько прошло с прошлого события */
  delta?: string;
  title: string;
  line: string;
};

const BEATS: Beat[] = [
  {
    time: '09:00',
    title: 'Бриф',
    line: 'Задача, тираж, срок. Пятнадцать минут за столом или в Telegram.',
  },
  {
    time: '11:00',
    delta: '+2 ч',
    title: 'Макет',
    line: 'Рисует свой дизайнер. Присылать готовый файл не обязательно.',
  },
  {
    time: '13:00',
    delta: '+2 ч',
    title: 'Цветопроба',
    line: 'Пробный экземпляр на подтверждение. Без него машина в тираж не уходит.',
  },
  {
    time: '18:00',
    delta: '+5 ч',
    title: 'Тираж',
    line: '50 экземпляров на руки. Наряд закрыт в тот же день.',
  },
];

export function OneDay() {
  const rail = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();

  // Линейка прочерчивается, пока блок событий проходит через кадр
  const { scrollYProgress } = useScroll({
    target: rail,
    offset: ['start 88%', 'end 62%'],
  });

  const drawn = reduced ? 1 : scrollYProgress;

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-12% 0px -12% 0px' },
          transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section id="za-odin-den" className="relative px-gutter py-section">
      {/* ── Служебная строка полосы ──────────────────────────────────────── */}
      <div className="t-meta flex items-baseline justify-between gap-6 border-b border-ink-16 pb-4 text-ink-48">
        <span>
          Полоса 02<span className="hidden sm:inline"> · Наряд от 13 августа</span>
        </span>
        <span className="tab-nums whitespace-nowrap">09:00 → 18:00 · 9 часов</span>
      </div>

      {/* ── Заголовок и свидетельство ────────────────────────────────────── */}
      <div className="mt-10 grid gap-y-10 md:grid-cols-12 md:gap-x-8 md:mt-14">
        <motion.div className="md:col-span-5" {...rise(0)}>
          <h2 className="t-display text-[clamp(2.4rem,5.4vw,4.8rem)]">
            <Registration offset={reduced ? 0 : 8} duration={1.05} className="block">
              За один день
            </Registration>
          </h2>
          <p className="t-lead mt-6 text-ink-72">
            Тринадцатого августа наряд открыли утром и закрыли вечером. Ниже —
            тот же день по часам.
          </p>
        </motion.div>

        <motion.figure
          className="md:col-span-6 md:col-start-7 md:pt-2"
          {...rise(0.12)}
        >
          <blockquote
            cite={CONTACTS.maps}
            className="t-didone text-[clamp(1.3rem,2.2vw,1.95rem)] text-ink"
          >
            «{QUOTE}»
          </blockquote>
          <figcaption className="t-meta mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-ink-48">
            <span>{REVIEW.author}</span>
            <span className="text-ink-32">·</span>
            <a
              href={CONTACTS.maps}
              target="_blank"
              rel="noreferrer"
              className="underline-ink pb-px"
              data-cursor="Читать"
            >
              отзыв на Яндекс.Картах
            </a>
            <span className="text-ink-32">·</span>
            <span>{REVIEW.date}</span>
          </figcaption>
        </motion.figure>
      </div>

      {/* ── Линейка дня ──────────────────────────────────────────────────── */}
      <ol
        ref={rail}
        role="list"
        className="relative mt-20 grid grid-cols-1 md:mt-28 lg:grid-cols-4"
      >
        {/* Горизонтальная линейка — прочерчивается слева направо */}
        <motion.span
          aria-hidden
          style={{ scaleX: drawn }}
          className="absolute inset-x-0 top-9 hidden h-px origin-left bg-ink-16 lg:block"
        />
        {/* Та же линейка на узком экране — день идёт сверху вниз */}
        <motion.span
          aria-hidden
          style={{ scaleY: drawn }}
          className="absolute bottom-1 left-2 top-1 w-px origin-top bg-ink-16 lg:hidden"
        />

        {BEATS.map((beat, i) => (
          <BeatCell
            key={beat.time}
            beat={beat}
            index={i}
            progress={scrollYProgress}
            reduced={reduced}
            last={i === BEATS.length - 1}
          />
        ))}
      </ol>

      {/* ── Вывод ────────────────────────────────────────────────────────── */}
      <motion.p
        className="t-didone mt-20 max-w-[24ch] text-balance border-t border-ink-16 pt-10 text-[clamp(1.65rem,4.4vw,3.4rem)] md:mt-28 md:pt-14"
        {...rise(0)}
      >
        <Registration offset={reduced ? 0 : 6} duration={1.1} className="block">
          Срочная печать — не наценка за панику, а обычный режим работы.
        </Registration>
      </motion.p>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   СОБЫТИЕ ДНЯ
   Крест приводки защёлкивается на узком отрезке прокрутки — ровно тогда,
   когда линейка доходит до его доли. Никакой пружины: приводка не качается.
   ───────────────────────────────────────────────────────────────────────── */

function BeatCell({
  beat,
  index,
  progress,
  reduced,
  last,
}: {
  beat: Beat;
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
  last: boolean;
}) {
  const at = index / BEATS.length;
  const opacity = useTransform(progress, [at, at + 0.035], [0, 1]);
  const scale = useTransform(progress, [at, at + 0.08], [0.45, 1]);

  return (
    <li className="relative pb-12 pl-9 last:pb-0 lg:pb-0 lg:pl-0 lg:pr-8 xl:pr-14">
      <div className="flex items-baseline gap-3 lg:h-9">
        <time
          dateTime={beat.time}
          className="t-num text-[1.0625rem] leading-none text-ink-72"
        >
          {beat.time}
        </time>
        {beat.delta && <span className="t-meta text-ink-32">{beat.delta}</span>}
      </div>

      {/* Позиционирование — классами, движение — внутри: motion пишет свой transform */}
      <span
        aria-hidden
        className="absolute left-0 top-0 lg:top-9 lg:-translate-y-1/2"
      >
        <motion.span
          className={cn('block', last ? 'text-rubine' : 'text-ink-32')}
          style={reduced ? undefined : { opacity, scale }}
        >
          <RegistrationMark size={16} strokeWidth={1} />
        </motion.span>
      </span>

      <h3 className="t-display mt-5 text-[clamp(1.5rem,3.1vw,2.7rem)] uppercase tracking-[0.012em] lg:mt-7">
        {beat.title}
      </h3>
      <p className="t-body mt-3 text-[0.9375rem]">{beat.line}</p>
    </li>
  );
}
