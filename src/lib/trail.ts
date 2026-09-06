/**
 * СЛЕД КУРСОРА: одна линия за указателем.
 *
 * Системный указатель на месте и ничем не подменён. Мишеней, колец и
 * координатных выносок здесь нет: единственное, что добавлено листу, это
 * линия, которую указатель за собой тянет.
 *
 * Здесь вся арифметика и вся отрисовка. Кадр даёт единственный rAF-цикл
 * сайта, движение приходит из единственного pointermove в PlateProvider:
 * ни своего цикла, ни своего слушателя движения у следа нет и быть не может.
 *
 * ДЛИНА НЕ ЗАДАНА ЧИСЛОМ, ОНА ВЫХОДИТ ИЗ ХОДА. Линия это путь указателя за
 * последние SPAN миллисекунд, и ничего сверх того. Ведут мышь медленно:
 * остаётся короткий штрих в три десятка пикселей. Бросают через лист:
 * тянется длинная прямая. Останавливают: окно съедает хвост, линия сходится
 * в точку и гаснет сама, без отдельного правила на гашение.
 *
 * ОТСЮДА ЖЕ НЕЗАВИСИМОСТЬ ОТ ЧАСТОТЫ КАДРОВ. Геометрия считается по
 * записанному пути и по времени, а не по числу пересчётов: на 60, 144 и
 * 240 Гц линия одна и та же. Цепочка догоняющих звеньев, которой такие следы
 * пишут обычно, этого не умеет: у неё отставание звена упирается в длину
 * кадра, и на 60 Гц след выходит в полтора раза длиннее, чем на 144.
 *
 * ЦЕНА КАДРА. Одна дуга, один stroke, ноль объектов в горячем пути: путь
 * лежит в трёх типизованных кольцах. Холст чистится не целиком, а по
 * габариту прошлого кадра: линия занимает лоскут в несколько сотен
 * пикселей, а вьюпорт на плотном экране это восемь миллионов.
 */

/** Окно следа, мс. Столько времени точка пути остаётся на листе. */
const SPAN = 120;

/** Потолок длины, px. Бросок мыши иначе прочертил бы линию через весь лист. */
const MAX_LEN = 460;

/** Толщина линии, px. Постоянная: это росчерк, а не показание прибора. */
const WIDTH = 2;

/**
 * Ниже этого новая точка ничего не добавляет пути. Сравнение идёт с
 * ПОСЛЕДНЕЙ ЗАПИСАННОЙ точкой, а не с предыдущим событием: на медленном
 * ходу расстояние копится и точка ложится через одно событие, а не теряется.
 */
const MIN_STEP = 0.5;

/** Ёмкость кольца. Мышь на 1000 Гц пишет за окно 120 точек, здесь запас. */
const CAP = 192;

/** Плотность выше двух холст не окупает: линия тонкая и одноцветная. */
const MAX_DPR = 2;

/** Краска по умолчанию на случай, если холст ещё не в документе. */
const INK_FALLBACK = '#a3ec26';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

/* Путь указателя: три параллельных кольца, чтобы в кадре не рождалось ни
   одного объекта. Время держится отдельным Float64: performance.now() это
   миллисекунды от старта вкладки, и во float32 они теряют доли. */
const sx = new Float32Array(CAP);
const sy = new Float32Array(CAP);
const st = new Float64Array(CAP);
let head = -1;
let count = 0;

/* Точки текущего кадра. Их не больше, чем точек в кольце, плюс одна на
   срезанный хвост. */
const bx = new Float32Array(CAP + 1);
const by = new Float32Array(CAP + 1);

/* Габарит прошлого кадра. Стирать нечего, пока dirty ложь. */
let dirty = false;
let x0 = 0;
let y0 = 0;
let x1 = 0;
let y1 = 0;

/* Краска спрашивается у CSS и перечитывается только на смене грунта.
   Само значение объявлено на .trail: за пределами следа этой краски на
   листе нет и быть не должно. */
let ink = INK_FALLBACK;
let inkedFor: string | null = null;

/** Записывает точку пути. Единственное место, где кольцо растёт. */
function push(x: number, y: number, t: number) {
  if (count) {
    const dx = x - sx[head];
    const dy = y - sy[head];
    if (dx * dx + dy * dy < MIN_STEP * MIN_STEP) return;
  }
  head = (head + 1) % CAP;
  sx[head] = x;
  sy[head] = y;
  st[head] = t;
  if (count < CAP) count++;
}

/** Стирает прошлый кадр по его же габариту. Дважды подряд не работает. */
function wipe() {
  if (!ctx || !dirty) return;
  ctx.clearRect(x0, y0, x1 - x0, y1 - y0);
  dirty = false;
}

/**
 * Размер холста. Присвоение width и height ОЧИЩАЕТ холст и сбрасывает
 * состояние контекста, поэтому и матрица, и перо ставятся заново здесь же.
 */
function size() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineWidth = WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ink;
  dirty = false;
}

/** Ставит холст на учёт. Возвращает снятие с учёта: StrictMode зовёт дважды. */
export function attachTrail(node: HTMLCanvasElement) {
  const c = node.getContext('2d');
  if (!c) return () => {};

  canvas = node;
  ctx = c;
  count = 0;
  head = -1;
  inkedFor = null;
  size();

  /* Смена масштаба, поворот экрана и перенос окна на другой монитор приходят
     сюда же: devicePixelRatio перечитывается каждый раз. Горячим этот путь
     не бывает. */
  window.addEventListener('resize', size);

  return () => {
    window.removeEventListener('resize', size);
    canvas = null;
    ctx = null;
    count = 0;
    head = -1;
    dirty = false;
    inkedFor = null;
  };
}

