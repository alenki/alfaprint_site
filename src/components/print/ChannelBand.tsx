'use client';

import { motion } from 'motion/react';
import { useRevealProps } from '@/components/type/PrintReveal';
import { K_SVYAZ } from '@/content/kontakty';

/**
 * ТРИ ПЛАШКИ ПИСЬМА, ПОЛОСОЙ ОТ РЕЗА ДО РЕЗА.
 *
 * Та же вырубка, что кончает главную (`ContactPanels`), и намеренно та же:
 * у дома один способ печатать действие, а не по способу на лист. Отличий
 * ровно три, и все три от содержания.
 *
 * ПЕРВОЕ: ПЛАШЕК ТРИ, А НЕ ДВЕ. Телефон в полосу не входит, он уже напечатан
 * афишей на экран выше, и четвёртой плашкой повторил бы сам себя.
 *
 * ВТОРОЕ: ПОД ИМЕНЕМ КАНАЛА СТОИТ АДРЕС, ПО КОТОРОМУ ОН ОТКРЫВАЕТСЯ. На
 * главной кикер это ГЛАГОЛ («позвонить», «написать»), потому что там выбор
 * между двумя действиями. Здесь действие одно на все три, и выбирают не его,
 * а канал; значит, называть надо то, чем каналы и различаются: номер, под
 * которым нас найдут в WhatsApp, имя, под которым мы стоим в Telegram, и
 * адрес страницы во ВКонтакте.
 *
 * ТРЕТЬЕ: ГРУНТ ЗДЕСЬ КРАСКА, А НЕ БУМАГА. Полоса открывает тёмно-синий
 * раздел бланка и стоит его верхней кромкой: два тёмных поля уходят в грунт
 * раздела, а синее остаётся стоять. Лист поворачивается с бумаги на краску
 * через синюю треть, и шва между полосой и разделом нет ни одного.
 * Отбивает полосу сверху сама бумага §K1.
 *
 * ОТКЛИК ТОТ ЖЕ, ЧТО У ГЛАВНОЙ: не двигается ничего, кольцо заливается
 * краской, остриё выворачивается. По тёмному полю краской служит мел, и
 * поправка на это записана в стиле листа, а не здесь.
 */

/** Кольцо приводочного креста в роли стрелки. Тот же знак, что в `ContactPanels`. */
function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle
        className="kp-arrow-ring"
        cx="12"
        cy="12"
        r="11"
        stroke="currentColor"
        strokeWidth="1"
      />
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

export function ChannelBand() {
  return (
    <div className="kp-band kb-band">
      {K_SVYAZ.channels.map((c, i) => (
        <Cell key={c.name} {...c} delay={i * 0.05} />
      ))}
    </div>
  );
}

function Cell({
  name,
  at,
  href,
  ink,
  delay,
}: {
  name: string;
  at: string;
  href: string;
  ink: string;
  delay: number;
}) {
  const reveal = useRevealProps(delay);
  const rubine = ink === 'rubine';

  return (
    <motion.a
      {...reveal}
      href={href}
      target="_blank"
      rel="noreferrer"
      /* На синем поле грунт и есть форма R, значит уходить обязана форма K:
         весь набор на нём идёт бумагой. Правило написано в globals.css,
         плашка только называет себя. */
      {...(rubine ? { 'data-invert': 'true' } : null)}
      className={`kp kb-cell ${rubine ? 'ground-rubine kp-rubine' : 'ground-ink'}`}
    >
      <span className="t-micro fg-56 kp-kicker">{at}</span>
      <span className="kp-foot">
        <span className="kp-line">{name}</span>
        <Arrow className="kp-arrow" />
      </span>
    </motion.a>
  );
}
