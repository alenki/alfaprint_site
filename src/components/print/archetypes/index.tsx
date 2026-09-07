/**
 * АРХЕТИПЫ ПЕЧАТНЫХ ИЗДЕЛИЙ.
 *
 * Пока съёмки нет, плитка портфолио рисует настоящее изделие в векторе,
 * в правильной пропорции, свёрстанное теми же тремя гарнитурами, что и сайт,
 * примерно в масштабе 1:8.
 *
 * Каждый архетип разложен на две формы:
 *   plate-k несёт всю типографику, линии, штриховку, окна;
 *   plate-r несёт знак, одну акцентную линию, одно поле плашки.
 * Разведение форм при наведении это transform на группе, а не перерисовка.
 */

import type { Archetype } from '@/content/works';
import { MARK_K, MARK_R } from '@/components/chrome/Mark';

const K = 'var(--color-ink)';
const R = 'var(--color-rubine)';

type Props = { content: string[] };

/**
 * Приведение знака к масштабу изделия. Знак нарисован в поле шириной 120
 * единиц (см. `Mark`), а на макетах он стоял в поле шириной 22: `s = 1` обязан
 * оставить прежний кегль, иначе разъедутся все пять посадочных мест ниже.
 * 22 / 109.78 это отношение ширины БУКВЫ к ширине буквы в поле знака.
 */
const MARK_UNIT = 0.2;

/**
 * Знак «А» с галочкой в масштабе изделия. Пути общие с шапкой и иконкой
 * вкладки: своей копии у макетов больше нет, и разойтись им теперь не с чем.
 *
 * Знак стал ниже прежнего при той же ширине: у настоящей марки буква шире
 * относительно роста, чем у рисованной, которая стояла тут раньше. Посадочные
 * места считаны по левому краю буквы, поэтому правки координат не потребовали.
 */