/**
 * Единственный горячий путь. Зовётся из pointermove, который у сайта один
 * и живёт в PlateProvider: второго слушателя движения здесь не заводится.
 */
export function trailPointer(e: PointerEvent) {
  if (!ctx || e.pointerType === 'touch') return;

  const now = performance.now();

  /* Мышь на 1000 Гц отдаёт браузеру десяток положений между кадрами, и все
     они лежат в ОДНОМ событии. Берём их: на быстром броске путь получается
     настоящей кривой, а не хордой между двумя кадрами.
     Метки времени у склеенных событий свои, и берутся они СМЕЩЕНИЕМ от
     несущего: абсолютная шкала timeStamp не в каждом движке совпадает с
     performance.now(), а разность совпадает всегда. */
  const list = e.getCoalescedEvents?.();
  if (list && list.length > 1) {
    const base = e.timeStamp;
    for (let i = Math.max(0, list.length - CAP); i < list.length; i++) {
      const ce = list[i];
      push(ce.clientX, ce.clientY, now + (ce.timeStamp - base));
    }
    return;
  }

  push(e.clientX, e.clientY, now);
}

/**
 * Мышь ушла за край окна, окно потеряло фокус, вкладку увели в фон.
 * Путь сбрасывается ЦЕЛИКОМ, и это не уборка ради уборки: вернуться мышь
 * может в другом углу листа, и без сброса первым же кадром через весь экран
 * прочертило бы прямую из старого положения в новое.
 */
export function trailAway() {
  count = 0;
  head = -1;
  wipe();
}

/**
 * Кадр. Зовётся из единственного rAF-цикла сайта с его же меткой времени.
 */
export function trailFrame(t: number) {
  if (!ctx || count < 1) {
    wipe();
    return;
  }

  /* Событие мыши приходит ДО кадра, и метка у него бывает свежее метки
     кадра. Возраст обязан быть неотрицательным, иначе хвост считался бы
     от будущего. */
  const now = t > st[head] ? t : st[head];

  /* Голова старше окна: мышь стоит дольше, чем живёт след, и показывать
     нечего. Путь при этом сбрасывается ЦЕЛИКОМ, и это не уборка ради
     уборки. Точки в кольце пережили бы простой и достались бы следующему
     движению: первый же его кадр прочертил бы огрызок от указателя к тому
     месту, где мышь стояла минуту назад, то есть в сторону, никакого
     отношения к текущему ходу не имеющую. Кончился след, кончился и путь. */
  let age = now - st[head];
  if (age > SPAN) {
    count = 0;
    head = -1;
    wipe();
    return;
  }

  bx[0] = sx[head];
  by[0] = sy[head];
  let n = 1;
  let len = 0;
  let i = head;
  let minX = bx[0];
  let maxX = bx[0];
  let minY = by[0];
  let maxY = by[0];

  /* Идём от указателя в прошлое, пока не кончится один из двух бюджетов:
     время окна или потолок длины. Кончился на середине отрезка, значит
     отрезок и режется по середине: без этого хвост дёргался бы на целую
     точку всякий раз, когда очередная выпадает из окна. */
  for (let k = 0; k < count - 1; k++) {
    const j = (i + CAP - 1) % CAP;
    const nextAge = now - st[j];
    const dx = sx[j] - sx[i];
    const dy = sy[j] - sy[i];
    const seg = Math.hypot(dx, dy);

    let u = 1;
    if (nextAge > SPAN && nextAge > age) u = (SPAN - age) / (nextAge - age);
    if (len + seg > MAX_LEN && seg > 0) {
      const v = (MAX_LEN - len) / seg;
      if (v < u) u = v;
    }
    if (u < 0) u = 0;

    const x = sx[i] + dx * u;
    const y = sy[i] + dy * u;
    bx[n] = x;
    by[n] = y;
    n++;
    if (x < minX) minX = x;
    else if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    else if (y > maxY) maxY = y;

    if (u < 1) break;

    len += seg;
    age = nextAge;
    i = j;
  }

  wipe();
  if (n < 2) return;

  /* Краска перечитывается только на смене грунта: getComputedStyle
     заставляет браузер досчитать стили, и в каждом кадре это встало бы
     поперёк прокрутки. Сравнение строк дешевле пересчёта на три порядка. */
  const ground = document.documentElement.dataset.ground ?? '';
  if (ground !== inkedFor && canvas) {
    inkedFor = ground;
    ink = getComputedStyle(canvas).getPropertyValue('--trail-ink').trim() || INK_FALLBACK;
    ctx.strokeStyle = ink;
  }

  /* Кривая по серединам отрезков: точки пути идут в контрольные, а перо
     ведётся через середины. Ломаная на медленном ходу иначе показывала бы
     каждый излом частоты опроса мыши. Концы при этом остаются ровно там,
     где стоял указатель: первый узел это он сам. */
  ctx.beginPath();
  ctx.moveTo(bx[0], by[0]);
  for (let m = 1; m < n - 2; m++) {
    ctx.quadraticCurveTo(bx[m], by[m], (bx[m] + bx[m + 1]) / 2, (by[m] + by[m + 1]) / 2);
  }
  ctx.quadraticCurveTo(bx[n - 2], by[n - 2], bx[n - 1], by[n - 1]);
  ctx.stroke();

  /* Габарит под стирание. Дуга целиком лежит в выпуклой оболочке своих
     контрольных точек, а контрольные это те же узлы пути, поэтому оболочки
     ломаной хватает. Поле в половину пера плюс пиксель на сглаживание. */
  const pad = WIDTH / 2 + 1.5;
  x0 = minX - pad;
  y0 = minY - pad;
  x1 = maxX + pad;
  y1 = maxY + pad;
  dirty = true;
}
