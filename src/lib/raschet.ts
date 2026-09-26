/**
 * НАРЯД ЛИСТА «ЗАКАЗ»: типы, счёт тиража и текст сообщения.
 *
 * АРИФМЕТИКИ ЦЕНЫ ЗДЕСЬ НЕТ, И ЭТО НЕ ПРОПУСК. Цен, сроков и условий
 * доставки агентства мы не знаем, поэтому лист ничего не считает: он
 * собирает наряд, а цену и срок агентство называет в ответ на него.
 * Прежняя формула со ставками, множителями и порогом снята целиком, вместе
 * с частицей «от» и рублём.
 *
 * В ЭТОМ ФАЙЛЕ НЕТ НИ ОДНОГО ИМПОРТА ВРЕМЕНИ ВЫПОЛНЕНИЯ, и это условие, а не
 * совпадение: проверка `scripts/check-raschet.mjs` грузит его голым `node`,
 * без сборщика и без разрешения псевдонима `@/`. Любой `import` кроме
 * `import type` ломает проверку.
 */

/** Вариант в панели. Только имя: чисел у вариантов больше нет. */
export type Option = { readonly label: string };

export type Product = {
  readonly id: string;
  readonly title: string;
  /** Виды изделия. Только те, что назвало само агентство, иначе вопрос о
   *  положении заказчика. Не длиннее пяти: столько держит резерв колонки. */
  readonly kinds: readonly Option[];
};

/** Строки, общие для всех услуг. */
export type Shared = {
  readonly size: readonly Option[];
  readonly design: readonly Option[];
  readonly speed: readonly Option[];
};

/** Выбор читателя. Варианты хранятся НОМЕРОМ в своём списке. */
export type Choice = {
  readonly productId: string;
  readonly qty: number;
  readonly kind: number;
  readonly size: number;
  readonly design: number;
  readonly speed: number;
};

/**
 * Тираж с неразрывным пробелом в разрядах: «10 000», а не «10000».
 * `toLocaleString('ru-RU')` отдаёт U+00A0 почти везде, но отдельные сборки
 * ICU ставят узкий U+202F, а на этом листе разряды отбиты именно U+00A0.
 * Замена на месте.
 */
export function formatQty(n: number): string {
  return Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
}

/** Ровно те подписи, которые нужны сообщению. Структурный тип: импорта нет. */
export type MessageCopy = {
  readonly waOpen: string;
  readonly waTail: string;
  readonly fields: {
    readonly qty: string;
    readonly kind: string;
    readonly size: string;
    readonly design: string;
    readonly speed: string;
  };
  readonly qtyUnit: string;
};

/**
 * НАРЯД ТЕКСТОМ. Пустой чат заставил бы агентство спрашивать всё заново,
 * поэтому в переписку уходит весь выбор строкой на параметр. Ничего никуда
 * не отправляется, открывается WhatsApp: врать в подтверждении нечем.
 */
export function raschetMessage(p: Product, c: Choice, sh: Shared, copy: MessageCopy): string {
  const f = copy.fields;
  return [
    copy.waOpen,
    p.title,
    `${f.qty}: ${c.qty} ${copy.qtyUnit}`,
    `${f.kind}: ${p.kinds[c.kind].label}`,
    `${f.size}: ${sh.size[c.size].label}`,
    `${f.design}: ${sh.design[c.design].label}`,
    `${f.speed}: ${sh.speed[c.speed].label}`,
    copy.waTail,
  ].join('\n');
}
