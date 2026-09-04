'use client';

import { useRef, useState } from 'react';
import { Tick } from '@/components/chrome/Mark';
import {
  CATALOGUE,
  CATALOGUE_FOOTNOTE,
  CATALOGUE_LEAD,
  CATALOGUE_PRICE_NOTE,
  FORMES,
  MATERIALS_LINE,
  type Forme,
} from '@/content/catalogue';
import { useNaryad } from '@/state/NaryadContext';
import { cn } from '@/lib/cn';

/**
 * КАТАЛОГ — ДВЕ ФОРМЫ.
 *
 * Оба списка всегда в DOM и лежат в одних координатах. Неактивный съезжает
 * рубиновым призраком и получает inert: переключение читается как физический
 * съезд плёнки, а не как таб.
 *
 * Клик по строке — это добавление в наряд, а НЕ раскрытие аккордеона.
 * Аккордеонов на сайте нет вовсе.
 *
 * Человеческое слово стоит первым, буква формы — вторым: «K» и «R» ничего
 * не говорят посетителю и никогда не несут смысл в одиночку.
 */
export function Catalogue() {
  const [active, setActive] = useState<Forme>('k');
  const tabsRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next: Forme = active === 'k' ? 'r' : 'k';
    setActive(next);
    tabsRef.current?.querySelector<HTMLButtonElement>(`#tab-${next}`)?.focus();
  };

  return (
    <div>
      <p className="t-lead max-w-[52ch] text-[var(--color-chalk-70)]">{CATALOGUE_LEAD}</p>

      {/* Переключатель форм */}
      <div
        ref={tabsRef}
        role="tablist"
        aria-label="Разделы каталога"
        onKeyDown={onKeyDown}
        className="mt-12 flex sticky-toggle"
      >
        {(['k', 'r'] as const).map((f) => (
          <button
            key={f}
            id={`tab-${f}`}
            role="tab"
            type="button"
            aria-selected={active === f}
            aria-controls={`panel-${f}`}
            tabIndex={active === f ? 0 : -1}
            onClick={() => setActive(f)}
            className={cn(
              't-label flex h-13 min-h-[48px] flex-1 items-center justify-center border px-4 transition-colors duration-300 sm:flex-none sm:px-8',
              active === f
                ? f === 'k'
                  ? 'border-[var(--color-chalk)] bg-[var(--color-chalk)] text-[var(--color-ink)]'
                  : 'border-[var(--color-rubine)] bg-[var(--color-rubine)] text-[var(--color-paper)]'
                : 'border-[var(--color-chalk-30)] text-[var(--color-chalk-70)]'
            )}
          >
            {FORMES[f].label} · {FORMES[f].code}
          </button>
        ))}
      </div>

      <p className="t-micro mt-4 text-[var(--color-chalk-56)]">{FORMES[active].caption}</p>

      {/* Оба списка в одних координатах */}
      <div className="mt-10 grid">
        {(['k', 'r'] as const).map((f) => (
          <FormePanel key={f} forme={f} active={active === f} />
        ))}
      </div>

      {/* Подстрочная полоса материалов — заменяет собой целую секцию */}
      <div className="hairline-t mt-12 pt-6">
        <p className="text-[15px] font-semibold leading-[1.7] text-[var(--color-chalk-70)]">
          {MATERIALS_LINE.map((m, i) => {
            const last = m === 'Бельгийский шоколад';
            return (
              <span key={m}>
                {i > 0 && <span className="opacity-40"> · </span>}
                <span className={last ? 'text-[var(--color-chalk)]' : undefined}>{m}</span>
                {last && (
                  <span className="t-micro ml-3 inline-flex items-center gap-1.5 whitespace-nowrap text-[var(--color-chalk)]">
                    <Tick className="h-2.5 w-3 text-[var(--color-rubine)]" strokeWidth={3} />
                    Да, печатаем и по нему
                  </span>
                )}
              </span>
            );
          })}
        </p>
      </div>

      <p className="t-micro mt-6 text-[var(--color-chalk-56)]">{CATALOGUE_FOOTNOTE}</p>
      <p className="mt-6 text-base font-medium text-[var(--color-chalk)]">{CATALOGUE_PRICE_NOTE}</p>
    </div>
  );
}

function FormePanel({ forme, active }: { forme: Forme; active: boolean }) {
  const rows = CATALOGUE.filter((r) => r.forme === forme);

  return (
    <div
      id={`panel-${forme}`}
      role="tabpanel"
      aria-labelledby={`tab-${forme}`}
      aria-hidden={!active}
      {...(!active && { inert: true })}
      className={cn(
        'catalogue-panel col-start-1 row-start-1',
        active ? 'is-active' : 'is-idle pointer-events-none'
      )}
    >
      <ul>
        {rows.map((row, i) => (
          <CatalogueRow key={row.id} row={row} index={i} active={active} />
        ))}
      </ul>
    </div>
  );
}

function CatalogueRow({
  row,
  index,
  active,
}: {
  row: (typeof CATALOGUE)[number];
  index: number;
  active: boolean;
}) {
  const naryad = useNaryad();
  const checked = naryad.has(row.id);

  return (
    <li style={{ transitionDelay: `${index * 26}ms` }}>
      <button
        type="button"
        tabIndex={active ? 0 : -1}
        aria-pressed={checked}
        onClick={() => naryad.toggle({ id: row.id, title: row.title })}
        className="catalogue-row hairline-b group grid w-full grid-cols-12 items-center gap-x-[var(--gutter)] gap-y-2 py-6 md:h-[124px] md:py-0"
      >
        <span className="t-micro col-span-2 self-start text-[var(--color-chalk-56)] md:col-span-1 md:self-center">
          {row.n}
        </span>

        <span className="col-span-10 md:col-span-6">
          <span className="t-h3 block text-[var(--color-chalk)]">{row.title}</span>
          <span className="mt-1.5 line-clamp-3 block text-[13px] font-semibold leading-relaxed text-[var(--color-chalk-56)] md:line-clamp-2 md:text-sm">
            {row.items.join(' · ')}
          </span>
        </span>

        <span className="t-micro col-span-9 text-[var(--color-chalk-70)] md:col-span-4 md:text-right md:transition-transform md:duration-300 md:group-hover:-translate-x-2">
          {row.priceFrom ? `${row.priceFrom} · ${row.spec}` : row.spec}
        </span>

        <span className="col-span-3 flex justify-end md:col-span-1">
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center border transition-colors duration-200',
              checked
                ? 'border-[var(--color-chalk)] bg-[var(--color-chalk)]'
                : 'border-[var(--color-chalk-30)]'
            )}
          >
            <Tick
              className="h-3 w-3.5 text-[var(--color-rubine)]"
              strokeWidth={3.4}
              drawn={checked}
            />
          </span>
          <span className="sr-only">{checked ? 'Убрать из наряда' : 'Добавить в наряд'}</span>
        </span>
      </button>
    </li>
  );
}
