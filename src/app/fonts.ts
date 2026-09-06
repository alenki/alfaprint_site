import { Noto_Serif_Display, Golos_Text, Martian_Mono } from 'next/font/google';

/**
 * ТРИ ГАРНИТУРЫ И ТРИ РОЛИ
 *
 * ── NOTO SERIF DISPLAY ─ форма K, дисплей.
 *    Жирная высококонтрастная антиква с осью ширины 62.5…100. Ось нужна
 *    не для красоты: заголовок выключается в формат подбором ширины букв,
 *    как это делал наборщик, а не растяжкой трекинга и не разным кеглем
 *    на соседних строках. Высокий контраст штриха при этом остаётся:
 *    плохой пресс на такой антикве видно сразу.
 *
 * ── GOLOS TEXT ─ форма K, голос.
 *    «Паратайп», Москва. Спроектирована для сплошного русского текста
 *    в государственных сервисах. Типография, которая всю жизнь печатает
 *    бланки, наряды и меню, набирает корпус тем же гротеском.
 *
 * ── MARTIAN MONO ─ форма R, машина.
 *    Evil Martians. Кириллица родная, цифры табличные по природе: счётчик
 *    и часы не дёргаются. Взята вместо JetBrains Mono сознательно:
 *    JetBrains тянет за собой семантику «редактор кода».
 *
 * Две из трёх спроектированы кириллицей вперёд. Третья выбрана
 * по механической причине, из-за оси ширины.
 */

export const nsd = Noto_Serif_Display({
  subsets: ['cyrillic', 'latin'],
  axes: ['wdth'],
  display: 'swap',
  preload: true,
  variable: '--font-nsd',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: false,
});

export const golos = Golos_Text({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  preload: true,
  variable: '--font-golos',
  fallback: ['Segoe UI', 'system-ui', 'sans-serif'],
  adjustFontFallback: false,
});

export const martian = Martian_Mono({
  subsets: ['cyrillic', 'latin'],
  axes: ['wdth'],
  display: 'swap',
  preload: true,
  variable: '--font-martian',
  fallback: ['ui-monospace', 'monospace'],
  adjustFontFallback: false,
});

export const fontVariables = `${nsd.variable} ${golos.variable} ${martian.variable}`;
