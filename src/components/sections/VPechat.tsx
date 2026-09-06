'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { H1Justified } from '@/components/type/H1Justified';
import { Naryad, Checklist } from '@/components/ui/Naryad';
import { Tick } from '@/components/chrome/Mark';
import { TrimMarks } from '@/components/chrome/TrimMarks';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { ORDER, CONTACTS, COMPANY, SECTIONS } from '@/content/site';
import { useNaryad } from '@/state/NaryadContext';
import { waHref } from '@/lib/whatsapp';

/**
 * §07 · В ПЕЧАТЬ
 *
 * Единственная заливка на весь сайт. Красное поле и есть штамп
 * «утверждено».
 *
 * ИНВЕРСИЯ ЗАКОНА: здесь рубин не краска поверх листа, а сам грунт, поэтому
 * уходит ЧЁРНАЯ форма. Заливка стоит намертво, а типографика съезжает по ней.
 *
 * Контрасты: крупный дисплей чёрным (3,48:1, законно для ≥40 px), весь
 * мелкий текст и метки бумагой (4,79:1, AA). Исключений нет.
 *
 * Раскладка: заголовок во весь формат, под ним 1–5 и 7–12, внизу чек-лист
 * во всю ширину. Прежняя редакция держала чек-лист узкой колонкой, и правая
 * половина полосы оставалась пустой краской.
 */
export function VPechat() {
  const naryad = useNaryad();
  const S = SECTIONS[6];

  return (
    <Section
      id={S.id}
      ground="rubine"
      gain={1.4}
      invert
      className="min-h-[92svh] py-[var(--section-pad)]"
    >
      <TrimMarks className="z-10 text-[var(--color-ink)]" />

      <Sheet>
        <PrintReveal as="div">
          <H1Justified
            as="h2"
            linesDesktop={ORDER.heading}
            linesMobile={ORDER.headingMobile}
            className="plate-k fg"
          />
        </PrintReveal>

        <Grid className="mt-[clamp(40px,4.6vw,96px)] gap-y-10">
          {/* На телефоне все три блока становятся строками сетки и получают
              собственный порядок: сначала действие, потом уточнения. */}
          <div className="contents md:col-span-5 md:flex md:flex-col md:gap-9">
            <PrintReveal
              as="p"
              className="t-lead fg-70 measure order-1 col-span-4 md:order-none"
            >
              {ORDER.lead}
            </PrintReveal>

            <div className="order-2 col-span-4 md:order-none">
              <MainAction href={waHref(naryad)} />
            </div>

            <ul className="order-4 col-span-4 grid grid-cols-1 gap-2 md:order-none md:grid-cols-3">
              {[
                { label: `Telegram ${CONTACTS.telegramHandle}`, href: CONTACTS.telegram },
                { label: 'Позвонить', href: CONTACTS.phoneHref },
                { label: `Instagram · ${COMPANY.followers}`, href: CONTACTS.instagram },
              ].map((a) => (
                <li key={a.label}>
                  <a
                    href={a.href}
                    target={a.href.startsWith('tel:') ? undefined : '_blank'}
                    rel="noreferrer"
                    className="t-micro fg-70 flex h-14 items-center justify-center border border-[var(--color-ink)] text-center transition-colors duration-200 hover:bg-[var(--color-ink)] hover:text-[var(--color-chalk)]"
                  >
                    {a.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-3 col-span-4 md:order-none md:col-span-6 md:col-start-7">
            <Naryad />
          </div>
        </Grid>
      </Sheet>

      <Sheet className="mt-[clamp(48px,5vw,112px)]">
        <Checklist />
      </Sheet>
    </Section>
  );
}

/**
 * Переход происходит синхронно по клику: это настоящий <a>, который работает
 * при мёртвом JS. Никаких анимаций перед навигацией: user-activation живёт
 * миллисекунды, и Safari заблокирует отложенный переход.
 */
function MainAction({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="main-action group relative flex h-16 w-full items-center justify-center gap-3 bg-[var(--color-ink)] px-6 md:h-24"
    >
      <span className="main-action__inner flex items-center gap-3">
        <span className="t-label text-[var(--color-chalk)]">
          {ORDER.cta} · {CONTACTS.phone}
        </span>
        <Tick className="h-4 w-6 shrink-0 text-[var(--color-rubine)]" strokeWidth={3} />
      </span>
    </a>
  );
}
