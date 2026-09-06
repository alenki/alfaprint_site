/**
 * ВЫКЛЮЧКА ЗАГОЛОВКА ПО ОСИ ШИРИНЫ.
 *
 * Наборщик выключал строку в формат, подбирая литеры, а не растягивая
 * пробелы и не меняя кегль от строки к строке. Переменная ось wdth
 * 62.5…100 у Noto Serif Display позволяет сделать ровно это: каждая строка
 * дотягивается до меры собственным рисунком буквы.
 *
 * Единственное место на сайте, где текст измеряется.
 *
 * ── ЧТО ИЗМЕНИЛОСЬ В РЕДАКЦИИ «ВО ВЕСЬ ЛИСТ» ─────────────────────────────
 * Прежняя версия умела только сжимать: строку, которая не достаёт до меры
 * даже на самой широкой литере, она оставляла короткой. Пока мера равнялась
 * колонке в 1680 px, это было незаметно. На формате во весь вьюпорт коротка
 * оказывается КАЖДАЯ строка, и заголовок повисает в левой половине листа
 * рваным столбиком. Это и есть разница между «во весь лист» и «растянуто».
 *
 * Поэтому кегль теперь ищется, а не принимается. Для одного общего кегля S
 * блок выключается тогда и только тогда, когда для каждой строки i
 *
 *      S · ширина_i(wdth=100)  ≥  мера     (строку есть чем дотянуть)
 *      S · ширина_i(wdth=62.5) ≤  мера     (строка не вылезет за формат)
 *
 * Нижнюю границу задаёт самая КОРОТКАЯ строка, верхнюю самая ДЛИННАЯ.
 * Внутри этого отрезка кегль свободен, и мы берём тот, что назначен в CSS:
 * макетный кегль побеждает, пока он вообще возможен. Отрезок пуст только
 * тогда, когда строки различаются длиннее, чем позволяет ось (1 : 1,6);
 * тогда берём верхнюю границу: вылезшая за обрез строка это брак, а короткая
 * всего лишь ragged, и наборщик выбирал ragged.
 */

const MIN_WDTH = 62.5;
const MAX_WDTH = 100;
const ITERATIONS = 12;
const TOLERANCE = 0.5;

/** Пределы, за которые подбор кегля не выходит даже ради идеальной выключки. */
const MIN_SCALE = 0.62;
const MAX_SCALE = 1.48;

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

export type Style = {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  letterSpacing: string;
};

/**
 * Трекинг приходит из getComputedStyle в пикселях, то есть уже привязанным
 * к текущему кеглю. Если оставить его так, измерение перестанет быть линейным
 * по кеглю, и весь подбор поедет. Переводим обратно в em.
 */
function trackingEm(style: Style, basePx: number): number {
  const ls = parseFloat(style.letterSpacing);
  if (!Number.isFinite(ls) || basePx <= 0) return 0;
  return ls / basePx;
}

function measure(text: string, wdth: number, family: string, weight: string, sizePx: number, trackEm: number): number {
  const el = getProbe();
  el.style.fontFamily = family;
  el.style.fontWeight = weight;
  el.style.fontSize = `${sizePx}px`;
  el.style.letterSpacing = `${trackEm}em`;
  el.style.fontVariationSettings = `"wdth" ${wdth}`;
  el.textContent = text;
  return el.getBoundingClientRect().width;
}

export type JustifyResult = { wdth: number[]; scale: number };

/**
 * Возвращает ширину литеры для каждой строки и общий множитель кегля.
 * Кегль у всех строк один: разный кегль на соседних строках это лесенка,
 * а не выключенный блок.
 */
export function justifyLines(lines: string[], target: number, style: Style): JustifyResult {
  if (!lines.length || target <= 0) return { wdth: lines.map(() => MAX_WDTH), scale: 1 };

  const basePx = parseFloat(style.fontSize) || 16;
  if (basePx <= 0) return { wdth: lines.map(() => MAX_WDTH), scale: 1 };

  const { fontFamily: family, fontWeight: weight } = style;
  const track = trackingEm(style, basePx);
  const at = (text: string, wdth: number, sizePx: number) =>
    measure(text, wdth, family, weight, sizePx, track);

  /* ── ПЕРВЫЙ ПРОХОД: отрезок допустимых кеглей ───────────────────────────
     Измеряем на макетном кегле; ширина линейна по кеглю, поэтому дальше
     достаточно арифметики, а не новых измерений. */
  let lo = 0; // кегль, ниже которого самая короткая строка уже не дотянется
  let hi = Infinity; // кегль, выше которого самая длинная вылезет за формат

  for (const line of lines) {
    const wide = at(line, MAX_WDTH, basePx);
    const narrow = at(line, MIN_WDTH, basePx);
    if (wide > 0) lo = Math.max(lo, (target / wide) * basePx);
    if (narrow > 0) hi = Math.min(hi, (target / narrow) * basePx);
  }

  /* Макетный кегль побеждает, пока он вообще лежит в отрезке. Пустой отрезок
     разрешаем в пользу верхней границы: за обрез не вылезаем никогда. */
  let sizePx = hi < lo ? hi : Math.min(Math.max(basePx, lo), hi);

  const scale = Math.min(Math.max(sizePx / basePx, MIN_SCALE), MAX_SCALE);
  sizePx = basePx * scale;

  /* ── ВТОРОЙ ПРОХОД: ширина литеры под каждую строку ─────────────────────
     Меряем уже на итоговом кегле, иначе выключка разъедется. */
  const wdth: number[] = [];

  for (const line of lines) {
    if (at(line, MAX_WDTH, sizePx) < target - TOLERANCE) {
      // Даже самая широкая литера не достаёт: строка остаётся ragged.
      wdth.push(MAX_WDTH);
      continue;
    }
    if (at(line, MIN_WDTH, sizePx) > target + TOLERANCE) {
      // Даже самая узкая не влезает: жмём до предела, за обрез не пускаем.
      wdth.push(MIN_WDTH);
      continue;
    }

    let a = MIN_WDTH;
    let b = MAX_WDTH;
    let best = MAX_WDTH;
    for (let i = 0; i < ITERATIONS; i++) {
      const mid = (a + b) / 2;
      const w = at(line, mid, sizePx);
      best = mid;
      if (Math.abs(w - target) < TOLERANCE) break;
      if (w > target) b = mid;
      else a = mid;
    }
    wdth.push(best);
  }

  return { wdth, scale };
}
