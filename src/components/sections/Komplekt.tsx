'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { PrintReveal, useRevealProps } from '@/components/type/PrintReveal';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { KOMPLEKT, SPHERES, rub } from '@/content/komplekt';
import { CONTACTS, SECTIONS } from '@/content/site';

/**
 * §04 · КОМПЛЕКТ
 *
 * Блок прежнего сайта «Что заказать для вашего бизнеса», перенесённый по
 * просьбе заказчика со всеми сведениями и без единого нового. Сверху
 * двенадцать сфер, под ними то, что для выбранной сферы заказывают: два
 * перечня, метки, цена комплекта и оговорка к ней. Откуда взят каждый знак и
 * чем текст отличается от источника, разобрано в `content/komplekt.ts`.
 *
 * СФЕРЫ СТОЯТ ПОЛОСОЙ НАД ОТТИСКОМ, А НЕ КОЛОНКОЙ СЛЕВА. Первая редакция
 * повторяла источник: сферы в два столбца слева, оттиск справа. Заказчик
 * забраковал её по балансу: шесть рядов фишек кончались на трети высоты, а
 * оттиск уходил под них ещё на полэкрана. С 1280 оттиск разложен в три
 * равные доли, и каждая стоит под своей парой фишек: что это за сфера
 * (имя, описание, метки), что ей заказывают (два перечня), сколько это стоит
 * (цена, оговорка, звонок). Три столбца кончаются почти на одной линии, а
 * порядок чтения источника цел: оговорка по-прежнему стоит ПОД ценой, как
 * того требуют её же слова «указанная выше». Ниже 1280 оттиск стоит одним
 * столбцом: на 1024 средняя доля в 300 px ломала оба перечня почти по
 * каждой строке.
 *
 * НАБРАНО ЯЗЫКОМ ЭТОГО ЛИСТА, А НЕ ПРЕЖНЕГО САЙТА. Там были стеклянные
 * карточки со скруглениями, тенями и эмодзи; здесь их нет ни одной. Разворот
 * тот же, что у бланка §K2: сферы стоят фишками без рамок, выбранная залита
 * краской формы K, а всё, что о сфере сказано, лежит прямо на бумажном грунте.
 * Белого листа под ним нет: по бумаге он стал бы ещё одним прямоугольником
 * чуть светлее фона, и это уже решено для бланка, см. `BlankSection`.
 *
 * ДВЕНАДЦАТЬ ФИШЕК ПРИ ПОТОЛКЕ В ПЯТЬ ЦЕЛЕЙ, и это не нарушение потолка, а
 * другой случай. Потолок записан про §03, где наведение само ставит строку на
 * машину, и десять строк под рукой переставляли лист от любого движения. Здесь
 * наведение не делает ничего, кроме краски под указателем: сферу выбирают
 * нажатием, как и на прежнем сайте. Двенадцать это число сфер источника, и
 * резать его на две группы значило бы выдумать деление, которого у фирмы нет.
 *
 * ВЫСОТУ ПОЛОСЫ ДЕРЖИТ СЕТКА, А НЕ СПИСОК. Все двенадцать оттисков стоят в
 * документе разом, в одной клетке, и у клетки общие ряды (subgrid): заголовок,
 * описание, перечни, метки, цена. Каждый ряд берёт высоту самого высокого из
 * двенадцати, поэтому смена сферы не двигает ни полосу, ни строки внутри неё:
 * цена стоит на одной линии у всех двенадцати на любом формате. Резерв здесь
 * не нужно считать формулой, как `--dv-goods-h` в §03: его считает раскладка,
 * и считает на каждой ширине заново. См. `.km-stack` в globals.css.
 *
 * СМЕНА СФЕРЫ ПЕЧАТАЕТ ОТТИСК ЗАНОВО тем же глаголом, каким на сайт входит
 * любой текст: ракель снизу вверх, ряд за рядом через 34 мс. Уходящий оттиск
 * снимается мгновенно, два оттиска в одном кадре не стоят никогда. Движение
 * целиком в CSS, по атрибуту `data-on`: нажатие не ждёт ни наблюдателя, ни
 * Motion, и при «уменьшить движение» оттиск просто встаёт на место.
 *
 * ПОЧЕМУ ВКЛАДКИ, А НЕ КНОПКИ С aria-current, как строки §03. Там строка это
 * заголовок позиции, и вынуть его из `h3` в группу значило бы потерять
 * заголовки. Здесь фишка ничего не называет сверх того, что назовёт оттиск, и
 * набор «двенадцать вариантов, одна панель» это ровно вкладки по APG: один
 * заход табуляцией, стрелки по кругу, Home и End, выбор следует за фокусом.
 */

