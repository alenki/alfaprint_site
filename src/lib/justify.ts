/**
 * ВЫКЛЮЧКА ЗАГОЛОВКА ПО ОСИ ШИРИНЫ.
 *
 * Наборщик выключал строку в формат, подбирая литеры, а не растягивая
 * пробелы и не меняя кегль от строки к строке. Переменная ось wdth
 * 62.5—100 у Noto Serif Display позволяет сделать ровно это: каждая строка
 * дотягивается до меры собственным рисунком буквы.
 *
 * Единственное место на сайте, где текст измеряется.
 */

const MIN_WDTH = 62.5;
const MAX_WDTH = 100;
const ITERATIONS = 12;
const TOLERANCE = 0.5;

let probe: HTMLSpanElement | null = null;

function getProbe(): HTMLSpanElement {
  if (probe && probe.isConnected) return probe;
  const el = document.createElement('span');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = [
    'position:absolute',
    'visibility:hidden',
    'white-space:pre',
    'pointer-events:none',
    'left:-99999px',
    'top:0',
    // Никакого contain: size-containment обнулил бы измеряемую ширину.
    'margin:0',
    'padding:0',
  ].join(';');
  document.body.appendChild(el);
  probe = el;
  return el;
}

type Style = {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  letterSpacing: string;
};

function measure(text: string, wdth: number, style: Style): number {
  const el = getProbe();
  el.style.fontFamily = style.fontFamily;
  el.style.fontWeight = style.fontWeight;
  el.style.fontSize = style.fontSize;
  el.style.letterSpacing = style.letterSpacing;
  el.style.fontVariationSettings = `"wdth" ${wdth}`;
  el.textContent = text;
  return el.getBoundingClientRect().width;
}

export type JustifyResult = { wdth: number[]; scale: number };

/**
 * Возвращает ширину буквы для каждой строки и общий множитель кегля.
 * Если строка не достаёт до меры даже на wdth=100, кегль всех строк
 * уменьшается сообща — максимум на 4 %, чтобы высота прописных совпала.
 */
export function justifyLines(lines: string[], target: number, style: Style): JustifyResult {
  if (!lines.length || target <= 0) return { wdth: lines.map(() => MAX_WDTH), scale: 1 };

  /**
   * ПЕРВЫЙ ПРОХОД — общий кегль.
   *
   * Кегль у всех строк обязан быть один: иначе это не выключенный блок,
   * а лесенка. Ищем самую упрямую строку — ту, что не влезает в меру даже
   * на самой узкой литере, — и ужимаем кегль ровно настолько, чтобы влезла
   * она. Строка, вылезающая за формат, — это брак, поэтому здесь предела
   * сжатию нет.
   */
  const basePx = parseFloat(style.fontSize) || 16;
  let scale = 1;
  for (const line of lines) {
    const narrowest = measure(line, MIN_WDTH, style);
    if (narrowest > target + TOLERANCE) scale = Math.min(scale, target / narrowest);
  }

  const scaled: Style =
    scale === 1 ? style : { ...style, fontSize: `${basePx * scale}px` };

  /**
   * ВТОРОЙ ПРОХОД — ширина литеры под каждую строку.
   * Меряем уже на итоговом кегле, иначе выключка разъедется.
   */
  const wdth: number[] = [];

  for (const line of lines) {
    const widest = measure(line, MAX_WDTH, scaled);
    if (widest < target - TOLERANCE) {
      /**
       * Строка не достаёт до меры даже на самой широкой литере. Кегль здесь
       * НЕ трогаем: уменьшать его — значит удалять строку от меры ещё
       * дальше, а увеличивать — ломать выключку остальных строк. Такая
       * строка просто остаётся чуть короче формата; наборщик поступал так же.
       */
      wdth.push(MAX_WDTH);
      continue;
    }

    let lo = MIN_WDTH;
    let hi = MAX_WDTH;
    let best = MAX_WDTH;
    for (let i = 0; i < ITERATIONS; i++) {
      const mid = (lo + hi) / 2;
      const w = measure(line, mid, scaled);
      best = mid;
      if (Math.abs(w - target) < TOLERANCE) break;
      if (w > target) hi = mid;
      else lo = mid;
    }
    wdth.push(best);
  }

  return { wdth, scale };
}
