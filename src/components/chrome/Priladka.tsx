/**
 * ПРИЛАДОЧНЫЙ ЛИСТ
 *
 * Лист, который печатник прогоняет ПЕРЕД тиражом. Машина под током, формы
 * встали, но приводка ещё не сведена и краска ещё не вышла: такие оттиски
 * идут в макулатуру, и печатник считает их по счётчику, пока лист не станет
 * годным. Ровно это и делает загрузка, поэтому у неё здесь имя ремесла, а не
 * «прелоадер».
 *
 * НА ЛИСТЕ ОДИН ПРЕДМЕТ: счёт до ста. Ни имени фирмы, ни знака, ни слова.
 * Приладочный лист ничего не сообщает, он показывает состояние машины.
 *
 * ЧИСЛО НАПЕЧАТАНО ДВАЖДЫ, и в этом вся полоса. Форма K чёрная, форма R
 * рубиновая, и на нуле вторая лежит мимо первой ровно на тот вектор, которым
 * уходит приводка на всём сайте: влево и вниз, 7 к 4. Счёт сводит её на
 * место, и к сотне рубин садится под чёрное и пропадает. Закон, на котором
 * стоит весь лист, читатель узнаёт раньше первого слова и узнаёт делом.
 *
 * ПОЧЕМУ АНТИКВА, А НЕ МАШИНКА. Счётчик на пульте набрали бы Martian Mono:
 * это голос приборов, и в `fonts.ts` он заведён в том числе под счётчик.
 * Здесь стоит дисплейная антиква, и довод ровно один: НЕ В ПРИВОДКЕ БЫВАЕТ
 * ТОЛЬКО НАПЕЧАТАННОЕ. Оснастка лежит НАД листом и мимо формы уйти не может;
 * чтобы рубиновый двойник читался приводкой, а не подсветкой, число обязано
 * быть оттиском. Отсюда и кегль, и `wdth 87.5`, и табличные цифры: это тот
 * же набор, что у чисел реестра §02, только крупнее.
 *
 * НУЛИ СЛЕВА НЕ В КРАСКЕ. Пока разряд не считает, он стоит бумагой, 14 %
 * чёрного, и красится ровно тогда, когда счёт до него доходит: на десятке и
 * на сотне. Лист выходит на краску разряд за разрядом, и это не приём, а
 * прямое чтение счётчика с ведущими нулями.
 *
 * ДО ГАРНИТУР ЛИСТ ПУСТ, и это то же самое правило: печатать нечем, пока не
 * пришли формы. Счёт начинается по `document.fonts.ready`, и пусто бывает
 * ровно столько, сколько идут гарнитуры: на своей машине и на любом втором
 * заходе это ноль, потому что они в кэше.
 *
 * ЖДЁТ ОН ПРИ ЭТОМ НЕ ДОЛЬШЕ 350 мс, и это не осторожность, а замер. Считать
 * в запасной гарнитуре не страшно: `font-variant-numeric` у неё работает,
 * Georgia с lnum и tnum даёт 56,3 px на разряд против 55,9 у Noto Serif на
 * кегле 100, то есть подмена стоит РИСУНКА, а не раскладки, и счётчик от неё
 * не дёргается ни на пиксель. А вот чистый лист без единого знака на плохом
 * канале не говорит ничего вообще, и молчать ему позволено треть секунды, не
 * дольше.
 *
 * СЧЁТ ЧЕСТЕН НАСКОЛЬКО МОЖЕТ. Сотню он показывает только тогда, когда лист
 * действительно готов, то есть после DOMContentLoaded и load, и ни кадром
 * раньше. Ползок между вехами есть: стоящий счётчик читается заклинившей
 * машиной, а не ожиданием. Потолок ползка 88 %, потолок показа до готовности
 * 99 %, крайний срок прогона 6,5 с.
 *
 * ЛИСТ СНИМАЮТ ВВЕРХ, на приёмку, вместе с напечатанным на нём числом:
 * краска не гаснет, уходит бумага. Под ним тот же грунт и уже свёрстанный
 * §01, и ровно в этот момент ему отдают его собственную приладку
 * (`data-press` на корне): ракель идёт снизу вверх по имени фирмы.
 *
 * СКРИПТ ГОЛЫЙ И СТОИТ В РАЗМЕТКЕ, а не в компоненте с 'use client'. Довод:
 * он обязан идти ДО гидратации и до разбора `<main>`. Он ставит
 * `data-press="load"` раньше, чем в дереве появится первая строка §01,
 * поэтому её анимация встаёт на паузу с первого своего кадра, а не с первого
 * кадра React. Из того же следует и обратное, и это здесь главная страховка:
 * пока скрипт не выполнился, атрибута НЕТ и §01 идёт как шёл. Отказом этого
 * листа сайт сломать нельзя ни при каком раскладе, а сам лист снимает с себя
 * ещё и чистый CSS на двенадцатой секунде, см. `mk-abort` в `globals.css`.
 */