export function Komplekt() {
  const S = SECTIONS[3];
  const [on, setOn] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const caseReveal = useRevealProps(0.068);
  const proofReveal = useRevealProps(0.102);

  /* Выбор следует за фокусом (автоматическая активация): оттиск печатается
     мгновенно и ничего не грузит, и по APG стрелка тогда обязана и
     переносить фокус, и выбирать. Кольцо замкнуто на двенадцати. */
  const onKeyDown = useCallback((e: React.KeyboardEvent, i: number) => {
    const last = SPHERES.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    setOn(next);
    tabs.current[next]?.focus();
  }, []);

  return (
    <Section id={S.id} ground="paper" gain={1.1} className="km py-[var(--section-pad)]">
      <Sheet>
        {/* Заголовок во весь формат, а не в восемь долей, как у «Отзывов»:
            имя блока здесь втрое длиннее, и в восьми долях оно ломалось
            надвое на всех настольных ширинах, а заголовок листа это одна
            строка. Лид держит своя мера. */}
        <Grid>
          <div className="col-span-4 md:col-span-12">
            <PrintReveal as="div">
              <h2 id="km-heading" className="t-h2">
                {KOMPLEKT.heading.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
            </PrintReveal>
            <PrintReveal
              as="p"
              delay={0.034}
              className="t-lead fg-70 measure mt-[clamp(24px,2.4vw,44px)]"
            >
              {KOMPLEKT.lead}
            </PrintReveal>
          </div>
        </Grid>

        <Grid className="km-spread mt-[clamp(40px,5vw,104px)]">
          {/* ── СФЕРЫ ──────────────────────────────────────────────────────
              Фишки без рамок, как в бланке §K2: имя набрано корпусом, стоящая
              сфера залита краской. У обёртки маски то же поле в 6 px, что у
              клетки оттисков: край маски отходит от залитой фишки и не
              подрезает ей крайний пиксель. Кольцо фокуса стоит ВНУТРИ фишки.

              ИМЯ СПИСКУ ДАЁТ ЗАГОЛОВОК ПОЛОСЫ, а не своя подпись: у источника
              подписи над кнопками нет, и слово, которое слышит только
              скринридер, было бы на полосе новым словом. */}
          <motion.div
            {...caseReveal}
            role="tablist"
            aria-labelledby="km-heading"
            className="km-case col-span-4 md:col-span-12"
          >
            {SPHERES.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`km-t-${s.id}`}
                aria-selected={i === on}
                aria-controls={`km-p-${s.id}`}
                tabIndex={i === on ? 0 : -1}
                onClick={() => setOn(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="km-tab"
              >
                {s.label}
              </button>
            ))}
          </motion.div>

          <div className="km-side col-span-4 md:col-span-12">
            {/* ── ОТТИСКИ ──────────────────────────────────────────────────
                Двенадцать панелей в одной клетке. Стоящая несёт `data-on` и
                принимает фокус. Остальные прячет `visibility: hidden`, и одного
                его хватает: скрытое так не читается голосом, не берёт фокус и
                не находится поиском по странице.

                НИ `inert`, НИ `aria-hidden` В РАЗМЕТКЕ НЕТ, и это не упущение.
                Оба атрибута приходят с сервера и без скрипта не снимаются ничем:
                правило <noscript> показывает глазу все двенадцать, а читающий
                голосом получал бы одну. Видимость снимает CSS, и тот же CSS её
                возвращает.

                Живой области нет: панель выбирает сам читатель, и объявлять ему
                то, что он только что нажал, значило бы прочитать её вторым
                голосом. */}
            <motion.div {...proofReveal} className="km-stack">
              {SPHERES.map((s, i) => (
                /* `--i` у ряда это его место в очереди ракеля: заголовок,
                   описание, перечни, метки, цена. CSS умножает его на 34 мс. */
                <div
                  key={s.id}
                  id={`km-p-${s.id}`}
                  role="tabpanel"
                  aria-labelledby={`km-t-${s.id}`}
                  {...(i === on ? { 'data-on': true, tabIndex: 0 } : null)}
                  className="km-print"
                >
                  <h3 className="t-h3 km-row km-title" style={{ ['--i' as string]: 0 }}>
                    {s.title}
                  </h3>
                  <p className="km-row km-desc" style={{ ['--i' as string]: 1 }}>
                    {s.desc}
                  </p>
                  <div className="km-row km-lists" style={{ ['--i' as string]: 2 }}>
                    <div>
                      <p id={`km-l-${s.id}-p`} className="t-micro fg-56 km-label">
                        {KOMPLEKT.columns.products}
                      </p>
                      <ul aria-labelledby={`km-l-${s.id}-p`} className="km-items">
                        {s.products.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p id={`km-l-${s.id}-r`} className="t-micro fg-56 km-label">
                        {KOMPLEKT.columns.premium}
                      </p>
                      <ul aria-labelledby={`km-l-${s.id}-r`} className="km-items">
                        {s.premium.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <ul className="km-row km-tags t-micro" style={{ ['--i' as string]: 3 }}>
                    {s.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className="km-row km-price" style={{ ['--i' as string]: 4 }}>
                    {KOMPLEKT.priceFrom} <span className="km-sum">{rub(s.price)}</span>
                  </p>
                </div>
              ))}

              {/* ── ОГОВОРКА И ЗВОНОК ───────────────────────────────────────
                  Общие для всех двенадцати, поэтому стоят ОДИН раз, а не в
                  каждом оттиске. Но стоят В ТОЙ ЖЕ КЛЕТКЕ, что оттиски: с 1280
                  оговорка встаёт в третью долю прямо под ценой, а цену печатает
                  оттиск, и встать под неё можно только внутри общей сетки.
                  Маску появления несёт клетка; кольцо фокуса кнопки лежит в её
                  поле в 6 px и не срезается. */}
              <div className="km-after">
                <p className="km-note">
                  <span className="t-micro km-note-label">{KOMPLEKT.note.label}</span>
                  <span className="block">
                    {KOMPLEKT.note.first.before}
                    <strong>{KOMPLEKT.note.first.strong}</strong>
                    {KOMPLEKT.note.first.after}
                  </span>
                  <span className="block">{KOMPLEKT.note.body}</span>
                  <strong className="block">{KOMPLEKT.note.last}</strong>
                </p>
                <a
                  href={KOMPLEKT.call.href}
                  aria-label={`${KOMPLEKT.call.label} ${CONTACTS.phone}`}
                  className="km-call"
                >
                  {KOMPLEKT.call.label}
                </a>
              </div>
            </motion.div>
          </div>
        </Grid>
      </Sheet>
    </Section>
  );
}
