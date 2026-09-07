'use client';

import { useEffect, useRef, useState } from 'react';
import { NAV, CONTACTS, HEADER, SECTIONS } from '@/content/site';
import { Mark } from '@/components/chrome/Mark';
import { useNaryad } from '@/state/NaryadContext';

/**
 * ВЕРХНЯЯ ПОЛОСА.
 *
 * Три зоны, шесть слов, ни одной линии. Знак у левого реза, разделы по
 * центру формата, одно действие у правого. Прежняя редакция держала в той же
 * рейке девять узлов и три иконки: знак, название, пять моношрифтовых меток,
 * счётчик наряда с галочкой, телефон, кнопку WhatsApp со второй галочкой,
 * кнопку меню и волосяную линию под всем этим. Полоса читалась как приборная
 * панель. У типографии в шапке должен стоять набор, а не пульт.
 *
 * ЧТО УБРАНО И ПОЧЕМУ
 * ── Линия под полосой. На формате «край в край» она режет лист пополам;
 *    отбивку делает воздух: полоса выросла с 52 до 68 px.
 * ── Телефон. Пятнадцать знаков номера над заголовком в 150 px. На телефоне
 *    его несёт нижняя панель `MobileCta`, на настольном §08 и содержание.
 * ── «В НАРЯДЕ N» с галочкой. Счётчик переехал внутрь действия: цифра, а не
 *    отдельный узел со своей иконкой.
 * ── Три иконки из прежних четырёх. Осталась одна, и это знак фирмы,
 *    см. `Wordmark`. Галочка на всей полосе теперь тоже одна: та, что
 *    стоит в самом знаке.
 * ── Набранное имя «АльфаПринт» рядом с маркой. Марка обведена с оригинала
 *    и сама говорит имя фирмы; набор повторял его вторым голосом и занимал
 *    под повтор треть плашки, см. `Wordmark`.
 * ── Моношрифт на разделах. Прописные с трекингом 0,14 em это машинный
 *    голос, и на пяти словах подряд он превращается в шум. Разделы говорят
 *    голосом покупателя и набраны корпусным гротеском.
 *
 * Полоса остаётся `sticky`: она занимает место в потоке, и §01 считает от
 * неё свою высоту. `fixed` подняла бы весь лист под неё.

 *
 * ВЫРУБЛЕННАЯ ПЛАШКА
 * Три зоны стоят теперь не прямо в полосе, а внутри `.bar-plate` — сплошной
 * чёрной формы со скруглёнными торцами, отбитой от краёв на --edge. Это
 * единственное скругление на всём листе, и заведено оно сознательно: у формы,
 * которую вырубают в штамп, торец круглый, а у полосы, доведённой до реза,
 * прямой. Полоса под плашкой осталась ровно тем, чем была, — грунтом,
 * который перекрашивается по секции. Поэтому поле вокруг плашки читается
 * как сам лист, а не как щель, сквозь которую видно уезжающий набор.
 *
 * Высота полосы разложена на слагаемые: --bar-h это вырубка, --bar-pad поле
 * вокруг неё, --topbar-h их сумма. Поток по-прежнему спрашивает сумму, и все
 * прежние формулы (§01, приводка §03, первая строка содержания) верны без
 * единой правки.
 *
 * Действие потеряло вылет до правого реза: внутри плашки реза нет, и краску
 * некуда доводить. Оно встало соосно правому торцу, слово выключено
 * по центру плашки в обе стороны, и налилось рубином —
 * уступка §1, который рубиновую кнопку запрещает. Плашка чёрная, действие
 * обязано читаться на ней сразу, и единственная хрома листа делает это,
 * не заводя третьей краски.
 */
