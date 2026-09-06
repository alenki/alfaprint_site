/**
 * ЕДИНСТВЕННЫЙ SVG-ФИЛЬТР НА ВСЁМ САЙТЕ.
 *
 * Рваный край штампа «В печать»: так резина оставляет краску на бумаге.
 * Фильтр объявлен один раз, применяется к трём статичным элементам
 * размером около 180×64 px и никогда не анимируется. Всё остальное,
 * что раньше требовало feTurbulence, вырезано: растеризация фильтров
 * на большой площади убивает средний Android.
 */
export function Filters() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        {[0, 1, 2].map((seed) => (
          <filter key={seed} id={`ink-bleed-${seed}`} x="-8%" y="-24%" width="116%" height="148%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed={seed * 17 + 3}
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </defs>
    </svg>
  );
}
