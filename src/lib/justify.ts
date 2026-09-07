/**
 * ВЫКЛЮЧКА ЗАГОЛОВКА ПО ОСИ ШИРИНЫ.
 *
 * Наборщик выключал строку в формат, подбирая литеры, а не растягивая
 * пробелы и не меняя кегль от строки к строке. Переменная ось wdth даёт
 * сделать ровно это: каждая строка дотягивается до меры собственным
 * рисунком буквы.
 *
 * Единственное место на сайте, где текст измеряется.
 *
 * ── ГАРНИТУРЫ ПОД ЭТОТ МЕХАНИЗМ СЕЙЧАС НЕТ ───────────────────────────────
 * Ось 62.5…100 брали у Noto Serif Display, а она снята с листа вместе со
 * всей антиквой, см. `fonts.ts`. Дисплейная гарнитура теперь Golos Text,
 * и оси ширины у неё нет вовсе. Пределы ниже это пределы ТОЙ оси; ось
 * осталась только у Martian Mono (75…112.5), и на неё числа не переносятся.
 * Код оставлен рабочим и никем не вызывается: `fitBlock` ниже считает
 * геометрию построенных литер и меры не измеряет. Полосе, которой
 * понадобится настоящая выключка, придётся сначала вернуть на лист
 * гарнитуру с осью ширины и заново снять MIN_WDTH и MAX_WDTH.
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
  /**
   * РЕГИСТР ЗАДАЁТ ВЁРСТКА, А МЕРЯЕТ ЕГО ЗАМЕР. Шапка §01 набрана прописными
   * через `text-transform`, и прописные шире строчных на четверть. Не передать
   * это в пробник значит мерить «Альфа», а печатать «АЛЬФА»: кегль подберётся
   * по чужой ширине, и набор уйдёт за меру ровно на эту четверть.
   */
  textTransform: string;
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

