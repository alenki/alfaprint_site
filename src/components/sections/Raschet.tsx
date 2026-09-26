'use client';

import { useEffect, useReducer, useState } from 'react';
import { Section, Sheet } from '@/components/layout/Sheet';
import { RaschetField } from '@/components/ui/RaschetField';
import { CONTACTS } from '@/content/site';
import { ASK, PRODUCTS, PRODUCTS_BY_ID, SHARED, DEFAULTS, RASCHET } from '@/content/raschet';
import { formatQty, raschetMessage, type Choice } from '@/lib/raschet';
import { WA } from '@/lib/whatsapp';
import { Soglasie } from '@/components/ui/Soglasie';

/**
 * ЗАКАЗ.
 *
 * ЛИСТ СОБИРАЕТ НАРЯД, А НЕ СЧИТАЕТ ЦЕНУ. Цен и сроков агентства мы не
 * знаем, поэтому на листе нет ни одной суммы: читатель выбирает, что ему
 * нужно, и отправляет наряд в переписку, а цену и срок агентство называет
 * в ответ.
 *
 * ДВА БЛАНКА РЯДОМ: слева тираж (что и сколько), справа подготовка (макет и
 * срок). Подписи колонок это единственное место, где мысль названа.
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
 * СМЕНА УСЛУГИ СБРАСЫВАЕТ ВИД на первый вариант: у каждой услуги свой
 * список, и номер из чужого списка ничего бы не значил. Размер, макет и
 * срок общие для всех услуг и смену переживают.
 */

type State = Choice;

type PickField = 'kind' | 'size' | 'design' | 'speed';

type Action =
  | { t: 'product'; id: string }
  | { t: 'qty'; n: number }
  | { t: 'pick'; field: PickField; i: number };

const INITIAL: State = {
  productId: DEFAULTS.productId,
  qty: DEFAULTS.qty,
  kind: 0,
  size: 0,
  design: 0,
  speed: 0,
};

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'product':
      return { ...s, productId: a.id, kind: 0 };
    case 'qty':
      return { ...s, qty: a.n };
    case 'pick':
      return { ...s, [a.field]: a.i };
  }
}

/** Порядок строк в колонках. Из него же считается, кому ехать вниз. */
const RUN_FIELDS: readonly string[] = ['qty', 'kind', 'size'];
const SETUP_FIELDS: readonly string[] = ['design', 'speed'];

