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
  formatFrom,
  raschetMessage,
  type Choice,
} from '@/lib/raschet';
import { WA } from '@/lib/whatsapp';
import { Soglasie } from '@/components/ui/Soglasie';

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
 * состояние `open`, а не по одному на колонку: две открытые панели в одной
 * колонке потребовали бы двойного резерва, то есть вдвое больше воздуха на
 * листе в покое, ради состояния, которого никто не просил.
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

  /* Сколько строк в раскрытой панели. Из этого числа `raschet.css` считает
     сдвиг соседних строк; резерв колонки объявлен по самой длинной панели и
     не зависит от раскрытого, поэтому высота листа не меняется никогда. */
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

  /* Слагаемое у правого поля строки. Ноль не печатается вовсе: строка «без
     отделки» ничего к приладке не прибавляет, и «0 ₽» в покое было бы шумом
     (в панели, где ноль это ВЫБОР среди платных вариантов, он печатается). */
  const money = (n: number) => (n === 0 ? undefined : formatFrom(n));

  return (
    <Section id="raschet" ground="paper" gain={0.8}>
      <Sheet className="rs-head">
        {/* МЕТКИ «ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ» НАД ИМЕНЕМ БОЛЬШЕ НЕТ (решение
            заказчика 12.09.2026). Страница называет себя тремя другими
            способами: пунктом «Расчёт» в шапке сайта, заголовком окна и
            меткой плашки итога. Четвёртый раз над именем продукта был
            подписью к подписи. `RASCHET.kicker` при этом остаётся в копии:
            им подписана радиогруппа продуктов для скринридера, где имя
            «Визитки» само по себе ничего не объясняет. */}
        <button
          type="button"
          className="rs-name"
          aria-expanded={open === 'product'}
          aria-controls="rs-products"
          onClick={() => toggle('product')}
        >
          {/* Имя перенабирается краской, и ключ стоит на ВНУТРЕННЕМ узле, а
              не на кнопке: пересобранная кнопка потеряла бы фокус и свой
              `aria-expanded` на глазах у скринридера. Разбор закона при
              `@keyframes rs-reink` в `raschet.css`. */}
          <span key={p.id} className="rs-reink">
            {p.title}
          </span>
        </button>
        <p className="rs-switch t-label">{RASCHET.switchProduct}</p>
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
                <span className="rs-qty">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={s.qty}
                    aria-label={RASCHET.fields.qty}
                    onChange={(e) =>
                      dispatch({ t: 'qty', n: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="rs-qty-n"
                    /* Поле ровно по числу знаков. Цифры табличные, поэтому `ch`
                       это в точности ширина цифры: за числом не остаётся
                       пустоты, а шаг стоит к нему вплотную. */
                    style={{ width: `${String(s.qty).length + 0.4}ch` }}
                  />
                  <span className="rs-qty-step">
                    <Stepper
                      label={RASCHET.qtyLess}
                      onClick={() => dispatch({ t: 'qty', n: Math.max(1, s.qty - 50) })}
                    >
                      −
                    </Stepper>
                    <Stepper
                      label={RASCHET.qtyMore}
                      onClick={() => dispatch({ t: 'qty', n: s.qty + 50 })}
                    >
                      +
                    </Stepper>
                  </span>
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

            {/* РЕЗЕРВ ПАНЕЛИ СТОИТ ЗДЕСЬ, МЕЖДУ ПОСЛЕДНЕЙ СТРОКОЙ И ПОДЫТОГОМ,
                и порядок этих двух узлов несёт всю раскладку. Резерв это то
                место, куда едут строки под раскрытой панелью; подытог за ним
                прибит к подошве колонки и не едет вообще никогда. В покое
                резерв читается воздухом перед итогом, то есть тем, чем
                кончается печатный бланк. Поменять их местами значит вернуть
                двести пунктов пустоты ПОСЛЕ суммы, ради которой лист и
                заведён. */}
            <div className="rs-tail" aria-hidden />
            <p className="rs-subtotal">
              <span className="t-label fg-56">{RASCHET.run.total}</span>
              <span className="rs-subtotal-n">{formatFrom(run)}</span>
            </p>
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
              /* ПОСЛЕДНЯЯ СТРОКА ЕДЕТ ТАК ЖЕ, КАК ВСЕ. Здесь стояло `false`,
                 как будто «ниже неё ничего нет, значит и ехать некуда», и
                 довод перевёрнут: ехать некуда ВЫШЕ, а ниже раскрытой панели
                 стоит именно она. Любая панель в этой колонке («отделка»,
                 «макет», «получение») уводила соседей вниз, а «дополнительно»
                 оставалась на месте, и строки печатались одна поверх другой.
                 В колонке тиража на том же месте стоит «срок», и он с самого
                 начала считался правильно. */
              shift={shifted(SETUP_FIELDS, 'extras')}
              onToggle={() => toggle('extras')}
              onPick={(i) => dispatch({ t: 'extra', id: SHARED.extras[i].id })}
            />

            {/* РЕЗЕРВ ПАНЕЛИ СТОИТ ЗДЕСЬ, МЕЖДУ ПОСЛЕДНЕЙ СТРОКОЙ И ПОДЫТОГОМ,
                и порядок этих двух узлов несёт всю раскладку. Резерв это то
                место, куда едут строки под раскрытой панелью; подытог за ним
                прибит к подошве колонки и не едет вообще никогда. В покое
                резерв читается воздухом перед итогом, то есть тем, чем
                кончается печатный бланк. Поменять их местами значит вернуть
                двести пунктов пустоты ПОСЛЕ суммы, ради которой лист и
                заведён. */}
            <div className="rs-tail" aria-hidden />
            <p className="rs-subtotal">
              <span className="t-label fg-56">{RASCHET.setup.total}</span>
              <span className="rs-subtotal-n">{formatFrom(setup)}</span>
            </p>
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
          /* Не `hidden`: разбор капкана стоит в `RaschetField.tsx`. */
          data-open={open === 'product' ? 'true' : 'false'}
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
              <span className="rs-total-n">
                {/* Частица неразрывным пробелом ВНУТРИ узла, а не полем: поле
                    рисует отбивку, но в текст её не кладёт, и «от1 200 ₽»
                    уходило бы в буфер обмена и в синтезатор речи. */}
                <span className="rs-from">{'от\u00A0'}</span>
                {formatRub(total)}
              </span>
            </p>
            <p>
              <span className="t-label fg-56">{RASCHET.termLabel}</span>
              <span key={term} className="rs-total-term rs-reink block font-semibold">
                {term}
              </span>
            </p>
            <p>
              <span className="t-label fg-56">{RASCHET.recLabel}</span>
              <span key={p.id} className="rs-total-rec rs-reink fg-56 block">
                {p.rec}
              </span>
            </p>
          </div>
        </Sheet>

        {/* Ничего никуда не отправляется, открывается WhatsApp: врать в
            подтверждении нечем. Но наряд уходит туда целиком, а не пустым
            чатом, как на прежнем сайте.

            ПОРЯДОК ТОТ ЖЕ, ЧТО У §08 НИЖЕ НА ЭТОЙ ЖЕ СТРАНИЦЕ: телефон, за
            ним WhatsApp в рубине. Стояло наоборот, и два разговора об одном и
            том же на одном листе шли в разные стороны. */}
        <div className="rs-cta">
          <a href={CONTACTS.phoneHref}>
            {RASCHET.callCta} · {CONTACTS.phone}
          </a>
          <a
            data-wa="true"
            href={`${WA}?text=${encodeURIComponent(raschetMessage(p, s, SHARED, RASCHET))}`}
            target="_blank"
            rel="noreferrer"
          >
            {RASCHET.waCta}
          </a>
        </div>

        {/* СОГЛАСИЕ ПОД ПАРОЙ ДЕЙСТВИЙ, И ТА ЖЕ СТРОКА, ЧТО ПОД БЛАНКОМ:
            компонент один на оба листа, см. `ui/Soglasie.tsx`.

            ЗДЕСЬ ОНА СТОИТ НЕ ПОТОМУ, ЧТО ЛИСТ ЧТО-ТО СОБИРАЕТ. Набранного
            человеком на этом листе нет ни знака: он выбирает варианты, и в
            переписку уходит наряд, а не он сам. Строка стоит потому, что
            нажатие ведёт в тот же разговор, что и бланк, и узнать об условии
            в одном месте сайта и не узнать в другом читатель не должен. */}
        <Soglasie className="rs-soglasie" />
      </div>

      {/* ОГОВОРКА ЭТО ПОСЛЕДНЕЕ ЗАЯВЛЕНИЕ ЛИСТА, А НЕ ЕГО СНОСКА. Стояли два
          абзаца одним серым корпусом восьмым кеглем, и лист, у которого
          каждая сумма подписана «от», кончался самым тихим местом на всей
          полосе. Метка взята в рубин — единственную хрому сайта, ту же, что
          помечает раскрытую строку и итог, — а первое предложение набрано
          тем же весом и кеглем, что значения расчёта: читатель видит его в
          один вес с тем, что выбрал. Разбор под ним остался разбором.
          Ни одной новой краски, ни одной новой линейки. */}
      <Sheet className="rs-note">
        <p className="t-label rs-note-mark">{RASCHET.noteTitle}</p>
        <div>
          <p className="rs-note-lead">{RASCHET.noteLead}</p>
          <p className="rs-note-body">{RASCHET.note}</p>
        </div>
      </Sheet>
    </Section>
  );
}

/**
 * Шаг тиража. Пятьдесят экземпляров это ход, которым думают о тираже.
 *
 * Плашка без единого класса раскладки: «−» и «+» это ОДИН орган управления,
 * общий волосок и размеры им задаёт `.rs-qty-step` в `raschet.css`. Здесь
 * остаётся только имя для скринридера: на листе кнопка подписана знаком.
 */
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
    <button type="button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}
