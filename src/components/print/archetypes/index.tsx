/**
 * АРХЕТИПЫ ИЗДЕЛИЙ.
 *
 * Пока съёмки нет, плитка «Растра» рисует настоящее изделие агентства в
 * векторе, в правильной пропорции, свёрстанное теми же гарнитурами, что и
 * сайт. Изделия ровно те, что называет само агентство (см. `works.ts`).
 *
 * Каждый архетип разложен на две формы:
 *   plate-k несёт всю типографику, линии, штриховку, окна;
 *   plate-r несёт слово «Legko», одну акцентную линию, одно поле плашки.
 * Разведение форм при наведении это transform на группе, а не перерисовка.
 *
 * НИ ОДНОГО РАЗМЕРА И НИ ОДНОЙ ЦИФРЫ НА ИЗДЕЛИЯХ НЕТ. Прежние макеты несли
 * миллиметры бирки и ширину баннера; у агентства таких данных нет, и
 * размерная линия баннера осталась линией без числа.
 */

import type { Archetype } from '@/content/works';
import { LOGOTYPE_CAP, LOGOTYPE_GLYPHS, LOGOTYPE_WIDTH } from '@/components/chrome/Mark';

const K = 'var(--color-ink)';
const R = 'var(--color-rubine)';

type Props = { content: string[] };

/**
 * ПОСАДОЧНОЕ МЕСТО МАРКИ. Прежний знак стоял в поле 120 × 90,47 единиц,
 * приведённом к изделию множителем 0,2: при `s = 1` поле занимало 24 × 18,1
 * единицы макета, и все посадочные места ниже отмерены от его левого верха.
 * Слово встаёт в то же место: шириной ровно в поле, по высоте посередине
 * него. Слово втрое ниже знака той же ширины, поэтому там, где изделию
 * нужна марка крупнее, растёт `s`, а не правило посадки.
 */
const MARK_UNIT = 0.2;
const MARK_BOX_W = 120 * MARK_UNIT;
const MARK_BOX_H = 90.47 * MARK_UNIT;

/**
 * Слово «Legko» шириной `w`. Пути общие с шапкой и иконкой вкладки: своей
 * копии у макетов нет, и разойтись им не с чем.
 *
 * `(x, y)` это левый верхний угол рамки краски. У вертикального слова это
 * левый НИЖНИЙ угол: слово читается снизу вверх, как на полотне флага.
 *
 * ФОРМА R СНАРУЖИ МАСШТАБА, и это несущее. Уход приводки и разведение форм
 * пишутся CSS-трансформом на `.plate-r`, а он перебил бы атрибут `transform`
 * на том же узле и увёл бы слово в угол изделия. Поэтому форма это внешняя
 * группа без атрибута, а место и масштаб стоят на внутренней. Заодно уход
 * считается в единицах макета, как у всех прочих узлов формы R на изделии, а
 * не в сжатых единицах логотипа.
 */
