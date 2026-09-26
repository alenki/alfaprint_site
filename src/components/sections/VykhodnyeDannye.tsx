'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { CityFilm } from '@/components/print/CityFilm';
import { ContactPanels } from '@/components/print/ContactPanels';
import { EmbossWord } from '@/components/print/EmbossWord';
import { useShift } from '@/components/ui/ShiftStatus';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { HOURS_DISPLAY } from '@/content/hours';
import { CLOSING, IMPRINT, PAGES, SECTIONS } from '@/content/site';

/**
 * §08 · ВЫХОДНЫЕ ДАННЫЕ
 *
 * ПОЛОСА КОНЧАЛАСЬ СПРАВОЧНИКОМ. Адрес, часы, четыре канала и план города
 * стояли в две колонки: на вопрос «где вы» лист отвечал, а заказа не просил
 * ни разу, и кончался не концом, а обрывом. Теперь порядок обратный, и он
 * тот же, что у самого разговора с заказчиком: сначала говорят дело, потом
 * дают руку, и только потом диктуют адрес.
 *
 * ЧЕТЫРЕ ПОЛОСЫ СВЕРХУ ВНИЗ:
 *   1 · заявление и один абзац под ним;
 *   2 · две плашки заказа во весь формат, бумага и синяя форма;
 *   3 · колонки справочника: офис, разделы, связь, и план города у реза;
 *   4 · слепое тиснение имени во весь вылет.
 *
 * ВОЛОСЯНЫХ ЗДЕСЬ НЕТ НИ ОДНОЙ. Полосы отбиты грунтом, краской и воздухом.
 * Колофон снят вместе со своей линией: строка выходных данных и «Наверх»
 * договаривали то, что уже сказано выше, а линия резала лист на карточки
 * ровно там, где он обязан просто кончиться.
 *
 * ЖИВОЙ СТРОКИ «СМЕНА ИДЁТ» ЗДЕСЬ ПО-ПРЕЖНЕМУ НЕТ. Часы работы выходят
 * наружу ровно одним способом, подсветкой сегодняшних строк, см. `useShift`.
 */
export function VykhodnyeDannye() {
  const shift = useShift();
  const S = SECTIONS[6];

  return (
    <Section
      as="footer"
      id={S.id}
      ground="ink"
      gain={0.5}
      className="overflow-hidden pt-[var(--section-pad)]"
    >
      {/* ── 1 · Заявление ─────────────────────────────────────────────────── */}
      <Sheet>
        <Grid>
          <div className="col-span-4 md:col-span-9">
            <PrintReveal as="div">
              <h2 className="t-h2 fg">
                {CLOSING.statement.map((l) => (
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
              {CLOSING.lead}
            </PrintReveal>
          </div>
        </Grid>
      </Sheet>

      {/* ── 2 · Плашки заказа во весь формат ──────────────────────────────── */}
      <div className="mt-[clamp(44px,5.4vw,116px)]">
        <ContactPanels />
      </div>

      {/* ── 3 · Справочник ────────────────────────────────────────────────── */}
      <Sheet className="pt-[clamp(56px,6.4vw,150px)]">
        <Grid className="gap-y-[clamp(40px,4vw,76px)]">
          {/* Офис */}
          <div className="col-span-4 md:col-span-3">
            <PrintReveal as="div">
              <span className="t-micro fg-56 kp-col-label">{CLOSING.columns.shop}</span>
              <p className="t-lead fg">
                {IMPRINT.addressLines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </p>

              {/* ОРИЕНТИРА ПОД АДРЕСОМ НЕТ: вход с улицы, и искать его по
                  соседнему заведению не нужно. Как войти, сказано ниже, под
                  часами, в строках получения. */}
              <ul className="mt-[clamp(18px,1.7vw,28px)] space-y-1.5">
                {HOURS_DISPLAY.map((h) => {
                  const today =
                    shift.day >= 0 && (h.match as readonly number[]).includes(shift.day);
                  return (
                    <li
                      key={h.days}
                      className="t-mono"
                      style={{ color: today ? 'var(--fg)' : 'var(--fg-70)' }}
                    >
                      {h.days} {h.time}
                    </li>
                  );
                })}
              </ul>

              {/* ВХОД И ОПЛАТА ИДУТ ПОД ГРАФИКОМ, ТЕМ ЖЕ ГОЛОСОМ И БЕЗ СВОЕГО
                  ЗАГОЛОВКА. Часы отвечают «когда», эти две строки «как», и
                  подписывать вторую пару значило бы разбить одну колонку на
                  две. Приглушены на разряд против текущего дня: график живой,
                  а вход и оплата не меняются от дня недели. */}
              <ul className="mt-[clamp(12px,1.1vw,20px)] space-y-1.5">
                {CLOSING.logistics.map((l) => (
                  <li key={l} className="t-mono fg-56">
                    {l}
                  </li>
                ))}
              </ul>
            </PrintReveal>
          </div>

          {/* Страницы */}
          <div className="col-span-2 md:col-span-2 md:col-start-5">
            <PrintReveal as="div" delay={0.05}>
              <span className="t-micro fg-56 kp-col-label">{CLOSING.columns.nav}</span>
              <ul className="kp-col-list">
                {PAGES.map((n) => (
                  <li key={n.href}>
                    <a href={n.href} className="link-rule fg-70">
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </PrintReveal>
          </div>

          {/* Связь. Каналы словами: иконок соцсетей на этом листе нет. */}
          <div className="col-span-2 md:col-span-2 md:col-start-7">
            <PrintReveal as="div" delay={0.1}>
              <span className="t-micro fg-56 kp-col-label">{CLOSING.columns.channels}</span>
              <ul className="kp-col-list">
                {IMPRINT.channels.map((c) => (
                  <li key={c.label}>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noreferrer"
                      className="link-rule fg-70"
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </PrintReveal>
          </div>

          {/* План города у правого реза.
              Плёнка ВЫСОКАЯ, но полосы она не задаёт: с md она вынута из
              потока и прижата к низу своей клетки, а растёт вверх, в отбивку
              справочника, где всё равно пусто. Раньше было наоборот, и лишние
              полтораста пунктов пустого грунта висели под колонками. */}
          <div className="col-span-4 md:col-span-4 md:col-start-9 md:relative">
            <div className="md:absolute md:inset-x-0 md:bottom-[calc(clamp(24px,3.6vw,76px)*-1)]">
              <CityFilm />
            </div>
          </div>
        </Grid>
      </Sheet>

      {/* ── 4 · Слепое тиснение во весь вылет ─────────────────────────────
          Отбивка снизу равна высоте липкой полосы: под ней тиснению нечего
          делать, а других полос за ним больше нет. */}
      <div className="mt-[clamp(92px,9.4vw,208px)] pb-[calc(var(--mobilecta-h)+clamp(20px,3vw,44px))] md:pb-[calc(var(--strip-h)+clamp(20px,3vw,44px))]">
        <EmbossWord />
      </div>
    </Section>
  );
}
