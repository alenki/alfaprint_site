import type { NaryadState } from '@/state/NaryadContext';
import { CONTACTS } from '@/content/site';

/**
 * АДРЕС ЧАТА БЕРЁТСЯ ИЗ СПРАВОЧНИКА, А НЕ ПИШЕТСЯ ЗДЕСЬ ВТОРОЙ РАЗ. Прежде
 * номер стоял в двух местах, и смена справочника оставляла все заказы сайта
 * уходить на старый номер.
 *
 * ⚠️ УТОЧНИТЬ У КЛИЕНТА: номер WhatsApp на листовке агентства не назван, в
 * справочнике взят основной мобильный, см. `CONTACTS.whatsapp`.
 *
 * Кольца импорт не замыкает: `content/site.ts` берёт только `lib/base` и
 * `lib/plural`, а ни один из них сюда не смотрит.
 */
export const WA = CONTACTS.whatsapp;

/**
 * Собирает наряд в текст сообщения.
 *
 * Ничего никуда не отправляется, открывается WhatsApp. Поэтому на сайте нет
 * ни одного экрана «наряд передан»: врать в подтверждении нельзя.
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
