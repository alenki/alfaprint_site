'use client';

import { motion } from 'motion/react';
import { Tick } from '@/components/chrome/Mark';
import { PlateGhost } from '@/components/type/PlateGhost';
import { useRevealProps } from '@/components/type/PrintReveal';
import { DOPUSK, COMPANY } from '@/content/site';

function useRegistryReveal() {
  const base = useRevealProps(0);
  return (i: number) => ({
    ...base,
    transition: { ...base.transition, delay: 'delay' in base.transition ? i * 0.034 : 0 },
  });
}

/**
 * РЕЕСТР — четыре строки, разделённые волосяной линией.
 * Ни карточек, ни иконок, ни теней: только линии и числа.
 *
 * У каждого числа в DOM лежит рубиновый двойник. При спокойном чтении его
 * не существует; при разгоне прокрутки из-под числа выезжает рубиновый след —
 * доказательство закона ровно в той секции, где он объявлен.
 */
export function Registry() {
  const reveal = useRegistryReveal();
  const years = new Date().getFullYear() - COMPANY.since;

  return (
    <dl>
      {DOPUSK.registry.map((row, i) => {
        const value = row.kind === 'years' ? `${years} лет` : row.value ?? '';
        return (
          <motion.div
            key={row.label}
            className="hairline-b flex items-baseline justify-between gap-6 py-7 md:min-h-[96px]"
            {...reveal(i)}
          >
            <dt className="t-label text-[var(--color-ink-62)]">{row.label}</dt>
            <dd className="relative flex items-baseline gap-3">
              <span className="relative inline-block">
                <PlateGhost>{value}</PlateGhost>
                <span className="t-num relative">{value}</span>
              </span>
              {row.kind === 'tick' && (
                <Tick className="h-4 w-5 shrink-0 text-[var(--color-rubine)]" strokeWidth={3} />
              )}
            </dd>
          </motion.div>
        );
      })}
    </dl>
  );
}
