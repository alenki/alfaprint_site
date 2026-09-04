'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Registration } from '@/components/ui/Registration';
import { Justified } from '@/components/ui/Justified';
import { ControlStrip, RegistrationMark } from '@/components/ui/PrintMarks';
import { COMPANY, CONTACTS } from '@/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';

/* ═══════════════════════════════════════════════════════════════════════════
   ПОЛОСА ПЕРВАЯ

   Заголовок — не наш копирайт. Это дословная фраза из отзыва Залины
   Нагапловой на Яндекс.Картах, и подпись под ней об этом честно говорит.
   Ни одно агентство не сформулировало бы позиционирование точнее, чем это
   сделал живой клиент.

   Три строки выключены в формат по оси ширины — не шпациями, а рисунком
   буквы. При загрузке формы сходятся в приводку по очереди: сайт печатает
   собственный заголовок.
   ═══════════════════════════════════════════════════════════════════════════ */

const HEADLINE = ['Печатаем то, с чем', 'не справляются другие', 'типографии города'];
const SR_HEADLINE = 'Печатаем то, с чем не справляются другие типографии города';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-11%']);
  const fade = useTransform(scrollYProgress, [0.15, 0.9], [1, 0]);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between px-gutter pb-7 pt-24 md:pt-28"
    >
      {/* ── Верхняя служебная строка ─────────────────────────────────────── */}
      <motion.div
        className="t-meta flex items-start justify-between gap-6 text-ink-48"
        {...rise(0.1)}
      >
        <span>
          Полоса 01<span className="hidden sm:inline"> · Формат 1/1 · Вылет 3 мм</span>
        </span>
        <span className="text-right tab-nums">
          {COMPANY.coords.lat.toFixed(4)} N&nbsp;&nbsp;{COMPANY.coords.lng.toFixed(4)} E
        </span>
      </motion.div>

      {/* ── Заголовок ────────────────────────────────────────────────────── */}
      <motion.div style={{ y, opacity: fade }} className="my-auto w-full py-8">
        <motion.p
          className="t-meta mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-48 md:mb-7"
          {...rise(0.2)}
        >
          <span>Типография и рекламное агентство</span>
          <span className="text-ink-32">/</span>
          <span>{COMPANY.city}</span>
          <span className="text-ink-32">/</span>
          <span className="tab-nums">с {COMPANY.since} года</span>
        </motion.p>

        <h1 className="t-display text-[clamp(2.35rem,8.6vw,10.5rem)] leading-[0.87]">
          <Justified
            lines={HEADLINE}
            srText={SR_HEADLINE}
            opsz={144}
            weight={900}
            renderLine={(line, i) => (
              <Registration
                immediate
                offset={reduced ? 0 : 9}
                delay={0.34 + i * 0.12}
                duration={1.15}
                className="block"
              >
                {line}
              </Registration>
            )}
          />
        </h1>

        {/* Подпись: заголовок принадлежит клиентке, а не нам */}
        <motion.p
          className="t-meta mt-6 flex flex-wrap items-center gap-2.5 text-ink-48 md:mt-8"
          {...rise(1)}
        >
          <RegistrationMark size={13} strokeWidth={1} className="shrink-0 text-rubine" />
          <span>Залина Нагаплова</span>
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
          <span>21 августа</span>
        </motion.p>
      </motion.div>

      {/* ── Подвал полосы ────────────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 items-end gap-7 border-t border-ink-16 pt-6 md:grid-cols-12"
        {...rise(1.1)}
      >
        <p className="t-lead md:col-span-5 lg:col-span-4">
          Оперативная полиграфия, УФ-печать, лазерная резка, гравировка и широкий
          формат — в одном цехе на Тарчокова, 29.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 md:col-span-4">
          <a
            href="#naryad"
            data-cursor="Четыре поля"
            className="t-meta group relative overflow-hidden rounded-full bg-ink px-6 py-3.5 text-paper"
          >
            <span className="relative z-10">Собрать наряд</span>
            <span className="absolute inset-0 z-0 origin-left scale-x-0 bg-rubine transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </a>
          <a
            href={CONTACTS.phoneHref}
            data-cursor="Позвонить"
            className="t-meta tab-nums rounded-full border border-ink-32 px-6 py-3.5 transition-colors duration-500 hover:border-ink"
          >
            {CONTACTS.phone}
          </a>
        </div>

        <div className="flex items-end justify-between gap-6 md:col-span-3 md:justify-end lg:col-span-4">
          <a
            href={CONTACTS.maps}
            target="_blank"
            rel="noreferrer"
            className="group flex items-baseline gap-2"
            data-cursor="Яндекс.Карты"
          >
            {/* Оценку набираем дисплейной гарнитурой, а не моноширинной:
                в моноширинной запятая занимает целую кегельную и число
                разваливается на «4 , 8». */}
            <span
              className="text-[2.6rem] leading-[0.8]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontVariationSettings: "'opsz' 60, 'wdth' 92, 'GRAD' 0",
                letterSpacing: '-0.03em',
              }}
            >
              {String(COMPANY.rating).replace('.', ',')}
            </span>
            <span className="t-meta text-ink-48">
              из 5 · {COMPANY.reviewCount} отзыва
            </span>
          </a>
          <ControlStrip patch={10} className="hidden shrink-0 lg:flex" />
        </div>
      </motion.div>
    </section>
  );
}
