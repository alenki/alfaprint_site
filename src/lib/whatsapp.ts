import type { NaryadState } from '@/state/NaryadContext';

export const WA = 'https://wa.me/79674257979';

/**
 * Собирает наряд в текст сообщения.
 *
 * Ничего никуда не отправляется — открывается WhatsApp. Поэтому на сайте нет
 * ни одного экрана «наряд передан в цех»: врать в подтверждении нельзя.
 */
export function buildOrder(n: NaryadState): string {
  const lines: string[] = ['Здравствуйте! Хочу заказать:'];
  if (n.items.length) lines.push('Что печатаем: ' + n.items.map((i) => i.title).join(', '));
  if (n.freeText.trim()) lines.push('Задача: ' + n.freeText.trim());
  if (n.qty) lines.push('Тираж: ' + n.qty);
  if (n.deadline) lines.push('Срок: ' + n.deadline);
  if (n.contact.trim()) lines.push('Связь: ' + n.contact.trim());
  return lines.join('\n');
}

export function waHref(n: NaryadState): string {
  return `${WA}?text=${encodeURIComponent(buildOrder(n))}`;
}
