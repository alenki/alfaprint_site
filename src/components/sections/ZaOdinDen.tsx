'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { DayTimeline } from '@/components/ui/DayTimeline';
import { ShiftPromise, ShiftCountdown } from '@/components/ui/ShiftStatus';
import { DAY } from '@/content/site';

/**
 * §05 · ЗА ОДИН ДЕНЬ
 *
 * Срочность — расписание, а не наценка. Часы здесь настоящие и считают
 * по московскому времени; «типовой день» снимает вопрос, откуда цифры.
 */
export function ZaOdinDen() {
  return (
    <section
      id="za-odin-den"
      data-section-ground="ink"
      style={{ ['--gain' as string]: 1.25 }}
      className="ground-ink ink-warmth relative overflow-hidden py-[var(--section-pad)]"
    >
      <div className="trim relative">
        <div className="cols gap-y-10">
          <div className="col-span-4 md:col-span-7">
            <PrintReveal as="div">
              <h2 className="t-h2 text-[var(--color-chalk)]">
                {DAY.heading.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
            </PrintReveal>
            <PrintReveal as="p" delay={0.034} className="t-lead mt-8 max-w-[54ch] text-[var(--color-chalk-70)]">
              {DAY.lead}
            </PrintReveal>
          </div>

          <div className="col-span-4 self-end md:col-span-3 md:col-start-10 md:text-right">
            <ShiftPromise className="t-micro text-[var(--color-chalk)]" />
            <ShiftCountdown className="t-micro mt-2 text-[var(--color-chalk-56)]" />
          </div>
        </div>

        <DayTimeline />
      </div>
    </section>
  );
}
