'use client';

import { useEffect, useReducer, useState } from 'react';
import { Section, Sheet } from '@/components/layout/Sheet';
import { RaschetField } from '@/components/ui/RaschetField';
import { CONTACTS } from '@/content/site';
import {
  PRODUCTS,
  PRODUCTS_BY_ID,
  SHARED,
  SLOW_PRODUCTS,
  TERMS,
  DEFAULTS,
  RASCHET,
} from '@/content/raschet';
import {
  runTotal,
  setupTotal,
  grandTotal,
  termKey,
  formatRub,
  raschetMessage,
  type Choice,
} from '@/lib/raschet';
import { WA } from '@/lib/whatsapp';

/**
 * ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ.
 *
 * СТРАНИЦА ДЕЛИТСЯ ПО САМОЙ ФОРМУЛЕ, а не по вкусу: слева то, что множится на
 * каждый экземпляр, справа то, что платится один раз. Так считают в
 * типографии, и подписи колонок это единственное место, где мысль названа.
 *
 * В ПОКОЕ ВИДНО ТОЛЬКО ВЫБРАННОЕ: по строке на параметр. Первая редакция
 * печатала все варианты сразу и была отвергнута заказчиком 12.09.2026: сорок
 * строк на экране это не честность, это захламление.
 *
 * РАСКРЫТА ВСЕГДА НЕ БОЛЬШЕ ОДНОЙ СТРОКИ НА ВСЮ СТРАНИЦУ. Отсюда одно
 * состояние `open`, а не по одному на колонку: две открытые панели развели бы
 * высоты колонок, и хвост перестал бы держать лист.
 *
 * СМЕНА ПРОДУКТА СБРАСЫВАЕТ материал, формат и отделку на первый вариант, и
 * это не удобство, а верность: прежний сайт пересобирал эти три списка
 * заново (`fillSelect`), и выбор в них не переживал смены продукта. Макет,
 * срок, получение и галочки переживали, и здесь переживают.
 */

type State = Choice;

type PickField = 'material' | 'format' | 'finish' | 'design' | 'speed' | 'delivery';

type Action =
  | { t: 'product'; id: string }
  | { t: 'qty'; n: number }
  | { t: 'pick'; field: PickField; i: number }
  | { t: 'extra'; id: string };

const INITIAL: State = {
  productId: DEFAULTS.productId,
  qty: DEFAULTS.qty,
  material: 0,
  format: 0,
  finish: 0,
  design: 0,
  speed: 0,
  delivery: 0,
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
        extras: s.extras.includes(a.id)
          ? s.extras.filter((x) => x !== a.id)
          : [...s.extras, a.id],
      };
  }
}

/** Порядок строк в колонках. Из него же считается, кому ехать вниз. */
const RUN_FIELDS: readonly string[] = ['qty', 'material', 'format', 'speed'];
const SETUP_FIELDS: readonly string[] = ['finish', 'design', 'delivery', 'extras'];

