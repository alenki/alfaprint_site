'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { RegistrationHover } from '@/components/ui/Registration';
import { Justified } from '@/components/ui/Justified';
import { RegistrationMark } from '@/components/ui/PrintMarks';
import { CAPABILITIES } from '@/content/site';
import { fillNaryad } from '@/lib/naryad';
import { useFinePointer, usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ПРОИЗВОДСТВО

   Каталог набран как указатель наборной кассы: номер, название, техническая
   строка. Десять строк — десять производств, все под одной крышей на
   Тарчокова, 29.

   Строка в покое разведена на сотые доли кегля и сходится под курсором:
   то же правило, что и в заголовке полосы. Справа — плашка с составом работ,
   она подменяется без смены высоты, поэтому список не дёргается.

   Клик по строке не открывает страницу, а дописывает наряд внизу и
   возвращает к нему: каталог и пульт — один механизм, а не две секции.
   ═══════════════════════════════════════════════════════════════════════════ */

export function Production() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const inView = useInView(listRef, { once: true, margin: '-10% 0px -25% 0px' });
  const current = CAPABILITIES[Math.max(0, active)];

  return (
    <section id="proizvodstvo" className="relative px-gutter py-section">
      {/* ── Шапка секции ─────────────────────────────────────────────────── */}
      <header className="mb-14 md:mb-20">
        <div className="t-meta mb-7 flex items-baseline justify-between gap-6 border-t border-ink-16 pt-4 text-ink-48">
          <span>03 / Производство</span>
          <span className="tab-nums">10 направлений</span>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          <h2 className="t-display text-[clamp(2rem,6.2vw,5.4rem)] leading-[0.9] md:col-span-7">
            <Justified
              lines={['Десять производств', 'под одной крышей']}
              srText="Десять производств под одной крышей"
              opsz={144}
              weight={900}
            />
          </h2>
          <p className="t-lead self-end md:col-span-5 md:pb-2">
            Оперативная полиграфия, УФ, лазер и гравировка стоят в одном цехе.
            Поэтому макет, цветопроба и тираж не ездят по городу между
            подрядчиками — и укладываются в один день.
          </p>
        </div>
      </header>

      {/* ── Каталог ──────────────────────────────────────────────────────── */}
      <div className="grid gap-x-10 md:grid-cols-12">
        <ol ref={listRef} className="md:col-span-7 lg:col-span-8">
          {CAPABILITIES.map((cap, i) => (
            <motion.li
              key={cap.slug}
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={inView || reduced ? { opacity: 1, y: 0 } : undefined}
              transition={{
                duration: 0.7,
                delay: 0.04 * i,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => {
                  // На точном указателе плашка справа уже раскрыта наведением,
                  // поэтому нажатие сразу уходит в наряд. На касании наведения
                  // нет: первое нажатие раскрывает строку, и только кнопка
                  // внутри неё дописывает наряд. Иначе палец улетал бы вниз,
                  // так и не увидев, из чего состоит направление.
                  if (fine) fillNaryad({ chto: cap.slug });
                  else setActive((prev) => (prev === i ? -1 : i));
                }}
                data-cursor="В наряд"
                aria-expanded={fine ? undefined : i === active}
                aria-label={
                  fine
                    ? `${cap.title} — добавить в наряд`
                    : `${cap.title} — состав работ`
                }
                className={cn(
                  'group grid w-full grid-cols-[2.4rem_1fr] items-start gap-x-3 border-t border-ink-16 py-3.5 text-left transition-colors duration-500 md:grid-cols-[3rem_1fr_auto] md:gap-x-5 md:py-4',
                  i === active ? 'text-ink' : 'text-ink md:text-ink-72',
                )}
              >
                <span className="t-meta tab-nums pt-[0.62em] text-ink-32 transition-colors duration-500 group-hover:text-rubine">
                  {cap.index}
                </span>

                <span className="t-display block text-[clamp(1.5rem,4vw,3.1rem)] leading-[1.02]">
                  <RegistrationHover>{cap.title}</RegistrationHover>
                </span>

                <span className="t-meta hidden shrink-0 self-start whitespace-nowrap pt-[0.62em] text-ink-32 md:block">
                  {cap.spec}
                </span>
              </button>

              {/* На узком экране плашка не помещается сбоку — состав работ
                  печатается прямо под активной строкой. */}
              {i === active && (
                <div className="pb-5 pl-[2.4rem] md:hidden">
                  <p className="t-body mb-3 text-[0.9375rem]">{cap.lead}</p>
                  <ul className="mb-4 flex flex-wrap gap-x-2 gap-y-1">
                    {cap.items.map((it) => (
                      <li key={it} className="t-meta text-ink-48">
                        {it}
                      </li>
                    ))}
                  </ul>
                  <p className="t-meta mb-4 text-ink-32">{cap.spec}</p>
                  <button
                    type="button"
                    onClick={() => fillNaryad({ chto: cap.slug })}
                    className="t-meta rounded-full bg-ink px-5 py-3 text-paper"
                  >
                    Добавить в наряд ↓
                  </button>
                </div>
              )}
            </motion.li>
          ))}
          <li className="border-t border-ink-16" aria-hidden />
        </ol>

        {/* ── Плашка состава ──────────────────────────────────────────────── */}
        <aside className="hidden md:col-span-5 md:block lg:col-span-4">
          <div className="sticky top-28">
            <div className="relative min-h-[19rem] border border-ink-16 bg-paper-2 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.slug}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="t-meta flex items-center justify-between gap-4 text-ink-48">
                    <span className="tab-nums">Направление {current.index}</span>
                    <RegistrationMark size={13} strokeWidth={1} className="text-rubine" />
                  </div>

                  <p className="t-lead mt-5 text-[1.0625rem] leading-[1.45]">
                    {current.lead}
                  </p>

                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {current.items.map((it) => (
                      <li
                        key={it}
                        className="t-meta border border-ink-16 px-2.5 py-1.5 text-ink-72"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>

                  <p className="t-meta mt-6 border-t border-ink-16 pt-4 text-ink-32">
                    {current.spec}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="t-meta mt-4 text-ink-32">
              Нажмите строку — направление уйдёт в наряд ↓
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
