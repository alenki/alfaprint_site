'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { Catalogue } from '@/components/ui/Catalogue';
import { CATALOGUE_LEAD } from '@/content/catalogue';

/**
 * §03 · ДВЕ ФОРМЫ
 *
 * Смысловое ядро направления и коммерческое ядро страницы: каталог разложен
 * не по прайсу, а по природе изображения. Форма K — там, где изображение
 * делает краска. Форма R — там, где его делает сам материал.
 */
export function DveFormy() {
  return (
    <section
      id="dve-formy"
      data-section-ground="ink"
      style={{ ['--gain' as string]: 1 }}
      className="ground-ink ink-warmth relative overflow-hidden py-[var(--section-pad)]"
    >
      <div className="trim relative">
        <div className="cols gap-y-8">
          <div className="col-span-4 md:col-span-9">
            <PrintReveal as="div">
              <h2 className="t-h2 text-[var(--color-chalk)]">
                <span className="block">Всё, что мы умеем,</span>
                <span className="block">делится на две формы.</span>
              </h2>
            </PrintReveal>
          </div>
          <div className="col-span-4 self-end md:col-span-3">
            <span className="sr-only">{CATALOGUE_LEAD}</span>
          </div>
        </div>

        <div className="mt-10 md:mt-14">
          <Catalogue />
        </div>
      </div>
    </section>
  );
}