export function Raschet() {
  const [s, dispatch] = useReducer(reducer, INITIAL);
  const [open, setOpen] = useState<string | null>(null);

  const p = PRODUCTS_BY_ID[s.productId];

  /* Метка страницы гасит нижнюю панель телефона: её работу делает плашка
     итога, и второй WhatsApp у нижнего реза дублировал бы первый. Метка
     лежит на :root, потому что панель живёт в макете, а не здесь. */
  useEffect(() => {
    document.documentElement.dataset.page = 'raschet';
    return () => {
      delete document.documentElement.dataset.page;
    };
  }, []);

  /* Escape складывает раскрытое, откуда бы фокус ни пришёл. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const run = runTotal(p, s, SHARED);
  const setup = setupTotal(p, s, SHARED);
  const total = grandTotal(p, s, SHARED);
  const term = TERMS[termKey(p, s, SHARED, SLOW_PRODUCTS)];

  const pickedExtras = SHARED.extras.filter((e) => s.extras.includes(e.id));

  const toggle = (id: string) => setOpen((v) => (v === id ? null : id));

  /* Сколько строк в раскрытой панели. Из этого числа globals.css считает и
     сдвиг соседей, и высоту хвоста; сумма «строки + панель + хвост»
     постоянна, поэтому высота листа не меняется никогда. */
  const panelRows: Record<string, number> = {
    material: p.materials.length,
    format: p.formats.length,
    speed: SHARED.speed.length,
    finish: p.finishes.length,
    design: SHARED.design.length,
    delivery: SHARED.delivery.length,
    extras: SHARED.extras.length,
  };

  const columnProps = (fields: readonly string[]) => {
    const here = open !== null && fields.includes(open);
    return {
      'data-open': here ? 'true' : 'false',
      ...(here ? { style: { ['--rs-open-n' as string]: panelRows[open] } } : null),
    };
  };

  /* Едут вниз только те строки, что НИЖЕ раскрытой, и только в её колонке. */
  const shifted = (fields: readonly string[], me: string) =>
    open !== null && fields.includes(open) && fields.indexOf(open) < fields.indexOf(me);

  /* Подытог стоит последним и едет вместе со строками: раскрытая панель всегда
     выше него. Хвост лежит ПОД ним и на ту же величину укорачивается, поэтому
     высота колонки не меняется, а в покое резерв оказывается замыкающим
     воздухом, а не дырой посреди столбца. */
  const shiftedTail = (fields: readonly string[]) => open !== null && fields.includes(open);

  const money = (n: number) => (n === 0 ? undefined : formatRub(n));

  return (
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
        <p className="t-label" style={{ color: 'var(--color-rubine)' }}>
          {RASCHET.switchProduct}
        </p>
        <p className="rs-lead">{RASCHET.lead}</p>
      </Sheet>

      <Sheet className="rs-body">
        <div className="rs-cols">
          {/* ── ТИРАЖ: всё, что множится на каждый экземпляр ─────────────── */}
          <div className="rs-col" {...columnProps(RUN_FIELDS)}>
            <h2 className="rs-colhead t-label fg-56">
              <span>{RASCHET.run.title}</span>
              <span>{RASCHET.run.caption}</span>
            </h2>

            <div className="rs-field" data-shift="false">
              <div className="rs-row">
                <span className="t-label fg-56">{RASCHET.fields.qty}</span>
                <span className="flex items-baseline gap-[13px]">
                  <Stepper
                    label={RASCHET.qtyLess}
                    onClick={() => dispatch({ t: 'qty', n: Math.max(1, s.qty - 50) })}
                  >
                    −
                  </Stepper>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={s.qty}
                    aria-label={RASCHET.fields.qty}
                    onChange={(e) =>
                      dispatch({ t: 'qty', n: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="font-display w-24 bg-transparent text-[clamp(22px,2.1vw,34px)] font-bold tracking-[-0.03em] tabular-nums outline-none"
                  />
                  <Stepper
                    label={RASCHET.qtyMore}
                    onClick={() => dispatch({ t: 'qty', n: s.qty + 50 })}
                  >
                    +
                  </Stepper>
                </span>
                <span className="rs-row-p">{RASCHET.qtyUnit}</span>
              </div>
            </div>

            <RaschetField
              id="material"
              label={RASCHET.fields.material}
              value={p.materials[s.material].label}
              options={p.materials}
              selected={[s.material]}
              open={open === 'material'}
              shift={shifted(RUN_FIELDS, 'material')}
              onToggle={() => toggle('material')}
              onPick={(i) => dispatch({ t: 'pick', field: 'material', i })}
            />
            <RaschetField
              id="format"
              label={RASCHET.fields.format}
              value={p.formats[s.format].label}
              options={p.formats}
              selected={[s.format]}
              open={open === 'format'}
              shift={shifted(RUN_FIELDS, 'format')}
              onToggle={() => toggle('format')}
              onPick={(i) => dispatch({ t: 'pick', field: 'format', i })}
            />
            <RaschetField
              id="speed"
              label={RASCHET.fields.speed}
              value={SHARED.speed[s.speed].label}
              options={SHARED.speed}
              selected={[s.speed]}
              open={open === 'speed'}
              shift={shifted(RUN_FIELDS, 'speed')}
              onToggle={() => toggle('speed')}
              onPick={(i) => dispatch({ t: 'pick', field: 'speed', i })}
            />

            <p className="rs-subtotal" data-shift={shiftedTail(RUN_FIELDS) ? 'true' : 'false'}>
              <span className="t-label fg-56">{RASCHET.run.total}</span>
              <span className="rs-subtotal-n">{formatRub(run)}</span>
            </p>
            <div className="rs-tail" aria-hidden />
          </div>

          {/* ── ПРИЛАДКА: всё, что платится один раз ─────────────────────── */}
          <div className="rs-col" {...columnProps(SETUP_FIELDS)}>
            <h2 className="rs-colhead t-label fg-56">
              <span>{RASCHET.setup.title}</span>
              <span>{RASCHET.setup.caption}</span>
            </h2>

            <RaschetField
              id="finish"
              label={RASCHET.fields.finish}
              value={p.finishes[s.finish].label}
              price={money(p.finishes[s.finish].value)}
              options={p.finishes}
              selected={[s.finish]}
              money
              open={open === 'finish'}
              shift={shifted(SETUP_FIELDS, 'finish')}
              onToggle={() => toggle('finish')}
              onPick={(i) => dispatch({ t: 'pick', field: 'finish', i })}
            />
            <RaschetField
              id="design"
              label={RASCHET.fields.design}
              value={SHARED.design[s.design].label}
              price={money(SHARED.design[s.design].value)}
              options={SHARED.design}
              selected={[s.design]}
              money
              open={open === 'design'}
              shift={shifted(SETUP_FIELDS, 'design')}
              onToggle={() => toggle('design')}
              onPick={(i) => dispatch({ t: 'pick', field: 'design', i })}
            />
            <RaschetField
              id="delivery"
              label={RASCHET.fields.delivery}
              value={SHARED.delivery[s.delivery].label}
              price={money(SHARED.delivery[s.delivery].value)}
              options={SHARED.delivery}
              selected={[s.delivery]}
              money
              open={open === 'delivery'}
              shift={shifted(SETUP_FIELDS, 'delivery')}
              onToggle={() => toggle('delivery')}
              onPick={(i) => dispatch({ t: 'pick', field: 'delivery', i })}
            />
            <RaschetField
              id="extras"
              label={RASCHET.fields.extras}
              mode="toggle"
              value={
                pickedExtras.length
                  ? pickedExtras.map((e) => e.label).join(' · ')
                  : RASCHET.extrasEmpty
              }
              price={money(pickedExtras.reduce((n, e) => n + e.value, 0))}
              options={SHARED.extras}
              selected={SHARED.extras.flatMap((e, i) => (s.extras.includes(e.id) ? [i] : []))}
              money
              open={open === 'extras'}
              shift={false}
              onToggle={() => toggle('extras')}
              onPick={(i) => dispatch({ t: 'extra', id: SHARED.extras[i].id })}
            />

            <p className="rs-subtotal" data-shift={shiftedTail(SETUP_FIELDS) ? 'true' : 'false'}>
              <span className="t-label fg-56">{RASCHET.setup.total}</span>
              <span className="rs-subtotal-n">{formatRub(setup)}</span>
            </p>
            <div className="rs-tail" aria-hidden />
          </div>
        </div>

        {/* ВОСЕМНАДЦАТЬ ПРОДУКТОВ НАКРЫВАЮТ РАСЧЁТ. Резервировать под них
            место на листе постоянно нельзя: шесть пустых строк это тот самый
            хлам, ради отмены которого раскладка и переделывалась. А накрыть
            собой расчёт смена продукта имеет право: она обесценивает всё,
            что стоит ниже. */}
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
                onClick={() => {
                  dispatch({ t: 'product', id: item.id });
                  setOpen(null);
                }}
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

        {/* Ничего никуда не отправляется, открывается WhatsApp: врать в
            подтверждении нечем. Но наряд уходит туда целиком, а не пустым
            чатом, как на прежнем сайте. */}
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
  );
}

/** Шаг тиража. Пятьдесят экземпляров это ход, которым думают о тираже. */
function Stepper({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
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
