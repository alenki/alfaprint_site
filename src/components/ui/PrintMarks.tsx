'use client';

import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   МЕТКИ ПЕЧАТНОГО ЛИСТА
   Всё, что печатник ставит за линией обреза: кресты приводки, контрольная
   шкала, метки реза. Здесь они не украшение — они держат край страницы.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Крест приводки. Тот самый, по которому совмещают четыре формы. */
export function RegistrationMark({
  size = 22,
  className,
  strokeWidth = 1,
}: {
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      style={{ overflow: 'visible' }}
    >
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <path
        d="M12 0v7.2M12 16.8V24M0 12h7.2M16.8 12H24"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

/** Метка реза — угловой уголок за линией обреза. */
export function TrimMark({
  corner = 'tl',
  size = 16,
  className,
}: {
  corner?: 'tl' | 'tr' | 'bl' | 'br';
  size?: number;
  className?: string;
}) {
  const rotate = { tl: 0, tr: 90, br: 180, bl: 270 }[corner];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M0 5h5V0" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   КОНТРОЛЬНАЯ ШКАЛА
   Полоска плашек, по которой печатник на глаз ловит плотность краски.
   Триада живёт здесь — и только здесь, плюс в приводке и в растре.
   ───────────────────────────────────────────────────────────────────────── */

const STRIP = [
  { c: 'var(--color-proc-c)', l: 'C' },
  { c: 'var(--color-proc-m)', l: 'M' },
  { c: 'var(--color-proc-y)', l: 'Y' },
  { c: 'var(--color-ink)', l: 'K' },
  { c: 'var(--color-rubine)', l: 'R' },
];

export function ControlStrip({
  vertical = false,
  showLabels = false,
  className,
  patch = 13,
}: {
  vertical?: boolean;
  showLabels?: boolean;
  className?: string;
  patch?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn('flex', vertical ? 'flex-col' : 'flex-row', className)}
    >
      {STRIP.map((s) => (
        <div key={s.l} className="relative">
          <div
            style={{
              width: patch,
              height: patch,
              background: s.c,
            }}
          />
          {showLabels && (
            <span
              className="t-meta absolute left-1/2 top-full mt-1 -translate-x-1/2 text-[9px] tracking-[0.14em] opacity-40"
              style={{ letterSpacing: '0.14em' }}
            >
              {s.l}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   РАСТРОВАЯ РОЗЕТКА
   Четыре сетки точек под углами 15° / 75° / 0° / 45° — так ложится
   настоящий триадный растр. Чисто CSS: четыре radial-gradient.
   ───────────────────────────────────────────────────────────────────────── */

export function Rosette({
  cell = 7,
  opacity = 0.5,
  className,
}: {
  cell?: number;
  opacity?: number;
  className?: string;
}) {
  const layer = (color: string, angle: number, dx: number, dy: number) =>
    `radial-gradient(circle at ${dx}px ${dy}px, ${color} 0 ${cell * 0.26}px, transparent ${cell * 0.27}px)`;

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        opacity,
        backgroundImage: [
          layer('var(--color-proc-c)', 15, cell * 0.5, cell * 0.5),
          layer('var(--color-proc-m)', 75, cell * 0.5 + 1.4, cell * 0.5 + 1.1),
          layer('var(--color-proc-y)', 0, cell * 0.5 - 1.2, cell * 0.5 + 1.6),
        ].join(','),
        backgroundSize: `${cell}px ${cell}px`,
        mixBlendMode: 'multiply',
      }}
    />
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   ПОЛЕ ЛИСТА
   Кресты приводки по четырём углам секции. Ставится один раз на секцию.
   ───────────────────────────────────────────────────────────────────────── */

export function SheetCorners({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 text-ink-32',
        className,
      )}
    >
      <TrimMark corner="tl" className="absolute left-0 top-0" />
      <TrimMark corner="tr" className="absolute right-0 top-0" />
      <TrimMark corner="bl" className="absolute bottom-0 left-0" />
      <TrimMark corner="br" className="absolute bottom-0 right-0" />
    </div>
  );
}
