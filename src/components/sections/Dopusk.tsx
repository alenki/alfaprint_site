'use client';

import { Fragment } from 'react';
import { PrintReveal } from '@/components/type/PrintReveal';
import { RegisterPatch } from '@/components/print/RegisterPatch';
import { Registry } from '@/components/ui/Registry';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { useMediaQuery } from '@/lib/hooks';
import { DOPUSK, SECTIONS } from '@/content/site';

/**
 * §02 · ДОПУСК
 *
 * Полоса построена на трёх ходах и ни на одном лишнем.
 *
 *   1. ЗАЯВЛЕНИЕ во весь формат. Не заголовок в колонке на пять долей плюс
 *      три абзаца рядом, а один блок дисплейного набора от реза до реза.
 *      В конце первой фразы стоит приводочный шильд: чёрный крест и
 *      рубиновая точка. Фраза «скорость видно по приводке» не объясняется
 *      словами: рядом с ней стоит прибор, который её показывает.
 *   2. КОРПУС у правого края и ЗАМЕТКА у левого. Между ними лежит пустая
 *      бумага в семь долей: на этом сайте она не пуста, её держат
 *      направляющие спуска.
 *   3. РЕЕСТР одной строкой во весь формат под единственной линейкой.
 *
 * Что убрано и почему: столбец из четырёх строк с волосяной линией под
 * каждой (читался таблицей характеристик), сносочная линейка в 38 %
 * колонки (линия, которая ничего не отделяла), два абзаца корпуса из трёх
 * (то же самое, сказанное трижды). Линейки на полосе теперь ровно две:
 * шмуцтитул сверху и реестр снизу.
 */
export function Dopusk() {
  const S = SECTIONS[1];
  const isMobile = useMediaQuery('(width < 768px)');

  const { desktop, mobile, markAfter } = DOPUSK.statement;
  const lines = isMobile ? mobile : desktop;
  const mark = isMobile ? markAfter.mobile : markAfter.desktop;

  return (
    <Section id={S.id} ground="paper" gain={0.8} className="py-[var(--section-pad)]">
      <Sheet>
        {/* ── ЗАЯВЛЕНИЕ ────────────────────────────────────────────────────
            Ракель проходит по строке за строкой: сначала тезис, следом
            условие. Стагер 55 мс это ритм листа, выходящего из машины,
            а не каскад «эффектов». */}
        <h2 className="t-statement">
          {lines.map((line, i) => (
            <PrintReveal as="span" key={line} className="block" delay={i * 0.055}>
              {line}
              {i === mark && (
                <Fragment>
                  {/* Неразрывный пробел: шильд это часть фразы, он не имеет
                      права перескочить на следующую строку. */}
                  {' '}
                  <RegisterPatch />
                </Fragment>
              )}
              {/* Строки это блоки, но доступное имя заголовка склеивается из
                  текстовых узлов: без этого пробела скринридер прочтёт
                  «приводке.Печатаем». */}
              {' '}
            </PrintReveal>
          ))}
        </h2>

        {/* ── КОРПУС И ЗАМЕТКА ────────────────────────────────────────────
            Выключка по первой базовой линии: два разных кегля обязаны
            начинаться с одной строки, иначе меньший висит.

            Корпус стоит в разметке ПЕРВЫМ: это порядок чтения, и на телефоне
            он же становится порядком в потоке: заметка на поле идёт после
            корпуса, а не вместо него. На двенадцати долях обе колонки
            расставлены явным col-start, поэтому порядок в разметке на
            раскладку не влияет вовсе. */}
        <Grid className="mt-[clamp(56px,6.4vw,140px)] items-baseline gap-y-[clamp(30px,3vw,44px)]">
          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <PrintReveal as="p" delay={0.28} className="t-lead fg-70 measure">
              {DOPUSK.body}
            </PrintReveal>

            <PrintReveal as="div" delay={0.34} className="mt-[clamp(26px,2.4vw,44px)]">
              <a
                href={DOPUSK.link.href}
                className="link-rule inline-block py-2 text-[clamp(15px,1.05vw,18px)] font-medium"
              >
                {DOPUSK.link.label} →
              </a>
            </PrintReveal>
          </div>

          <PrintReveal
            as="p"
            delay={0.24}
            className="t-small fg-56 measure-tight col-span-4 leading-relaxed md:col-span-4 md:col-start-1 md:row-start-1"
          >
            {DOPUSK.note}
          </PrintReveal>
        </Grid>

        {/* ── РЕЕСТР ──────────────────────────────────────────────────────── */}
        <div className="mt-[clamp(60px,7vw,150px)]">
          <Registry />
        </div>
      </Sheet>
    </Section>
  );
}
