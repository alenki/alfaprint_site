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
 * Догадка тут невозможна в принципе: первый множитель в каждом списке равен
 * единице, то есть целому числу, и всякая проверка «целое значит рубли»
 * напечатала бы «Обычный +1 ₽».
 */
export function RaschetField({
  id,
  label,
  value,
  price,
  options,
  selected,
  money,
  open,
  shift,
  onToggle,
  onPick,
  mode = 'radio',
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
      <button
        type="button"
        className="rs-row"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="t-label fg-56">{label}</span>
        <span className="rs-row-v">{value}</span>
        <span className="rs-row-p">{price ?? ''}</span>
      </button>

      <div className="rs-slot">
        <div
          id={panelId}
          className="rs-panel"
          hidden={!open}
          role={mode === 'radio' ? 'radiogroup' : 'group'}
          aria-label={label}
        >
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
  if (value === 0) return '0\u00A0₽';
  const sign = value > 0 ? '+' : '\u2212';
  return `${sign}${Math.abs(value)
    .toLocaleString('ru-RU')
    .replace(/\u202F/g, '\u00A0')}\u00A0₽`;
}
