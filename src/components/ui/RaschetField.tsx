'use client';

import type { Option } from '@/lib/raschet';

/**
 * ОДИН ПАРАМЕТР НАРЯДА: строка в покое и её панель вариантов.
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
 * ПАНЕЛЬ ОСТАЁТСЯ В РАЗМЕТКЕ ЗАКРЫТОЙ: раскрыть то, чего в документе нет,
 * нельзя, а прочитать варианты обязан и тот, у кого скрипты сняты.
 * Раскрывает её без JS `<noscript>`-стиль из `src/app/raschet/page.tsx`.
 * Закрыта она краской, `visibility` и резом, а не `display`, и довод у этой
 * тройки один: из `display:none` не выходит ни один ход. Разбор при
 * `.rs-panel` в `raschet.css`.
 *
 * И ИМЕННО ПОЭТОМУ ЗАКРЫТА ОНА НЕ АТРИБУТОМ `hidden`, А МЕТКОЙ `data-open`.
 * Preflight Tailwind объявляет `[hidden] { display: none !important }`, и это
 * `!important` в слое `base`. У важных объявлений порядок слоёв
 * ПЕРЕВЁРНУТ: важное правило вне слоёв (а `<noscript>`-стиль всегда вне
 * слоёв) слабее важного правила из `base`, и перебить его нельзя вообще
 * ничем. Замерено: с `hidden` панели не раскрывались без JS ни одна. С
 * `data-open` открывать нечего перебивать, потому что закрывают её обычные
 * правила из `@layer components`, а обычное правило вне слоёв их бьёт.
 * Для скринридера разницы нет: `visibility: hidden` убирает узел из дерева
 * доступности так же, как `hidden`, и таб по закрытой панели не идёт.
 * Проверено табом от имени продукта: ни одной кнопки варианта в ходе.
 *
 * ТОТ ЖЕ КАПКАН СТОИТ В МАКЕТЕ на `.dv-plate[hidden]` (§03), и там он тоже
 * не срабатывает. Чужой файл здесь не правится: в репозитории работают
 * другие сессии.
 *
 * ЗНАЧЕНИЕ ПЕРЕНАБИРАЕТСЯ, А НЕ ПОДМЕНЯЕТСЯ. `key` при `.rs-row-v` это не
 * оптимизация списка, а возврат хода: CSS не умеет замечать, что текст в узле
 * стал другим, переходить ему тут не от чего. Узел с новым ключом монтируется
 * заново, и `rs-reink` идёт с первого его кадра. Ключ это САМО ЗНАЧЕНИЕ,
 * поэтому выбор того же варианта второй раз ничего не перенабирает: ход
 * отвечает на смену, а не на нажатие. Закон записан при `@keyframes
 * rs-reink`: краска на именах, ни одной краски на числах.
 *
 * ГНЕЗДО ЗНАЕТ О РАСКРЫТОМ НАРАВНЕ С ПАНЕЛЬЮ. Ниже 1040 колонки встают друг
 * под друга, панель идёт В ПОТОКЕ, и прятать её там нечем: вне потока место
 * держит резерв колонки, а в потоке место обязано открыться само. Открывает
 * его гнездо долей 0fr → 1fr, и метка на нём нужна ровно для этого. Выше
 * порога метка не делает ничего.
 *
 * ЦЕН НА ЛИСТЕ НЕТ, поэтому у строки и у варианта нет правого числового
 * поля. Правый борт колонки остаётся за единицей счёта в строке тиража
 * (`.rs-row-p` в `Raschet.tsx`), и больше там не стоит ничего.
 */
export function RaschetField({
  id,
  label,
  value,
  options,
  selected,
  open,
  shift,
  onToggle,
  onPick,
}: {
  id: string;
  label: string;
  /** Что стоит в строке в покое. */
  value: string;
  options: readonly Option[];
  /** Номер выбранного варианта. */
  selected: number;
  open: boolean;
  shift: boolean;
  onToggle: () => void;
  onPick: (i: number) => void;
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
        <span key={value} className="rs-row-v rs-reink">
          {value}
        </span>
      </button>

      <div className="rs-slot" data-open={open ? 'true' : 'false'}>
        <div
          id={panelId}
          className="rs-panel"
          data-open={open ? 'true' : 'false'}
          role="radiogroup"
          aria-label={label}
        >
          {options.map((o, i) => {
            const on = selected === i;
            return (
              <button
                key={o.label}
                type="button"
                className="rs-opt"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => onPick(i)}
              >
                <span className="rs-opt-mark" aria-hidden />
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
