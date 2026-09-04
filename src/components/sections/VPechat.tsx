'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { H1Justified } from '@/components/type/H1Justified';
import { Naryad, Checklist } from '@/components/ui/Naryad';
import { Tick } from '@/components/chrome/Mark';
import { TrimMarks } from '@/components/chrome/TrimMarks';
import { ORDER, CONTACTS, COMPANY } from '@/content/site';
import { useNaryad } from '@/state/NaryadContext';
import { waHref } from '@/lib/whatsapp';

/**
 * §07 · В ПЕЧАТЬ
 *
 * Единственная заливка на весь сайт. Красное поле — это и есть штамп
 * «утверждено».
 *
 * ИНВЕРСИЯ ЗАКОНА: здесь рубин не краска поверх листа, а сам грунт, поэтому
 * уходит ЧЁРНАЯ форма. Заливка стоит намертво, а типографика съезжает по ней.
 *
 * Контрасты: крупный дисплей — чёрным (3.48:1, законно для ≥40 px), весь
 * мелкий текст и метки — бумагой (4.79:1, AA). Исключений нет.
 */
export function VPechat() {
  const naryad = useNaryad();

  return (
    <section
      id="v-pechat"
      data-section-ground="rubine"
      data-invert="true"
      style={{ ['--gain' as string]: 1.4 }}
      className="ground-rubine relative min-h-[92svh] py-[var(--section-pad)]"
    >
      <TrimMarks className="z-10 text-[var(--color-ink)]" />

      <div className="trim cols gap-y-14">
        <div className="col-span-4 md:col-span-7">
          <PrintReveal as="div">
            <H1Justified
              as="h2"
              linesDesktop={ORDER.heading}
              linesMobile={ORDER.headingMobile}
              className="plate-k text-[var(--color-ink)]"
            />
          </PrintReveal>

          <PrintReveal as="p" delay={0.034} className="t-lead mt-8 max-w-[54ch] text-[var(--color-paper)]">
            {ORDER.lead}
          </PrintReveal>

          {/* На телефоне сначала действие, потом уточнения. */}
          <div className="mt-10 md:hidden">
            <MainAction href={waHref(naryad)} />
          </div>

          <div className="mt-10">
            <Naryad />
          </div>

          <div className="mt-8 hidden md:block">
            <MainAction href={waHref(naryad)} />
          </div>

          {/* Три второстепенных действия */}
          <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
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
                  className="t-micro flex h-14 items-center justify-center border border-[var(--color-paper)] text-center text-[var(--color-paper)] transition-colors duration-200 hover:bg-[var(--color-ink)] hover:text-[var(--color-chalk)]"
                >
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-4 md:col-span-3 md:col-start-10">
          <Checklist />
        </div>
      </div>
    </section>
  );
}

/**
 * Переход происходит синхронно по клику: это настоящий <a>, который работает
 * при мёртвом JS. Никаких анимаций перед навигацией — user-activation живёт
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
        <Tick className="h-4 w-6 text-[var(--color-rubine)]" strokeWidth={3} />
      </span>
    </a>
  );
}