function MiniMark({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${(s * MARK_UNIT).toFixed(4)})`}>
      <path className="plate-k" fill={K} fillRule="evenodd" d={MARK_K} />
      <path className="plate-r" fill={R} d={MARK_R} />
    </g>
  );
}

/** Набранная строка текста это прямоугольник, а не lorem. */
function Rule({
  x,
  y,
  w,
  h = 2,
  o = 1,
  cls = 'plate-k',
  fill = K,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  o?: number;
  cls?: string;
  fill?: string;
}) {
  return <rect className={cls} x={x} y={y} width={w} height={h} fill={fill} opacity={o} />;
}

/* ── ВИЗИТКА 90×50 мм ─────────────────────────────────────────────────── */
export function Vizitka({ content }: Props) {
  return (
    <svg viewBox="0 0 360 200" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect x="0" y="0" width="360" height="200" fill="var(--color-proof)" />
      {/* линия обреза 3 мм */}
      <rect
        className="plate-k"
        x="12"
        y="12"
        width="336"
        height="176"
        fill="none"
        stroke={K}
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.32"
      />
      <MiniMark x={34} y={38} s={1.25} />
      <text className="plate-k" x={34} y={112} fill={K} fontSize="19" fontFamily="var(--font-display)" fontWeight="600">
        {content[0]}
      </text>
      <text className="plate-k" x={34} y={133} fill={K} fontSize="11" fontFamily="var(--font-text)" opacity="0.7">
        {content[1]}
      </text>
      <Rule x={34} y={152} w={120} o={0.3} />
      <Rule x={34} y={161} w={96} o={0.3} />
      <Rule x={34} y={170} w={140} o={0.3} />
      <Rule x={250} y={170} w={76} h={3} cls="plate-r" fill={R} />
    </svg>
  );
}

/* ── МЕНЮ A4 ──────────────────────────────────────────────────────────── */
export function Menu({ content }: Props) {
  const rows = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg viewBox="0 0 260 368" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect width="260" height="368" fill="var(--color-proof)" />
      <text
        className="plate-k"
        x="130"
        y="52"
        fill={K}
        fontSize="26"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="600"
      >
        {content[0]}
      </text>
      <line className="plate-r" x1="98" y1="64" x2="162" y2="64" stroke={R} strokeWidth="2" />
      {rows.map((i) => (
        <g key={i}>
          <Rule x={30} y={96 + i * 34} w={70 + ((i * 13) % 40)} o={0.75} />
          <line
            className="plate-k"
            x1={106 + ((i * 13) % 40)}
            y1={97 + i * 34}
            x2={206}
            y2={97 + i * 34}
            stroke={K}
            strokeWidth="1"
            strokeDasharray="1 3"
            opacity="0.4"
          />
          <Rule x={212} y={96 + i * 34} w={18} o={0.75} />
          <Rule x={30} y={107 + i * 34} w={120} o={0.25} />
        </g>
      ))}
      <line className="plate-k" x1="30" y1="336" x2="230" y2="336" stroke={K} strokeWidth="1" opacity="0.32" />
      <MiniMark x={30} y={344} s={0.6} />
    </svg>
  );
}

/* ── ЛИСТОВКА A5 ──────────────────────────────────────────────────────── */
export function Flyer({ content }: Props) {
  return (
    <svg viewBox="0 0 260 368" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect width="260" height="368" fill="var(--color-proof)" />
      <text className="plate-k" x="26" y="66" fill={K} fontSize="30" fontFamily="var(--font-display)" fontWeight="700">
        {content[0]}
      </text>
      <text className="plate-k" x="26" y="100" fill={K} fontSize="30" fontFamily="var(--font-display)" fontWeight="700">
        {content[1]}
      </text>
      {/* окно под фото: диагональная штриховка 45° */}
      <defs>
        <pattern id="hatch45" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={K} strokeWidth="1" opacity="0.22" />
        </pattern>
      </defs>
      <rect className="plate-k" x="26" y="126" width="208" height="150" fill="url(#hatch45)" stroke={K} strokeWidth="1" opacity="0.7" />
      <Rule x={26} y={296} w={168} o={0.35} />
      <Rule x={26} y={306} w={132} o={0.35} />
      <rect className="plate-r" x="26" y="326" width="94" height="20" fill={R} />
      <MiniMark x={200} y={322} s={0.7} />
    </svg>
  );
}

/* ── НАКЛЕЙКА 1:1 ─────────────────────────────────────────────────────── */
export function Sticker({ content }: Props) {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect width="300" height="300" fill="var(--color-proof)" />
      {/* die-line: замкнутый пунктир */}
      <circle
        className="plate-k"
        cx="150"
        cy="150"
        r="112"
        fill="none"
        stroke={K}
        strokeWidth="1"
        strokeDasharray="5 5"
        opacity="0.5"
      />
      {/* kiss-cut на 2 мм внутрь */}
      <circle className="plate-r" cx="150" cy="150" r="102" fill="none" stroke={R} strokeWidth="1.5" />
      <MiniMark x={132} y={112} s={2.1} />
      <text
        className="plate-k"
        x="150"
        y="206"
        fill={K}
        fontSize="15"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        letterSpacing="2"
      >
        {content[0]?.toUpperCase()}
      </text>
    </svg>
  );
}

/* ── БАННЕР 3:1 ───────────────────────────────────────────────────────── */
export function Banner({ content }: Props) {
  const eyelets = [
    [22, 22],
    [438, 22],
    [22, 134],
    [438, 134],
    [230, 22],
    [230, 134],
  ];
  return (
    <svg viewBox="0 0 460 156" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect width="460" height="156" fill="var(--color-ink)" />
      <text className="plate-k" x="52" y="78" fill="var(--color-chalk)" fontSize="40" fontFamily="var(--font-display)" fontWeight="700">
        {content[0]}
      </text>
      <Rule x={52} y={94} w={150} h={3} o={0.45} fill="var(--color-chalk)" />
      <rect className="plate-r" x="336" y="52" width="76" height="52" fill={R} />
      {eyelets.map(([cx, cy], i) => (
        <g key={i}>
          <circle className="plate-k" cx={cx} cy={cy} r="6" fill="none" stroke="var(--color-chalk)" strokeWidth="1.5" opacity="0.8" />
          <circle className="plate-k" cx={cx} cy={cy} r="2.5" fill="var(--color-chalk)" opacity="0.5" />
        </g>
      ))}
      {/* размерная линия */}
      <g className="plate-k" stroke="var(--color-chalk)" strokeWidth="1" opacity="0.45">
        <line x1="22" y1="148" x2="438" y2="148" />
        <line x1="22" y1="144" x2="22" y2="152" />
        <line x1="438" y1="144" x2="438" y2="152" />
      </g>
      <text x="230" y="145" fill="var(--color-chalk)" fontSize="8" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.6">
        3000 ММ
      </text>
    </svg>
  );
}

/* ── БИРКА 20×70 мм ───────────────────────────────────────────────────── */
export function Birka({ content }: Props) {
  return (
    <svg viewBox="0 0 120 340" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect width="120" height="340" fill="var(--color-proof)" />
      <rect className="plate-k" x="20" y="20" width="80" height="300" fill="none" stroke={K} strokeWidth="1" opacity="0.32" />
      {/* линия подгиба */}
      <line className="plate-k" x1="20" y1="170" x2="100" y2="170" stroke={K} strokeWidth="1" strokeDasharray="3 4" opacity="0.45" />
      <MiniMark x={45} y={54} s={1} />
      <text className="plate-k" x="60" y="110" fill={K} fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)" letterSpacing="1.4">
        {content[0]?.toUpperCase()}
      </text>
      <Rule x={38} y={126} w={44} h={1.5} o={0.4} />
      <line className="plate-r" x1="38" y1="250" x2="82" y2="250" stroke={R} strokeWidth="2" />
      <text className="plate-k" x="60" y="276" fill={K} fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)" opacity="0.6" letterSpacing="1">
        20 × 70 ММ
      </text>
    </svg>
  );
}

export const ARCHETYPES: Record<Archetype, (p: Props) => React.ReactElement> = {
  vizitka: Vizitka,
  menu: Menu,
  flyer: Flyer,
  sticker: Sticker,
  banner: Banner,
  birka: Birka,
};
