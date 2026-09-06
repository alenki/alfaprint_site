import { PROOFS } from '@/content/site';

/**
 * ШТАМП «В ПЕЧАТЬ».
 *
 * Единственная текстура на сайте и единственный поворот: штампу можно.
 * Рваный край это тот самый один-единственный feTurbulence, статичный,
 * с разным сидом на каждый экземпляр.
 */
export function StampVPechat({ seed = 0 }: { seed?: number }) {
  return (
    <svg viewBox="0 0 200 70" className="w-[46%] max-w-[190px]" aria-hidden>
      <g filter={`url(#ink-bleed-${seed % 3})`} transform="rotate(-4 100 35)">
        <rect
          x="6"
          y="10"
          width="188"
          height="50"
          fill="none"
          stroke="var(--color-rubine)"
          strokeWidth="2.5"
        />
        <text
          x="100"
          y="43"
          textAnchor="middle"
          fill="var(--color-rubine)"
          fontFamily="var(--font-mono)"
          fontSize="19"
          fontWeight="700"
          letterSpacing="2.4"
        >
          {PROOFS.stamp.toUpperCase()}
        </text>
      </g>
    </svg>
  );
}
