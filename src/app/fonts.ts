import { Roboto_Serif, Geologica, Geist_Mono } from 'next/font/google';

/**
 * ТИПОГРАФИКА «АЛЬФА ПРИНТ»
 *
 * Три гарнитуры, все три — с настоящей кириллицей и переменными осями.
 * Оси здесь не украшение: ширина и оптический кегль — это и есть «набор»,
 * то, чем типография занимается каждый день.
 *
 * ── Roboto Serif ─ дисплейная.
 *    opsz  8…144   оптический кегль: от текстового рисунка к плакатному
 *    wdth  50…150  от узкой газетной кассы до широкой дидоны
 *    wght 100…900
 *    На wdth 50 / wght 900 — заголовок афиши. На wdth 150 / wght 300 — дидона.
 *    Одна гарнитура, две противоположности: этим живёт вся анимация набора.
 *
 * ── Geologica ─ гротеск интерфейса и текста.
 *    SHRP 0…100    «острота» — срез углов. 0 — мягкий, 100 — как после лазера.
 *    wght 100…900
 *
 * ── Geist Mono ─ технический слой: метки приводки, спецификации, цифры.
 */

export const display = Roboto_Serif({
  subsets: ['cyrillic', 'latin'],
  axes: ['GRAD', 'opsz', 'wdth'],
  display: 'swap',
  variable: '--ff-display',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: false,
});

export const sans = Geologica({
  subsets: ['cyrillic', 'latin'],
  axes: ['CRSV', 'SHRP', 'slnt'],
  display: 'swap',
  variable: '--ff-sans',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
  adjustFontFallback: false,
});

export const mono = Geist_Mono({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--ff-mono',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
  adjustFontFallback: false,
});

export const fontVariables = `${display.variable} ${sans.variable} ${mono.variable}`;
