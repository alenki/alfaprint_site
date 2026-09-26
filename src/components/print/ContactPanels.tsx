'use client';

import { motion } from 'motion/react';
import { useRevealProps } from '@/components/type/PrintReveal';
import { CLOSING } from '@/content/site';

/**
 * ДВЕ ПЛАШКИ ЗАКАЗА.
 *
 * Последний разворот листа: две формы во весь формат, встык, без просвета
 * и без волосяной между ними. Линия здесь не нужна ни одна: бумага и синяя
 * форма отбиты друг от друга краской, а от тёмного грунта их отбивает сам
 * рез.
 *
 * СПЛОШНАЯ ВТОРАЯ КРАСКА ВОЗВРАЩАЕТСЯ РОВНО ЗДЕСЬ. Сплошное поле ушло с
 * листа вместе с §07, и последняя плашка ставит его обратно один раз: лист
 * кончается полной краской, синей краской логотипа, а не затуханием.
 *
 * ЗАКОН УХОДА НА СИНЕМ ПОЛЕ ПЕРЕВЁРНУТ. `data-invert` объявлен не для
 * красоты: на этом поле грунт и есть форма R, значит уходить обязана форма
 * K, и правило это уже написано в globals.css. Плашка только называет себя.
 *
 * НАБОР НА СИНЕМ ИДЁТ БУМАГОЙ НА ЛЮБОМ КЕГЛЕ, и это не вкус, а замер.
 * Чёрным по синему логотипа выходит 2,43:1: незаконно даже для крупного
 * набора. Бумагой 6,85:1, законно на любом кегле, поэтому и строка, и
 * метка, и стрелка на этой плашке бумажные и от ширины экрана не зависят.
 * Правило живёт в CSS, у `.kp-rubine`.
 *
 * НА НАВЕДЕНИИ НЕ ДВИГАЕТСЯ НИЧЕГО, И ЭТО РЕШЕНИЕ, А НЕ НЕДОДЕЛКА. Здесь
 * успели побывать и накат краски на всю нижнюю треть плашки с вывороткой
 * строки, и рост кольца с остриём вразнобой; заказчик снял оба, и оба раза
 * по делу. Плашка напечатана, а печать под курсором не шевелится. Остался
 * один ответ, и он в краске: кольцо заливается чёрным, остриё выворачивается
 * бумагой. Правило в `globals.css`, рядом с самим знаком.
 */

/** Стрелка «увести со страницы»: то же кольцо, что у приводочного креста. */
function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle className="kp-arrow-ring" cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1" />
      <path
        className="kp-arrow-tip"
        d="M8.4 15.6 15.6 8.4M9.9 8.4h5.7v5.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="butt"
      />
    </svg>
  );
}

function Panel({
  kicker,
  line,
  href,
  ground,
  delay,
  external,
}: {
  kicker: string;
  line: string;
  href: string;
  ground: 'paper' | 'rubine';
  delay: number;
  external?: boolean;
}) {
  const reveal = useRevealProps(delay);

  return (
    <motion.a
      {...reveal}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : null)}
      {...(ground === 'rubine' ? { 'data-invert': 'true' } : null)}
      className={`kp ${ground === 'rubine' ? 'ground-rubine kp-rubine' : 'ground-paper'}`}
    >
      <span className="t-micro fg-56 kp-kicker">/ {kicker}</span>
      <span className="kp-foot">
        {/* Волосяной под строкой нет: под номером в 88 px она читалась как
            случайный подчёрк. Строка на наведении не делает ничего. */}
        <span className="kp-line">{line}</span>
        <Arrow className="kp-arrow" />
      </span>
    </motion.a>
  );
}

export function ContactPanels() {
  return (
    <div className="kp-band">
      <Panel {...CLOSING.call} ground="paper" delay={0} />
      <Panel {...CLOSING.write} ground="rubine" delay={0.06} external />
    </div>
  );
}
