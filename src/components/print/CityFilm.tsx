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
 * а точка на местности — нет, и выдумывать её нельзя.
 */

const H = [
  { y: 92, w: 1 },
  { y: 196, w: 2 },
  { y: 300, w: 1 },
  { y: 404, w: 1 },
];
const V = [
  { x: 110, w: 1 },
  { x: 250, w: 1 },
  { x: 396, w: 2 },
  { x: 540, w: 1 },
  { x: 676, w: 1 },
];
const LINKS = [
  'M110 92 L250 196',
  'M396 196 L540 300',
  'M250 300 L396 404',
  'M540 92 L676 196',
  'M110 300 L250 404',
  'M396 92 L540 196',
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
      <svg viewBox="0 0 800 520" className="h-auto w-full" role="img" aria-hidden>
        <g stroke="currentColor" fill="none" vectorEffect="non-scaling-stroke" opacity="0.45">
          {H.map((l, i) => (
            <motion.line key={`h${i}`} x1="0" y1={l.y} x2="800" y2={l.y} strokeWidth={l.w} {...draw(i)} />
          ))}
          {V.map((l, i) => (
            <motion.line key={`v${i}`} x1={l.x} y1="0" x2={l.x} y2="520" strokeWidth={l.w} {...draw(i + 4)} />
          ))}
          {LINKS.map((d, i) => (
            <motion.path key={`l${i}`} d={d} strokeWidth="1" {...draw(i + 9)} />
          ))}
        </g>

        {/* Подписи улиц вдоль линий */}
        <text
          x="20"
          y="190"
          fill="currentColor"
          fontFamily="var(--font-mono)"
          fontSize="11"
          letterSpacing="2.6"
          opacity="0.7"
        >
          ТАРЧОКОВА
        </text>
        <text
          x="404"
          y="60"
          fill="currentColor"
          fontFamily="var(--font-mono)"
          fontSize="11"
          letterSpacing="2.6"
          opacity="0.45"
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
          style={{ transformOrigin: '396px 196px' }}
        >
          <circle cx="396" cy="196" r="4" />
          <circle cx="396" cy="196" r="9" />
          <path d="M396 185v-11M396 218v-11M385 196h-11M418 196h-11" />
        </motion.g>

        {/* Кольцо и подпись — только под курсором */}
        <circle
          cx="396"
          cy="196"
          r="34"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="opacity-0 transition-opacity duration-300 group-hover:opacity-40"
        />

        {/* Масштабная линейка */}
        <g stroke="currentColor" strokeWidth="1" opacity="0.5">
          <line x1="640" y1="484" x2="760" y2="484" />
          <line x1="640" y1="479" x2="640" y2="489" />
          <line x1="760" y1="479" x2="760" y2="489" />
        </g>
        <text
          x="700"
          y="475"
          fill="currentColor"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          letterSpacing="1.6"
          opacity="0.6"
        >
          0 — 100 М
        </text>
      </svg>

      <span className="t-micro mt-3 inline-block opacity-0 transition-opacity duration-300 group-hover:opacity-80 group-focus-visible:opacity-80">
        Построить маршрут →
      </span>
    </a>
  );
}
