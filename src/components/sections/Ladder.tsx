'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { RegistrationMark } from '@/components/ui/PrintMarks';
import { CONTACTS } from '@/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';

/* ═══════════════════════════════════════════════════════════════════════════
   КЕГЕЛЬНАЯ ЛЕСТНИЦА

   Одно слово — «Альфа» — набранное девять раз, от баннера три на шесть
   метров до мелкого шрифта на упаковке. Слева подписано, каким изделием
   этот кегль оказывается в жизни.

   ── Почему это не просто «текст разного размера» ──

   Roboto Serif — переменная гарнитура с осью оптического кегля (opsz 8…144).
   Оптический кегль — это не масштаб. До фотонабора каждый кегль резали
   отдельно: крупные — с тонкими волосяными линиями и тесным очком, мелкие —
   с жирным штрихом и широким просветом, иначе на бумаге они «залипали».
   Ось opsz возвращает эту работу: каждая ступень здесь набрана СВОИМ
   рисунком буквы, а не увеличенным чужим.

   Поэтому размер задан честным font-size, а не transform: scale(). Масштаб
   растянул бы одну и ту же букву — и весь смысл лестницы пропал бы.

   Шкала на экране сжата: 600 мм и 1,4 мм в одном кадре не помещаются.
   Настоящая высота прописной подписана рядом с каждой ступенью.
   ═══════════════════════════════════════════════════════════════════════════ */

type Rung = {
  /** Кегль на экране */
  size: string;
  /** Оптическая ось, честно подобранная под физический размер */
  opsz: number;
  wdth: number;
  weight: number;
  /** Изделие, которым этот кегль становится в цехе */
  product: string;
  /** Настоящая высота прописной буквы */
  cap: string;
  /** Что уходит в сообщение */
  order: string;
};

const RUNGS: Rung[] = [
  { size: 'clamp(3.6rem, 12vw, 9rem)',    opsz: 144, wdth: 78,  weight: 900, product: 'Баннер 3 × 6 м',            cap: '600 мм', order: 'баннер 3 × 6 м' },
  { size: 'clamp(2.6rem, 8.4vw, 6.2rem)', opsz: 144, wdth: 84,  weight: 850, product: 'Вывеска на фасад',          cap: '300 мм', order: 'вывеску на фасад' },
  { size: 'clamp(1.9rem, 5.8vw, 4.3rem)', opsz: 120, wdth: 90,  weight: 800, product: 'Плакат А1',                 cap: '90 мм',  order: 'плакат А1' },
  { size: 'clamp(1.45rem, 4vw, 3rem)',    opsz: 88,  wdth: 96,  weight: 750, product: 'Меню для кафе',             cap: '24 мм',  order: 'меню для кафе' },
  { size: 'clamp(1.15rem, 2.8vw, 2.1rem)',opsz: 60,  wdth: 100, weight: 700, product: 'Сертификат А4',             cap: '14 мм',  order: 'сертификаты А4' },
  { size: 'clamp(1rem, 2vw, 1.5rem)',     opsz: 36,  wdth: 104, weight: 640, product: 'Открытка',                  cap: '9 мм',   order: 'открытки' },
  { size: 'clamp(0.9rem, 1.4vw, 1.1rem)', opsz: 20,  wdth: 108, weight: 580, product: 'Этикетка',                  cap: '5 мм',   order: 'этикетки' },
  { size: '0.875rem',                     opsz: 12,  wdth: 112, weight: 520, product: 'Визитка премиум',           cap: '3 мм',   order: 'визитки премиум-класса' },
  { size: '0.75rem',                      opsz: 8,   wdth: 116, weight: 480, product: 'Мелкий шрифт на упаковке',  cap: '1,4 мм', order: 'упаковку с мелким шрифтом' },
];

function orderHref(order: string) {
  return `${CONTACTS.whatsapp}?text=${encodeURIComponent(
    `Здравствуйте! Нужен ${order}. Подскажите срок и цену.`,
  )}`;
}

export function Ladder() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-8% 0px -20% 0px' });

  return (
    <section id="formaty" className="relative px-gutter py-section">
      <header className="mb-12 md:mb-16">
        <div className="t-meta mb-7 flex items-baseline justify-between gap-6 border-t border-ink-16 pt-4 text-ink-48">
          <span>04 / Форматы</span>
          <span className="tab-nums">9 ступеней · 600 мм → 1,4 мм</span>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          <h2 className="t-display text-[clamp(2rem,6.2vw,5.4rem)] leading-[0.9] md:col-span-7">
            Кегельная лестница
          </h2>
          <p className="t-lead self-end md:col-span-5 md:pb-2">
            Один и тот же знак, набранный девять раз. Слева — каким изделием
            каждый кегль становится в цехе. Нажмите ступень: формат уйдёт
            в сообщение уже вписанным.
          </p>
        </div>
      </header>

      {/* ── Лестница ─────────────────────────────────────────────────────── */}
      <div ref={ref} className="border-t border-ink-16">
        {RUNGS.map((r, i) => (
          <motion.a
            key={r.product}
            href={orderHref(r.order)}
            target="_blank"
            rel="noreferrer"
            data-cursor="В WhatsApp"
            className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b border-ink-16 py-3 md:grid-cols-[minmax(9rem,15rem)_1fr_auto] md:gap-x-8 md:py-4"
            initial={reduced ? false : { opacity: 0, x: -14 }}
            animate={inView || reduced ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.72, delay: i * 0.055, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Поле слева: чем этот кегль становится в жизни */}
            <span className="t-meta order-2 col-span-2 flex items-center gap-2 text-ink-48 transition-colors duration-500 group-hover:text-ink md:order-none md:col-span-1 md:self-center">
              <RegistrationMark
                size={11}
                strokeWidth={1}
                className="shrink-0 text-ink-16 transition-colors duration-500 group-hover:text-rubine"
              />
              {r.product}
            </span>

            {/* Ступень. font-size настоящий — иначе оптический кегль теряет смысл */}
            <span
              className="order-1 block leading-[0.96] text-ink md:order-none"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: r.size,
                fontWeight: r.weight,
                fontVariationSettings: `'opsz' ${r.opsz}, 'wdth' ${r.wdth}, 'GRAD' 0`,
                letterSpacing: r.opsz > 60 ? '-0.02em' : '0',
              }}
            >
              Альфа
            </span>

            {/* Поле справа: настоящая высота прописной и положение оси */}
            <span className="t-meta order-1 shrink-0 self-center whitespace-nowrap text-right tab-nums text-ink-32 md:order-none">
              <span className="text-ink-48">{r.cap}</span>
              <span className="hidden md:inline"> · opsz {r.opsz}</span>
            </span>
          </motion.a>
        ))}
      </div>

      {/* ── Замок ────────────────────────────────────────────────────────── */}
      <div className="mt-10 grid gap-6 md:grid-cols-12 md:mt-14">
        <p className="t-didone text-[clamp(1.5rem,3.4vw,2.6rem)] md:col-span-7">
          Один и тот же знак. Девять разных производств.
        </p>
        <p className="t-meta self-end text-ink-32 md:col-span-5 md:pb-2">
          Шкала на экране сжата — 600 мм и 1,4 мм в один кадр не помещаются.
          Оптическая ось на каждой ступени настоящая: крупные кегли набраны
          тонким рисунком, мелкие — плотным.
        </p>
      </div>
    </section>
  );
}
