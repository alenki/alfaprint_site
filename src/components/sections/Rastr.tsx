'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { WorkTile } from '@/components/print/WorkTile';
import { Rosette } from '@/components/print/Rosette';
import { TrimMarks } from '@/components/chrome/TrimMarks';
import { WORKS } from '@/content/works';
import { RASTR } from '@/content/site';

/**
 * §04 · РАСТР
 *
 * Общий план и макро на одной непрерывной поверхности. Съёмки нет, и это
 * сказано вслух: заявленный плейсхолдер перестаёт быть дырой и становится
 * позицией.
 *
 * Единственное место, где два вылетных блока идут подряд, — сознательный
 * переход от спуска к лупе.
 */
export function Rastr() {
  return (
    <section
      id="rastr"
      data-section-ground="paper-hi"
      style={{ ['--gain' as string]: 1 }}
      className="ground-paper-hi pt-[var(--section-pad)]"
    >
      <div className="trim cols gap-y-6">
        <div className="col-span-4 md:col-span-8">
          <PrintReveal as="div">
            <h2 className="t-h2">
              {RASTR.heading.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h2>
          </PrintReveal>
        </div>
        <PrintReveal
          as="p"
          delay={0.034}
          className="t-micro col-span-4 self-end leading-relaxed text-[var(--color-ink-62)] md:col-span-3 md:col-start-10"
        >
          {RASTR.note}
        </PrintReveal>
      </div>

      {/* ── Спуск: плитки делят общую волосяную линию, зазора между ними нет ── */}
      <div className="relative mt-12 md:mt-16">
        <TrimMarks className="z-10 text-[var(--color-ink-32)]" />
        <div className="grid grid-cols-2 border-l border-t border-[var(--color-ink-32)] md:grid-cols-3">
          {WORKS.map((work, i) => (
            <WorkTile key={work.id} work={work} index={i} />
          ))}
        </div>
      </div>

      {/* ── Розетка: тот же кадр под лупой ─────────────────────────────────── */}
      <div className="relative h-[78vh] w-full md:h-[92vh]">
        <Rosette />
        <div className="pointer-events-none absolute inset-0">
          <div className="trim cols h-full items-start pt-[clamp(40px,7vh,96px)]">
            <div className="col-span-4 md:col-span-8">
              <PrintReveal as="div">
                <h2 className="t-h2">
                  {RASTR.rosetteHeading.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </h2>
              </PrintReveal>
              <div className="mt-7 space-y-4">
                {RASTR.rosetteBody.map((p, i) => (
                  <PrintReveal
                    key={i}
                    as="p"
                    delay={0.034 * (i + 1)}
                    className="t-body text-[var(--color-ink-70)]"
                  >
                    {p}
                  </PrintReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
