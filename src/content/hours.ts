/**
 * ЧАСЫ РАБОТЫ ЦЕХА.
 *
 * ⚠️ CONFIRM WITH CLIENT BEFORE LAUNCH: блокер релиза.
 * На Яндекс.Картах указано только «открыто до 18:00». Остальное это допущение
 * по типовому графику полиграфии в регионе. Пока клиент не подтвердил,
 * эти значения нельзя считать фактом; они не попадают в JSON-LD.
 */

export const TIMEZONE = 'Europe/Moscow';

/** Индекс = день недели по Date#getDay (0 это воскресенье). null это выходной. */
export const HOURS: ({ open: string; close: string } | null)[] = [
  null, // вс
  { open: '09:00', close: '18:00' },
  { open: '09:00', close: '18:00' },
  { open: '09:00', close: '18:00' },
  { open: '09:00', close: '18:00' },
  { open: '09:00', close: '18:00' },
  { open: '10:00', close: '15:00' }, // сб
];

export const HOURS_DISPLAY = [
  { days: 'Пн…Пт', time: '09:00…18:00', match: [1, 2, 3, 4, 5] },
  { days: 'Сб', time: '10:00…15:00', match: [6] },
  { days: 'Вс', time: 'выходной', match: [0] },
] as const;

/** Подтверждены ли часы клиентом. Пока false, в JSON-LD они не уходят. */
export const HOURS_CONFIRMED = false;
