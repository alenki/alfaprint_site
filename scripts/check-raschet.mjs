/**
 * ПРОВЕРКА ПЕРЕНОСА КАЛЬКУЛЯТОРА.
 *
 * Два утверждения, и оба о том, что перенос ничего не изменил:
 *   1. наши данные это те же данные (порядок, имена, ставки, множители, суммы);
 *   2. наша формула это та же формула, на ПОЛНОМ переборе сочетаний.
 *
 * Оракул ниже переписан с `window.calc` прежнего сайта дословно. Приводить его
 * в порядок нельзя: именно он и есть проверяемое поведение.
 *
 * Запуск: node scripts/check-raschet.mjs
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { PRODUCTS, SHARED, SLOW_PRODUCTS, TERMS } from '../src/content/raschet.ts';
import { runTotal, setupTotal, grandTotal, termKey, formatRub } from '../src/lib/raschet.ts';

const oracle = JSON.parse(fs.readFileSync(new URL('./raschet-oracle.json', import.meta.url), 'utf8'));

/* ── оракул: формула прежнего сайта ─────────────────────────────────────── */
function oraclePrice(data, qty, material, format, finish, design, speed, delivery, proof, consult, repeat) {
  let price = Math.max(data.min, qty * data.base);
  price = price * material * format * speed + finish + design + delivery + proof + consult + repeat;
  price = Math.max(900, price);
  return price;
}
function oracleTerm(product, speed) {
  return speed > 1.3
    ? 'срочно, уточнить'
    : (['shirts', 'souvenirs', 'banners', 'calendars'].includes(product)
        ? '2–7 рабочих дней'
        : '1–3 рабочих дня');
}

/* ── 1. ДАННЫЕ ──────────────────────────────────────────────────────────── */
let optionCount = 0;
assert.deepEqual(PRODUCTS.map((p) => p.id), oracle.order, 'порядок продуктов разошёлся');

for (const p of PRODUCTS) {
  const o = oracle.products[p.id];
  assert.ok(o, `продукта ${p.id} нет в оракуле`);
  assert.equal(p.title, o.title, `${p.id}: имя`);
  assert.equal(p.base, o.base, `${p.id}: ставка`);
  assert.equal(p.min, o.min, `${p.id}: минимум`);
  assert.equal(p.rec, o.rec, `${p.id}: рекомендация`);
  for (const key of ['materials', 'formats', 'finishes']) {
    assert.equal(p[key].length, o[key].length, `${p.id}.${key}: длина списка`);
    p[key].forEach((opt, i) => {
      assert.equal(opt.label, o[key][i][1], `${p.id}.${key}[${i}]: имя варианта`);
      assert.equal(opt.value, Number(o[key][i][0]), `${p.id}.${key}[${i}]: число`);
      optionCount++;
    });
  }
}

/* Общие параметры оракул не хранит: они стояли прямо в разметке #calc. */
assert.deepEqual(SHARED.design.map((o) => [o.label, o.value]),
  [['Макет готов', 0], ['Небольшая правка', 1200], ['Дизайн с нуля', 2500]], 'макет');
assert.deepEqual(SHARED.speed.map((o) => [o.label, o.value]),
  [['Обычный', 1], ['Быстрее', 1.25], ['Срочно', 1.45]], 'срок');
assert.deepEqual(SHARED.delivery.map((o) => [o.label, o.value]),
  [['Самовывоз', 0], ['Доставка по городу', 300]], 'получение');
assert.deepEqual(SHARED.extras.map((o) => [o.id, o.label, o.value]),
  [['proof', 'Проверка файла', 500], ['consult', 'Подбор материала', 350], ['repeat', 'Повтор заказа', -300]], 'дополнительно');
assert.deepEqual([...SLOW_PRODUCTS].sort(), ['banners', 'calendars', 'shirts', 'souvenirs'], 'долгие продукты');

console.log(`данные: 18 продуктов, ${optionCount} вариантов, общие параметры — сходится`);