function measure(
  text: string,
  wdth: number,
  family: string,
  weight: string,
  sizePx: number,
  trackEm: number,
  transform: string
): number {
  const el = getProbe();
  el.style.fontFamily = family;
  el.style.fontWeight = weight;
  el.style.fontSize = `${sizePx}px`;
  el.style.letterSpacing = `${trackEm}em`;
  el.style.textTransform = transform;
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

  const { fontFamily: family, fontWeight: weight, textTransform: caps } = style;
  const track = trackingEm(style, basePx);
  const at = (text: string, wdth: number, sizePx: number) =>
    measure(text, wdth, family, weight, sizePx, track, caps);

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

/* ═══════════════════════════════════════════════════════════════════════════
   ВТОРОЙ СПОСОБ НАБОРА ЗАГОЛОВКА: АФИША.

   `justifyLines` тянет В ФОРМАТ КАЖДУЮ строку, подбирая ширину литеры, и
   отдаёт плотный прямоугольник набора. Он верен там, где заголовок это фраза:
   у фразы нет главного слова, и торчащая строка читалась бы браком.

   `fitBlock` набирает ИМЯ. У имени главное слово есть, и строки заведомо
   разной длины: «Альфа», «Принт». Тянуть каждую в формат
   значит растянуть пятибуквенное слово на всю полосу и потерять его рисунок.
   Поэтому кегль здесь ОДИН на все строки и подобран так, что меры достаёт
   САМАЯ ДЛИННАЯ; короткие ложатся своей натуральной шириной, и справа от них
   открывается пустота, в которой живёт всё остальное, что стоит на полосе.
   Ось ширины не трогается вовсе: рисунок литеры один на весь блок.

   ВЫСОТА ЗДЕСЬ ТАКОЕ ЖЕ ОГРАНИЧЕНИЕ, ЧТО И МЕРА. Блок обязан уместиться в
   свою полосу целиком, поэтому кегль ищется по двум границам сразу. Уступает
   сначала ИНТЕРЛИНЬЯЖ, и только потом кегль: наборщик поджимает строки
   прежде, чем разжаловать кегль, а на афише строки и должны стоять теснее
   собственного роста. Когда поджимать больше некуда, кегль сдаёт, и самая
   длинная строка не доходит до правого реза; это цена высоты, и платится она
   только на низких окнах.
   ═══════════════════════════════════════════════════════════════════════════ */

export type BlockFit = {
  /** Перенос, который выиграл замер. */
  lines: string[];
  sizePx: number;
  leading: number;
  /**
   * Ширина каждой строки на найденном кегле, ПО НАБОРУ И ТОЛЬКО ПО НЕМУ:
   * хвост (`BlockBox.tailEm`) сюда не входит. Из последней из них вёрстка
   * отмеряет место предмету, который на этой строке стоит, и потому ставит
   * его верно при любом кегле и на любом окне. Мерить её второй раз в
   * вёрстке было бы второй правдой об одной величине.
   */
  widths: number[];
};

export type BlockBox = {
  /** Высота полосы, отведённой блоку. 0 значит «не ограничивать». */
  maxHeightPx: number;
  /** Интерлиньяж, с которого начинается подбор. */
  leadingMax: number;
  /** Теснее этого строки не ставятся ни при какой высоте. */
  leadingMin: number;
  /**
   * Поле под маску ракеля сверху и снизу, в долях кегля. В высоту блока оно
   * входит наравне со строками, и забыть его значит промахнуться мимо полосы
   * ровно на две доли кегля: при 0,28 это больше половины строки.
   */
  padEm: number;
  /**
   * ХВОСТ ПОСЛЕДНЕЙ СТРОКИ, в долях кегля: место, которое на ней занимает не
   * набор, а предмет. В §01 это звёздчатая мишень с печатью, и до реза
   * достаёт не слово, а слово ВМЕСТЕ С НИМИ.
   *
   * В меру хвост входит наравне с очком, и забыть его значит увести печать за
   * рез. В ВЫСОТУ он не входит: предмет стоит на той же строке, а не под ней.
   *
   * Отсюда же берётся воздух полосы, когда последняя строка И ЕСТЬ самая
   * длинная: хвост отнимает у кегля свою долю меры, набор садится мельче, и
   * высвободившаяся высота становится пустотой над набором. Пустота при этом
   * не назначена числом, а стоит ровно столько, сколько стоит предмет:
   * назначить её значило бы завести вторую правду о композиции.
   *
   * Не самая длинная, значит доля просто не связывает, и хвост кончается
   * раньше реза наравне с любой короткой строкой. Так в §01 и стоит с тех
   * пор, как с набора сняли третью строку: до реза достаёт «Альфа».
   */
  tailEm?: number;
  /**
   * ЧЕМ МЕРИТЬ СТРОКУ. По умолчанию гарнитурой, тем же пробником в документе,
   * которым меряет `justifyLines`.
   *
   * Шапка §01 передаёт сюда свою меру. Она печатается не гарнитурой, а
   * формами логотипа, и ширина слова там не меряется вовсе: она СЧИТАЕТСЯ по
   * местам букв, которые известны точно. Замер от этого перестаёт зависеть от
   * `document.fonts.ready` и попадает в меру с первого прохода, ещё до того,
   * как страница успела бы показать подменный рисунок.
   *
   * Линейность по кеглю остаётся условием: подбор делает на ней всю
   * арифметику и второй раз строку не меряет.
   *
   * СТРОКА ПРИХОДИТ СО СВОИМ ПЕРЕНОСОМ, третьим доводом. Ширина строки
   * бывает зависимой от того, с кем она стоит: шапка §01 выключает имя в блок,
   * и разрядка короткой строки считается там от самой длинной (см.
   * `logotypeBlock`). Мерить такую строку порознь значило бы мерить не то, что
   * печатается.
   */
  measure?: (line: string, basePx: number, set: readonly string[]) => number;
};

/**
 * ПЕРЕНОС ВЫБИРАЕТ ЗАМЕР, А НЕ МЕДИАЗАПРОС.
 *
 * Авторских переносов у блока несколько, и решает между ними правило
 * наборщика: берётся тот, при котором строка ДОСТАЁТ ДО РЕЗА и кегль при
 * этом крупнее. Если до реза не достаёт ни один, берётся просто самый
 * крупный: короткая строка это ragged, а мелкий набор на пустом листе это
 * брак.
 *
 * Отсюда сама собой выходит и «мобильная версия», которой здесь нет. На
 * узкой мере трёхстрочный перенос упирается в меру и оставляет две трети
 * полосы пустыми; перенос с отбивкой слова упирается в неё же, но кеглем
 * вдвое крупнее, и выигрывает. На развороте всё наоборот: он упирается в
 * высоту, теряет кегль и проигрывает. Ни одного порога в пикселях.
 */
export function fitBlock(
  sets: readonly (readonly string[])[],
  target: number,
  style: Style,
  box: BlockBox
): BlockFit {
  const basePx = parseFloat(style.fontSize) || 16;
  const first = [...(sets[0] ?? [])];
  const fallback = { lines: first, sizePx: basePx, leading: box.leadingMax, widths: [] };
  if (!sets.length || target <= 0 || basePx <= 0) return fallback;

  const { fontFamily: family, fontWeight: weight, textTransform: caps } = style;
  const track = trackingEm(style, basePx);
  const pad = box.padEm * 2;

  let best: (BlockFit & { full: boolean }) | null = null;

  for (const set of sets) {
    const lines = [...set];
    if (!lines.length) continue;

    /* Ширина линейна по кеглю, поэтому одного замера на строку хватает на
       весь подбор: дальше только арифметика. */
    const width =
      box.measure ??
      ((line: string, size: number) => measure(line, MAX_WDTH, family, weight, size, track, caps));
    const raw = lines.map((line) => width(line, basePx, lines));

    /* Хвост линеен по кеглю ровно так же, как набор, поэтому он и объявлен в
       долях кегля: на базовом кегле он занимает tail * basePx, и в подбор
       уходит той же арифметикой, без второго замера. Меру ищем по СОСТАВНОЙ
       последней строке, а `widths` наружу отдаём по НАБОРУ: хвост это
       ограничение меры, а не ширина строки, и смешать их значит вписать
       ширину печати в то место, от которого печать отмеряет своё. */
    const tail = (box.tailEm ?? 0) * basePx;
    const last = lines.length - 1;
    const widest = Math.max(...raw.map((w, i) => (i === last ? w + tail : w)));
    if (widest <= 0) continue;

    const n = lines.length;
    const tall = (size: number, lh: number) => size * (lh * n + pad);

    const sizeForMeasure = (target / widest) * basePx;
    let sizePx = sizeForMeasure;
    let leading = box.leadingMax;

    if (box.maxHeightPx > 0 && tall(sizePx, leading) > box.maxHeightPx) {
      // Сначала строки, потом кегль.
      leading = Math.max(box.leadingMin, (box.maxHeightPx / sizePx - pad) / n);
      if (tall(sizePx, leading) > box.maxHeightPx) {
        sizePx = box.maxHeightPx / (leading * n + pad);
      }
    }

    // Достала ли самая длинная строка до реза. Допуск в полпикселя: за ним
    // стоит округление замера, а не рваный край.
    const full = sizePx >= sizeForMeasure - TOLERANCE / widest;
    const win =
      !best || (full && !best.full) || (full === best.full && sizePx > best.sizePx + 0.5);
    if (win) {
      const k = sizePx / basePx;
      best = { lines, sizePx, leading, full, widths: raw.map((w) => w * k) };
    }
  }

  if (!best) return fallback;
  return { lines: best.lines, sizePx: best.sizePx, leading: best.leading, widths: best.widths };
}