function Wordmark({
  x,
  y,
  w,
  vertical = false,
  fill = R,
}: {
  x: number;
  y: number;
  w: number;
  vertical?: boolean;
  fill?: string;
}) {
  const k = (w / LOGOTYPE_WIDTH).toFixed(5);
  const at = `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
  return (
    <g className="plate-r" fill={fill}>
      <g transform={vertical ? `${at} rotate(-90) scale(${k})` : `${at} scale(${k})`}>
        {LOGOTYPE_GLYPHS.map((g, i) => (
          <path key={i} d={g.d} transform={g.transform} />
        ))}
      </g>
    </g>
  );
}

/** Слово в посадочном месте прежнего знака, см. `MARK_UNIT`. */
function MiniMark({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const w = MARK_BOX_W * s;
  const h = (w / LOGOTYPE_WIDTH) * LOGOTYPE_CAP;
  return <Wordmark x={x} y={y + (MARK_BOX_H * s - h) / 2} w={w} />;
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
      {/* линия обреза */}
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
      <MiniMark x={34} y={38} s={3} />
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

/* ── ФЛАГ «ПАРУС» НА ФЛАГШТОКЕ ────────────────────────────────────────────
   Полотно ровное у древка и скруглённое по свободной кромке сверху. Слово
   стоит вдоль полотна и читается снизу вверх, как печатают на таких флагах. */
export function Flag({ content }: Props) {
  return (
    <svg viewBox="0 0 120 340" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect width="120" height="340" fill="var(--color-proof)" />
      {/* флагшток и опора */}
      <line className="plate-k" x1="26" y1="16" x2="26" y2="328" stroke={K} strokeWidth="2.5" opacity="0.8" />
      <line className="plate-k" x1="14" y1="328" x2="38" y2="328" stroke={K} strokeWidth="2" opacity="0.8" />
      {/* полотно */}
      <path
        className="plate-k"
        d="M28 22 C64 20 98 42 100 84 L100 292 L28 292 Z"
        fill="none"
        stroke={K}
        strokeWidth="1"
        opacity="0.5"
      />
      {/* карман под флагшток и подгиб нижней кромки */}
      <line className="plate-k" x1="35" y1="26" x2="35" y2="292" stroke={K} strokeWidth="1" strokeDasharray="3 4" opacity="0.45" />
      <line className="plate-k" x1="28" y1="284" x2="100" y2="284" stroke={K} strokeWidth="1" strokeDasharray="3 4" opacity="0.45" />
      <Wordmark x={43.6} y={262} w={170} vertical />
    </svg>
  );
}

/* ── ФУТБОЛКА ─────────────────────────────────────────────────────────────
   На груди слово и строка «рекламное агентство» между двумя линейками: так
   логотип стоит на визитке агентства. */
export function Futbolka({ content }: Props) {
  return (
    <svg viewBox="0 0 300 320" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <path
        className="plate-k"
        d="M104 36 C122 58 178 58 196 36 L252 58 L290 118 L254 138 L238 116 L238 298 L62 298 L62 116 L46 138 L10 118 L48 58 Z"
        fill="var(--color-proof)"
        stroke={K}
        strokeWidth="1.2"
        strokeOpacity="0.55"
        strokeLinejoin="round"
      />
      {/* горловина */}
      <path className="plate-k" d="M112 40 C128 60 172 60 188 40" fill="none" stroke={K} strokeWidth="1" opacity="0.35" />
      <Wordmark x={100} y={104} w={100} />
      <Rule x={100} y={140} w={100} h={1} o={0.5} />
      <text
        className="plate-k"
        x="150"
        y="150.5"
        fill={K}
        fontSize="6"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        letterSpacing="1"
        opacity="0.8"
      >
        РЕКЛАМНОЕ АГЕНТСТВО
      </text>
      <Rule x={100} y={155} w={100} h={1} o={0.5} />
    </svg>
  );
}

/* ── НАКЛЕЙКА 1:1 ─────────────────────────────────────────────────────── */
export function Sticker({ content }: Props) {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect width="300" height="300" fill="var(--color-proof)" />
      {/* линия высечки: замкнутый пунктир */}
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
      {/* надрез на 2 мм внутрь */}
      <circle className="plate-r" cx="150" cy="150" r="102" fill="none" stroke={R} strokeWidth="1.5" />
      <MiniMark x={111.6} y={109} s={3.2} />
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

/* ── КРУЖКА ───────────────────────────────────────────────────────────── */
export function Kruzhka({ content }: Props) {
  return (
    <svg viewBox="0 0 320 260" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      {/* плоскость, на которой стоит кружка */}
      <line className="plate-k" x1="40" y1="230" x2="300" y2="230" stroke={K} strokeWidth="1" opacity="0.32" />
      {/* ручка: наружный и внутренний контур */}
      <g className="plate-k" fill="none" stroke={K} strokeWidth="1.2" opacity="0.55">
        <path d="M222 88 C272 88 280 110 280 136 C280 162 272 184 222 184" />
        <path d="M222 106 C256 106 262 120 262 136 C262 152 256 166 222 166" />
      </g>
      {/* корпус ложится поверх концов ручки */}
      <rect
        className="plate-k"
        x="72"
        y="48"
        width="150"
        height="182"
        fill="var(--color-proof)"
        stroke={K}
        strokeWidth="1.2"
        strokeOpacity="0.55"
      />
      <Rule x={72} y={58} w={150} h={1} o={0.3} />
      <Wordmark x={97} y={112} w={100} />
      <Rule x={117} y={152} w={60} h={3} cls="plate-r" fill={R} />
    </svg>
  );
}

/* ── ОТТИСК ПЕЧАТИ НА ДОКУМЕНТЕ ───────────────────────────────────────────
   Оттиск это краска формы R поверх набора формы K: печать ставят на готовый
   лист, и кольца ложатся прямо на его строки. По кольцу идёт «образец», а не
   имя и реквизиты: печать настоящей организации на макете не рисуют. */
export function Pechat({ content }: Props) {
  const lines = [210, 232, 188, 224, 160, 216, 196, 120];
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect width="300" height="300" fill="var(--color-proof)" />
      {lines.map((w, i) => (
        <Rule key={i} x={34} y={42 + i * 16} w={w} o={0.28} />
      ))}
      {/* строка подписи и сама подпись */}
      <line className="plate-k" x1="34" y1="236" x2="132" y2="236" stroke={K} strokeWidth="1" opacity="0.5" />
      <path
        className="plate-k"
        d="M44 230 C60 206 70 238 84 222 S104 214 116 228"
        fill="none"
        stroke={K}
        strokeWidth="1.2"
        opacity="0.7"
      />
      <g className="plate-r" opacity="0.9">
        <g fill="none" stroke={R}>
          <circle cx="196" cy="190" r="70" strokeWidth="2.4" />
          <circle cx="196" cy="190" r="62" strokeWidth="1" />
          <circle cx="196" cy="190" r="38" strokeWidth="1.2" />
        </g>
        <defs>
          <path id="pechat-ring" d="M146 190 a50 50 0 1 1 100 0 a50 50 0 1 1 -100 0" />
        </defs>
        <text fill={R} fontSize="8" fontFamily="var(--font-mono)">
          <textPath href="#pechat-ring" textLength="312" lengthAdjust="spacing">
            ОБРАЗЕЦ ОТТИСКА · ОБРАЗЕЦ ОТТИСКА ·
          </textPath>
        </text>
      </g>
      <Wordmark x={169} y={183.5} w={54} />
    </svg>
  );
}

/* ── ЕЖЕДНЕВНИК ───────────────────────────────────────────────────────── */
export function Ezhednevnik({ content }: Props) {
  return (
    <svg viewBox="0 0 260 368" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      {/* блок листов выглядывает из-под обложки */}
      <rect className="plate-k" x="40" y="24" width="196" height="324" fill="none" stroke={K} strokeWidth="1" opacity="0.3" />
      <rect
        className="plate-k"
        x="34"
        y="20"
        width="196"
        height="324"
        fill="var(--color-proof)"
        stroke={K}
        strokeWidth="1.2"
        strokeOpacity="0.55"
      />
      {/* корешок */}
      <Rule x={34} y={20} w={18} h={324} o={0.85} />
      <Wordmark x={73} y={150} w={120} />
      <Rule x={93} y={194} w={80} h={1} o={0.5} />
      <text
        className="plate-k"
        x="133"
        y="210"
        fill={K}
        fontSize="7"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        letterSpacing="2"
        opacity="0.7"
      >
        {content[0]?.toUpperCase()}
      </text>
      {/* резинка: акцентная линия формы R */}
      <line className="plate-r" x1="218" y1="20" x2="218" y2="344" stroke={R} strokeWidth="4" />
    </svg>
  );
}

/* ── ТАБЛИЧКА НА ДВЕРЬ ────────────────────────────────────────────────── */
export function Tablichka({ content }: Props) {
  const screws: [number, number][] = [
    [34, 34],
    [326, 34],
    [34, 186],
    [326, 186],
  ];
  return (
    <svg viewBox="0 0 360 220" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect
        className="plate-k"
        x="16"
        y="16"
        width="328"
        height="188"
        fill="var(--color-proof)"
        stroke={K}
        strokeWidth="1.2"
        strokeOpacity="0.55"
      />
      {screws.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`} className="plate-k" fill="none" stroke={K} strokeWidth="1" opacity="0.55">
          <circle cx={cx} cy={cy} r="5" />
          <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} />
        </g>
      ))}
      <Wordmark x={56} y={48} w={96} />
      <text className="plate-k" x={56} y={128} fill={K} fontSize="34" fontFamily="var(--font-display)" fontWeight="700">
        {content[0]}
      </text>
      <text className="plate-k" x={56} y={152} fill={K} fontSize="13" fontFamily="var(--font-text)" opacity="0.7">
        {content[1]}
      </text>
      <Rule x={56} y={170} w={64} h={3} cls="plate-r" fill={R} />
    </svg>
  );
}

