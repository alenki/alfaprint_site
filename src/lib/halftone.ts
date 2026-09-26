/**
 * РАСТРИРОВАНИЕ.
 *
 * Исходное поле это не «мягкие радиальные заливки» (это запрещённый blob),
 * а имя фирмы, «Legko», разложенное на две формы. То есть демонстрация того,
 * чем занимается печать, а не орнамент.
 *
 * Каждый холст рисуется РОВНО ОДИН РАЗ. После загрузки страницы в профиле
 * не должно оставаться ни одного вызова arc().
 */

export type ScreenOptions = {
  /** Шаг растровой решётки в CSS-пикселях. */
  pitch: number;
  /** Угол экрана: у K это 45°, у R это 15°. Разница 30° и даёт розетку. */
  angle: number;
  colour: string;
  word: string;
  /** Множитель кегля слова относительно высоты холста. */
  fit?: number;
  /** Доля высоты, на которой стоит средняя линия слова. 0.5 это по центру. */
  anchorY?: number;
  /**
   * Увеличение оттиска относительно общего плана, вокруг центра холста.
   *
   * Лупа обязана показывать ТО ЖЕ изображение крупнее, а не то же изображение
   * более грубым растром. Прежняя редакция просто рисовала поле шагом 42
   * вместо 7: картинка оставалась в натуральную величину, и вместо розетки
   * получались кляксы. Настоящее увеличение это чтение исходного поля в
   * шесть раз ближе к центру ПЛЮС шаг 7 × 6 = 42: тогда и линиатура, и углы
   * остаются теми же, просто оттиск ближе к глазу.
   */
  zoom?: number;
};

/** Снимает яркость слова в буфер низкого разрешения. */
function buildField(
  w: number,
  h: number,
  word: string,
  fontFamily: string,
  fit: number,
  anchorY: number
) {
  const SCALE = 6; // читаем в шесть раз мельче, полутона всё равно есть
  const fw = Math.max(1, Math.round(w / SCALE));
  const fh = Math.max(1, Math.round(h / SCALE));

  const off = document.createElement('canvas');
  off.width = fw;
  off.height = fh;
  const ctx = off.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, fw, fh);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let size = fh * fit;
  ctx.font = `800 ${size}px ${fontFamily}`;
  const target = fw * 0.9;
  const measured = ctx.measureText(word).width;
  if (measured > 0 && measured > target) {
    size = size * (target / measured);
    ctx.font = `800 ${size}px ${fontFamily}`;
  }
  ctx.fillText(word, fw / 2, fh * anchorY);

  // Линейная рампа 12 % сверху вниз, чтобы полутона существовали и вне букв.
  const grad = ctx.createLinearGradient(0, 0, 0, fh);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(255,255,255,0.12)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, fw, fh);

  const data = ctx.getImageData(0, 0, fw, fh).data;
  return {
    at(x: number, y: number) {
      const px = Math.min(fw - 1, Math.max(0, Math.round(x / SCALE)));
      const py = Math.min(fh - 1, Math.max(0, Math.round(y / SCALE)));
      return data[(py * fw + px) * 4] / 255;
    },
  };
}

/** Рисует один растровый экран. Возвращает число точек, нужное для бюджета. */
export function drawScreen(
  canvas: HTMLCanvasElement,
  { pitch, angle, colour, word, fit = 0.72, anchorY = 0.5, zoom = 1 }: ScreenOptions
): number {
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const family = getComputedStyle(canvas).fontFamily || 'system-ui, sans-serif';
  const field = buildField(w, h, word, family, fit, anchorY);
  if (!field) return 0;

  const a = (angle * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const diag = Math.hypot(w, h);
  const rMax = pitch * 0.72;

  ctx.fillStyle = colour;
  let dots = 0;

  for (let u = -diag; u < diag; u += pitch) {
    for (let v = -diag; v < diag; v += pitch) {
      const x = w / 2 + u * cos - v * sin;
      const y = h / 2 + u * sin + v * cos;
      if (x < -pitch || y < -pitch || x > w + pitch || y > h + pitch) continue;

      // Увеличение читается из исходного поля, а не из готового растра:
      // растрируем то, что видно в лупу, а не увеличиваем сами точки.
      const L =
        zoom === 1
          ? field.at(x, y)
          : field.at((x - w / 2) / zoom + w / 2, (y - h / 2) / zoom + h / 2);
      // Настоящий рост точки: площадь пропорциональна плотности краски.
      const r = rMax * Math.sqrt(L);
      if (r < 0.15) continue;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      dots++;
    }
  }

  return dots;
}

/** Ждёт шрифт, потом рисует в простое, чтобы не соревноваться с загрузкой. */
export function drawWhenIdle(fn: () => void) {
  const go = () => {
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
      .requestIdleCallback;
    if (ric) ric(fn);
    else setTimeout(fn, 1);
  };
  Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, 900)),
  ]).then(go);
}
