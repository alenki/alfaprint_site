'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { ProofSheet } from '@/components/print/ProofSheet';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { REVIEWS } from '@/content/reviews';
import { PROOFS, CONTACTS, SECTIONS } from '@/content/site';

/**
 * §06 · ПОДПИСНОЙ ЛИСТ
 *
 * Никакой карусели: три отзыва стоят разом и все видны сразу. Ссылка на
 * карточку в Яндекс.Картах настоящая: проверяемость важнее любой анимации.
 *
 * Отзывы стоят на полосе набора, а не на плашках: ни белого листа, ни
 * рамки, ни коробки. Делит их одна волосяная линия по разрезу, и она же
 * единственная линия во всём разделе.
 */
export function PodpisnoiList() {
  const S = SECTIONS[5];

  return (
    <Section id={S.id} ground="paper" gain={1} className="py-[var(--section-pad)]">
      <Sheet>
        <Grid className="items-end gap-y-6">
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
          <div className="col-span-4 md:col-span-3 md:col-start-10 md:text-right">
            <a
              href={CONTACTS.maps}
              target="_blank"
              rel="noreferrer"
              className="t-micro link-rule fg-56 inline-block"
            >
              {PROOFS.link} →
            </a>
          </div>
        </Grid>
      </Sheet>

      <Sheet className="mt-[clamp(40px,5vw,104px)]">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <ProofSheet key={i} review={review} index={i} count={REVIEWS.length} />
          ))}
        </div>
      </Sheet>
    </Section>
  );
}
