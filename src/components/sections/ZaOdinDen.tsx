'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { DayTimeline } from '@/components/ui/DayTimeline';
import { ShiftPromise, ShiftCountdown } from '@/components/ui/ShiftStatus';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { DAY, SECTIONS } from '@/content/site';

/**
 * §05 · ЗА ОДИН ДЕНЬ
 *
 * Срочность это расписание, а не наценка. Часы здесь настоящие и считают
 * по московскому времени; «типовой день» снимает вопрос, откуда цифры.
 *
 * Секция закрывается строкой условий на линии во весь формат: прежняя
 * редакция обрывала её в пустоту, и под сменным заданием оставалось метров
 * триста чёрного ни о чём.
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
        <Grid className="items-end gap-y-10">
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

          <div className="col-span-4 md:col-span-3 md:col-start-10 md:text-right">
            <ShiftPromise className="t-micro fg" />
            <ShiftCountdown className="t-micro fg-56 mt-2" />
          </div>
        </Grid>
      </Sheet>

      <DayTimeline />

      <Sheet>
        <p className="t-micro fg-56 rule-t pt-6">{DAY.terms}</p>
      </Sheet>
    </Section>
  );
}
