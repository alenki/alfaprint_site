'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { CityPlan } from '@/components/print/CityPlan';
import { EmbossWord } from '@/components/print/EmbossWord';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { PAGES } from '@/content/site';
import { K_CLOSING, K_PLAN, K_SECTIONS } from '@/content/kontakty';

/**
 * §K4 · ПЛАН
 *
 * ЗАЯВЛЕНИЕ ПОЛОСЫ ПРО ПОЛУЧЕНИЕ, А НЕ ПРО АДРЕС. Где мы, лист уже сказал
 * дважды и сказал делом: строкой адреса и пятью кадрами по дороге. Третий
 * раз сказать то же самое значило бы напечатать страницу в полтора раза
 * длиннее ни за чем. Здесь отвечают на следующий вопрос, который задают в
 * трубку сразу за «где вы»: ехать самому или привезёте.
 *
 * ПЛЁНКА СТОИТ СПРАВКОЙ ПРИ ЭТОМ ЗАЯВЛЕНИИ. Она не повторяет кадры: кадрами
 * ИДУТ, а на план СМОТРЯТ, прикидывая расстояние и сторону города. Разбор
 * самой плёнки и её источников стоит при `CityPlan` и в `content/plan.ts`.
 *
 * ПЛЁНКА НЕ ИДЁТ В ВЫЛЕТ, и это не забывчивость. Прогон кадров полосой выше
 * уже уходит от реза до реза, а два вылетных блока подряд формат «край в
 * край» не терпит: лист теряет поля и перестаёт быть листом. Плёнка стоит на
 * всех двенадцати долях полосы набора, то есть ровно в тех же полях, что и
 * весь текст сайта.
 *
 * ЛИСТ КОНЧАЕТСЯ ТЕМ ЖЕ, ЧЕМ КОНЧАЕТСЯ ГЛАВНАЯ: слепым тиснением имени во
 * весь вылет. Справочника в подвале нет ни строки, и это не экономия: весь
 * справочник и есть этот лист. Над тиснением стоит один ряд разделов, чтобы
 * лист не оказался тупиком для пришедшего из поиска.
 */
export function Plan() {
  const S = K_SECTIONS[3];

  return (
    <Section
      id={S.id}
      ground={S.ground}
      gain={S.gain}
      className="ink-warmth overflow-hidden pt-[var(--section-pad)]"
    >
      <Sheet>
        <Grid className="gap-y-[clamp(26px,2.8vw,52px)]">
          <div className="col-span-4 md:col-span-7">
            <PrintReveal as="div">
              <h2 className="t-h2 fg">
                {K_PLAN.heading.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
            </PrintReveal>
          </div>

          <div className="col-span-4 md:col-span-4 md:col-start-9">
            <PrintReveal as="p" delay={0.034} className="t-lead fg-70 measure">
              {K_PLAN.lead}
            </PrintReveal>

            <PrintReveal as="div" delay={0.08} className="mt-[clamp(18px,1.8vw,32px)]">
              <a
                href={K_PLAN.mapsHref}
                target="_blank"
                rel="noreferrer"
                className="t-micro link-rule fg-56"
              >
                {K_PLAN.mapsLink}
              </a>
            </PrintReveal>
          </div>
        </Grid>

        {/* ── Плёнка подхода ─────────────────────────────────────────────
            Без `PrintReveal`: плёнка обязана печататься без единой строки
            JS, см. прецедент при `CityFilm`. Ракель проходит по заголовку,
            а карта либо есть, либо её нет. */}
        <div className="mt-[clamp(40px,4.4vw,96px)]">
          <CityPlan />
        </div>
      </Sheet>

      {/* ── Закрытие листа ──────────────────────────────────────────────── */}
      <Sheet className="mt-[clamp(56px,6vw,132px)]">
        <div className="rule-t flex flex-wrap items-baseline gap-x-[clamp(18px,2vw,44px)] gap-y-3 pt-[clamp(14px,1.4vw,26px)]">
          <span className="t-micro fg-56 mr-auto">{K_CLOSING.navLabel}</span>
          {/* `PAGES`, А НЕ `NAV`: ряд называет страницы и перечисляет только
              их, адресами от корня. Якоря главной стояли здесь мёртвыми: полос
              `#pervyi-progon` и `#dve-formy` в этом документе нет. */}
          {PAGES.map((n) => (
            <a key={n.href} href={n.href} className="t-micro link-rule fg-56">
              {n.label}
            </a>
          ))}
        </div>
      </Sheet>

      <div className="mt-[clamp(72px,7.4vw,164px)] pb-[calc(var(--mobilecta-h)+clamp(20px,3vw,44px))] md:pb-[calc(var(--strip-h)+clamp(20px,3vw,44px))]">
        <EmbossWord />
      </div>
    </Section>
  );
}