/* ── БАННЕР 3:1 ───────────────────────────────────────────────────────────
   Тёмное полотно это грунт агентства, тёмно-синий, а не чёрный. Поле формы R
   на нём светлее обычной синей: обычная по тёмно-синему даёт 1,71:1 и
   пропадает, светлая держит 3,20:1. Числа на размерной линии нет: размеров
   баннеров агентство не называет. */
export function Banner({ content }: Props) {
  return (
    <svg viewBox="0 0 460 156" className="h-full w-full" role="img" aria-label={content.join(' ')}>
      <rect width="460" height="156" fill="var(--color-deep)" />
      <text className="plate-k" x="52" y="78" fill="var(--color-chalk)" fontSize="40" fontFamily="var(--font-display)" fontWeight="700">
        {content[0]}
      </text>
      <Rule x={52} y={94} w={150} h={3} o={0.45} fill="var(--color-chalk)" />
      <rect className="plate-r" x="336" y="52" width="76" height="52" fill="var(--color-rubine-deep)" />
      {/* размерная линия */}
      <g className="plate-k" stroke="var(--color-chalk)" strokeWidth="1" opacity="0.45">
        <line x1="22" y1="148" x2="438" y2="148" />
        <line x1="22" y1="144" x2="22" y2="152" />
        <line x1="438" y1="144" x2="438" y2="152" />
      </g>
    </svg>
  );
}

export const ARCHETYPES: Record<Archetype, (p: Props) => React.ReactElement> = {
  vizitka: Vizitka,
  flag: Flag,
  futbolka: Futbolka,
  sticker: Sticker,
  kruzhka: Kruzhka,
  pechat: Pechat,
  ezhednevnik: Ezhednevnik,
  tablichka: Tablichka,
  banner: Banner,
};
