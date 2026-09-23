'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { ChannelBand } from '@/components/print/ChannelBand';
import { Blank } from '@/components/ui/Blank';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { K_BLANK, K_SECTIONS } from '@/content/kontakty';

/**
 * §K2 · БЛАНК
 *
 * ПОЛОСА ОТКРЫВАЕТСЯ ПОЛОСОЙ КАНАЛОВ, и та стоит верхней кромкой раздела,
 * встык с бумагой §K1. Ни отбивки, ни волосяной между ними нет: лист
 * поворачивается с бумаги на краску через красную треть, а два чёрных поля
 * полосы уходят в грунт раздела и становятся им. Это тот же приём, каким
 * кончается главная, поставленный на другую работу: там две плашки закрывают
 * лист, здесь три открывают раздел.
 *
 * ДАЛЬШЕ РАЗВОРОТ ИЗ ДВУХ ПОЛОВИН: слева форма, справа оттиск. Разбор самого
 * механизма стоит при `Blank`, а здесь сказано то, чего там нет: почему
 * грунт чёрный. Лист пробы обязан быть БУМАГОЙ, и бумагой белее той, на
 * которой печатается сайт (--color-proof, чистый лист цветопробы). По
 * бумажному грунту он стал бы ещё одним прямоугольником чуть светлее фона;
 * по краске он читается ровно тем, чем является: листом, вынутым из машины.
 */
export function BlankSection() {
  const S = K_SECTIONS[1];

  return (
    <Section id={S.id} ground={S.ground} gain={S.gain} className="pb-[var(--section-pad)]">
      {/* Полоса каналов: вылет от реза до реза, верхняя кромка раздела. */}
      <ChannelBand />

      <Sheet className="pt-[clamp(64px,7vw,164px)]">
        <Grid>
          {/* ДЕВЯТЬ ДОЛЕЙ, А НЕ ВОСЕМЬ. Заявление разбито на строки рукой, и
              вторая строка здесь самая длинная на сайте: на восьми долях она
              переламывалась ещё раз на любом формате до 2400 точек, и набор
              печатался тремя строками вместо двух. Мера подогнана под набор,
              а не набор под меру. */}
          <div className="col-span-4 md:col-span-9">
            <PrintReveal as="div">
              <h2 className="t-h2 fg">
                {K_BLANK.heading.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
            </PrintReveal>
          </div>
        </Grid>

        <div className="mt-[clamp(44px,4.6vw,104px)]">
          <Blank />
        </div>
      </Sheet>
    </Section>
  );
}