export function TopBar() {
  const naryad = useNaryad();
  const count = naryad.items.length;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  /* Указатель текущего раздела. Полоса не заводит своего слушателя прокрутки
     и не лезет внутрь общего rAF-цикла: она читает ту самую метку
     `data-section`, которую цикл и так пишет на :root ради грунтов. Один
     MutationObserver на один атрибут срабатывает восемь раз за весь лист. */
  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      const n = root.dataset.section;
      const s = SECTIONS.find((x) => x.n === n);
      setActive(s ? `#${s.id}` : null);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ['data-section'] });
    return () => mo.disconnect();
  }, []);

  /* Открытое содержание это модальный лист: прокрутка заперта, Tab ходит по
     кругу внутри, Escape закрывает, фокус возвращается на слово «Меню».
     `scrollbar-gutter: stable` на html стоит с самого начала, поэтому замок
     прокрутки не даёт скачка формата. */
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = sheetRef.current?.querySelectorAll<HTMLElement>('a[href], button');
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    const t = window.setTimeout(
      () => sheetRef.current?.querySelector<HTMLElement>('a[href]')?.focus(),
      60
    );

    return () => {
      root.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      menuBtnRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="topbar sticky top-0 z-60 h-[var(--topbar-h)] w-full">
        <div className="sheet flex h-full items-center">
          <div className="bar-plate gap-[clamp(16px,2vw,48px)]">
            <Wordmark />

            <nav aria-label="Разделы сайта" className="hidden lg:block">
              <ul className="bar-nav flex items-center gap-[clamp(20px,2.5vw,44px)]">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="navlink"
                      {...(active === item.href ? { 'aria-current': 'true' as const } : null)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Слово «Меню» стоит перед действием: действие соосно правому
                торцу плашки и обязано быть последним. */}
            <div className="flex items-center justify-end gap-[clamp(14px,1.6vw,26px)]">
              <button
                ref={menuBtnRef}
                type="button"
                className="menu-btn lg:hidden"
                aria-expanded={open}
                aria-controls="menu-sheet"
                onClick={() => setOpen(true)}
              >
                {HEADER.menu}
              </button>

              {/* Наряд считается сигнатурой на плече слова, как сноска. */}
              <a
                href={HEADER.ctaHref}
                className="bar-cta hidden md:inline-flex"
                aria-label={count > 0 ? `${HEADER.cta}, в наряде ${count}` : undefined}
              >
                {HEADER.cta}
                {count > 0 && (
                  <span className="bar-cta-n" aria-hidden>
                    {count}
                  </span>
                )}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* СОДЕРЖАНИЕ. Первая строка повторяет полосу знак в знак: при подъёме
          листа знак остаётся стоять, а меняется под ним только грунт. */}
      <div
        id="menu-sheet"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={HEADER.menuTitle}
        data-ground="ink"
        data-open={open ? 'true' : 'false'}
        className="menu-sheet ground-ink lg:hidden"
        {...(!open && { inert: true })}
      >
        <div className="flex h-[var(--topbar-h)] flex-none items-center justify-between pr-[var(--bar-inset)] pl-[var(--bar-lead)]">
          <Wordmark onClick={() => setOpen(false)} />
          <button type="button" className="menu-btn" onClick={() => setOpen(false)}>
            {HEADER.close}
          </button>
        </div>

        <nav aria-label="Разделы сайта" className="flex flex-1 items-center">
          <ul className="w-full">
            {NAV.map((item, i) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="menu-row"
                  style={{ ['--i' as string]: i }}
                  {...(active === item.href ? { 'aria-current': 'true' as const } : null)}
                >
                  <span className="menu-row-n" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="menu-row-word">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-none flex-col gap-3 pb-[max(28px,env(safe-area-inset-bottom))]">
          <a href={CONTACTS.phoneHref} className="menu-phone">
            {CONTACTS.phone}
          </a>
          <div className="menu-channels">
            <a href={CONTACTS.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={CONTACTS.telegram} target="_blank" rel="noreferrer">
              Telegram
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * ЗНАК: ОДНА МАРКА, БЕЗ НАБОРА.
 *
 * «А» с галочкой это НАСТОЯЩИЙ знак агентства, обведённый с оригинала до
 * десятых долей процента, см. `Mark`. Он стоит у левого торца плашки один.
 *
 * ПОЧЕМУ СЛОВА СНЯТЫ. Здесь стояло «АльфаПринт» набором: «Альфа» формой K,
 * «Принт» формой R, ровно тем порядком, каким устроена сама марка. В этом и
 * была ошибка: марка УЖЕ говорит имя фирмы, и набор рядом повторял его
 * вторым голосом, занимая под повтор треть плашки. Марка, у которой есть
 * оригинал, в подписи не нуждается: подпись нужна рисунку, который сам себя
 * не называет. Имя фирмы лист всё равно произносит — вылетом в §01, титулом
 * вкладки и `aria-label` этой самой ссылки.
 *
 * МАРКА СТОИТ НАМЕРТВО. Закон ухода приводки на неё не заведён: в собственном
 * знаке сползшая форма читается не как дрожь машины, а как опечатка.
 *
 * МАРКА ВСТАВЛЕНА ВНУТРЬ ССЫЛКИ, А НЕ РЯДОМ С НЕЙ. `.bar-plate` это сетка с
 * заданным числом колонок (две до 1024 px, три выше), и лишний прямой
 * потомок уехал бы во второй ряд плашки фиксированной высоты. Внутри ссылки
 * марка вдобавок достаётся обоим местам вывода сразу: и полосе, и первой
 * строке содержания.
 *
 * ИМЯ У УЗЛА ОДНО. Ссылка названа `aria-label`, поэтому `Mark` идёт без
 * `title`: второе имя на том же узле скринридер прочитал бы дважды. Ссылка
 * теперь единственный носитель имени в полосе, и снимать с неё `aria-label`
 * нельзя ни при каких правках: без него в шапке останется безымянная
 * картинка.
 */
function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <a href="#pervyi-progon" className="wordmark" aria-label={HEADER.home} onClick={onClick}>
      <Mark className="wordmark-mark" />
    </a>
  );
}
