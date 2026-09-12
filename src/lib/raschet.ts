/**
 * АРИФМЕТИКА ПРЕДВАРИТЕЛЬНОГО РАСЧЁТА.
 *
 * Формула перенесена с прежнего сайта агентства ПОСИМВОЛЬНО, вместе с обоими
 * порогами и с порядком действий:
 *
 *   run   = max(product.min, qty × product.base) × материал × формат × срок
 *   setup = отделка + макет + получение + дополнительные работы
 *   итог  = max(900, run + setup)
 *
 * Минимум продукта стоит ДО множителей, порог 900 ₽ ПОСЛЕ всего. Это не описка
 * исходника: это его поведение, и оно проверяется полным перебором в
 * `scripts/check-raschet.mjs`.
 *
 * В ЭТОМ ФАЙЛЕ НЕТ НИ ОДНОГО ИМПОРТА ВРЕМЕНИ ВЫПОЛНЕНИЯ, и это условие, а не
 * совпадение: проверка грузит его голым `node`, без сборщика и без разрешения
 * псевдонима `@/`. Любой `import` кроме `import type` ломает проверку.
 */

export type Option = { readonly label: string; readonly value: number };
export type ExtraOption = Option & { readonly id: string };

export type Product = {
  readonly id: string;
  readonly title: string;
  /** Ставка за штуку, ₽. */
  readonly base: number;
  /** Минимальная сумма тиража, ₽. Порог берётся ДО множителей. */
  readonly min: number;
  /** Множители. */
  readonly materials: readonly Option[];
  readonly formats: readonly Option[];
  /** Слагаемые, ₽. */
  readonly finishes: readonly Option[];
  readonly rec: string;
};

export type Shared = {
  readonly design: readonly Option[];
  readonly speed: readonly Option[];
  readonly delivery: readonly Option[];
  readonly extras: readonly ExtraOption[];
};

/** Выбор читателя. Варианты хранятся НОМЕРОМ в списке своего продукта. */
export type Choice = {
  readonly productId: string;
  readonly qty: number;
  readonly material: number;
  readonly format: number;
  readonly finish: number;
  readonly design: number;
  readonly speed: number;
  readonly delivery: number;
  readonly extras: readonly string[];
};

export const PRICE_FLOOR = 900;
export const RUSH_OVER = 1.3;

/** То, что множится на каждый экземпляр. Без округления. */
export function runTotal(p: Product, c: Choice, sh: Shared): number {
  const run = Math.max(p.min, c.qty * p.base);
  return run * p.materials[c.material].value * p.formats[c.format].value * sh.speed[c.speed].value;
}

/** То, что платится один раз. Всегда целое число рублей. */
export function setupTotal(p: Product, c: Choice, sh: Shared): number {
  let n = p.finishes[c.finish].value + sh.design[c.design].value + sh.delivery[c.delivery].value;
  for (const e of sh.extras) if (c.extras.includes(e.id)) n += e.value;
  return n;
}

/**
 * ВАЖНО: это НЕ `runTotal(...) + setupTotal(...)`. У оракула прежнего сайта
 * одна цепочка сложений слева направо: тираж, затем отделка, макет,
 * получение и дополнительные работы по очереди, без промежуточного
 * округления суммы отделки. Сложение чисел с плавающей точкой не
 * ассоциативно: если сначала свернуть отделку+макет+получение+допы в
 * отдельное число (как делает `setupTotal`) и прибавить его целиком, итог на
 * ~0,26 % сочетаний (проверено полным перебором) расходится с оракулом в
 * последнем разряде — до ~6×10⁻¹¹, на округлённую до рубля цену это не
 * влияет, но точному сравнению в `scripts/check-raschet.mjs` этого хватает,
 * чтобы не сойтись. Поэтому здесь та же цепочка сложений, что и в
 * `window.calc`, а не сумма двух готовых слагаемых. `runTotal` и
 * `setupTotal` при этом не трогаем: они по-прежнему нужны отдельно — под
 * тираж и под приладку — и сами по себе верны.
 */
export function grandTotal(p: Product, c: Choice, sh: Shared): number {
  let price = runTotal(p, c, sh);
  price = price + p.finishes[c.finish].value + sh.design[c.design].value + sh.delivery[c.delivery].value;
  for (const e of sh.extras) if (c.extras.includes(e.id)) price += e.value;
  return Math.max(PRICE_FLOOR, price);
}

export type TermKey = 'rush' | 'slow' | 'normal';

export function termKey(p: Product, c: Choice, sh: Shared, slow: readonly string[]): TermKey {
  if (sh.speed[c.speed].value > RUSH_OVER) return 'rush';
  return slow.includes(p.id) ? 'slow' : 'normal';
}

/**
 * Рубль с неразрывным пробелом в разрядах. `toLocaleString('ru-RU')` отдаёт
 * U+00A0 почти везде, но отдельные сборки ICU ставят узкий U+202F, а на этом
 * листе разряды отбиты именно U+00A0 (см. `COMPANY.orders`). Замена на месте.
 */
export function formatRub(n: number): string {
  return Math.round(n).toLocaleString('ru-RU').replace(/\u202F/g, '\u00A0') + '\u00A0₽';
}
