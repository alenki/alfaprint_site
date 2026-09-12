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
if (a < 0 || b < 0 || b <= a) throw new Error('маркеры перенесённой таблицы не найдены или расположены неверно');
if (src.indexOf(BEGIN, a + 1) >= 0 || src.indexOf(END, b + 1) >= 0) throw new Error('маркеры перенесённой таблицы встречаются дважды');
fs.writeFileSync(path, src.slice(0, a) + generated + src.slice(b + END.length), 'utf8');
console.log(`переписано: ${o.order.length} продуктов`);
