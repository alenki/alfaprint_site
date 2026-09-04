'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { Registry } from '@/components/ui/Registry';
import { DOPUSK } from '@/content/site';

/**
 * §02 · ДОПУСК
 *
 * Единственное место на сайте, где механика объяснена словами. Ни в §05,
 * ни где-либо ещё нет второй подписи про уход приводки: уверенная работа
 * говорит один раз.
 */
export function Dopusk() {
  return (
    <section
      id="dopusk"
      data-section-ground="paper"
      style={{ ['--gain' as string]: 0.8 }}
      className="ground-paper py-[var(--section-pad)]"
    >
      <div className="trim cols gap-y-16">
        <div className="col-span-4 md:col-span-6">
          <PrintReveal as="div">
            <h2 className="t-h2">
              {DOPUSK.heading.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h2>
          </PrintReveal>

          <div className="mt-8 space-y-5 md:mt-10">
            {DOPUSK.body.map((p, i) => (
              <PrintReveal key={i} as="p" delay={0.034 * (i + 1)} className="t-body text-[var(--color-ink-70)]">
                {p}
              </PrintReveal>
            ))}
          </div>

          {/* Сносочная линейка — 38 % колонки, как в наборе */}
          <div className="mt-8">
            <div className="h-px w-[38%] bg-[var(--color-ink-32)]" />
            <PrintReveal as="p" delay={0.14} className="t-micro mt-4 max-w-[46ch] leading-relaxed text-[var(--color-ink-62)]">
              {DOPUSK.footnote}
            </PrintReveal>
          </div>
        </div>

        <div className="col-span-4 md:col-span-5 md:col-start-8">
          <Registry />
        </div>
      </div>
    </section>
  );
}