/**
 * Три разряда на форму. `data-pale` на двух старших это состояние ДО первого
 * кадра: счёт начинается с «000», и в краске там только единицы.
 *
 * `suppressHydrationWarning` стоит на каждом узле, который трогает скрипт, и
 * ни на одном лишнем. Скрипт успевает отсчитать до гидратации, React видит в
 * разметке не тот текст, который отрисовал сам, и без этой пометки он либо
 * ругается, либо возвращает «000» обратно на один кадр.
 */
function Forma({ forma }: { forma: 'k' | 'r' }) {
  return (
    <span className={`mk-form mk-${forma}`} data-mk-form>
      {[0, 1, 2].map((i) => (
        <span key={i} data-pale={i < 2 ? '' : undefined} suppressHydrationWarning>
          0
        </span>
      ))}
    </span>
  );
}

/**
 * ПОРЯДОК КРАСОК В РАЗМЕТКЕ ЭТО ПОРЯДОК ПЕЧАТИ. Формы стоят одна на другой
 * в одной ячейке грида, и рубин объявлен ПЕРВЫМ: чёрное кроет его сверху,
 * как на оттиске, и мимо приводки видно именно кайму, а не два числа рядом.
 */
const PROGON = `
(function () {
  if (window.__mk) return;
  window.__mk = 1;
  var D = document, H = D.documentElement, mk = D.querySelector('.mk');
  if (!mk) return;
  function off() {
    try {
      mk.setAttribute('data-mk', 'done');
      H.setAttribute('data-press', 'run');
    } catch (e2) {}
  }
  try {
    if (!window.requestAnimationFrame) { off(); return; }
    H.setAttribute('data-press', 'load');

    var R = mk.querySelectorAll('[data-mk-form] > span');
    var MIN = 1000, MAX = 6500, RATE = 1.6, WAIT = 350;
    var t0 = 0, last = 0, w = 0, p = 0, shown = -1, done = false;

    function hold(e) { if (!done) e.preventDefault(); }
    window.addEventListener('wheel', hold, { passive: false });
    window.addEventListener('touchmove', hold, { passive: false });

    function paint(v) {
      var n = Math.round(v * 100);
      if (n !== shown) {
        shown = n;
        var s = n > 99 ? '100' : n > 9 ? '0' + n : '00' + n;
        var lead = n > 99 ? 0 : n > 9 ? 1 : 2;
        for (var i = 0; i < R.length; i++) {
          var el = R[i], c = s.charAt(i % 3);
          if (el.textContent !== c) el.textContent = c;
          if (i % 3 < lead) el.setAttribute('data-pale', '');
          else el.removeAttribute('data-pale');
        }
      }
      mk.style.setProperty('--mk-miss', (1 - v).toFixed(3));
    }

    function snyat() {
      if (done) return;
      done = true;
      paint(1);
      window.removeEventListener('wheel', hold);
      window.removeEventListener('touchmove', hold);
      setTimeout(function () {
        H.setAttribute('data-press', 'run');
        mk.setAttribute('data-mk', 'lift');
        setTimeout(function () { mk.setAttribute('data-mk', 'done'); }, 620);
      }, 140);
    }

    function frame(now) {
      if (done) return;
      var el = now - t0;
      if (el >= MAX) { snyat(); return; }
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var goal = Math.max(w, 0.88 * (1 - Math.exp(-el / 2200)));
      if (w < 1) goal = Math.min(goal, 0.99);
      goal = Math.min(goal, el / MIN);
      if (goal > p) p = Math.min(goal, p + RATE * dt);
      paint(p);
      if (p > 0.9995 && w > 0.999) { snyat(); return; }
      requestAnimationFrame(frame);
    }

    function pusk() {
      if (t0) return;
      t0 = last = performance.now();
      mk.setAttribute('data-mk', 'ink');
      requestAnimationFrame(frame);
      setTimeout(snyat, MAX + 600);
    }
    if (D.fonts && D.fonts.ready && D.fonts.ready.then) D.fonts.ready.then(pusk, pusk);
    else pusk();
    setTimeout(pusk, WAIT);

    function vekha(a) { w = Math.min(1, w + a); }
    if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { vekha(0.4); });
    else vekha(0.4);
    if (D.readyState === 'complete') vekha(0.6);
    else window.addEventListener('load', function () { vekha(0.6); });
  } catch (e) { off(); }
})();
`;

export function Priladka() {
  return (
    <>
      <div className="mk" data-mk="load" aria-hidden="true" suppressHydrationWarning>
        <div className="mk-num">
          <Forma forma="r" />
          <Forma forma="k" />
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: PROGON }} />
    </>
  );
}
