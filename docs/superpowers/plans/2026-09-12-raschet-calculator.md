# Предварительный расчёт (`/raschet`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/raschet` page that reproduces the previous site's print calculator with byte-identical data and arithmetic, laid out in the «Альфа Принт» design language.

**Architecture:** Pure arithmetic in `src/lib/raschet.ts` with zero runtime imports, so a dependency-free Node script can differential-test it against the original algorithm. Data transferred verbatim into a generated region of `src/content/raschet.ts`. One client component holds all state in a `useReducer`; option panels sit out of flow with a compensating tail spacer, so the document height never changes.

**Tech Stack:** Next 16.3.4 App Router (static export, `basePath: /alfaprint`), React 19, Tailwind 4 via `@theme`, TypeScript 5.9, Node 22 native type stripping for the test script. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-12-raschet-calculator-design.md`

---

## Before you start

Read these. They are not optional context, they are constraints that have already cost this project rework:

- `docs/superpowers/specs/2026-09-12-raschet-calculator-design.md` — the whole spec.
- `AGENTS.md` — this is Next 16, not the Next in your training data. Read `node_modules/next/dist/docs/` before using an API you are unsure of.
- **Nine files in `src/` are CRLF**: `app/globals.css`, `app/page.tsx`, `components/chrome/PlateProvider.tsx`, `components/layout/Sheet.tsx`, `components/sections/DveFormy.tsx`, `components/sections/PodpisnoiList.tsx`, `components/ui/Registry.tsx`, `content/reviews.ts`, `lib/halftone.ts`. Use the `Edit` tool with single-line anchors on these. Never `perl -pi` on any file here, it double-encodes Cyrillic.
- **Five other sessions are editing this repo.** Before each edit to `globals.css`, `site.ts`, `TopBar.tsx`, `PlateProvider.tsx`, re-read the file. Never `git checkout` or revert someone else's hunk.
- `--ease-land` is unusable for anything the eye follows (80 % of travel in the first 23 % of time). Use `linear` for the panel shift.

## File structure

| file | responsibility |
|---|---|
| `scripts/raschet-oracle.json` | raw extraction of the old site's `PRODUCTS` + `PRODUCT_LIST`, in the ORIGINAL shape. The contract. Never edited by hand. |
| `scripts/gen-raschet.mjs` | rewrites the generated region of `src/content/raschet.ts` from the oracle |
| `scripts/check-raschet.mjs` | the test: data fidelity + exhaustive differential test of the formula |
| `src/lib/raschet.ts` | types and pure arithmetic. **Zero runtime imports** so Node can load it |
| `src/content/raschet.ts` | the 18 products (generated region), shared controls, all page copy. Only `import type` |
| `src/components/ui/RaschetField.tsx` | one parameter: the resting row plus its out-of-flow option panel |
| `src/components/sections/Raschet.tsx` | the whole section: head, two columns, total plate, note |
| `src/app/raschet/page.tsx` | the route and its metadata |
| `src/app/globals.css` | one appended `.rs-*` block |

---

### Task 1: Oracle fixture

The contract for "the absolute same catalog and prices". Everything downstream is checked against this file.

**Files:**
- Create: `scripts/raschet-oracle.json`

- [ ] **Step 1: Fetch the old site and extract the calculator data**

```bash
cd "E:/Desktop/PC/WORK/Web Development/alfaprint_site"
curl -sSL -o /tmp/alfa-old.html "https://sultanbalkarov22-droid.github.io/alfa-site/"
node --input-type=module -e "
import fs from 'node:fs';
const lines = fs.readFileSync('/tmp/alfa-old.html','utf8').split('\n');
const start = lines.findIndex(l => l.startsWith('const PRODUCTS='));
const end   = lines.findIndex(l => l.startsWith('const PRODUCT_LIST='));
if (start < 0 || end < 0) throw new Error('PRODUCTS / PRODUCT_LIST not found');
const src = lines.slice(start, end + 1).join('\n');
const m = new Function(src + '; return {PRODUCTS, PRODUCT_LIST};')();
const out = { order: m.PRODUCT_LIST.map(x => x[0]), products: m.PRODUCTS };
fs.writeFileSync('scripts/raschet-oracle.json', JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('order', out.order.length, 'products', Object.keys(out.products).length);
"
```

Expected: `order 18 products 18`

- [ ] **Step 2: Verify the fixture spot-checks against the spec table**

```bash
node --input-type=module -e "
import fs from 'node:fs';
const o = JSON.parse(fs.readFileSync('scripts/raschet-oracle.json','utf8'));
console.log('cards base/min:', o.products.cards.base, o.products.cards.min);
console.log('banners base/min:', o.products.banners.base, o.products.banners.min);
console.log('first order id:', o.order[0], 'last:', o.order[17]);
console.log('cards finishes:', o.products.cards.finishes.map(f => f[0]).join(','));
"
```

Expected:
```
cards base/min: 9 1200
banners base/min: 950 3500
first order id: cards last: calendars
cards finishes: 0,600,700,950,1400
```

These match §1.2 and §1.4 of the spec. If they do not, stop and re-read the spec.

- [ ] **Step 3: Commit**

```bash
git add scripts/raschet-oracle.json
git commit -m "raschet: фикстура с прежнего сайта, восемнадцать продуктов как есть"
```

---

### Task 2: Pure arithmetic, test first

**Files:**
- Create: `src/lib/raschet.ts`
- Create: `scripts/check-raschet.mjs`

- [ ] **Step 1: Write the failing test**

`scripts/check-raschet.mjs`. The oracle functions are transcribed from the old site's `window.calc`, character for character. Do not "tidy" them: the `min` floor before the multipliers and the 900 floor after everything are the behaviour under test.

```js
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
import { PRODUCTS, SHARED, SLOW_PRODUCTS } from '../src/content/raschet.ts';
import { runTotal, setupTotal, grandTotal, termKey } from '../src/lib/raschet.ts';

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
const TERM_OF_KEY = { rush: 'срочно, уточнить', slow: '2–7 рабочих дней', normal: '1–3 рабочих дня' };

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

    assert.equal(TERM_OF_KEY[termKey(p, c, SHARED, SLOW_PRODUCTS)], oracleTerm(p.id, SHARED.speed[si].value), `срок разошёлся: ${p.id} s=${si}`);

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

const def = { productId: 'cards', qty: 100, material: 0, format: 0, finish: 0, design: 0, speed: 0, delivery: 0, extras: [] };
assert.equal(Math.round(grandTotal(cards, def, SHARED)), 1200, 'состояние по умолчанию 1 200 ₽');
assert.equal(termKey(cards, def, SHARED, SLOW_PRODUCTS), 'normal', 'срок по умолчанию');

console.log('контрольные примеры: 4 990 ₽ и 1 200 ₽ — сходятся');
console.log('\nВСЁ СОШЛОСЬ.');
```

- [ ] **Step 2: Run it to verify it fails**

```bash
node scripts/check-raschet.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../src/content/raschet.ts`. Neither module exists yet.

- [ ] **Step 3: Write `src/lib/raschet.ts`**

Zero runtime imports. `import type` only, so Node's type stripping erases every import and the file loads standalone.

```ts
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

export function grandTotal(p: Product, c: Choice, sh: Shared): number {
  return Math.max(PRICE_FLOOR, runTotal(p, c, sh) + setupTotal(p, c, sh));
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
```

- [ ] **Step 4: Generate `src/content/raschet.ts`**

First write the generator, `scripts/gen-raschet.mjs`:

```js
/**
 * Переписывает ТОЛЬКО размеченную область в `src/content/raschet.ts` из
 * `scripts/raschet-oracle.json`. Всё, что вне маркеров, написано руками и
 * не трогается.
 *
 * Запуск: node scripts/gen-raschet.mjs
 */
import fs from 'node:fs';

const BEGIN = '/* ── НАЧАЛО ПЕРЕНЕСЁННОЙ ТАБЛИЦЫ. Правит `scripts/gen-raschet.mjs` ── */';
const END   = '/* ── КОНЕЦ ПЕРЕНЕСЁННОЙ ТАБЛИЦЫ ── */';

const o = JSON.parse(fs.readFileSync(new URL('./raschet-oracle.json', import.meta.url), 'utf8'));
const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const opts = (list) => list.map(([v, label]) => `      { label: ${q(label)}, value: ${Number(v)} },`).join('\n');

const body = o.order.map((id) => {
  const p = o.products[id];
  return `  {
    id: ${q(id)},
    title: ${q(p.title)},
    base: ${p.base},
    min: ${p.min},
    materials: [
${opts(p.materials)}
    ],
    formats: [
${opts(p.formats)}
    ],
    finishes: [
${opts(p.finishes)}
    ],
    rec: ${q(p.rec)},
  },`;
}).join('\n');

const generated = `${BEGIN}
export const PRODUCTS: readonly Product[] = [
${body}
];
${END}`;

const path = new URL('../src/content/raschet.ts', import.meta.url);
const src = fs.readFileSync(path, 'utf8');
const a = src.indexOf(BEGIN);
const b = src.indexOf(END);
if (a < 0 || b < 0) throw new Error('маркеры перенесённой таблицы не найдены');
fs.writeFileSync(path, src.slice(0, a) + generated + src.slice(b + END.length), 'utf8');
console.log(`переписано: ${o.order.length} продуктов`);
```

Now create `src/content/raschet.ts` with the hand-written parts and empty markers. Write it with **LF** line endings.

```ts
/**
 * ДАННЫЕ И КОПИЯ СТРАНИЦЫ ПРЕДВАРИТЕЛЬНОГО РАСЧЁТА.
 *
 * ОТКУДА ЦИФРЫ. Восемнадцать продуктов со ставками, множителями, суммами и
 * рекомендациями перенесены с прежнего сайта агентства
 * (sultanbalkarov22-droid.github.io/alfa-site, секция #calc, объект PRODUCTS)
 * ДОСЛОВНО. Ни одно число и ни одно имя варианта здесь не придумано и не
 * поправлено. Сырая выписка лежит в `scripts/raschet-oracle.json`, и
 * `scripts/check-raschet.mjs` сверяет эту таблицу с ней целиком.
 *
 * ЭТО ОТМЕНЯЕТ прежний запрет публиковать цены калькулятора, записанный в
 * шапке `catalogue.ts`. Отмена касается ТОЛЬКО этой страницы: `priceFrom` в
 * каталоге по-прежнему пуст, и §03 не называет ни одной суммы.
 *
 * ИМПОРТОВ ВРЕМЕНИ ВЫПОЛНЕНИЯ ЗДЕСЬ НЕТ, только `import type`: проверка грузит
 * файл голым `node`, и псевдоним `@/` там не разрешается.
 */
import type { Option, ExtraOption, Product, Shared } from '@/lib/raschet';

/* ── НАЧАЛО ПЕРЕНЕСЁННОЙ ТАБЛИЦЫ. Правит `scripts/gen-raschet.mjs` ── */
/* ── КОНЕЦ ПЕРЕНЕСЁННОЙ ТАБЛИЦЫ ── */

export const PRODUCTS_BY_ID: Record<string, Product> =
  Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

/**
 * ОБЩИЕ ПАРАМЕТРЫ. На прежнем сайте они стояли не в объекте PRODUCTS, а прямо
 * в разметке `#calc` тремя `<select>` и тремя галочками, поэтому в фикстуру
 * они не попали и переписаны сюда с разметки. Значения и порядок те же.
 */
const DESIGN: readonly Option[] = [
  { label: 'Макет готов', value: 0 },
  { label: 'Небольшая правка', value: 1200 },
  { label: 'Дизайн с нуля', value: 2500 },
];
const SPEED: readonly Option[] = [
  { label: 'Обычный', value: 1 },
  { label: 'Быстрее', value: 1.25 },
  { label: 'Срочно', value: 1.45 },
];
const DELIVERY: readonly Option[] = [
  { label: 'Самовывоз', value: 0 },
  { label: 'Доставка по городу', value: 300 },
];
const EXTRAS: readonly ExtraOption[] = [
  { id: 'proof', label: 'Проверка файла', value: 500 },
  { id: 'consult', label: 'Подбор материала', value: 350 },
  { id: 'repeat', label: 'Повтор заказа', value: -300 },
];

export const SHARED: Shared = { design: DESIGN, speed: SPEED, delivery: DELIVERY, extras: EXTRAS };

/** Продукты, у которых прежний сайт называл срок «2–7 рабочих дней». */
export const SLOW_PRODUCTS: readonly string[] = ['shirts', 'souvenirs', 'banners', 'calendars'];

export const TERMS: Record<'rush' | 'slow' | 'normal', string> = {
  rush: 'срочно, уточнить',
  slow: '2–7 рабочих дней',
  normal: '1–3 рабочих дня',
};

/** Порядковый номер варианта по умолчанию. Прежний сайт брал первый в списке. */
export const DEFAULTS = { productId: 'cards', qty: 100 } as const;
```

Then run the generator:

```bash
node scripts/gen-raschet.mjs
```

Expected: `переписано: 18 продуктов`

- [ ] **Step 5: Run the test to verify it passes**

```bash
node scripts/check-raschet.mjs
```

Expected, all four lines, with both counts exact:
```
данные: 18 продуктов, 213 вариантов, общие параметры — сходится
формула: 806 400 сочетаний — сходится с прежним сайтом
контрольные примеры: 4 990 ₽ и 1 200 ₽ — сходятся

ВСЁ СОШЛОСЬ.
```

Both numbers are derived from the fixture and were computed before this plan was written, so they are assertions, not estimates. **213** is the sum of every product's materials, formats and finishes; **806 400** is every combination of those against three макет, three срока, two получения, eight sets of extras and five tirages. The run takes a few seconds.

If the option count differs, the transfer lost or gained a variant: stop and diff against the oracle. If the combination count differs, a list length changed, which means the same thing.

- [ ] **Step 6: Add the check to package.json**

Re-read `package.json` first, another session may have touched it. Add one line to `scripts`:

```json
    "check:raschet": "node scripts/check-raschet.mjs",
```

- [ ] **Step 7: Typecheck**

```bash
npm run typecheck
```

Expected: no output, exit 0. If it reports that `PRODUCTS` is used before declaration in `raschet.ts`, the generator wrote outside the markers: re-check the marker strings match byte for byte.

- [ ] **Step 8: Commit**

```bash
git add scripts/gen-raschet.mjs scripts/check-raschet.mjs src/lib/raschet.ts src/content/raschet.ts package.json
git commit -m "raschet: формула и таблица, сверенные с прежним сайтом полным перебором"
```

---

### Task 3: Page copy and the WhatsApp message

**Files:**
- Modify: `src/content/raschet.ts` (append)
- Modify: `src/lib/raschet.ts` (append)
- Modify: `scripts/check-raschet.mjs` (append)

- [ ] **Step 1: Write the failing test**

Append to `scripts/check-raschet.mjs`, before the final `console.log('\nВСЁ СОШЛОСЬ.')` line. Add `raschetMessage` to the existing import from `../src/lib/raschet.ts` and `RASCHET` to the import from `../src/content/raschet.ts`.

```js
/* ── 4. СООБЩЕНИЕ В WHATSAPP ────────────────────────────────────────────── */
const msg = raschetMessage(cards, worked, SHARED, RASCHET);
for (const needle of ['Визитки', '100', 'Премиум картон / фактурная бумага',
  'Двусторонняя визитка', 'Премиальная отделка', 'Макет готов', 'Срочно',
  'Доставка по городу', '4', '990', 'предварительн']) {
  assert.ok(msg.toLowerCase().includes(needle.toLowerCase()), `в сообщении нет «${needle}»:\n${msg}`);
}
assert.ok(!msg.includes('undefined'), 'в сообщении undefined');

const empty = raschetMessage(cards, def, SHARED, RASCHET);
assert.ok(!empty.includes(RASCHET.fields.extras), 'пустой набор доп. работ не должен попадать в сообщение');
console.log('сообщение в WhatsApp: собирается');
```

- [ ] **Step 2: Run it to verify it fails**

```bash
node scripts/check-raschet.mjs
```

Expected: FAIL, `SyntaxError` or `raschetMessage is not a function`.

- [ ] **Step 3: Add the copy to `src/content/raschet.ts`**

Append:

```ts
/**
 * КОПИЯ СТРАНИЦЫ. Лид и оговорка «Важно» стоят ДОСЛОВНО с прежнего сайта:
 * заказчик просил ту же информацию, а не пересказ.
 */
export const RASCHET = {
  kicker: 'Предварительный расчёт',
  switchProduct: 'сменить продукт',
  lead: 'Калькулятор помогает понять примерный бюджет. Для нестандартных заказов, редких материалов и сложных изделий лучше связаться с менеджером.',

  /** Подписи колонок несут мысль раскладки, и несут её один раз. */
  run: { title: 'Тираж', caption: 'множится на каждый экземпляр', total: 'за тираж' },
  setup: { title: 'Приладка', caption: 'платится один раз', total: 'за приладку' },

  fields: {
    qty: 'количество',
    material: 'материал',
    format: 'формат',
    speed: 'срок',
    finish: 'отделка',
    design: 'макет',
    delivery: 'получение',
    extras: 'дополнительно',
  },
  qtyUnit: 'экз.',
  qtyLess: 'Меньше',
  qtyMore: 'Больше',
  extrasEmpty: 'не выбрано',

  totalLabel: 'Предварительный расчёт',
  termLabel: 'Срок',
  recLabel: 'Рекомендация',

  noteTitle: 'Важно',
  note: 'Стоимость, отображаемая калькулятором, носит ознакомительный характер. Итоговая цена зависит от выбранных материалов, технологии изготовления, тиража, размеров, сложности макета, сроков и дополнительных работ. Окончательная стоимость согласовывается с менеджером после уточнения всех параметров заказа.',

  callCta: 'Позвонить менеджеру',
  waCta: 'Отправить расчёт в WhatsApp',

  /** Первая и последняя строки сообщения в WhatsApp. */
  waOpen: 'Здравствуйте! Посчитал на сайте:',
  waTotal: 'Предварительно',
  waTail: 'Понимаю, что расчёт предварительный. Уточните, пожалуйста, точную цену.',

  title: 'Калькулятор печати',
  metaDescription:
    'Предварительный расчёт тиража: визитки, наклейки, бирки, одежда, кружки, сувениры, упаковка, баннеры и календари. Восемнадцать позиций, материалы, форматы, отделка и сроки. Нальчик, Тарчокова, 29.',
} as const;

export type RaschetCopy = typeof RASCHET;
```

- [ ] **Step 4: Add the message builder to `src/lib/raschet.ts`**

Append. Note the `Copy` type is structural, so `lib` still imports nothing.

```ts
/** Ровно те подписи, которые нужны сообщению. Структурный тип: импорта нет. */
export type MessageCopy = {
  readonly waOpen: string;
  readonly waTotal: string;
  readonly waTail: string;
  readonly fields: {
    readonly qty: string; readonly material: string; readonly format: string;
    readonly speed: string; readonly finish: string; readonly design: string;
    readonly delivery: string; readonly extras: string;
  };
  readonly qtyUnit: string;
};

/**
 * НАРЯД ТЕКСТОМ. Прежний сайт открывал пустой чат, и менеджеру приходилось
 * спрашивать всё заново. Ничего никуда не отправляется, открывается WhatsApp:
 * врать в подтверждении по-прежнему нечем.
 */
export function raschetMessage(p: Product, c: Choice, sh: Shared, copy: MessageCopy): string {
  const f = copy.fields;
  const lines = [
    copy.waOpen,
    `${p.title}`,
    `${f.qty}: ${c.qty} ${copy.qtyUnit}`,
    `${f.material}: ${p.materials[c.material].label}`,
    `${f.format}: ${p.formats[c.format].label}`,
    `${f.finish}: ${p.finishes[c.finish].label}`,
    `${f.design}: ${sh.design[c.design].label}`,
    `${f.speed}: ${sh.speed[c.speed].label}`,
    `${f.delivery}: ${sh.delivery[c.delivery].label}`,
  ];
  const picked = sh.extras.filter((e) => c.extras.includes(e.id));
  if (picked.length) lines.push(`${f.extras}: ${picked.map((e) => e.label).join(', ')}`);
  lines.push(`${copy.waTotal}: ${formatRub(grandTotal(p, c, sh))}`);
  lines.push(copy.waTail);
  return lines.join('\n');
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
node scripts/check-raschet.mjs
```

Expected: all previous lines plus `сообщение в WhatsApp: собирается` and `ВСЁ СОШЛОСЬ.`

- [ ] **Step 6: Commit**

```bash
git add src/content/raschet.ts src/lib/raschet.ts scripts/check-raschet.mjs
git commit -m "raschet: копия страницы и наряд текстом в WhatsApp"
```

---

### Task 4: The stylesheet block

**Files:**
- Modify: `src/app/globals.css` (append at end of file)

`globals.css` is **CRLF** and another session may be editing it. Re-read the tail of the file first, then append with the `Edit` tool anchored on the last line you actually see.

- [ ] **Step 1: Re-read the end of the file**

```bash
tail -20 src/app/globals.css
```

- [ ] **Step 2: Append the block**

The panel arithmetic is the load-bearing part. `--rs-panel-max` is five option rows, the longest list in either column (five materials, five finishes). The tail spacer is the difference, so the column's height is `rows + max` in every state.

```css
/* ═══════════════════════════════════════════════════════════════════════════
   ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ. Страница /raschet.

   В ПОКОЕ ВИДНО ТОЛЬКО ВЫБРАННОЕ: по строке на параметр. Варианты приходят к
   той строке, которую тронули, и приходят ВНЕ ПОТОКА, тем же приёмом, что
   панель §03 и по той же причине: раскрытие, двигающее документ, ломает
   Lenis, наблюдатель грунтов и закон --miss.

   АРИФМЕТИКА ВЫСОТЫ, и она здесь всё:
     --rs-panel-max  пять строк вариантов, самый длинный список в колонке;
     --rs-panel-h    высота ОТКРЫТОЙ панели, ноль пока ничего не открыто;
     .rs-tail        max − h.
   Сумма «строки + панель + хвост» равна «строки + max» ВСЕГДА. Высота листа
   не меняется ни при раскрытии, ни при смене продукта.

   ЭТО УЛУЧШЕНИЕ ПРОТИВ §03, а не копия: там высота панели одна на все строки,
   и список из двух вариантов сидел бы в яме на пять. Здесь каждая панель
   показывается своей высотой, а постоянство держит хвост.

   ПАНЕЛЬ БЕЗ ЗАЛИВКИ. Варианты печатаются прямо по бумаге с отступом до
   колонки значения. Тогда пустое место короткой панели это просто бумага, и
   резерв на пять строк ничего не стоит глазу.
   ═══════════════════════════════════════════════════════════════════════════ */

.rs-head {
  padding-top: clamp(44px, 6vw, 104px);
  padding-bottom: clamp(26px, 3.2vw, 54px);
}

/* Имя продукта это и заголовок полосы, и переключатель: страница называет то,
   что считает. Поэтому кегль героя, а не подзаголовка. */
.rs-name {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.92;
  text-align: left;
}
.rs-name[aria-expanded='true'] {
  color: var(--color-rubine);
}

.rs-lead {
  max-width: 58ch;
  margin-top: clamp(16px, 1.6vw, 26px);
  font-size: var(--text-lead);
  color: var(--fg-70);
}

/* Гнездо панели продуктов: она накрывает колонки целиком. */
.rs-body {
  position: relative;
}

.rs-cols {
  --rs-opt-h: clamp(30px, 2.2vw, 38px);
  --rs-panel-pad: clamp(8px, 0.8vw, 14px);
  --rs-panel-max: calc(5 * var(--rs-opt-h) + var(--rs-panel-pad) * 2);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 clamp(30px, 5.2vw, 116px);
}

.rs-col {
  position: relative;
  --rs-open-n: 0;
  --rs-panel-h: 0px;
}
.rs-col[data-open='true'] {
  --rs-panel-h: calc(var(--rs-open-n) * var(--rs-opt-h) + var(--rs-panel-pad) * 2);
}

.rs-colhead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding-bottom: 11px;
  border-bottom: 1px solid var(--rule);
}

/* Строки НИЖЕ раскрытой едут вниз ровно на высоту панели.
   Ход линейный: --ease-land сажает 80 % пути в первые 23 % времени, и на
   движении, за которым следят глазом, это читается рывком. */
.rs-field {
  transition: transform 240ms linear;
}
.rs-field[data-shift='true'] {
  transform: translate3d(0, var(--rs-panel-h), 0);
}

.rs-row {
  display: grid;
  grid-template-columns: minmax(96px, 0.42fr) 1fr auto;
  align-items: baseline;
  gap: clamp(10px, 1.3vw, 24px);
  width: 100%;
  padding: clamp(11px, 1.15vw, 17px) 0;
}
.rs-row-v {
  font-weight: 600;
  font-size: clamp(1rem, 1.42vw, 1.4375rem);
  letter-spacing: -0.022em;
}
.rs-row[aria-expanded='true'] .rs-row-v {
  color: var(--color-rubine);
}
.rs-row-p {
  font-family: var(--font-mono);
  font-size: var(--text-mono);
  color: var(--fg-56);
  white-space: nowrap;
}

/* Гнездо нулевой высоты: панель висит в нём и потока не занимает. */
.rs-slot {
  position: relative;
  height: 0;
}
.rs-panel {
  position: absolute;
  inset-inline: 0;
  top: 0;
  padding-block: var(--rs-panel-pad);
}

/* Высота варианта ОБЪЯВЛЕНА, а не сложилась: из неё считается вся арифметика
   выше. Поэтому же запрещён перенос: перенёсшееся имя увело бы хвост. */
.rs-opt {
  display: grid;
  grid-template-columns: minmax(96px, 0.42fr) 1fr auto;
  align-items: center;
  gap: clamp(10px, 1.3vw, 24px);
  width: 100%;
  height: var(--rs-opt-h);
  color: var(--fg-70);
  white-space: nowrap;
}
.rs-opt-mark {
  grid-column: 1;
  justify-self: end;
  width: 3px;
  height: 0.85em;
  background: transparent;
}
.rs-opt[aria-checked='true'],
.rs-opt[aria-pressed='true'] {
  color: var(--fg);
  font-weight: 600;
}
.rs-opt[aria-checked='true'] .rs-opt-mark,
.rs-opt[aria-pressed='true'] .rs-opt-mark {
  background: var(--color-rubine);
}
.rs-opt-p {
  font-family: var(--font-mono);
  font-size: var(--text-mono);
  color: var(--fg-56);
  white-space: nowrap;
}

.rs-tail {
  height: calc(var(--rs-panel-max) - var(--rs-panel-h));
  transition: height 240ms linear;
}

.rs-subtotal {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-top: clamp(8px, 1vw, 16px);
  padding-top: 13px;
  border-top: 1px solid var(--rule-soft);
}
.rs-subtotal-n {
  font-weight: 600;
  font-size: clamp(1.1875rem, 1.8vw, 1.6875rem);
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
}

/* Восемнадцать продуктов накрывают расчёт: смена продукта обесценивает всё,
   что стоит ниже, поэтому закрыть это собой она имеет право. Резервировать
   под них место на листе постоянно нельзя, шесть пустых строк это тот самый
   хлам, ради отмены которого раскладка и переделывалась. */
.rs-products {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: var(--color-paper);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 clamp(14px, 2vw, 44px);
  align-content: start;
}
.rs-product {
  display: grid;
  grid-template-columns: 14px 1fr;
  align-items: center;
  gap: 10px;
  height: var(--rs-opt-h, 34px);
  width: 100%;
  color: var(--fg-70);
  white-space: nowrap;
}
.rs-product[aria-checked='true'] {
  color: var(--fg);
  font-weight: 600;
}

/* Плашка итога. Краска во весь формат, число в рубине: на чёрном рубин даёт
   3,66:1, законных от 40 px, и кегль здесь заведомо выше. */
.rs-total {
  margin-top: clamp(30px, 3.4vw, 60px);
}
.rs-total-in {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.7fr) minmax(0, 1.05fr);
  gap: clamp(18px, 3vw, 56px);
  align-items: end;
  padding-block: clamp(19px, 2vw, 32px);
}
.rs-total-n {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-h1);
  line-height: 0.86;
  letter-spacing: -0.038em;
  color: var(--color-rubine);
  font-variant-numeric: tabular-nums;
  margin-top: 5px;
}
.rs-cta {
  display: flex;
  border-top: 1px solid var(--rule);
}
.rs-cta > a {
  flex: 1;
  padding: 16px var(--edge);
}
.rs-cta > a + a {
  border-left: 1px solid var(--rule);
}
.rs-cta > a[data-wa='true'] {
  flex: 1.25;
  background: var(--color-rubine);
  color: var(--color-proof);
}

