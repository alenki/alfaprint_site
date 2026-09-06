'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { PrintReveal, useRevealProps } from '@/components/type/PrintReveal';
import { Sheet, Grid } from '@/components/layout/Sheet';
import { RegistrationMark } from '@/components/chrome/Mark';
import { CATALOGUE, FORMES, FORME_ORDER, PLATES, type Forme } from '@/content/catalogue';
import { FORMY } from '@/content/site';
import { cn } from '@/lib/cn';

/**
 * ФОРМА И ОТТИСК составляют тело §03. Разворот: слева лист, справа полоса.
 *
 * НА МАШИНЕ СТОИТ ОДНА ФОРМА. Полоса показывает пять строк, а не десять:
 * десять целей под курсором это не каталог, а список, и глаз в нём не
 * держит ни одной. Вторая пятёрка приходит СМЕНОЙ ФОРМЫ, и это не вкладки
 * ради вкладок это ровно то, что говорит заголовок полосы. Печатник не
 * ставит две формы разом: он ставит одну, печатает тираж, смывает и ставит
 * другую.
 *
 * ПЕРЕКЛЮЧАТЕЛЬ НЕ ВВОДИТ НА ПОЛОСУ НИ ОДНОГО НОВОГО ОБЪЕКТА. Это те же две
 * метки групп, что стояли здесь прежде («Краска · Форма K», «Материал ·
 * Форма R»), тем же кеглем и тем же голосом; они перестали подписывать две
 * половины списка и стали выбирать, какая из них на машине. И линия реза
 * никуда не делась: волосяная под метками набрана в полную силу ровно на той
 * половине, чья форма стоит на машине, и переезжает на вторую при смене.
 * Раньше эта линия лежала между строками 05 и 06 и говорила «выше краска,
 * ниже её нет»; теперь она говорит «краска подана сюда». Линейка та же.
 *
 * ДЕЛЕНИЕ КАТАЛОГА НЕСУТ САМИ БУКВЫ, и смена формы только усилила их: пять
 * имён формы K напечатаны: на них лежит краска; пять имён формы R не
 * напечатаны вовсе, у них только контур, и чёрное внутри очка не цвет, а
 * материал, видный там, где прошёл резак. Прежде это деление читалось на
 * одной строке стыка. Теперь вся полоса разом переходит из краски в контур.
 * Это и есть смена формы, показанная набором.
 *
 * СМЕНА ПЕЧАТАЕТСЯ, А НЕ ПОДМЕНЯЕТСЯ. Пятёрка строк лежит под ключом формы,
 * поэтому при смене она пересоздаётся, и PrintReveal проходит по ней ракелем
 * заново, сверху вниз, с той же задержкой, что при первом появлении полосы.
 * Машина при этом стоит на месте: волосяные, гнёзда квадратов и вся раскладка
 * не в PrintReveal и не мигают. Меняется форма, а не станок.
 *
 * КАЖДАЯ ФОРМА ПОМНИТ СВОЮ РАСКРЫТУЮ СТРОКУ. Вернуться к краске значит
 * увидеть тот же оттиск, на котором её оставили. Сбрасывать выбор на первую
 * строку значило бы, что форму каждый раз ставят заново.
 *
 * Слева ОТТИСК: один белый лист, который перепечатывают. ВСЕ ДЕСЯТЬ оттисков
 * лежат в одних координатах и остаются в документе при любой форме: высоту
 * листа задаёт самый высокий, и она не меняется никогда. На листе стоит то,
 * что заказчик ищет глазами: полное торговое имя и перечень изделий. Описание
 * процесса стоит на полосе, у своей строки, и здесь не повторяется ни словом.
 *
 * ЧЕМ КУПЛЕНО РАСКРЫТИЕ. Панель стоит ВНЕ ПОТОКА (position: absolute,
 * постоянная --dv-panel-h). Элементы ниже раскрытой строки несут data-shift и
 * едут вниз ровно на эту величину, а в конце полосы лежит спейсер той же
 * высоты. Высота §03 в документе не меняется никогда, ни при раскрытии, ни
 * ПРИ СМЕНЕ ФОРМЫ: в группах по пять строк одного кегля, и сумма высот полосы
 * одинакова во всех десяти состояниях обеих форм. Ни рефлоу, ни толчка Lenis,
 * ни перезапуска IntersectionObserver, ни перекраски грунта на :root.
 * Гармошки нет; есть приводка. Раскрытая строка ровно одна и всегда: иначе
 * листу нечего печатать.
 *
 * РАСКРЫТИЕ ВЕДЁТ УКАЗАТЕЛЬ, а не нажатие. Мышь не выбирает строку, она по
 * ней ведёт: строка под курсором и есть строка на печати, и лист слева
 * перепечатывается следом за рукой. Наведение слушает вся строка целиком,
 * вместе с раскрытой панелью, потому что панель лежит ВНУТРИ .dv-item: рука,
 * съехавшая с имени на описание, своей строки не покидает. Уход курсора не
 * закрывает ничего: иначе полоса гасла бы, стоило отвести руку.
 *
 * СТРОКА ПОД КУРСОРОМ НЕ ЕЗДИТ, и это не везение, а арифметика приводки.
 * Раскрытие сдвигает вниз только то, что НИЖЕ раскрытой строки, поэтому с
 * той, которую сам же открыл, указатель соскочить не может. Идущий вниз
 * проходит панель (она той же строки) и входит в следующую; та поднимается
 * ему навстречу ровно на --dv-panel-h, то есть ровно на ту величину, на
 * которую опустилась, и её собственные владения, строка плюс панель, выше
 * сдвига на высоту строки. Курсор остаётся внутри них при любом кегле и любом
 * формате: дребезга нет ни на одном.
 *
 * ПАЛЬЦУ И КЛАВИШЕ ОСТАВЛЕНО НАЖАТИЕ. Наведение снято по pointerType ===
 * 'mouse': на тачскрине pointerenter приходит вперёд тапа, и раскрытие по нему
 * нельзя было бы ни отменить, ни повторить. Строка остаётся кнопкой в h3:
 * тап и Enter работают, как работали.
 *
 * ЧТО СНЯТО. Радиогруппа на строках (role=radio / aria-checked), roving
 * tabindex по строкам и раскрытие по фокусу: у disclosure каждая строка это свой
 * таб-стоп, а фокус ходит по полосе стрелками и ничего не печатает, пока не
 * нажмут. aria-live с листа снят: состояние объявляет aria-expanded, и живая
 * область дала бы двойное чтение. Roving tabindex остался ровно там, где он
 * обязан быть, на двух формах: это tablist, и по APG вкладки суть один
 * таб-стоп.
 */

