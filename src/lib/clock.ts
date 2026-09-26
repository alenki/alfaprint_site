import { HOURS, HOURS_DISPLAY, TIMEZONE } from '@/content/hours';

/**
 * СОСТОЯНИЕ СМЕНЫ.
 *
 * Время считается по Europe/Moscow, а не по часам посетителя: гость из
 * Новосибирска не должен видеть «закрыто» в три часа дня.
 *
 * Наружу состояние идёт одной подсветкой: в выходных данных выделена
 * сегодняшняя строка часов. Живых обещаний и обратного отсчёта сайт больше
 * не печатает, поэтому и текстов здесь нет.
 *
 * ПЕРЕРЫВ ЭТО ЗАКРЫТО. В обеденный час офис не работает, и `open` в эти
 * минуты ложно; отдельно `pause` говорит, почему: закрыто не до завтра, а
 * до конца перерыва.
 */

export type Shift = {
  /** Индекс дня недели по МСК, чтобы подсветить строку в часах. */
  day: number;
  open: boolean;
  /** Идёт перерыв внутри рабочего дня. При нём `open` всегда ложно. */
  pause: boolean;
};

/** Нейтральный вариант для SSR: одинаков на сервере и до гидратации. */
export const NEUTRAL_SHIFT: Shift = { day: -1, open: false, pause: false };

function nalchikNow(now: Date) {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const hh = parseInt(get('hour'), 10);
  const mm = parseInt(get('minute'), 10);

  const wd = get('weekday').toLowerCase();
  const map: Record<string, number> = { вс: 0, пн: 1, вт: 2, ср: 3, чт: 4, пт: 5, сб: 6 };
  const day = map[wd.slice(0, 2)] ?? 1;

  return { day, minutes: hh * 60 + mm };
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function getShift(now = new Date()): Shift {
  const { day, minutes } = nalchikNow(now);
  const today = HOURS[day];

  if (!today) return { day, open: false, pause: false };

  const working = minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);
  const pause =
    working &&
    !!today.pause &&
    minutes >= toMinutes(today.pause[0]) &&
    minutes < toMinutes(today.pause[1]);

  return { day, open: working && !pause, pause };
}

export { HOURS_DISPLAY };
