'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { OrderPath } from '@/components/ui/OrderPath';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { SROK, SECTIONS } from '@/content/site';

/**
 * §05 · СРОК
 *
 * Полоса показывает порядок заказа и на каждом шаге говорит, что на нём
 * делают. Прежде она называлась «За один день» и печатала типовой день
 * срочного заказа по часам; чем это обещание расходится с калькулятором
 * прежнего сайта, разобрано у `SROK` в `content/site.ts`.
 *
 * ЧИСЛА СРОКА ПОЛОСА БОЛЬШЕ НЕ НАЗЫВАЕТ. Весь её текст взят у мастерской
 * слово в слово, а числа мастерская не называет; см. тот же разбор.
 *
 * Полосу держат заголовок, лид и сам путь заказа: живая строка смены и
 * строка условий сняты, они повторяли часы из §08 и обещание из лида.
 */
export function Srok() {
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
                {SROK.heading.map((l) => (
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
              {SROK.lead}
            </PrintReveal>
          </div>
        </Grid>
      </Sheet>

      <OrderPath />
    </Section>
  );
}
