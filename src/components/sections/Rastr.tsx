'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { WorkTile } from '@/components/print/WorkTile';
import { TrimMarks } from '@/components/chrome/TrimMarks';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { WORKS } from '@/content/works';
import { RASTR, SECTIONS } from '@/content/site';

/**
 * §04 · РАСТР
 *
 * Общий план и макро на одной непрерывной поверхности. Съёмки нет, и это
 * сказано вслух: заявленный плейсхолдер перестаёт быть дырой и становится
 * позицией.
 *
 * Спуск: двойная плитка занимала весь экран целиком, визитка 90×50 мм
 * показывалась в полтора метра. Колонок теперь четыре на широком листе,
 * три на среднем и две на телефоне: плитка вернулась к масштабу изделия.
 */
export function Rastr() {
  const S = SECTIONS[3];

  return (
    <Section id={S.id} ground="paper-hi" gain={1} className="py-[var(--section-pad)]">
      <Sheet>
        <Grid className="items-end gap-y-6">
          <div className="col-span-4 md:col-span-6">
            <PrintReveal as="div">
              <h2 className="t-h2">
                {RASTR.heading.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
            </PrintReveal>
          </div>
          <PrintReveal
            as="p"
            delay={0.034}
            className="t-micro fg-56 col-span-4 leading-relaxed md:col-span-4 md:col-start-9 md:text-right"
          >
            {RASTR.note}
          </PrintReveal>
        </Grid>
      </Sheet>

      {/* ── Спуск: край в край, плитки делят общую волосяную линию ────────── */}
      <div className="relative mt-[clamp(40px,5vw,104px)]">
        <TrimMarks className="z-10 text-[var(--rule)]" />
        <div className="grid grid-cols-2 border-l border-t border-[var(--rule)] md:grid-cols-3 lg:grid-cols-4">
          {WORKS.map((work, i) => (
            <WorkTile key={work.id} work={work} index={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}
