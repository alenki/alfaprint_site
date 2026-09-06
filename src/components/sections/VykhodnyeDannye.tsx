'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { CityFilm } from '@/components/print/CityFilm';
import { EmbossWord } from '@/components/print/EmbossWord';
import { Tick } from '@/components/chrome/Mark';
import { useShift } from '@/components/ui/ShiftStatus';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { HOURS_DISPLAY } from '@/content/hours';
import { COMPANY, CONTACTS, IMPRINT, SECTIONS } from '@/content/site';

/**
 * §08 · ВЫХОДНЫЕ ДАННЫЕ
 *
 * Не строка копирайта, а колофон, техническая правда о самой странице.
 * Ровно та выходная полоса, которую несёт каждая напечатанная книга, и
 * единственная форма подвала, допустимая для типографии.
 *
 * Колофон набран во весь формат: ключ на левом резе, значение на правом,
 * линия между ними идёт от края до края. Прежняя редакция жала его в две
 * узкие колонки посреди листа, а это ровно та таблица, которой формат
 * во весь лист идёт на пользу больше всего.
 *
 * Реквизиты выводятся только если клиент их прислал: ИНН и ОГРНИП это
 * юридически значимые данные, выдумывать их нельзя.
 */
export function VykhodnyeDannye() {
  const shift = useShift();
  const year = new Date().getFullYear();
  const S = SECTIONS[7];

  const half = Math.ceil(IMPRINT.colophon.length / 2);
  const columns = [IMPRINT.colophon.slice(0, half), IMPRINT.colophon.slice(half)];

  return (
    <Section
      as="footer"
      id={S.id}
      ground="ink"
      gain={0.5}
      className="overflow-hidden pt-[var(--section-pad)]"
    >
      <Sheet>
        {/* ── Цех ──────────────────────────────────────────────────────── */}
        <Grid className="gap-y-14">
          <div className="col-span-4 md:col-span-4">
            <PrintReveal as="div">
              <p className="font-display fg text-[clamp(1.875rem,3.4vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.024em]">
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
                    style={{ color: today ? 'var(--fg)' : 'var(--fg-70)' }}
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

            <p className="t-micro fg-56 mt-6 leading-relaxed">{IMPRINT.terms}</p>

            <a
              href={CONTACTS.phoneHref}
              className="link-rule fg mt-8 inline-block text-[22px] font-medium"
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
                    className="link-rule fg inline-flex items-center gap-2.5"
                  >
                    <Tick
                      className="h-2.5 w-3 shrink-0 text-[var(--color-rubine)]"
                      strokeWidth={3}
                    />
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <CityFilm />
          </div>
        </Grid>

        {/* ── Колофон ──────────────────────────────────────────────────── */}
        <p className="rule-t fg-70 mt-[clamp(56px,6vw,128px)] pt-8 text-[13px] font-medium">
          {COMPANY.legalName} · {COMPANY.name}
          {COMPANY.legal ? ` · ${COMPANY.legal}` : ''}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-x-[clamp(24px,4vw,96px)] lg:grid-cols-2">
          {columns.map((col, ci) => (
            <dl key={ci}>
              {col.map(([k, v]) => (
                <div
                  key={k}
                  className="rule-soft-b flex items-baseline justify-between gap-6 py-2.5"
                >
                  <dt className="t-micro fg-56 shrink-0">{k}</dt>
                  <dd className="t-micro fg-70 text-right">{v}</dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
      </Sheet>

      {/* ── Слепое тиснение во весь вылет ────────────────────────────────── */}
      <div className="mt-[clamp(48px,6vw,140px)]">
        <EmbossWord />
      </div>

      <Sheet className="flex items-center justify-between gap-6 pb-[calc(var(--strip-h)+16px)] pt-8">
        <p className="t-micro fg-56">
          © {COMPANY.since}…{year} · {COMPANY.legalName} · {COMPANY.city}
        </p>
        <a href="#pervyi-progon" className="t-micro link-rule fg-56">
          Наверх ↑
        </a>
      </Sheet>
    </Section>
  );
}
