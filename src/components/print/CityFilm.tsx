'use client';

import { motion } from 'motion/react';
import { CONTACTS, IMPRINT } from '@/content/site';

/**
 * ПЛЁНКА ГОРОДА.
 *
 * Не карта, а печатная плёнка: четырнадцать волосяных линий, две подписи
 * улиц и приводочный крест на месте дома. Весит килобайт и целиком лежит
 * в системе страницы.
 *
 * Никаких координат, никаких POI, никаких домов: адрес подтверждён,
 * а точка на местности не подтверждена, и выдумывать её нельзя.
 */

const H = [
  { y: 76, w: 1 },
  { y: 160, w: 2 },
  { y: 244, w: 1 },
  { y: 328, w: 1 },
];
const V = [
  { x: 110, w: 1 },
  { x: 250, w: 1 },
  { x: 396, w: 2 },
  { x: 540, w: 1 },
  { x: 676, w: 1 },
];
const LINKS = [
  'M110 76 L250 160',
  'M396 160 L540 244',
  'M250 244 L396 328',
  'M540 76 L676 160',
  'M110 244 L250 328',
  'M396 76 L540 160',
];

export function CityFilm() {
  const draw = (i: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: '-10% 0px' },
    transition: { duration: 0.7, delay: i * 0.04, ease: [0.65, 0, 0.35, 1] as const },
  });

  return (
    <a
      href={CONTACTS.mapsRoute}
      target="_blank"
      rel="noreferrer"
      className="group relative block"
      aria-label={`${IMPRINT.mapsLink}: Нальчик, Тарчокова, 29`}
    >
      <svg viewBox="0 0 800 420" className="h-auto w-full min-h-[190px]" role="img" aria-hidden>
        <g stroke="currentColor" fill="none" vectorEffect="non-scaling-stroke" opacity="0.62">
          {H.map((l, i) => (
            <motion.line key={`h${i}`} x1="0" y1={l.y} x2="800" y2={l.y} strokeWidth={l.w} {...draw(i)} />
          ))}
          {V.map((l, i) => (
            <motion.line key={`v${i}`} x1={l.x} y1="0" x2={l.x} y2="420" strokeWidth={l.w} {...draw(i + 4)} />
          ))}
          {LINKS.map((d, i) => (
            <motion.path key={`l${i}`} d={d} strokeWidth="1" {...draw(i + 9)} />
          ))}
        </g>

        {/* Подписи улиц вдоль линий */}
        <text
          x="20"
          y="154"
          fill="currentColor"
          fontFamily="var(--font-mono)"
          fontSize="11"
          letterSpacing="2.6"
          opacity="0.9"
        >
          ТАРЧОКОВА
        </text>
        <text
          x="404"
          y="40"
          fill="currentColor"
          fontFamily="var(--font-mono)"
          fontSize="11"
          letterSpacing="2.6"
          opacity="0.62"
          writingMode="tb"
        >
          НОГМОВА
        </text>

        {/* Дом отмечен тем же приводочным крестом, что стоит в знаке */}
        <motion.g
          stroke="var(--color-rubine)"
          fill="none"
          strokeWidth="1.5"
          initial={{ scale: 1 }}
          whileInView={{ scale: [1, 1.12, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.65, 0, 0.35, 1] }}
          style={{ transformOrigin: '396px 160px' }}
        >
          <circle cx="396" cy="160" r="4" />
          <circle cx="396" cy="160" r="9" />
          <path d="M396 149v-11M396 182v-11M385 160h-11M418 160h-11" />
        </motion.g>

        {/* Кольцо и подпись стоят только под курсором */}
        <circle
          cx="396"
          cy="160"
          r="34"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="opacity-0 transition-opacity duration-300 group-hover:opacity-40"
        />

        {/* Масштабная линейка */}
        <g stroke="currentColor" strokeWidth="1" opacity="0.7">
          <line x1="640" y1="392" x2="760" y2="392" />
          <line x1="640" y1="387" x2="640" y2="397" />
          <line x1="760" y1="387" x2="760" y2="397" />
        </g>
        <text
          x="700"
          y="383"
          fill="currentColor"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          letterSpacing="1.6"
          opacity="0.8"
        >
          0…100 М
        </text>
      </svg>

      <span className="t-micro absolute left-0 top-full mt-3 opacity-0 transition-opacity duration-300 group-hover:opacity-80 group-focus-visible:opacity-80">
        Построить маршрут →
      </span>
    </a>
  );
}
