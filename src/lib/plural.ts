/**
 * ЧИСЛО И СЛОВО ПРИ НЁМ. Русское согласование держится на трёх формах: один
 * отзыв, два отзыва, пять отзывов. От одиннадцати до четырнадцати всегда
 * третья форма, как бы число ни кончалось.
 *
 * Лежит отдельным файлом, потому что нужно оно и тексту (`content/site.ts`),
 * и компоненту (`Registry`), а этот файл не импортирует ничего и кольца не
 * замкнёт.
 */
export function plural(n: number, one: string, few: string, many: string): string {
  const tens = Math.abs(n) % 100;
  const units = tens % 10;
  if (tens > 10 && tens < 20) return many;
  if (units === 1) return one;
  if (units >= 2 && units <= 4) return few;
  return many;
}
