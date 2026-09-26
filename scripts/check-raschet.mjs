/**
 * ПРОВЕРКА ЛИСТА «ЗАКАЗ».
 *
 * Лист не считает цену, поэтому сверять здесь нечего, кроме устройства:
 * данные обязаны влезать в раскладку, а ни одна строка листа и сообщения не
 * имеет права назвать цену. Проверка сторожит пять утверждений:
 *   1. услуга по умолчанию существует, услуг не больше восемнадцати, имена
 *      и номера не повторяются;
 *   2. в каждом списке от двух до пяти вариантов, имена в списке разные
 *      (они же ключи React), имя услуги не длиннее замеренного;
 *   3. в данных и копии нет рубля, нет цифры перед рублём и нет тире;
 *   4. сообщение в WhatsApp собирается на ВСЕХ сочетаниях, без `undefined`,
 *      без рубля и без пустых строк;
 *   5. в сообщении нет строк, которых нет на листе: каждая строка это
 *      приветствие, имя услуги, «поле: значение» или последняя просьба.
 *
 * Запуск: node scripts/check-raschet.mjs (Node 22 сам снимает типы с .ts).
 */
import assert from 'node:assert/strict';
import { PRODUCTS, PRODUCTS_BY_ID, SHARED, DEFAULTS, RASCHET } from '../src/content/raschet.ts';
import { formatQty, raschetMessage } from '../src/lib/raschet.ts';

/* Замер `.rs-name` в `raschet.css`: 22 знака встают в одну строку. */
const NAME_MAX = 22;
const LIST_MAX = 5;
const PRODUCTS_MAX = 18;

/** Все строки объекта, на любой глубине. */
function strings(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
}

/* Тире как знак препинания: длинное, короткое, двойной дефис и дефис,
   отбитый пробелами. Дефис внутри слова («УФ-печать») законен. */
const DASH = /[—–]|--| - /;
const RUB = /₽/;
const DIGIT_RUB = /\d\s*₽/;

function clean(where, text) {
  assert.ok(!RUB.test(text), `${where}: рубль в «${text}»`);
  assert.ok(!DIGIT_RUB.test(text), `${where}: цена в «${text}»`);
  assert.ok(!DASH.test(text), `${where}: тире в «${text}»`);
  assert.ok(!text.includes('undefined'), `${where}: undefined в «${text}»`);
}

/* ── 1. УСЛУГИ ──────────────────────────────────────────────────────────── */
assert.ok(PRODUCTS.length >= 1, 'список услуг пуст');
assert.ok(PRODUCTS.length <= PRODUCTS_MAX, `услуг ${PRODUCTS.length}, больше ${PRODUCTS_MAX}`);
assert.ok(PRODUCTS_BY_ID[DEFAULTS.productId], `услуги по умолчанию «${DEFAULTS.productId}» нет`);
assert.ok(Number.isInteger(DEFAULTS.qty) && DEFAULTS.qty >= 1, 'тираж по умолчанию');
assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length, 'номера услуг повторяются');
assert.equal(new Set(PRODUCTS.map((p) => p.title)).size, PRODUCTS.length, 'имена услуг повторяются');

/* ── 2. СПИСКИ ──────────────────────────────────────────────────────────── */
function list(where, opts) {
  assert.ok(opts.length >= 2, `${where}: вариантов ${opts.length}, панель из одного бессмысленна`);
  assert.ok(opts.length <= LIST_MAX, `${where}: вариантов ${opts.length}, резерв держит ${LIST_MAX}`);
  assert.equal(new Set(opts.map((o) => o.label)).size, opts.length, `${where}: имена повторяются`);
  for (const o of opts) {
    assert.equal(Object.keys(o).join(), 'label', `${where}: у варианта «${o.label}» есть поля кроме имени`);
    assert.ok(o.label.trim().length > 0, `${where}: пустое имя`);
  }
}
for (const p of PRODUCTS) {
  assert.ok(p.title.length <= NAME_MAX, `${p.id}: имя «${p.title}» длиннее ${NAME_MAX} знаков, перемерьте .rs-name`);
  assert.deepEqual(Object.keys(p).sort(), ['id', 'kinds', 'title'], `${p.id}: лишние поля`);
  list(`${p.id}.kinds`, p.kinds);
}
for (const [key, opts] of Object.entries(SHARED)) list(`SHARED.${key}`, opts);

/* ── 3. НИ ОДНОЙ ЦЕНЫ В ДАННЫХ И КОПИИ ──────────────────────────────────── */
for (const t of strings(PRODUCTS)) clean('PRODUCTS', t);
for (const t of strings(SHARED)) clean('SHARED', t);
for (const t of strings(RASCHET)) clean('RASCHET', t);

assert.equal(formatQty(10000), '10 000', 'разряды тиража отбиты неразрывным пробелом');
assert.equal(formatQty(100), '100', 'тираж без разрядов');

console.log(`услуги: ${PRODUCTS.length}, списков ${PRODUCTS.length + Object.keys(SHARED).length}, цен нет`);

/* ── 4 и 5. СООБЩЕНИЕ НА ВСЕХ СОЧЕТАНИЯХ ────────────────────────────────── */
const f = RASCHET.fields;
const FIELD_PREFIXES = [f.qty, f.kind, f.size, f.design, f.speed].map((x) => `${x}: `);
let checked = 0;

for (const p of PRODUCTS)
for (let kind = 0; kind < p.kinds.length; kind++)
for (let size = 0; size < SHARED.size.length; size++)
for (let design = 0; design < SHARED.design.length; design++)
for (let speed = 0; speed < SHARED.speed.length; speed++)
for (const qty of [1, DEFAULTS.qty, 12345]) {
  const c = { productId: p.id, qty, kind, size, design, speed };
  const msg = raschetMessage(p, c, SHARED, RASCHET);
  clean(`сообщение ${p.id}`, msg);

  const lines = msg.split('\n');
  assert.equal(lines[0], RASCHET.waOpen, 'первая строка');
  assert.equal(lines[1], p.title, 'вторая строка это имя услуги');
  assert.equal(lines.at(-1), RASCHET.waTail, 'последняя строка');
  for (const line of lines.slice(2, -1)) {
    const prefix = FIELD_PREFIXES.find((x) => line.startsWith(x));
    assert.ok(prefix, `строка «${line}» не принадлежит ни одному полю листа`);
    assert.ok(line.slice(prefix.length).trim().length > 0, `пустое значение в «${line}»`);
  }
  assert.equal(lines.length, 2 + FIELD_PREFIXES.length + 1, 'по строке на поле, не больше');
  for (const needle of [`${qty} ${RASCHET.qtyUnit}`, p.kinds[kind].label,
    SHARED.size[size].label, SHARED.design[design].label, SHARED.speed[speed].label]) {
    assert.ok(msg.includes(needle), `в сообщении нет «${needle}»:\n${msg}`);
  }
  checked++;
}
console.log(`сообщение в WhatsApp: ${checked} сочетаний, собирается`);
console.log('\nВСЁ СОШЛОСЬ.');
