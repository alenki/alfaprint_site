'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { CityFilm } from '@/components/print/CityFilm';
import { EmbossWord } from '@/components/print/EmbossWord';
import { Tick } from '@/components/chrome/Mark';
import { useShift } from '@/components/ui/ShiftStatus';
import { HOURS_DISPLAY } from '@/content/hours';
import { COMPANY, CONTACTS, IMPRINT } from '@/content/site';

/**
 * §08 · ВЫХОДНЫЕ ДАННЫЕ
 *
 * Не строка копирайта, а колофон — техническая правда о самой странице.
 * Ровно та выходная полоса, которую несёт каждая напечатанная книга, и
 * единственная форма подвала, допустимая для типографии.
 *
 * Реквизиты выводятся только если клиент их прислал: ИНН и ОГРНИП —
 * юридически значимые данные, выдумывать их нельзя.
 */
export function VykhodnyeDannye() {
  const shift = useShift();
  const year = new Date().getFullYear();

  return (
    <footer
      id="vykhodnye-dannye"
      data-section-ground="ink"
      style={{ ['--gain' as string]: 0.5 }}
      className="ground-ink relative overflow-hidden pt-[var(--section-pad)]"
    >
      <div className="trim">
        {/* ── Цех ────────────────────────────────────────────────────────── */}
        <div className="cols gap-y-14">
          <div className="col-span-4 md:col-span-5">
            <PrintReveal as="div">
              <p className="font-display text-[clamp(1.75rem,3.2vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[var(--color-chalk)]">
                {IMPRINT.addressLines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </p>
            </PrintReveal>

            <ul className="mt-8 space-y-1.5">
              {HOURS_DISPLAY.map((h) => {
                const today = shift.day >= 0 && (h.match as readonly number[]).includes(shift.day);
                return (
                  <li
                    key={h.days}
                    className="t-mono flex items-center gap-2.5"
                    style={{ color: today ? 'var(--color-chalk)' : 'var(--color-chalk-70)' }}
                  >
                    <span
                      className="inline-block h-[5px] w-[5px] shrink-0 rounded-full"
                      style={{ background: today ? 'var(--color-rubine)' : 'transparent' }}
                      aria-hidden
                    />
                    {h.days} {h.time}
                  </li>
                );
              })}
            </ul>

            <p className="t-micro mt-6 leading-relaxed text-[var(--color-chalk-56)]">
              {IMPRINT.terms}
            </p>

            <a
              href={CONTACTS.phoneHref}
              className="link-rule mt-8 inline-block text-[22px] font-medium text-[var(--color-chalk)]"
            >
              {CONTACTS.phone}
            </a>

            {/* Каналы словами. Никаких иконок соцсетей. */}
            <ul className="mt-6 space-y-2.5">
              {IMPRINT.channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-rule inline-flex items-center gap-2.5 text-[var(--color-chalk)]"
                  >
                    <Tick className="h-2.5 w-3 shrink-0 text-[var(--color-rubine)]" strokeWidth={3} />
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <CityFilm />
          </div>
        </div>

        {/* ── Колофон ────────────────────────────────────────────────────── */}
        <div className="mt-[88px] h-px w-full bg-[var(--color-chalk-30)]" />

        <p className="mt-10 text-[13px] font-medium text-[var(--color-chalk-70)]">
          {COMPANY.legalName} · {COMPANY.name}
          {COMPANY.legal ? ` · ${COMPANY.legal}` : ''}
        </p>

        <dl className="mt-8 grid grid-cols-1 gap-x-[var(--gutter)] gap-y-2 md:grid-cols-2">
          {IMPRINT.colophon.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 md:justify-start">
              <dt className="t-micro w-[46%] shrink-0 text-[var(--color-chalk-56)] md:w-[13rem]">
                {k}
              </dt>
              <dd className="t-micro text-right text-[var(--color-chalk-56)] md:text-left">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Слепое тиснение во весь вылет ──────────────────────────────── */}
      <div className="mt-16 md:mt-24">
        <EmbossWord />
      </div>

      <div className="trim flex items-center justify-between gap-6 pb-[calc(var(--strip-h)+var(--striplabel-h)+16px)] pt-8">
        <p className="t-micro text-[var(--color-chalk-56)]">
          © {COMPANY.since}—{year} · {COMPANY.legalName} · {COMPANY.city}
        </p>
        <a href="#pervyi-progon" className="t-micro link-rule text-[var(--color-chalk-56)]">
          Наверх ↑
        </a>
      </div>
    </footer>
  );
}
