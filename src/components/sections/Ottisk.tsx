'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { RegistrationMark } from '@/components/ui/PrintMarks';
import { usePrefersReducedMotion, useFinePointer } from '@/lib/hooks';
import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ОТТИСК

   Одно слово — «Альфа» — отпечатанное тремя разными способами. Не три
   картинки трёх изделий, а один и тот же набор, прошедший три производства.
   Никто в полиграфии так не показывает: обычно вешают фотографию Heidelberg
   и пишут «высокое качество».

   ── Выборочный УФ-лак ──
   Лак кладут поверх матовой ламинации. Краски в нём нет: в рассеянном свете
   надписи не видно вообще, её находят, наклонив лист к лампе. Именно этот
   жест здесь и воспроизведён — блик идёт за курсором, и слово проявляется
   только под ним. Самая дорогая отделка в цехе и самый дешёвый приём в CSS:
   градиент, обрезанный по контуру букв.

   ── Оговорка к закону одной тени ──
   На всём сайте тень бывает только у вырезанного блока. Здесь text-shadow
   работает не тенью, а краской: ожог и фаска тиснения — это след
   инструмента в материале, а не высота над плоскостью. Исключение
   действует только в этой секции.
   ═══════════════════════════════════════════════════════════════════════════ */

const WORD = 'Альфа';

type Plate = {
  id: string;
  process: string;
  substrate: string;
  spec: string;
  note: string;
  /** Поверхность материала — рисуется CSS, ни одного изображения */
  surface: React.CSSProperties;
};

const PLATES: Plate[] = [
  {
    id: 'uv',
    process: 'Выборочный УФ-лак',
    substrate: 'Оргстекло 3 мм, матовая ламинация',
    spec: 'UV-LED · лак 20 мкм · без краски',
    note: 'Наведите — лак поймает свет',
    surface: {
      backgroundColor: '#15181c',
      backgroundImage: [
        'linear-gradient(148deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 34%)',
        'linear-gradient(28deg, rgba(255,255,255,0) 62%, rgba(255,255,255,0.045) 78%, rgba(255,255,255,0) 86%)',
        'linear-gradient(180deg, #1b1f24 0%, #0e1114 62%, #14181c 100%)',
      ].join(','),
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.5)',
    },
  },
  {
    id: 'laser',
    process: 'Лазерная гравировка',
    substrate: 'Фанера берёзовая 6 мм',
    spec: 'CO₂ · рез 0,1 мм · глубина 0,4 мм',
    note: 'Снят слой, а не нанесена краска',
    surface: {
      backgroundColor: '#b08a55',
      backgroundImage: [
        // Сучки: без них любой повтор читается вельветом, а не берёзой
        'radial-gradient(ellipse 13px 42px at 27% 34%, rgba(74,44,16,0.42) 0 38%, rgba(74,44,16,0) 74%)',
        'radial-gradient(ellipse 9px 30px at 71% 68%, rgba(74,44,16,0.32) 0 36%, rgba(74,44,16,0) 76%)',
        'repeating-linear-gradient(96deg, rgba(90,58,26,0.22) 0px, rgba(90,58,26,0.22) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 7px)',
        'repeating-linear-gradient(93deg, rgba(60,36,14,0.13) 0px, rgba(60,36,14,0.13) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 19px)',
        'repeating-linear-gradient(97.5deg, rgba(255,232,196,0.16) 0px, rgba(255,232,196,0.16) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 31px)',
        'linear-gradient(180deg, #c49b62 0%, #a67f4c 55%, #8f6c3e 100%)',
      ].join(','),
      boxShadow: 'inset 0 1px 0 rgba(255,240,214,0.4), inset 0 -1px 0 rgba(60,36,14,0.5)',
    },
  },
  {
    id: 'foil',
    process: 'Тиснение фольгой',
    substrate: 'Дизайнерский картон 350 г/м²',
    spec: 'горячее тиснение · клише · 120 °C',
    note: 'Наведите — свет пойдёт с другой стороны',
    surface: {
      backgroundColor: '#221c17',
      backgroundImage: [
        'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%)',
        'linear-gradient(180deg, #2b241d 0%, #1a1511 70%, #221b15 100%)',
      ].join(','),
      boxShadow: 'inset 0 1px 0 rgba(255,244,224,0.14), inset 0 -1px 0 rgba(0,0,0,0.55)',
    },
  },
];

