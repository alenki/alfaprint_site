'use client';

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
 *
 * ПЛЁНКА ПЕЧАТАЕТСЯ БЕЗ ЕДИНОЙ СТРОКИ JS, и это требование, а не вкус.
 * Ход «прорисовки» стоял на whileInView, то есть в статике лист уходил с
 * opacity="0" на каждой линии и проявлялся только если сработает
 * IntersectionObserver. На iPhone он не срабатывал, и от карты оставались
 * одни подписи: они-то не анимированы. Ни pathLength, ни stroke-dashoffset
 * этого не лечат, потому что дело не в штрихе, а в том, что видимость
 * карты вообще зависела от скрипта. Теперь не зависит: сетка нарисована
 * сразу и целиком.
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
const LINKS: [number, number, number, number][] = [
  [110, 76, 250, 160],
  [396, 160, 540, 244],
  [250, 244, 396, 328],
  [540, 76, 676, 160],
  [110, 244, 250, 328],
  [396, 76, 540, 160],
];

export function CityFilm() {
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
            <path key={`h${i}`} d={`M0 ${l.y}H800`} strokeWidth={l.w} />
          ))}
          {V.map((l, i) => (
            <path key={`v${i}`} d={`M${l.x} 0V420`} strokeWidth={l.w} />
          ))}
          {LINKS.map(([x1, y1, x2, y2], i) => (
            <path key={`l${i}`} d={`M${x1} ${y1}L${x2} ${y2}`} strokeWidth="1" />
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
          style={{ writingMode: 'vertical-rl' }}
        >
          НОГМОВА
        </text>

        {/* Дом отмечен тем же приводочным крестом, что стоит в знаке */}
        <g stroke="var(--color-rubine)" fill="none" strokeWidth="1.5">
          <circle cx="396" cy="160" r="4" />
          <circle cx="396" cy="160" r="9" />
          <path d="M396 149v-11M396 182v-11M385 160h-11M418 160h-11" />
        </g>

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
