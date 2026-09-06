import { HOURS, HOURS_DISPLAY, TIMEZONE } from '@/content/hours';

/**
 * СОСТОЯНИЕ СМЕНЫ.
 *
 * Время считается по Europe/Moscow, а не по часам посетителя: гость из
 * Новосибирска не должен видеть «закрыто» в три часа дня.
 *
 * Никогда не выводим одно слово «ЗАКРЫТО». Закрытый цех всё равно продаёт:
 * он принимает заявку.
 */

export type Shift = {
  /** Строка обещания в первом экране и в §05. */
  promise: string;
  /** Обратный отсчёт: до конца смены или до приёма. */
  countdown: string | null;
  /** Индекс дня недели по МСК, чтобы подсветить строку в часах. */
  day: number;
  open: boolean;
};

/** Нейтральный вариант для SSR: одинаков на сервере и до гидратации. */
export const NEUTRAL_SHIFT: Shift = {
  promise: 'Заявка до 12:00, тираж сегодня · тираж от одного экземпляра',
  countdown: null,
  day: -1,
  open: false,
};

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

function fmtLeft(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m} мин`;
  return `${h} ч ${String(m).padStart(2, '0')} мин`;
}

export function getShift(now = new Date()): Shift {
  const { day, minutes } = nalchikNow(now);
  const today = HOURS[day];

  if (!today) {
    return {
      promise: 'Воскресенье · заявку примем сейчас, запустим в понедельник',
      countdown: null,
      day,
      open: false,
    };
  }

  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  const isOpen = minutes >= open && minutes < close;

  if (!isOpen) {
    const untilOpen = minutes < open ? open - minutes : 24 * 60 - minutes + open;
    return {
      promise: `Цех закрыт · заявку примем сейчас, запустим в ${today.open}`,
      countdown: `До приёма: ${fmtLeft(untilOpen)}`,
      day,
      open: false,
    };
  }

  const countdown = `До конца смены: ${fmtLeft(close - minutes)}`;

  // Суббота: короткая смена.
  if (day === 6) {
    return {
      promise: `Короткая смена до ${today.close} · срочное берём`,
      countdown,
      day,
      open: true,
    };
  }

  if (minutes < 12 * 60) {
    return {
      promise: 'Заявка до 12:00, тираж сегодня · тираж от одного экземпляра',
      countdown,
      day,
      open: true,
    };
  }

  return {
    promise: `Сегодня принимаем до ${today.close} · тираж завтра к 12:00`,
    countdown,
    day,
    open: true,
  };
}

export { HOURS_DISPLAY };
