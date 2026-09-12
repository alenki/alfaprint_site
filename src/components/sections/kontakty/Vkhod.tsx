'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { RouteRun } from '@/components/print/RouteRun';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { ROUTE_LINKS } from '@/content/route';
import { IMPRINT, MARSHRUT } from '@/content/site';
import { K_SECTIONS } from '@/content/kontakty';

/**
 * §K3 · ВХОД
 *
 * ПОЛОСА ОТВЕЧАЕТ НА ВОПРОС, КОТОРЫЙ АДРЕС НЕ ЗАКРЫВАЕТ: вход у цеха со
 * двора, двора с Тарчокова не видно, и человек с верным адресом остаётся у
 * забора. Заявление, лид и пять кадров по дороге взяты с главной слово в
 * слово (`MARSHRUT`, `content/route.ts`): это один и тот же раздел, и второй
 * правды о дороге к двери на сайте быть не должно ни одной.
 *
 * СОБСТВЕННОГО СОСТОЯНИЯ У ПОЛОСЫ НЕТ: прогон `RouteRun` взят как есть, без
 * единой правки, и ведёт себя здесь ровно так же, как на главной. Раздел
 * отличается от главного номером и грунтом соседей, а не содержанием.
 *
 * ПЛАНА ЗДЕСЬ НЕТ, И ЭТО РЕШЕНИЕ. Кадры и плёнка отвечают разным читателям:
 * кадрами идут ногами, план смотрят, решая, ехать самому или попросить
 * привезти. Поставленные встык, они вдобавок дали бы два вылетных блока
 * подряд, чего формат «край в край» не терпит. План стоит следующей полосой,
 * внутри полосы набора.
 */
export function Vkhod() {
  const S = K_SECTIONS[2];

  return (
    <Section id={S.id} ground={S.ground} gain={S.gain} className="py-[var(--section-pad)]">
      <Sheet>
        <Grid className="gap-y-[clamp(26px,2.8vw,52px)]">
          <div className="col-span-4 md:col-span-6">
            <PrintReveal as="div">
              <h2 className="t-h2">
                {MARSHRUT.heading.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
            </PrintReveal>
          </div>

          <div className="col-span-4 md:col-span-5 md:col-start-8">
            {/* Адрес стоит машинным голосом: здесь он не заявление раздела,
                а строка, которую переписывают в карту. */}
            <PrintReveal as="p" className="t-micro fg-56">
              {IMPRINT.addressLines.join(' ')}
            </PrintReveal>

            <PrintReveal
              as="p"
              delay={0.034}
              className="t-lead fg-70 measure mt-[clamp(14px,1.3vw,24px)]"
            >
              {MARSHRUT.lead}
            </PrintReveal>

            {/* Четыре адреса словами. Кнопок нет: все четыре уводят с листа,
                а кнопка обещает действие НА нём. */}
            <PrintReveal as="div" delay={0.08} className="mt-[clamp(20px,2vw,38px)]">
              <ul className="flex flex-wrap gap-x-[clamp(16px,1.7vw,34px)] gap-y-3">
                {ROUTE_LINKS.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(l.external ? { target: '_blank', rel: 'noreferrer' } : null)}
                      className="t-micro link-rule fg-56"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </PrintReveal>
          </div>
        </Grid>
      </Sheet>

      {/* ── Прогон до двери ───────────────────────────────────────────────
          Стоит вне полосы набора: путь идёт от реза до реза, как и всё, что
          на этом листе шире полей. */}
      <div className="mt-[clamp(44px,5vw,110px)]">
        <RouteRun />
      </div>
    </Section>
  );
}
