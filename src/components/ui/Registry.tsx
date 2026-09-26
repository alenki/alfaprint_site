'use client';

import { motion } from 'motion/react';
import { useRevealProps } from '@/components/type/PrintReveal';
import { DOPUSK, COMPANY } from '@/content/site';
import { plural } from '@/lib/plural';

/**
 * РЕЕСТР: четыре подтверждённых числа, набранные ОДНОЙ СТРОКОЙ во весь
 * формат, под единственной линейкой полосы.
 *
 * Прежняя редакция ставила их столбцом: четыре волосяные линии, метка у
 * одного края, число у другого, и между ними полполосы пустоты. Это читалось
 * как таблица характеристик, а не как доказательство, и было самой шумной
 * вещью в секции.
 *
 * Теперь это выходные данные тиража: числа стоят на одной базовой линии,
 * подписи под ними, разделителей между колонками нет вовсе. Линейка ровно
 * одна, и она отделяет доказательство от заявления.
 *
 * Числа набраны в одну краску и стоят неподвижно: рубиновый двойник под ними
 * и галочка утверждения рядом с оценкой сняты: доказательству нечего играть.
 */
export function Registry() {
  const base = useRevealProps(0);
  /* Годы считаются от года, с которого агентство работает, а слово при них
     согласуется с числом: шесть лет, но двадцать один год. */
  const years = new Date().getFullYear() - COMPANY.since;
  const yearsLabel = `${years} ${plural(years, 'год', 'года', 'лет')}`;

  return (
    <dl className="rule-t grid12 gap-y-[clamp(30px,3vw,52px)] pt-[clamp(22px,2.3vw,46px)] md:gap-y-0">
      {DOPUSK.registry.map((row, i) => {
        const value = row.kind === 'years' ? yearsLabel : (row.value ?? '');
        return (
          <motion.div
            key={row.label}
            className="col-span-2 md:col-span-3"
            {...base}
            transition={{
              ...base.transition,
              delay: 'delay' in base.transition ? i * 0.034 : 0,
            }}
          >
            <dd className="t-num whitespace-nowrap">{value}</dd>
            <dt className="t-micro fg-56 mt-[clamp(10px,0.85vw,18px)]">{row.label}</dt>
          </motion.div>
        );
      })}
    </dl>
  );
}
