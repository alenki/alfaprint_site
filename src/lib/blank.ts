import { K_BLANK } from '@/content/kontakty';
import { WA } from '@/lib/whatsapp';

/**
 * СБОРКА БЛАНКА В СООБЩЕНИЕ.
 *
 * ОДИН ИСТОЧНИК НА ДВА ПРЕДМЕТА, И ЭТО ВСЯ ПРИЧИНА, ПО КОТОРОЙ ФАЙЛ
 * СУЩЕСТВУЕТ. Лист пробы справа от бланка печатает `hello()` и `lines()`, а в
 * мессенджер уходит `text()`, собранный из тех же двух вызовов. Разойтись им
 * негде: что читатель видит на листе, то и уедет, слово в слово. Второй
 * сборки текста («а в сообщение допишем ещё вот это») здесь нет и быть не
 * может.
 *
 * ПОВОД НЕ СТРОКА СПИСКА, А ПЕРВАЯ СТРОКА ПИСЬМА. «Обращение: Вопрос» в
 * чужой переписке читается заполненной анкетой; «Здравствуйте! У меня
 * вопрос:» читается человеком. Поэтому чип повода не печатается строкой, а
 * переписывает приветствие листа, и переписывает его НА ГЛАЗАХ: строка эта
 * самая заметная на оттиске, и нажатие видно раньше, чем отпустишь палец.
 *
 * ПУСТАЯ СТРОКА ОСТАЁТСЯ СТРОКОЙ, но только на листе: `lines()` отдаёт все
 * три всегда, потому что непропечатанное место на бланке это тоже сведение,
 * а `text()` пустые выбрасывает, потому что «Имя: » в чужой переписке не
 * сведение, а мусор.
 */

export type BlankState = {
  name: string;
  kind: string;
  what: string;
  who: string;
};

export const EMPTY_BLANK: BlankState = { name: '', kind: '', what: '', who: '' };

export type BlankLine = { key: keyof BlankState; label: string; value: string };

/**
 * ПЕРВАЯ СТРОКА ЛИСТА. Нажатого чипа нет, значит нет и повода, и остаётся
 * голое приветствие: придумывать за читателя, зачем он пишет, странице
 * нечем.
 */
export function hello(s: BlankState): string {
  return K_BLANK.kinds.find((k) => k.label === s.kind)?.hello ?? K_BLANK.helloBare;
}

/** Три строки листа. Порядок несущий: он же порядок полей бланка. */
export function lines(s: BlankState): BlankLine[] {
  const m = K_BLANK.message;
  return [
    { key: 'name', label: m.name, value: s.name.trim() },
    { key: 'what', label: m.what, value: s.what.trim() },
    { key: 'who', label: m.who, value: s.who.trim() },
  ];
}

/** Готовое сообщение: приветствие по поводу и только заполненные строки. */
export function text(s: BlankState): string {
  const filled = lines(s).filter((l) => l.value);
  return [hello(s), ...filled.map((l) => `${l.label}: ${l.value}`)].join('\n');
}

/** Тот же текст, отданный WhatsApp. Отправляет его человек, а не страница. */
export function waHref(s: BlankState): string {
  return `${WA}?text=${encodeURIComponent(text(s))}`;
}
