'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { WorkTile } from '@/components/print/WorkTile';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { WORKS } from '@/content/works';
import { RASTR, SECTIONS } from '@/content/site';

/**
 * §04 · РАСТР
 *
 * Общий план и макро на одной непрерывной поверхности. Оговорки про съёмку
 * над спуском больше нет: работы либо показаны, либо нет, и объяснять это
 * покупателю мелким кеглем незачем.
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
        <Grid>
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
        </Grid>
      </Sheet>

      {/* ── Спуск: край в край, плитки делят общую волосяную линию ────────── */}
      <div className="relative mt-[clamp(40px,5vw,104px)]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {WORKS.map((work, i) => (
            <WorkTile key={work.id} work={work} index={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}
