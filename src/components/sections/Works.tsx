'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Registration, RegistrationHover } from '@/components/ui/Registration';
import { ControlStrip, RegistrationMark, Rosette, SheetCorners } from '@/components/ui/PrintMarks';
import { COMPANY, CONTACTS, WORKS, type Work } from '@/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ПОЛОСА СЕДЬМАЯ — РАБОТЫ

   Фотографий тиражей ещё нет. Серый прямоугольник с надписью «фото скоро»
   утопил бы весь сайт, поэтому здесь стоит не заглушка, а честный предмет:
   пробная форма наряда. Номер, заказчик, способ, год — всё, что печатник
   видит на приладке до того, как лист уйдёт в машину.

   Под краской — растровая розетка: полутон изображения, которое ещё не
   напечатано. Под курсором форма сходится в приводку и отрывается от листа:
   единственная тень на сайте — это рез, а не оформление.

   Сетка ведётся форматом карточки из данных: wide — две колонки, tall — три
   строки, square — квадрат. Заполнение плотное (dense), поэтому ритм
   получается рваным, как на реальном спуске полос, а не бенто-плиткой.
   Нижнее левое поле листа занимает пояснение — оно тоже часть наряда.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Номер наряда из журнала: детерминированный шаг, никакого рандома. */
const jobNumber = (i: number) => `А-${String(416 + i * 137).padStart(4, '0')}`;

/* Формат карточки → пролёты сетки. min-h работает только на телефоне:
   выше md высоту держат строки сетки, и min-h ломал бы выключку. */
const SPAN: Record<Work['span'], string> = {
  wide: 'min-h-[15rem] md:min-h-0 md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2',
  tall: 'min-h-[21rem] md:min-h-0 md:col-span-1 md:row-span-3 lg:col-span-1 lg:row-span-3',
  square: 'min-h-[17rem] md:min-h-0 md:col-span-1 md:row-span-2 lg:col-span-1 lg:row-span-2',
};

export function Works() {
  const reduced = usePrefersReducedMotion();

  return (
    <section id="raboty" className="relative px-gutter py-section">
      {/* ── Шапка полосы ──────────────────────────────────────────────────── */}
      <div className="t-meta flex items-center justify-between gap-6 border-t border-ink-16 pt-5 text-ink-48">
        <span>Полоса 07 · Избранное</span>
        <span className="flex items-center gap-4">
          <span className="tab-nums">{WORKS.length} нарядов</span>
          <ControlStrip patch={8} className="hidden shrink-0 sm:flex" />
        </span>
      </div>

      <div className="mt-7 grid gap-x-8 gap-y-6 md:mt-9 md:grid-cols-12 md:items-end">
        <h2 className="t-display text-[clamp(3.25rem,13vw,11rem)] md:col-span-7">
          <Registration offset={reduced ? 0 : 9} delay={0.06} duration={1.05}>
            Работы
          </Registration>
        </h2>

        {/* Честная строка: портфолио не собрано, но цех открыт */}
        <p className="t-meta max-w-[38ch] leading-[1.7] text-ink-48 md:col-span-5 md:pb-2">
          Портфолио пополняется. Живые образцы — в цехе на{' '}
          <a
            href={CONTACTS.maps}
            target="_blank"
            rel="noreferrer"
            data-cursor="Яндекс.Карты"
            className="underline-ink pb-px text-ink-72"
          >
            {COMPANY.address}
          </a>
          .
        </p>
      </div>

      {/* ── Спуск полос ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          'mt-11 grid grid-cols-1 gap-3 md:mt-16 md:grid-cols-2 md:gap-3 lg:grid-cols-4 lg:gap-4',
          'md:[grid-auto-rows:20vw] lg:[grid-auto-rows:10.4vw] [grid-auto-flow:dense]',
        )}
      >
        {WORKS.map((work, i) => (
          <Plate key={work.id} work={work} index={i} />
        ))}

        {/* Пояснение стоит на свободном поле листа, которое остаётся после
            спуска шести форм. Это не карточка: ни рамки, ни тени. */}
        <div className="flex flex-col justify-end gap-5 pt-2 md:col-span-2 md:row-span-2 lg:pr-10">
          <div>
            <p className="t-meta text-ink-48">Почему здесь формы, а не фотографии</p>
            <p className="t-body mt-3 max-w-[46ch]">
              Тиражи снимаем сами — в цехе, своим светом, на своей бумаге. Пока
              съёмки нет, на месте работы стоит пробная форма: номер наряда,
              способ, год. Снимем — форма уступит место оттиску.
            </p>
          </div>
          <ControlStrip patch={9} showLabels className="mb-4" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   ПРОБНАЯ ФОРМА
   Состояние реза держится в React, а не в CSS: класс .is-cut — единственный
   носитель тени на сайте, и его нельзя выдать через hover-вариант Tailwind.
   Шесть карточек, один булев флаг на каждую — перерисовка ничего не стоит.
   ─────────────────────────────────────────────────────────────────────────── */

function Plate({ work, index }: { work: Work; index: number }) {
  const reduced = usePrefersReducedMotion();
  const [cut, setCut] = useState(false);

  return (
    <motion.div
      className={cn('group relative', SPAN[work.span])}
      onPointerEnter={() => setCut(true)}
      onPointerLeave={() => setCut(false)}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px -8% 0px' }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <article
        data-cursor="Смотреть"
        className={cn(
          'relative isolate flex h-full w-full flex-col justify-between',
          'border border-ink-16 bg-paper-2 p-5 lg:p-6',
          // Рез уходит вправо-вниз на полсантиметра — лист, а не карточка
          '[--cut-x:0.5rem] [--cut-y:0.625rem]',
          'transition-[transform,box-shadow] duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          cut && 'is-cut',
          cut && !reduced && '-translate-y-1.5',
        )}
      >
        {/* Полутон изображения, которого ещё нет */}
        <Rosette cell={9} opacity={0.07} />
        <div aria-hidden className="pointer-events-none absolute inset-2.5">
          <SheetCorners />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <span className="t-meta tab-nums text-ink-72">{jobNumber(index)}</span>
          <span className="t-meta tab-nums text-ink-48">{work.year}</span>
        </div>

        <div className="relative mt-auto pt-10">
          <h3 className="t-display text-[clamp(1.2rem,2.1vw,2rem)] leading-[0.92]">
            <RegistrationHover className="block w-full">
              {work.client}
            </RegistrationHover>
          </h3>

          <p className="t-meta mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-72">
            <span>{work.type}</span>
            <span className="text-ink-32">·</span>
            <span>{work.method}</span>
          </p>

          <p className="t-meta mt-4 flex items-center gap-2 border-t border-ink-16 pt-3 text-ink-48">
            <RegistrationMark size={11} strokeWidth={1} className="shrink-0 text-rubine" />
            Съёмка готовится
          </p>
        </div>
      </article>
    </motion.div>
  );
}
