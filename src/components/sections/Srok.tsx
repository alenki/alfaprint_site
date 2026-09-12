'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { DayTimeline } from '@/components/ui/DayTimeline';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { DAY, SECTIONS } from '@/content/site';

/**
 * §05 · ЗА ОДИН ДЕНЬ
 *
 * Срочность это расписание, а не наценка. Полосу держат заголовок, лид и
 * само сменное задание: живая строка смены и строка условий сняты, они
 * повторяли часы из §08 и обещание из лида.
 */
export function ZaOdinDen() {
  const S = SECTIONS[4];

  return (
    <Section
      id={S.id}
      ground="ink"
      gain={1.25}
      className="ink-warmth overflow-hidden py-[var(--section-pad)]"
    >
      <Sheet>
        <Grid>
          <div className="col-span-4 md:col-span-7">
            <PrintReveal as="div">
              <h2 className="t-h2 fg">
                {DAY.heading.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
            </PrintReveal>
            <PrintReveal
              as="p"
              delay={0.034}
              className="t-lead fg-70 measure mt-[clamp(24px,2.4vw,44px)]"
            >
              {DAY.lead}
            </PrintReveal>
          </div>
        </Grid>
      </Sheet>

      <DayTimeline />
    </Section>
  );
}