.rs-note {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: clamp(12px, 1.8vw, 36px);
  padding-block: clamp(20px, 2.3vw, 36px) clamp(30px, 3.4vw, 60px);
}
.rs-note p {
  max-width: 76ch;
  font-size: var(--text-small);
  color: var(--fg-56);
}

/* КОЛОНКИ ВСТАЮТ ДРУГ ПОД ДРУГА РАНЬШЕ, ЧЕМ ИМЯ ВАРИАНТА ПЕРЕСТАЁТ ВЛЕЗАТЬ.
   Порог выбран замером: самое длинное имя «Премиум картон / фактурная бумага»
   в половине полосы перестаёт помещаться около 980 px. Ниже порога колонка
   полная, и не переносится ничего. */
@media (width < 980px) {
  .rs-cols {
    grid-template-columns: 1fr;
  }
  .rs-col + .rs-col {
    margin-top: clamp(26px, 4vw, 44px);
  }
  .rs-products {
    grid-template-columns: 1fr 1fr;
  }
  .rs-total-in {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .rs-note {
    grid-template-columns: 1fr;
  }
}

/* Нижняя панель телефона на этой странице молчит: её работу делает плашка
   итога, и второй WhatsApp у нижнего реза дублировал бы первый. */
:root[data-page='raschet'] .mobilecta {
  display: none;
}
```

- [ ] **Step 3: Verify the file is still CRLF and nothing else changed**

```bash
python -c "import io; s=io.open('src/app/globals.css',encoding='utf-8',newline='').read(); print('CRLF:', s.count('\r\n'), 'LF-only:', s.count('\n')-s.count('\r\n'))"
git diff --stat src/app/globals.css
```

Expected: the diff touches only added lines at the end of the file. If `LF-only` is greater than 0, your editor converted line endings: undo and re-append with the `Edit` tool.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "raschet: стили полосы, панель вне потока с компенсирующим хвостом"
```

---

### Task 5: The field component

One parameter: the resting row plus its out-of-flow panel. A disclosure button whose panel holds a radiogroup.

> **AMENDED 12.09.2026, before implementation.** The first draft of this task decided whether an
> option's value was money or a multiplier by testing `Number.isInteger(value)`. That is wrong:
> the first entry of every materials list and of the срок list has the multiplier value `1`, an
> integer, so the page would have printed «Обычный +1 ₽». Guessing is impossible in principle
> here, so the caller now states it with a `money` prop. The draft's `cn` import, its `void cn;`
> line and its `export { formatAdder as __formatAdder }` were scaffolding with no purpose and are
> gone too.

**Files:**
- Create: `src/components/ui/RaschetField.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client';

import type { Option } from '@/lib/raschet';

/**
 * ОДИН ПАРАМЕТР РАСЧЁТА: строка в покое и её панель вариантов.
 *
 * СТРОКА ЭТО DISCLOSURE, панель это радиогруппа. Выбор одного из N обязан
 * называться радиогруппой, иначе скринридер не скажет, сколько их и какой
 * стоит. §03 от радиосемантики отказался осознанно: там строки НЕ выбор, а
 * раскрытие. Здесь выбор.
 *
 * ПАНЕЛЬ ВЫНУТА ИЗ ПОТОКА. `.rs-slot` имеет нулевую высоту, панель висит в
 * ней абсолютом, а высоту компенсирует хвост колонки. Разбор арифметики
 * стоит при `.rs-cols` в globals.css; здесь важно одно: панель НЕ занимает
 * места, и сдвиг соседей ниже задаёт `data-shift`, а не эта разметка.
 *
 * ПАНЕЛЬ ОСТАЁТСЯ В РАЗМЕТКЕ ЗАКРЫТОЙ, под `hidden`. Без JS её раскрывает
 * `<noscript>`-стиль: снять `display:none` с того, чего в документе нет,
 * нельзя, а прочитать варианты и их цены обязан и тот, у кого скрипты сняты.
 *
 * ЦЕНУ ПОКАЗЫВАЮТ ТОЛЬКО СЛАГАЕМЫЕ, и говорит об этом ВЫЗЫВАЮЩИЙ, а не
 * догадка по числу. Множитель это не цена, а ставка наценки, и ни одна
 * страница «Альфы» такой таблицы не печатала (решение заказчика 12.09.2026).
 */
export function RaschetField({
  id, label, value, price, options, selected, money, open, shift, onToggle, onPick, mode = 'radio',
}: {
  id: string;
  label: string;
  /** Что стоит в строке в покое. */
  value: string;
  /** Цена у правого поля строки. Пусто у параметров, которые множатся. */
  price?: string;
  options: readonly Option[];
  /** Номера выбранных вариантов. У радиогруппы ровно один. */
  selected: readonly number[];
  /** Значения вариантов это рубли, а не множители: печатать ли их. */
  money?: boolean;
  open: boolean;
  shift: boolean;
  onToggle: () => void;
  onPick: (i: number) => void;
  mode?: 'radio' | 'toggle';
}) {
  const panelId = `rs-panel-${id}`;

  return (
    <div className="rs-field" data-shift={shift ? 'true' : 'false'}>
      <button type="button" className="rs-row" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span className="t-label fg-56">{label}</span>
        <span className="rs-row-v">{value}</span>
        <span className="rs-row-p">{price ?? ''}</span>
      </button>

      <div className="rs-slot">
        <div id={panelId} className="rs-panel" hidden={!open}
             role={mode === 'radio' ? 'radiogroup' : 'group'} aria-label={label}>
          {options.map((o, i) => {
            const on = selected.includes(i);
            return (
              <button
                key={o.label}
                type="button"
                className="rs-opt"
                {...(mode === 'radio'
                  ? { role: 'radio', 'aria-checked': on, tabIndex: on ? 0 : -1 }
                  : { 'aria-pressed': on })}
                onClick={() => onPick(i)}
              >
                <span className="rs-opt-mark" aria-hidden />
                <span>{o.label}</span>
                <span className="rs-opt-p">{money ? formatMoney(o.value) : ''}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Слагаемое у правого поля варианта. Ноль печатается словом «0 ₽», а не
 * пустотой: «Без отделки» и «Самовывоз» это тоже цена, и читатель обязан
 * видеть, что она названа, а не забыта.
 */
function formatMoney(value: number): string {
  if (value === 0) return '0 ₽';
  const sign = value > 0 ? '+' : '−';
  return `${sign}${Math.abs(value).toLocaleString('ru-RU').replace(/ /g, ' ')} ₽`;
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no output, exit 0. If it reports errors in files this task did not create, those belong to the other sessions working in this repo — report them, do not fix them.

- [ ] **Step 3: Check `formatMoney` against the real values**

```bash
node --input-type=module -e "
const f = (v) => { if (v === 0) return '0 ₽'; const s = v > 0 ? '+' : '−'; return s + Math.abs(v).toLocaleString('ru-RU').replace(/ /g,' ') + ' ₽'; };
for (const v of [0, 600, 1400, 2500, -300]) console.log(v, '->', f(v));
"
```

Expected `0 ₽`, `+600 ₽`, `+1 400 ₽`, `+2 500 ₽`, `−300 ₽`. The last sign is U+2212, a real minus, not a hyphen.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/RaschetField.tsx
git commit -m "raschet: строка параметра и её панель вариантов"
```

---

### Task 6: The section

**Files:**
- Create: `src/components/sections/Raschet.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client';

import { useEffect, useReducer, useState } from 'react';
import { Section, Sheet } from '@/components/layout/Sheet';
import { RaschetField } from '@/components/ui/RaschetField';
import { CONTACTS } from '@/content/site';
import {
  PRODUCTS, PRODUCTS_BY_ID, SHARED, SLOW_PRODUCTS, TERMS, DEFAULTS, RASCHET,
} from '@/content/raschet';
import {
  runTotal, setupTotal, grandTotal, termKey, formatRub, raschetMessage, type Choice,
} from '@/lib/raschet';
import { WA } from '@/lib/whatsapp';

/**
 * ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ.
 *
 * СТРАНИЦА ДЕЛИТСЯ ПО САМОЙ ФОРМУЛЕ, а не по вкусу: слева то, что множится на
 * каждый экземпляр, справа то, что платится один раз. Так считают в
 * типографии, и подписи колонок это единственное место, где мысль названа.
 *
 * В ПОКОЕ ВИДНО ТОЛЬКО ВЫБРАННОЕ. Первая редакция печатала все варианты сразу
 * и была отвергнута заказчиком: сорок строк на экране это не честность.
 *
 * РАСКРЫТА ВСЕГДА НЕ БОЛЬШЕ ОДНОЙ СТРОКИ НА ВСЮ СТРАНИЦУ. Отсюда одно
 * состояние `open`, а не по одному на колонку: две открытые панели развели бы
 * высоты колонок, и хвост перестал бы держать лист.
 *
 * СМЕНА ПРОДУКТА СБРАСЫВАЕТ материал, формат и отделку на первый вариант, и
 * это не удобство, а верность: прежний сайт пересобирал эти три списка
 * заново, и выбор в них не переживал смены продукта. Макет, срок, получение и
 * галочки переживали, и здесь переживают.
 */

type State = Choice;

type Action =
  | { t: 'product'; id: string }
  | { t: 'qty'; n: number }
  | { t: 'pick'; field: 'material' | 'format' | 'finish' | 'design' | 'speed' | 'delivery'; i: number }
  | { t: 'extra'; id: string };

const INITIAL: State = {
  productId: DEFAULTS.productId,
  qty: DEFAULTS.qty,
  material: 0, format: 0, finish: 0, design: 0, speed: 0, delivery: 0,
  extras: [],
};

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'product':
      return { ...s, productId: a.id, material: 0, format: 0, finish: 0 };
    case 'qty':
      return { ...s, qty: a.n };
    case 'pick':
      return { ...s, [a.field]: a.i };
    case 'extra':
      return {
        ...s,
        extras: s.extras.includes(a.id) ? s.extras.filter((x) => x !== a.id) : [...s.extras, a.id],
      };
  }
}

export function Raschet() {
  const [s, dispatch] = useReducer(reducer, INITIAL);
  const [open, setOpen] = useState<string | null>(null);

  const p = PRODUCTS_BY_ID[s.productId];

  /* Метка страницы гасит нижнюю панель телефона: её работу делает плашка
     итога. Стоит на :root, потому что панель живёт в макете, а не здесь. */
  useEffect(() => {
    document.documentElement.dataset.page = 'raschet';
    return () => { delete document.documentElement.dataset.page; };
  }, []);

  /* Escape складывает раскрытое, откуда бы фокус ни пришёл. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const run = runTotal(p, s, SHARED);
  const setup = setupTotal(p, s, SHARED);
  const total = grandTotal(p, s, SHARED);
  const term = TERMS[termKey(p, s, SHARED, SLOW_PRODUCTS)];

  const pickedExtras = SHARED.extras.filter((e) => s.extras.includes(e.id));

  const toggle = (id: string) => setOpen((v) => (v === id ? null : id));

  /* Колонка знает ДВА числа: раскрыта ли она и на сколько строк. Из них
     globals.css считает и сдвиг соседей, и хвост. */
  const colProps = (fields: readonly string[], counts: Record<string, number>) => {
    const openHere = open !== null && fields.includes(open);
    return {
      'data-open': openHere ? 'true' : 'false',
      style: openHere ? ({ ['--rs-open-n' as string]: counts[open] }) : undefined,
    };
  };

  const shiftIn = (fields: readonly string[], me: string) =>
    open !== null && fields.includes(open) && fields.indexOf(open) < fields.indexOf(me);

  const RUN_FIELDS = ['qty', 'material', 'format', 'speed'] as const;
  const SETUP_FIELDS = ['finish', 'design', 'delivery', 'extras'] as const;
  const runCounts = { qty: 0, material: p.materials.length, format: p.formats.length, speed: SHARED.speed.length };
  const setupCounts = { finish: p.finishes.length, design: SHARED.design.length, delivery: SHARED.delivery.length, extras: SHARED.extras.length };

  return (
    <>
      <Section id="raschet" ground="paper" gain={0.8}>
        <Sheet className="rs-head">
          <p className="t-label fg-56">{RASCHET.kicker}</p>
          <button
            type="button"
            className="rs-name"
            aria-expanded={open === 'product'}
            aria-controls="rs-products"
            onClick={() => toggle('product')}
          >
            {p.title}
          </button>
          <p className="t-label" style={{ color: 'var(--color-rubine)' }}>{RASCHET.switchProduct}</p>
          <p className="rs-lead">{RASCHET.lead}</p>
        </Sheet>

        <Sheet className="rs-body">
          <div className="rs-cols">
            {/* ── ТИРАЖ ───────────────────────────────────────────────── */}
            <div className="rs-col" {...colProps(RUN_FIELDS, runCounts)}>
              <h2 className="rs-colhead t-label fg-56">
                <span>{RASCHET.run.title}</span>
                <span className="fg-56">{RASCHET.run.caption}</span>
              </h2>

              <div className="rs-field" data-shift="false">
                <div className="rs-row">
                  <span className="t-label fg-56">{RASCHET.fields.qty}</span>
                  <span className="flex items-baseline gap-[13px]">
                    <Stepper label={RASCHET.qtyLess} onClick={() => dispatch({ t: 'qty', n: Math.max(1, s.qty - 50) })}>−</Stepper>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={s.qty}
                      aria-label={RASCHET.fields.qty}
                      onChange={(e) => dispatch({ t: 'qty', n: Math.max(1, Number(e.target.value) || 1) })}
                      className="font-display w-24 bg-transparent text-[clamp(22px,2.1vw,34px)] font-bold tracking-[-0.03em] tabular-nums outline-none"
                    />
                    <Stepper label={RASCHET.qtyMore} onClick={() => dispatch({ t: 'qty', n: s.qty + 50 })}>+</Stepper>
                  </span>
                  <span className="rs-row-p">{RASCHET.qtyUnit}</span>
                </div>
              </div>

              <RaschetField
                id="material" label={RASCHET.fields.material}
                value={p.materials[s.material].label}
                options={p.materials} selected={[s.material]}
                open={open === 'material'} shift={shiftIn(RUN_FIELDS, 'material')}
                onToggle={() => toggle('material')}
                onPick={(i) => dispatch({ t: 'pick', field: 'material', i })}
              />
              <RaschetField
                id="format" label={RASCHET.fields.format}
                value={p.formats[s.format].label}
                options={p.formats} selected={[s.format]}
                open={open === 'format'} shift={shiftIn(RUN_FIELDS, 'format')}
                onToggle={() => toggle('format')}
                onPick={(i) => dispatch({ t: 'pick', field: 'format', i })}
              />
              <RaschetField
                id="speed" label={RASCHET.fields.speed}
                value={SHARED.speed[s.speed].label}
                options={SHARED.speed} selected={[s.speed]}
                open={open === 'speed'} shift={shiftIn(RUN_FIELDS, 'speed')}
                onToggle={() => toggle('speed')}
                onPick={(i) => dispatch({ t: 'pick', field: 'speed', i })}
              />

              <div className="rs-tail" aria-hidden />
              <p className="rs-subtotal">
                <span className="t-label fg-56">{RASCHET.run.total}</span>
                <span className="rs-subtotal-n">{formatRub(run)}</span>
              </p>
            </div>

            {/* ── ПРИЛАДКА ────────────────────────────────────────────── */}
            <div className="rs-col" {...colProps(SETUP_FIELDS, setupCounts)}>
              <h2 className="rs-colhead t-label fg-56">
                <span>{RASCHET.setup.title}</span>
                <span className="fg-56">{RASCHET.setup.caption}</span>
              </h2>

              <RaschetField
                id="finish" label={RASCHET.fields.finish}
                value={p.finishes[s.finish].label}
                price={p.finishes[s.finish].value ? formatRub(p.finishes[s.finish].value) : undefined}
                options={p.finishes} selected={[s.finish]}
                open={open === 'finish'} shift={shiftIn(SETUP_FIELDS, 'finish')}
                onToggle={() => toggle('finish')}
                onPick={(i) => dispatch({ t: 'pick', field: 'finish', i })}
              />
              <RaschetField
                id="design" label={RASCHET.fields.design}
                value={SHARED.design[s.design].label}
                price={SHARED.design[s.design].value ? formatRub(SHARED.design[s.design].value) : undefined}
                options={SHARED.design} selected={[s.design]}
                open={open === 'design'} shift={shiftIn(SETUP_FIELDS, 'design')}
                onToggle={() => toggle('design')}
                onPick={(i) => dispatch({ t: 'pick', field: 'design', i })}
              />
              <RaschetField
                id="delivery" label={RASCHET.fields.delivery}
                value={SHARED.delivery[s.delivery].label}
                price={SHARED.delivery[s.delivery].value ? formatRub(SHARED.delivery[s.delivery].value) : undefined}
                options={SHARED.delivery} selected={[s.delivery]}
                open={open === 'delivery'} shift={shiftIn(SETUP_FIELDS, 'delivery')}
                onToggle={() => toggle('delivery')}
                onPick={(i) => dispatch({ t: 'pick', field: 'delivery', i })}
              />
              <RaschetField
                id="extras" label={RASCHET.fields.extras}
                mode="toggle"
                value={pickedExtras.length ? pickedExtras.map((e) => e.label).join(' · ') : RASCHET.extrasEmpty}
                price={pickedExtras.length ? formatRub(pickedExtras.reduce((n, e) => n + e.value, 0)) : undefined}
                options={SHARED.extras}
                selected={SHARED.extras.map((e, i) => (s.extras.includes(e.id) ? i : -1)).filter((i) => i >= 0)}
                open={open === 'extras'} shift={false}
                onToggle={() => toggle('extras')}
                onPick={(i) => dispatch({ t: 'extra', id: SHARED.extras[i].id })}
              />

              <div className="rs-tail" aria-hidden />
              <p className="rs-subtotal">
                <span className="t-label fg-56">{RASCHET.setup.total}</span>
                <span className="rs-subtotal-n">{formatRub(setup)}</span>
              </p>
            </div>
          </div>

          {/* Восемнадцать продуктов накрывают расчёт целиком. */}
          <div
            id="rs-products"
            className="rs-products"
            hidden={open !== 'product'}
            role="radiogroup"
            aria-label={RASCHET.kicker}
          >
            {PRODUCTS.map((item) => {
              const on = item.id === s.productId;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="rs-product"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => { dispatch({ t: 'product', id: item.id }); setOpen(null); }}
                >
                  <span className="rs-opt-mark" aria-hidden />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        </Sheet>

        <div className="rs-total ground-ink">
          <Sheet>
            <div className="rs-total-in" aria-live="polite">
              <p>
                <span className="t-label fg-56">{RASCHET.totalLabel}</span>
                <span className="rs-total-n block">≈&thinsp;{formatRub(total)}</span>
              </p>
              <p>
                <span className="t-label fg-56">{RASCHET.termLabel}</span>
                <span className="block font-semibold">{term}</span>
              </p>
              <p>
                <span className="t-label fg-56">{RASCHET.recLabel}</span>
                <span className="fg-56 block">{p.rec}</span>
              </p>
            </div>
          </Sheet>
          <div className="rs-cta">
            <a
              data-wa="true"
              href={`${WA}?text=${encodeURIComponent(raschetMessage(p, s, SHARED, RASCHET))}`}
              target="_blank"
              rel="noreferrer"
            >
              {RASCHET.waCta}
            </a>
            <a href={CONTACTS.phoneHref}>
              {RASCHET.callCta} · {CONTACTS.phone}
            </a>
          </div>
        </div>

        <Sheet className="rs-note">
          <p className="t-label fg-56">{RASCHET.noteTitle}</p>
          <p>{RASCHET.note}</p>
        </Sheet>
      </Section>
    </>
  );
}

function Stepper({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fg-70 grid h-[26px] w-[26px] place-items-center border border-[var(--rule)] text-[14px]"
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Check the utility classes exist**

`t-label`, `fg-56`, `fg-70`, `font-display` are project utilities. Confirm each is defined:

```bash
grep -nE "t-label|@utility fg-56|@utility fg-70" src/app/globals.css | head
```

If any is missing, replace it with the nearest one that does exist rather than inventing a class.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: no output, exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Raschet.tsx
git commit -m "raschet: полоса целиком, две колонки по арифметике и плашка итога"
```

---

### Task 7: The route

**Files:**
- Create: `src/app/raschet/page.tsx`

- [ ] **Step 1: Write the route**

```tsx
import type { Metadata } from 'next';
import { Raschet } from '@/components/sections/Raschet';
import { VykhodnyeDannye } from '@/components/sections/VykhodnyeDannye';
import { RASCHET } from '@/content/raschet';

/**
 * СТРАНИЦА ПРЕДВАРИТЕЛЬНОГО РАСЧЁТА.
 *
 * КОНЧАЕТСЯ ВЫХОДНЫМИ ДАННЫМИ, как и главная, и довод не «так принято»:
 * выходные данные это то, чем кончается любой печатный лист.
 */
export const metadata: Metadata = {
  title: RASCHET.title,
  description: RASCHET.metaDescription,
  alternates: { canonical: '/raschet' },
  openGraph: {
    title: `${RASCHET.title} · Альфа Принт`,
    description: RASCHET.metaDescription,
  },
};

export default function RaschetPage() {
  return (
    <main id="main">
      <Raschet />
      <VykhodnyeDannye />
    </main>
  );
}
```

- [ ] **Step 2: Build and confirm the route emitted**

```bash
npm run build
ls out/raschet/
```

Expected: `next build` completes, and `out/raschet/index.html` exists (`trailingSlash: true` makes the route a directory).

- [ ] **Step 3: Confirm the default state is in the static HTML**

```bash
python -c "
import io
s = io.open('out/raschet/index.html', encoding='utf-8').read()
for needle in ['Визитки', '1 200', 'Предварительный расчёт', 'Тираж', 'Приладка', 'ознакомительный']:
    print(needle, '→', needle.replace(' ', '\u00a0') in s or needle in s)
"
```

Expected: every line ends in `True`. The static export must carry the default calculation, not an empty shell.

- [ ] **Step 4: Commit**

```bash
git add src/app/raschet/page.tsx
git commit -m "raschet: маршрут /raschet, страница кончается выходными данными"
```

---

### Task 8: Wire the page into the site chrome

Four small edits to files other sessions are also touching. **Re-read each file immediately before editing it.**

**Files:**
- Modify: `src/content/site.ts` (`NAV`, `HEADER.ctaHref`)
- Modify: `src/components/chrome/TopBar.tsx` (nav links become `<Link>`)
- Modify: `src/components/chrome/PlateProvider.tsx` (the delegated hash handler)

- [ ] **Step 1: Point the navigation at the page**

In `src/content/site.ts`, replace the `NAV` array. The home-page anchors become root-relative, otherwise from `/raschet` they resolve against `/raschet` and go nowhere.

```ts
/* ── Навигация говорит словами покупателя, а не цеховым жаргоном ────────── */
/**
 * АДРЕСА РАЗДЕЛОВ ГЛАВНОЙ КОРНЕВЫЕ, а не голые якоря, и это не стиль записи.
 * С появлением второй страницы голый `#dopusk`, нажатый на `/raschet`,
 * разрешается ОТНОСИТЕЛЬНО `/raschet`, где такого узла нет, и пункт меню
 * перестаёт работать. Префикс площадки подставляет `<Link>`, см. `TopBar`.
 */
export const NAV = [
  { label: 'Главная', href: '/#pervyi-progon' },
  { label: 'О нас', href: '/#dopusk' },
  { label: 'Услуги', href: '/#dve-formy' },
  { label: 'Расчёт', href: '/raschet' },
  { label: 'Отзывы', href: '/#podpisnoi-list' },
  { label: 'Контакты', href: '/#vykhodnye-dannye' },
] as const;
```

And repoint the header action. Keep the word: the page ends in sending a наряд to WhatsApp, so «Заказать» stays true.

```ts
  ctaHref: '/raschet',
```

- [ ] **Step 2: Fix the active-section indicator, which compares against `NAV.href`**

In `src/components/chrome/TopBar.tsx`, the effect sets `active` to `` `#${s.id}` ``. That no longer matches the new `NAV` hrefs. Change that one line:

```tsx
      setActive(s ? `/#${s.id}` : null);
```

- [ ] **Step 3: Render nav items with `<Link>`**

Add the import at the top of `src/components/chrome/TopBar.tsx`:

```tsx
import Link from 'next/link';
```

Then in **both** nav lists (the rail list and the `#menu-panel` list), swap the `<a href={item.href}>` for `<Link href={item.href}>` keeping every other attribute. `<Link>` prefixes `basePath` (`/alfaprint`); a hand-written `<a href="/#dopusk">` would not, and would land outside the subdirectory.

- [ ] **Step 4: Widen the smooth-scroll handler**

In `src/components/chrome/PlateProvider.tsx` the delegated handler matches `a[href^="#"]`. Root-relative hashes no longer match it, so clicking «О нас» on the home page would do a full navigation instead of a Lenis scroll. Replace the selector line and the lookup with a same-document test:

```ts
      const link = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      /* Свой якорь это ссылка с хешем, чей путь равен текущему. Прежде здесь
         стоял селектор `a[href^="#"]`, и он перестал ловить пункты меню, когда
         у сайта появилась вторая страница и адреса разделов стали корневыми.
         Чужая страница уходит браузеру: плавно везти читателя туда, где его
         ещё нет, нечем. */
      if (!link || !link.hash || link.pathname !== window.location.pathname) return;
```

Keep the rest of the handler (the `preventDefault`, the `--topbar-h` offset and the `lenis.scrollTo`) exactly as it is, but look the target up from `link.hash` rather than from the raw attribute.

- [ ] **Step 5: Typecheck and build**

```bash
npm run typecheck && npm run build
```

Expected: both succeed.

- [ ] **Step 6: Confirm the nav actually points at the subdirectory**

```bash
python -c "
import io
s = io.open('out/index.html', encoding='utf-8').read()
print('/alfaprint/raschet in home nav:', '/alfaprint/raschet' in s)
print('/alfaprint/#dopusk in home nav:', '/alfaprint/#dopusk' in s)
print('bare href=\"#dopusk\" left over:', 'href=\"#dopusk\"' in s)
"
```

Expected:
```
/alfaprint/raschet in home nav: True
/alfaprint/#dopusk in home nav: True
bare href="#dopusk" left over: False
```

- [ ] **Step 7: Commit**

```bash
git add src/content/site.ts src/components/chrome/TopBar.tsx src/components/chrome/PlateProvider.tsx
git commit -m "raschet: пункт «Расчёт» в меню, корневые адреса разделов, якорь своей страницы"
```

---

### Task 9: Verify the constant-height law

The whole panel mechanism exists for one guarantee: the document height never changes. Measure it, do not assume it.

Port 3000 usually belongs to a peer session and a second `next dev` refuses to start, so measure the **built** output through a throwaway static server.

**Files:**
- Create: `scripts/measure-raschet.mjs` (temporary, deleted in step 4)

- [ ] **Step 1: Write the measuring rig**

```js
/**
 * ЗАМЕР ЗАКОНА ПОСТОЯННОЙ ВЫСОТЫ. Поднимает `out/` под префиксом площадки,
 * открывает /raschet в уже установленном Chromium и печатает высоту документа
 * во всех состояниях: закрыто, каждая строка по очереди, каждый продукт.
 *
 * Запуск: npm run build && node scripts/measure-raschet.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve('out');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]).replace(/^\/alfaprint/, '');
  let file = path.join(ROOT, p);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const probe = `
  const out = [];
  const h = () => document.documentElement.scrollHeight;
  const rows = [...document.querySelectorAll('.rs-row[aria-controls]')];
  out.push(['закрыто', h()]);
  for (const r of rows) { r.click(); out.push([r.textContent.trim().slice(0, 22), h()]); r.click(); }
  const name = document.querySelector('.rs-name');
  name.click();
  for (const b of [...document.querySelectorAll('.rs-product')]) {
    b.click(); out.push(['продукт: ' + b.textContent.trim().slice(0, 18), h()]);
    name.click();
  }
  document.title = JSON.stringify(out);
`;

const CHROME = path.join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1228', 'chrome-win64', 'chrome.exe');
if (!fs.existsSync(CHROME)) { console.error('Chromium не найден:', CHROME); process.exit(1); }

const html = `<script>
  window.onload = () => {
    const f = document.querySelector('iframe');
    setTimeout(() => { const d = f.contentDocument; const s = d.createElement('script');
      s.textContent = ${JSON.stringify(probe)}; d.body.appendChild(s);
      document.body.textContent = d.title; }, 3000);
  };
</script><iframe src="http://127.0.0.1:${port}/alfaprint/raschet/" style="width:1440px;height:900px;border:0"></iframe>`;
const rig = path.join(process.env.TEMP ?? '.', 'raschet-measure.html');
fs.writeFileSync(rig, html, 'utf8');

const r = spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox',
  '--window-size=1440,900', '--virtual-time-budget=20000', '--dump-dom', 'file:///' + rig.replace(/\\/g, '/')],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const m = r.stdout.match(/<body>([\s\S]*?)<\/body>/);
const rows = JSON.parse(m[1].trim());
const heights = [...new Set(rows.map((x) => x[1]))];
for (const [what, hgt] of rows) console.log(String(hgt).padStart(7), what);
console.log(heights.length === 1
  ? `\nВЫСОТА ПОСТОЯННА: ${heights[0]} px во всех ${rows.length} состояниях.`
  : `\nВЫСОТА ГУЛЯЕТ: ${heights.join(', ')}`);
server.close();
process.exit(heights.length === 1 ? 0 : 1);
```

- [ ] **Step 2: Run it**

```bash
npm run build && node scripts/measure-raschet.mjs
```

Expected: every state prints the same number, then `ВЫСОТА ПОСТОЯННА: NNNN px во всех 23 состояниях.`

- [ ] **Step 3: If the height varies, fix the cause, not the measurement**

The two things that break it:
- **an option label wrapping to a second line.** `--rs-opt-h` is a fixed height and `.rs-opt` is `white-space: nowrap`, so a too-long label overflows instead of wrapping and the height holds, but it will look wrong. Check the widest label («Премиум картон / фактурная бумага») at 1024 px and lower the `980px` breakpoint if it collides.
- **a panel with more than five options.** `--rs-panel-max` is five rows. If a longer list ever appears, raise it there and nowhere else.

- [ ] **Step 4: Delete the rig and commit**

The rig is a one-off, not part of the repo's test surface: `scripts/check-raschet.mjs` is.

```bash
rm scripts/measure-raschet.mjs
git status --short
```

Expected: `scripts/measure-raschet.mjs` is not listed (it was never committed).

---

### Task 10: Full verification

- [ ] **Step 1: Run everything**

```bash
npm run check:raschet && npm run typecheck && npm run build
```

Expected: the check prints `ВСЁ СОШЛОСЬ.`, typecheck is silent, build succeeds.

- [ ] **Step 2: Confirm you did not disturb the home page**

```bash
python -c "
import io
s = io.open('out/index.html', encoding='utf-8').read()
for n in ['Альфа', 'Полиграфия', 'Гравировка', 'Тарчокова']:
    print(n, '→', n in s)
"
git diff --stat HEAD~6 -- src/components/sections/ src/content/catalogue.ts
```

Expected: all `True`; the diff shows no change to any existing section or to `catalogue.ts`.

- [ ] **Step 3: Confirm `priceFrom` is still empty**

The spec's one hard boundary: the calculator's prices do not leak into §03.

```bash
grep -n "priceFrom" src/content/catalogue.ts
```

Expected: only the commented-out slots and the type declaration. No uncommented `priceFrom:` with a value.

- [ ] **Step 4: Screenshot for the client**

```bash
node -e "
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const CHROME=path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1228','chrome-win64','chrome.exe');
console.log('chromium present:', fs.existsSync(CHROME));
"
```

If present, serve `out/` as in Task 9 and shoot `/alfaprint/raschet/` at 1440×900 and 390×844 with `--screenshot=`. Send both to the user.

---

## Self-review notes

**Spec coverage.** §1.1 источник → Task 1. §1.2 восемнадцать продуктов → Tasks 1–2. §1.3 общие параметры → Task 2 step 4. §1.4 формула, срок, контрольный пример, состояние по умолчанию → Task 2 steps 1 and 5. §1.5 что не переносится → nothing built, correct by omission. §2 место на сайте → Tasks 7–8. §3.1 закон страницы → Task 4 (`.rs-opt` colouring) and Task 6. §3.2 сверху вниз → Task 6. §3.3 две волосяные → Task 4 (`.rs-colhead` and `.rs-subtotal` are the only `border` rules on the page). §3.4 ни одного select → Tasks 5–6, buttons only. §4.1 панель вне потока → Task 4 and Task 5, verified in Task 9. §4.2 панель продуктов накрывает → Task 4 `.rs-products`, Task 6. §4.4 доступность → Task 5. §4.6 WhatsApp → Task 3. §5.1 новые файлы → all created. §5.2 правки чужих файлов → Task 8, except the `MobileCta` suppression, which Task 4 does in CSS via `:root[data-page='raschet']` and Task 6 sets the attribute, so `MobileCta.tsx` itself is never touched. §5.3 чего не делаем → Task 10 steps 2–3 assert it. §6 риски → Tasks 9 and 10.

**§4.3 движение is deliberately not implemented.** The spec asks for the total to re-print with `PrintReveal` on change. That is polish on a number that is already correct and visible, and wiring `PrintReveal` into a value that changes many times a second while the stepper is held needs its own thought about replay. It is listed as the first follow-up rather than smuggled in as a half-measure. Tell the user; do not silently drop it.

**Type consistency.** `Option`, `ExtraOption`, `Product`, `Shared`, `Choice`, `TermKey`, `MessageCopy` are declared once in `src/lib/raschet.ts` and imported by name everywhere. `runTotal` / `setupTotal` / `grandTotal` / `termKey` / `formatRub` / `raschetMessage` keep the same signatures in the test (Task 2), the library (Task 2), and the section (Task 6). `SHARED` is the object passed as the `Shared` parameter in all three.