/* ── 2. ФОРМУЛА, ПОЛНЫЙ ПЕРЕБОР ─────────────────────────────────────────── */
const QTYS = [1, 2, 100, 999, 10000];
const EXTRA_SETS = [[], ['proof'], ['consult'], ['repeat'],
  ['proof', 'consult'], ['proof', 'repeat'], ['consult', 'repeat'], ['proof', 'consult', 'repeat']];
let checked = 0;

for (const p of PRODUCTS) {
  const o = oracle.products[p.id];
  for (let mi = 0; mi < p.materials.length; mi++)
  for (let fi = 0; fi < p.formats.length; fi++)
  for (let ni = 0; ni < p.finishes.length; ni++)
  for (let di = 0; di < SHARED.design.length; di++)
  for (let si = 0; si < SHARED.speed.length; si++)
  for (let li = 0; li < SHARED.delivery.length; li++)
  for (const extras of EXTRA_SETS)
  for (const qty of QTYS) {
    const c = { productId: p.id, qty, material: mi, format: fi, finish: ni, design: di, speed: si, delivery: li, extras };

    const mine = grandTotal(p, c, SHARED);
    const theirs = oraclePrice(
      o, qty, Number(o.materials[mi][0]), Number(o.formats[fi][0]), Number(o.finishes[ni][0]),
      SHARED.design[di].value, SHARED.speed[si].value, SHARED.delivery[li].value,
      extras.includes('proof') ? 500 : 0,
      extras.includes('consult') ? 350 : 0,
      extras.includes('repeat') ? -300 : 0,
    );
    assert.equal(mine, theirs, `цена разошлась: ${p.id} qty=${qty} m=${mi} f=${fi} n=${ni} d=${di} s=${si} l=${li} [${extras}]`);

    assert.equal(TERMS[termKey(p, c, SHARED, SLOW_PRODUCTS)], oracleTerm(p.id, SHARED.speed[si].value), `срок разошёлся: ${p.id} s=${si}`);

    /* Две подсуммы обязаны сходиться с итогом: приладка всегда целая, поэтому
       округление тиража не может увести сумму. Если это утверждение когда-то
       упадёт, значит, сработал порог 900, и страницу надо будет о нём
       предупредить. Сейчас он мёртв, см. §6.4 спецификации. */
    assert.equal(Math.round(runTotal(p, c, SHARED)) + setupTotal(p, c, SHARED), Math.round(mine),
      `подсуммы не сошлись с итогом: ${p.id} qty=${qty}`);

    checked++;
  }
}
console.log(`формула: ${checked.toLocaleString('ru-RU')} сочетаний — сходится с прежним сайтом`);

/* ── 3. КОНТРОЛЬНЫЙ ПРИМЕР ИЗ СПЕЦИФИКАЦИИ ──────────────────────────────── */
const cards = PRODUCTS.find((p) => p.id === 'cards');
const worked = { productId: 'cards', qty: 100, material: 3, format: 2, finish: 4, design: 0, speed: 2, delivery: 1, extras: [] };
assert.equal(Math.round(grandTotal(cards, worked, SHARED)), 4990, 'контрольный пример 4 990 ₽');
assert.equal(Math.round(runTotal(cards, worked, SHARED)), 3290, 'контрольный пример, за тираж');
assert.equal(setupTotal(cards, worked, SHARED), 1700, 'контрольный пример, за приладку');

assert.equal(formatRub(1234567), '1 234 567 ₽', 'разряды отбиты неразрывным пробелом');
assert.equal(formatRub(4990.34), '4 990 ₽', 'рубль округляется до целого');

const def = { productId: 'cards', qty: 100, material: 0, format: 0, finish: 0, design: 0, speed: 0, delivery: 0, extras: [] };
assert.equal(Math.round(grandTotal(cards, def, SHARED)), 1200, 'состояние по умолчанию 1 200 ₽');
assert.equal(termKey(cards, def, SHARED, SLOW_PRODUCTS), 'normal', 'срок по умолчанию');

console.log('контрольные примеры: 4 990 ₽ и 1 200 ₽ — сходятся');
console.log('\nВСЁ СОШЛОСЬ.');