/* ───────────────────────────────────────────────────────────────────────────
   Плашка. Блик лака пишется прямо в стиль узла: ни одного перерендера
   React на движение мыши.
   ─────────────────────────────────────────────────────────────────────────── */

function PlateCard({ plate, index }: { plate: Plate; index: number }) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const isVarnish = plate.id === 'uv';

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isVarnish || !fine || !wordRef.current || !boxRef.current) return;
      const r = boxRef.current.getBoundingClientRect();
      const pct = ((e.clientX - r.left) / r.width) * 100;
      wordRef.current.style.setProperty('--rake', `${Math.max(-20, Math.min(120, pct))}%`);
    },
    [isVarnish, fine],
  );

  // На тач-экране и в покое лак не догнать курсором — блик проходит сам,
  // один раз при появлении плашки в кадре.
  const inView = useInView(boxRef, { once: true, margin: '-15% 0px -15% 0px' });
  useEffect(() => {
    if (!isVarnish || fine || !inView || !wordRef.current) return;
    const node = wordRef.current;
    if (reduced) {
      node.style.setProperty('--rake', '50%');
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 2200);
      node.style.setProperty('--rake', `${-15 + p * 130}%`);
      if (p < 1) frame = requestAnimationFrame(tick);
      else node.style.setProperty('--rake', '46%');
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isVarnish, fine, inView, reduced]);

  return (
    <motion.article
      ref={boxRef}
      onPointerMove={onMove}
      className="group relative flex flex-col"
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Материал */}
      <div
        className="relative flex aspect-4/5 items-center justify-center overflow-hidden px-5"
        style={plate.surface}
      >
        {/* Слово, отпечатанное способом этой плашки */}
        <span
          ref={wordRef}
          className={cn(
            'select-none text-center leading-none',
            plate.id === 'uv' && 'varnish',
            plate.id === 'laser' && 'burn',
            plate.id === 'foil' && 'foil-emboss',
          )}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.6rem, 6vw, 4.4rem)',
            fontWeight: 900,
            fontVariationSettings: "'opsz' 144, 'wdth' 86, 'GRAD' 0",
            letterSpacing: '-0.02em',
          }}
        >
          {WORD}
        </span>

        {/* Обрез материала */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 border border-white/10"
        />
      </div>

      {/* Подпись к плашке */}
      <div className="mt-4 border-t border-chalk-24 pt-3.5">
        <h3 className="t-lead text-[1.0625rem] text-chalk">{plate.process}</h3>
        <p className="t-meta mt-2 text-chalk-56">{plate.substrate}</p>
        <p className="t-meta mt-1.5 text-chalk-24">{plate.spec}</p>
        <p className="t-meta mt-3 flex items-center gap-2 text-chalk-24 transition-colors duration-500 group-hover:text-rubine">
          <RegistrationMark size={10} strokeWidth={1} className="shrink-0" />
          {plate.note}
        </p>
      </div>
    </motion.article>
  );
}

export function Ottisk() {
  return (
    <section id="ottisk" data-ground="dark" className="relative bg-press px-gutter py-section text-chalk">
      <header className="mb-12 md:mb-16">
        <div className="t-meta mb-7 flex items-baseline justify-between gap-6 border-t border-chalk-24 pt-4 text-chalk-56">
          <span>05 / Оттиск</span>
          <span>Один набор · три производства</span>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          <h2 className="t-display text-[clamp(2rem,6.2vw,5.4rem)] leading-[0.9] md:col-span-7">
            Что вы покупаете,
            <br />
            когда платите за отделку
          </h2>
          <p className="t-lead self-end text-chalk-56 md:col-span-5 md:pb-2">
            УФ-лак, лазер и тиснение обычно продают словами. Здесь одно и то же
            слово прошло через все три — можно сравнить, не приезжая в цех.
          </p>
        </div>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {PLATES.map((p, i) => (
          <PlateCard key={p.id} plate={p} index={i} />
        ))}
      </div>

      <p className="t-meta mt-10 max-w-[60ch] text-chalk-24 md:mt-14">
        Это не фотографии. Все три поверхности и все три отпечатка нарисованы
        кодом — градиентами и обрезкой по контуру букв, — как и всё остальное
        на этой странице. Настоящие образцы лежат на столе в цехе.
      </p>
    </section>
  );
}
