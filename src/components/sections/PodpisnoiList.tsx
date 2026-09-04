'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { ProofSheet } from '@/components/print/ProofSheet';
import { REVIEWS } from '@/content/reviews';
import { PROOFS, CONTACTS } from '@/content/site';

/**
 * §06 · ПОДПИСНОЙ ЛИСТ
 *
 * Никакой карусели: три листа стоят разом и все видны сразу. Ссылка на
 * карточку в Яндекс.Картах настоящая — проверяемость важнее любой анимации.
 */
export function PodpisnoiList() {
  return (
    <section
      id="podpisnoi-list"
      data-section-ground="paper"
      style={{ ['--gain' as string]: 1 }}
      className="ground-paper py-[var(--section-pad)]"
    >
      <div className="trim">
        <div className="cols items-end gap-y-6">
          <div className="col-span-4 md:col-span-8">
            <PrintReveal as="div">
              <h2 className="t-h2">
                {PROOFS.heading.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
            </PrintReveal>
          </div>
          <div className="col-span-4 md:col-span-3 md:col-start-10">
            <a
              href={CONTACTS.maps}
              target="_blank"
              rel="noreferrer"
              className="t-micro link-rule inline-block text-[var(--color-ink-62)]"
            >
              {PROOFS.link} →
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3 md:gap-[var(--gutter)]">
          {REVIEWS.map((review, i) => (
            <ProofSheet key={i} review={review} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
