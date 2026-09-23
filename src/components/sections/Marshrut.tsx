'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { RouteRun } from '@/components/print/RouteRun';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { ROUTE_LINKS } from '@/content/route';
import { IMPRINT, MARSHRUT, SECTIONS } from '@/content/site';

/**
 * §07 · МАРШРУТ
 *
 * ПОЛОСА ОТВЕЧАЕТ НА ВОПРОС, КОТОРЫЙ АДРЕС НЕ ЗАКРЫВАЕТ. «Тарчокова, 29»
 * диктуют в трубку и вбивают в карту, и обе работы этот адрес делает. Но
 * вход у цеха со двора, а двора с улицы не видно, и человек, уже стоящий
 * на Тарчокова, остаётся с верным адресом и без двери. Ровно это прежний
 * сайт и закрывал пятью снимками, снятыми по дороге; снимки взяты оттуда
 * целиком, вместе с порядком (см. `content/route.ts`).
 *
 * МЕСТО ВЫБРАНО, А НЕ ДОСТАЛОСЬ. Полоса «В печать» была снята целиком, и
 * вместе с ней с листа ушло единственное красное поле. Место перед
 * выходными данными это то самое место, где спрашивают «а где вы»: §07
 * показывает дорогу, §08 диктует адрес, часы и связь. Разделять это
 * нечем, и повторять тоже: часов и каналов здесь нет ни строки.
 *
 * ТРИ ГОЛОСА И НИ ОДНОГО ЛИШНЕГО: заявление, один абзац, четыре адреса
 * словами. Волосяная на полосе ровно одна, и лежит она под прогоном.
 *
 * ГРУНТ БУМАЖНЫЙ ПОДРЯД С §06, и это не сбой ритма. Отбивку здесь держат
 * не краской: пятьсот пунктов фотографии посреди листа отбивают раздел
 * тяжелее, чем это сделал бы залитый чёрным грунт, а чёрный вдобавок
 * столкнулся бы с чёрным §08 через один разворот.
 */
export function Marshrut() {
  const S = SECTIONS[6];

  return (
    <Section id={S.id} ground="paper" gain={1} className="py-[var(--section-pad)]">
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
            {/* АДРЕС СТОИТ МАШИННЫМ ГОЛОСОМ, а не заголовком, как на прежнем
                сайте. Здесь он не заявление раздела, а его цель: строка,
                которую переписывают в карту. Полностью он всё равно
                напечатан ниже, в §08, и второй правды о нём тут не заводится:
                строка собрана из того же источника. */}
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

            {/* Четыре адреса словами. Кнопок здесь нет: все четыре уводят с
                листа, а кнопка обещает действие НА нём. */}
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