export function Formy() {
  /** Форма на машине. */
  const [forme, setForme] = useState<Forme>('k');
  /** Раскрытая строка КАЖДОЙ формы: своя у каждой, индекс внутри группы. */
  const [open, setOpen] = useState<Record<Forme, number>>({ k: 0, r: 0 });

  const openId = PLATES[forme][open[forme]].id;

  /* Первое появление полосы ведёт наблюдатель, как везде на сайте. СМЕНУ
     ФОРМЫ вести ему нельзя: строка, стоявшая на экране, обязана
     перепечататься сразу, а нижняя из пяти попадает в мёртвую полосу
     наблюдателя (-12 %) и осталась бы пустой до прокрутки. Флаг взводится в
     том же событии, что меняет форму, поэтому перерисовка видит его уже
     поднятым. */
  const changed = useRef(false);

  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  /* Ключ строки это «форма-номер»: в документе лежат обе пятёрки, и один
     числовой индекс склеил бы строку 02 краски со строкой 07 материала. */
  const btns = useRef<Record<string, HTMLButtonElement | null>>({});
  const mount = useRevealProps(0.16);

  /* ── ФОРМЫ ─────────────────────────────────────────────────────────────────
     Вкладки с АВТОМАТИЧЕСКОЙ активацией: панель показывается мгновенно и
     ничего не грузит, а по APG именно тогда стрелка обязана и переносить
     фокус, и ставить форму на машину. */
  const onTabKey = useCallback((e: React.KeyboardEvent, k: number) => {
    const last = FORME_ORDER.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = k === last ? 0 : k + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = k === 0 ? last : k - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    changed.current = true;
    setForme(FORME_ORDER[next]);
    tabs.current[next]?.focus();
  }, []);

  /* ── СТРОКИ ────────────────────────────────────────────────────────────────
     Стрелки ТОЛЬКО перемещают фокус и ничего не раскрывают. Кольцо замкнуто
     на пятёрке стоящей формы: за её край строк нет вовсе. */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, i: number) => {
      const last = PLATES[forme].length - 1;
      let next: number | null = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = last;
      if (next === null) return;
      e.preventDefault();
      btns.current[`${forme}-${next}`]?.focus();
    },
    [forme]
  );

  /* СРАЗУ, БЕЗ ПОРОГА. Строка встаёт на машину в том же событии,
     которым пришёл указатель. Ждать здесь нечего: раскрытие ничего не
     грузит и ничего не ломает, а порог намерения читался бы задержкой
     машины. Пролёт сквозь чужую строку теперь не стоит ничего: уходящая
     краска снимается мгновенно, и свести два оттиска в одном кадре нечем. */
  const activate = useCallback(
    (i: number) => setOpen((cur) => (cur[forme] === i ? cur : { ...cur, [forme]: i })),
    [forme]
  );

  return (
    <Sheet>
      <Grid>
        {/* ЛЕВАЯ КОЛОНКА. На планшете это вложенная сетка: слово слева, лист
            справа. На широком листе это один столбец в три доли. */}
        <div className="col-span-4 md:col-span-12 md:grid md:grid-cols-12 md:gap-x-[var(--gutter)] lg:col-span-3 lg:col-start-2 lg:block">
          <div className="md:col-span-7">
            {/* КОЛОНЦИФРА СНЯТА. «03 / Две формы» повторяла собой заголовок,
                стоящий строкой ниже и втрое крупнее: номер раздела никто не
                ищет, а название читалось дважды подряд. Разворот открывается
                тем, ради чего он набран, и верхняя строка заголовка встаёт на
                одну высоту с волосяной полосы напротив. */}
            <PrintReveal as="div">
              <h2 className="t-h3 fg">
                {FORMY.heading.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </h2>
            </PrintReveal>

            {/* Лид выдаёт набору лицензию на контурные названия: без него пять
                имён формы R читались бы сломанным шрифтом. Он же объясняет
                переключатель: про «вкладки» на полосе нет ни слова. */}
            <PrintReveal as="p" delay={0.04} className="t-body fg-70 mt-[clamp(16px,1.4vw,26px)]">
              {FORMY.lead}
            </PrintReveal>
          </div>

          <PrintReveal
            as="div"
            delay={0.08}
            className="mt-[clamp(40px,5.6vw,96px)] md:col-span-5 md:col-start-8 md:mt-0 lg:mt-[clamp(40px,5.6vw,96px)]"
          >
            {/* role=region БЕЗ aria-live: смену листа объявляет aria-expanded
                нажатой строки, живая область прочитала бы её вторым голосом.
                Оттиски всех десяти позиций остаются в документе при любой
                форме: высоту листа держит самый высокий из них. */}
            <div role="region" aria-label="Оттиск" className="dv-sheet ground-paper">
              {CATALOGUE.map((row) => (
                <div
                  key={row.id}
                  {...(row.id === openId
                    ? { 'data-on': true }
                    : { inert: true, 'aria-hidden': true })}
                  className="dv-print"
                >
                  <p className="t-micro fg-56">
                    {row.n} · {FORMES[row.forme].code}
                  </p>

                  {/* ПОЛНОЕ торговое имя видимым текстом на всех форматах: на
                      форме стоит короткое слово, и полное не имеет права
                      остаться только в sr-only. */}
                  <p className="dv-print-title">{row.title}</p>

                  <ul className="dv-print-items">
                    {row.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>

                  <p className="dv-print-foot">
                    <RegistrationMark size={22} className="text-[var(--color-ink-32)]" />
                    <span className="t-micro fg-56">{FORMES[row.forme].label}</span>
                  </p>
                </div>
              ))}
            </div>
          </PrintReveal>
        </div>

        {/* РАЗВОРОТ СДВИНУТ К КОРЕШКУ, а не перебран. Ширины обеих половин те
            же, что были: три доли под лист, шесть под полосу; каждая просто
            шагнула на долю внутрь. Три пустые доли между ними это уже не
            отбивка, а разрыв: на широком мониторе между листом и полосой
            лежало полтысячи пикселей, и разворот читался двумя несвязанными
            полосами. Теперь пустая доля между ними одна, и она держит их
            порознь, а не врозь.

            Долю 1 и долю 12 разворот отдаёт полям. Формат «край в край» это
            не отменяет: грунт, линейки соседних полос и вылеты остаются на
            резе; отступила ОДНА полоса набора, и отступила симметрично. */}

        <div className="dv-strip col-span-4 max-md:mt-[clamp(32px,7vw,56px)] md:col-span-12 md:mt-[clamp(48px,5vw,88px)] lg:col-span-6 lg:col-start-6 lg:mt-0">
          {/* ФОРМА НА МАШИНЕ. Волосяная под метками это верхняя линейка первой
              строки и линия реза разом: на половине стоящей формы она набрана
              в полную краску и переезжает вместе с формой. */}
          <motion.div
            {...mount}
            role="tablist"
            aria-label="Форма на машине"
            data-forme={forme}
            className="dv-mount"
          >
            {FORME_ORDER.map((f, k) => (
              <button
                key={f}
                ref={(el) => {
                  tabs.current[k] = el;
                }}
                type="button"
                role="tab"
                id={`dv-f-${f}`}
                className="dv-mount-tab"
                aria-selected={forme === f}
                aria-controls={`dv-plate-${f}`}
                tabIndex={forme === f ? 0 : -1}
                onClick={() => {
                  changed.current = true;
                  setForme(f);
                }}
                onKeyDown={(e) => onTabKey(e, k)}
              >
                {/* Слово и буква формы это два узла, а не одна строка: на
                    телефоне половина полосы даёт 135 px, и «Материал · Форма R»
                    ломалась там сиротской буквой. Порознь они встают друг под
                    друга нарочно, ровно в две строки у обеих форм, и высоту
                    гнезда это не двигает: её держит min-height. Пробелы между
                    узлами оставлены текстом: в доступное имя метки они входят,
                    а во флексе не рисуются вовсе. */}
                <span className="dv-mount-word">{FORMES[f].label}</span>{' '}
                <span aria-hidden className="dv-mount-dot">
                  ·
                </span>{' '}
                <span className="dv-mount-code">{FORMES[f].code}</span>
              </button>
            ))}
          </motion.div>

          {/* ОБЕ ПЯТЁРКИ ЛЕЖАТ В ДОКУМЕНТЕ, снятая формa стоит под hidden. Так у
              каждой формы своя панель (APG), и так каталог остаётся полным БЕЗ
              JS: <noscript> распускает обе полосы, а показать то, чего нет в
              разметке, никакой стилевой лист не может. Снятая форма не даёт ни
              пикселя высоты и ни одного таб-стопа: hidden это display: none.

              КЛЮЧ ПО СТОЯЩЕЙ ФОРМЕ. При смене обе полосы пересоздаются, и
              ракель проходит по пришедшей заново: форма меняется, станок
              стоит. Ушедшая пересоздаётся в display: none, где
              IntersectionObserver не срабатывает вовсе, и на экране этого нет. */}
          {FORME_ORDER.map((f) => (
            <div
              key={`${f}-${forme}`}
              id={`dv-plate-${f}`}
              role="tabpanel"
              aria-labelledby={`dv-f-${f}`}
              className="dv-plate"
              {...(f === forme ? null : { hidden: true })}
            >
              {PLATES[f].map((row, i) => (
                <Item
                  key={row.id}
                  row={row}
                  i={i}
                  open={open[f] === i}
                  shift={i > open[f]}
                  delay={0.2 + i * 0.05}
                  live={changed.current}
                  onOpen={activate}
                  onKeyDown={onKeyDown}
                  btns={btns}
                />
              ))}
            </div>
          ))}

          {/* Хвост держит полосу постоянной: это место последней панели. */}
          <div aria-hidden className="dv-tail" />

          <PrintReveal as="div" delay={0.5}>
            <a href={FORMY.link.href} className="dv-cta">
              <span className="dv-cta-pill">{FORMY.link.label}</span>
              <span className="dv-cta-go">
                {/* Стрелка набрана путями, а не символом «↗»: покрытие стрелок
                    в Golos Text не гарантировано, а подстановка из системного
                    шрифта встала бы в связке чужим кеглем. */}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                  <path
                    d="M6 18 L18 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                  />
                  <path
                    d="M9 6 L18 6 L18 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="butt"
                    strokeLinejoin="miter"
                  />
                </svg>
              </span>
            </a>
          </PrintReveal>
        </div>
      </Grid>
    </Sheet>
  );
}

/**
 * РАКЕЛЬ ПОЛОСЫ. Глагол появления один и тот же, тот, что у PrintReveal, и
 * взятый оттуда же, чтобы «уменьшить движение» и подмена маски жили в одном
 * месте. Разное только СОБЫТИЕ: первое появление ждёт наблюдателя, смена формы
 * не ждёт ничего. Ждать её заставил бы нижнюю строку из пяти стоять пустой,
 * пока читатель не тронет колесо.
 */
function Reveal({
  live,
  delay,
  className,
  children,
}: {
  live: boolean;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { whileInView, viewport, ...rest } = useRevealProps(delay);
  if (!live) {
    return (
      <motion.div {...rest} whileInView={whileInView} viewport={viewport} className={className}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div {...rest} animate={whileInView} className={className}>
      {children}
    </motion.div>
  );
}

function Item({
  row,
  i,
  open,
  shift,
  delay,
  live,
  onOpen,
  onKeyDown,
  btns,
}: {
  row: (typeof CATALOGUE)[number];
  i: number;
  open: boolean;
  shift: boolean;
  delay: number;
  live: boolean;
  onOpen: (i: number) => void;
  onKeyDown: (e: React.KeyboardEvent, i: number) => void;
  btns: React.RefObject<Record<string, HTMLButtonElement | null>>;
}) {
  const isR = row.forme === 'r';
  const pid = `dv-p-${row.id}`;

  return (
    <div
      className="dv-item"
      {...(shift ? { 'data-shift': true } : null)}
      /* РАСКРЫВАЕТ НАВЕДЕНИЕ, и слушает его строка ЦЕЛИКОМ, вместе с
         раскрытой панелью: панель лежит внутри .dv-item, и указатель,
         съехавший с имени на описание, из своей строки не выходит.
         Мышь и только мышь: на тачскрине pointerenter приходит вперёд тапа,
         и раскрытие по нему нельзя было бы ни отменить, ни повторить.
         Уход указателя не закрывает НИЧЕГО: раскрытая строка ровно одна и
         всегда, и лист слева остаётся с оттиском, на котором его бросили.
         Уход снимает лишь НЕВЫДЕРЖАННОЕ намерение: строка, мимо которой
         прошли, тиража не получает. */
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') onOpen(i);
      }}
    >
      <Reveal live={live} delay={delay} className="dv-reveal">
        {/* Заголовок СНАРУЖИ кнопки, как в APG: полоса читается по заголовкам.
            Доступного имени сверх видимого текста нет намеренно: у трёх
            позиций из десяти короткое слово не входит в полное имя, и
            aria-label={row.title} нарушил бы «Label in Name»: голосовое
            управление не нашло бы цель по тому, что видит глаз. */}
        <h3 className="dv-head">
          <button
            ref={(el) => {
              btns.current[`${row.forme}-${i}`] = el;
            }}
            type="button"
            id={`dv-b-${row.id}`}
            className="dv-btn"
            aria-expanded={open}
            aria-controls={pid}
            /* Одна панель обязана оставаться раскрытой: листу иначе нечего
               печатать. Это объявляется, а не умалчивается: кнопка остаётся
               фокусируемой, но нажатие на раскрытой строке ничего не делает. */
            {...(open ? { 'aria-disabled': true } : null)}
            onClick={() => {
              if (!open) onOpen(i);
            }}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span className="dv-name">
              <span className={cn('dv-word', isR && 'dv-word--r')}>{row.word}</span>

              {/* ПРИЗРАК стоит только у формы на машине. При спокойном
                  чтении его нет вовсе: opacity считается из --miss. Ни одного
                  motion на этом узле: инлайновый transform убил бы .plate-r. */}
              {open && (
                <span
                  aria-hidden
                  className={cn(
                    'plate-r plate-ghost dv-word dv-ghost pointer-events-none select-none',
                    isR && 'dv-word--r'
                  )}
                >
                  {row.word}
                </span>
              )}
            </span>

            <span aria-hidden className="dv-toggle" />
          </button>
        </h3>
      </Reveal>

      {/* Панель это СЕСТРА обёртки ракеля, а не её ребёнок: внутри она
          унаследовала бы отрицательные поля под призрак и была бы срезана. */}
      <div
        id={pid}
        className="dv-panel"
        {...(open ? { 'data-on': true } : { inert: true, 'aria-hidden': true })}
      >
        <p className="dv-desc">{row.blurb}</p>
      </div>
    </div>
  );
}