export function Raschet() {
  const [s, dispatch] = useReducer(reducer, INITIAL);
  const [open, setOpen] = useState<string | null>(null);

  const p = PRODUCTS_BY_ID[s.productId];

  /* Метка страницы гасит нижнюю панель телефона: её работу делает плашка
     наряда, и второй WhatsApp у нижнего реза дублировал бы первый. Метка
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

  const qty = formatQty(s.qty);
  const kind = p.kinds[s.kind].label;
  /* «Опишу в переписке» это ответ заказчика, а не изделие: в сводке тиража
     вместо него стоит сама услуга. В сообщение ответ уходит как есть. */
  const runName = kind === ASK.label ? p.title : kind;
  const design = SHARED.design[s.design].label;
  const speed = SHARED.speed[s.speed].label;

  const toggle = (id: string) => setOpen((v) => (v === id ? null : id));

  /* Сколько строк в раскрытой панели. Из этого числа `raschet.css` считает
     сдвиг соседних строк; резерв колонки объявлен по самой длинной панели и
     не зависит от раскрытого, поэтому высота листа не меняется никогда. */
  const panelRows: Record<string, number> = {
    kind: p.kinds.length,
    size: SHARED.size.length,
    design: SHARED.design.length,
    speed: SHARED.speed.length,
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

  return (
    <Section id="raschet" ground="paper" gain={0.8}>
      <Sheet className="rs-head">
        {/* МЕТКИ НАД ИМЕНЕМ НЕТ (решение заказчика 12.09.2026). Страница
            называет себя тремя другими способами: пунктом «Заказ» в шапке
            сайта, заголовком окна и меткой плашки наряда. Четвёртый раз над
            именем услуги был бы подписью к подписи. `RASCHET.kicker` при
            этом остаётся в копии: им подписана радиогруппа услуг для
            скринридера, где имя «Полиграфия» само по себе ничего не
            объясняет. */}
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
          {/* ── ТИРАЖ: что и сколько ─────────────────────────────────────── */}
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
              id="kind"
              label={RASCHET.fields.kind}
              value={kind}
              options={p.kinds}
              selected={s.kind}
              open={open === 'kind'}
              shift={shifted(RUN_FIELDS, 'kind')}
              onToggle={() => toggle('kind')}
              onPick={(i) => dispatch({ t: 'pick', field: 'kind', i })}
            />
            <RaschetField
              id="size"
              label={RASCHET.fields.size}
              value={SHARED.size[s.size].label}
              options={SHARED.size}
              selected={s.size}
              open={open === 'size'}
              shift={shifted(RUN_FIELDS, 'size')}
              onToggle={() => toggle('size')}
              onPick={(i) => dispatch({ t: 'pick', field: 'size', i })}
            />

            {/* РЕЗЕРВ ПАНЕЛИ СТОИТ ЗДЕСЬ, МЕЖДУ ПОСЛЕДНЕЙ СТРОКОЙ И ПОДЫТОГОМ,
                и порядок этих двух узлов несёт всю раскладку. Резерв это то
                место, куда едут строки под раскрытой панелью; подытог за ним
                прибит к подошве колонки и не едет вообще никогда. В покое
                резерв читается воздухом перед подытогом, то есть тем, чем
                кончается печатный бланк. Поменять их местами значит вернуть
                двести пунктов пустоты ПОСЛЕ показания, ради которого бланк и
                заведён. */}
            <div className="rs-tail" aria-hidden />
            {/* ПОДЫТОГ ЭТО СВОДКА КОЛОНКИ, А НЕ ЦЕНА: что и сколько одной
                строкой, как прежде сумма её строк. Повторять одно значение
                строки над ним было бы эхом, а не подытогом. В сводке есть
                число, оно меняется на каждом шаге тиража, и поэтому она не
                перенабирается краской. Единица прибита к числу неразрывным
                пробелом: «экз.» на своей строке это обрывок. */}
            <p className="rs-subtotal">
              <span className="t-label fg-56">{RASCHET.run.total}</span>
              <span className="rs-subtotal-n">{`${runName} · ${qty} ${RASCHET.qtyUnit}`}</span>
            </p>
          </div>

          {/* ── ПОДГОТОВКА: макет и срок ─────────────────────────────────── */}
          <div className="rs-col" {...columnProps(SETUP_FIELDS)}>
            <h2 className="rs-colhead t-label fg-56">
              <span>{RASCHET.setup.title}</span>
              <span>{RASCHET.setup.caption}</span>
            </h2>

            <RaschetField
              id="design"
              label={RASCHET.fields.design}
              value={design}
              options={SHARED.design}
              selected={s.design}
              open={open === 'design'}
              shift={shifted(SETUP_FIELDS, 'design')}
              onToggle={() => toggle('design')}
              onPick={(i) => dispatch({ t: 'pick', field: 'design', i })}
            />
            <RaschetField
              id="speed"
              label={RASCHET.fields.speed}
              value={speed}
              options={SHARED.speed}
              selected={s.speed}
              open={open === 'speed'}
              /* ПОСЛЕДНЯЯ СТРОКА ЕДЕТ ТАК ЖЕ, КАК ВСЕ: ехать некуда ВЫШЕ
                 неё, а ниже раскрытой панели стоит именно она. */
              shift={shifted(SETUP_FIELDS, 'speed')}
              onToggle={() => toggle('speed')}
              onPick={(i) => dispatch({ t: 'pick', field: 'speed', i })}
            />

            {/* Резерв и подытог: разбор в колонке тиража. */}
            <div className="rs-tail" aria-hidden />
            {/* Здесь сводка состоит из одних имён, без числа, и
                перенабирается краской, как всякое имя на листе. */}
            <p className="rs-subtotal">
              <span className="t-label fg-56">{RASCHET.setup.total}</span>
              <span key={`${design}|${speed}`} className="rs-subtotal-n rs-reink">
                {`${design} · ${speed}`}
              </span>
            </p>
          </div>
        </div>

        {/* СПИСОК УСЛУГ НАКРЫВАЕТ НАРЯД. Резервировать под него место на
            листе постоянно нельзя: пустые строки это тот самый хлам, ради
            отмены которого раскладка и переделывалась. А накрыть собой наряд
            смена услуги имеет право: она обесценивает всё, что стоит ниже. */}
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
                {qty}
                {/* Единица счёта неразрывным пробелом ВНУТРИ узла, а не
                    полем: поле рисует отбивку, но в текст её не кладёт, и
                    «100экз.» уходило бы в буфер обмена и в синтезатор речи. */}
                <span className="rs-unit">{` ${RASCHET.qtyUnit}`}</span>
              </span>
            </p>
            <p>
              <span className="t-label fg-56">{RASCHET.termLabel}</span>
              <span key={speed} className="rs-total-term rs-reink block font-semibold">
                {speed}
              </span>
            </p>
            <p>
              <span className="t-label fg-56">{RASCHET.hoursLabel}</span>
              <span className="rs-total-hours fg-70 block">
                {RASCHET.hours.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </p>
          </div>
        </Sheet>

        {/* Ничего никуда не отправляется, открывается WhatsApp: врать в
            подтверждении нечем. Но наряд уходит туда целиком, а не пустым
            чатом.

            ПОРЯДОК ТОТ ЖЕ, ЧТО У §08 НИЖЕ НА ЭТОЙ ЖЕ СТРАНИЦЕ: телефон, за
            ним WhatsApp плашкой формы R. Стояло наоборот, и два разговора об
            одном и том же на одном листе шли в разные стороны. */}
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

      {/* ОГОВОРКА ЭТО ПОСЛЕДНЕЕ ЗАЯВЛЕНИЕ ЛИСТА, А НЕ ЕГО СНОСКА. Лист без
          единой цены обязан сказать, кто и когда её назовёт, и сказать это
          не тише, чем всё остальное. Метка взята в краску формы R, ту же, что
          помечает раскрытую строку, а первое предложение набрано тем же
          весом и кеглем, что значения наряда: читатель видит его в один вес
          с тем, что выбрал. Разбор под ним остался разбором. Ни одной новой
          краски, ни одной новой линейки. */}
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
