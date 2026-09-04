'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Justified } from '@/components/ui/Justified';
import { Registration } from '@/components/ui/Registration';
import { ControlStrip, RegistrationMark, SheetCorners } from '@/components/ui/PrintMarks';
import { sushka } from '@/components/ui/Sushka';
import { COMPANY, CONTACTS, FEATURES } from '@/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ПОЛОСА ДЕСЯТАЯ — КОНТАКТЫ

   Адрес набран кеглем заголовка: улица и город — это и есть главное, что
   должно остаться в памяти. Дальше — точка на плане.

   Карты здесь нет и не будет. Вместо неё — схема, нарисованная кодом:
   сетка волосяных линий (лист), несколько улиц под небольшим углом и ровно
   в центре крест приводки с координатами. Приводка — это и есть поиск
   точной точки; чужой тайл этого не расскажет, а притворяться картой
   схема не должна. Кто хочет настоящую карту — под схемой две живые ссылки
   на Яндекс.

   Настоящая воронка этого цеха — звонок и сообщение в мессенджер, поэтому
   телефон набран крупно, а Telegram и WhatsApp стоят первыми, а не в
   подвале. Подтверждение копирования одно на весь сайт — сушка.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── СХЕМА ──────────────────────────────────────────────────────────────── */

const PLAN_W = 640;
const PLAN_H = 460;
const CELL = 32;
const CX = PLAN_W / 2;
const CY = PLAN_H / 2;

const COLS = Array.from({ length: Math.round(PLAN_W / CELL) + 1 }, (_, i) => i * CELL);
const ROWS = Array.from({ length: Math.round(PLAN_H / CELL) + 1 }, (_, i) => i * CELL);

// Линии заведомо выходят за поле: схема — фрагмент, а не замкнутый рисунок.
// Первые две проходят строго через центр, остальные идут мимо.
const STREETS_MAIN = [
  `M-24 ${CY + 38} L${PLAN_W + 24} ${CY - 38}`,
  `M${CX - 76} -24 L${CX + 76} ${PLAN_H + 24}`,
];
const STREETS_MINOR = [
  'M-24 96 L664 52',
  'M-24 392 L664 424',
  'M96 -24 L154 484',
  'M528 -24 L476 484',
];

/* ── ЧАСЫ ───────────────────────────────────────────────────────────────── */

const DAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
// Порядок строк COMPANY.hours: 0 — «Пн — Пт», 1 — «Сб», 2 — «Вс».
const ROW_BY_DAY = [2, 0, 0, 0, 0, 0, 1];

const fmt = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** «09:00 — 18:00» → [540, 1080]; «выходной» → null */
function parseRange(time: string): [number, number] | null {
  const m = time.match(/(\d{1,2}):(\d{2})\D+?(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return [+m[1] * 60 + +m[2], +m[3] * 60 + +m[4]];
}

type Status = { open: boolean; note: string; row: number };

/** Часы указаны по Нальчику. Считаем в его зоне, где бы ни был читатель. */
function shopStatus(): Status {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const row = ROW_BY_DAY[day];
  const today = parseRange(COMPANY.hours[row].time);

  if (today && mins >= today[0] && mins < today[1])
    return { open: true, note: `до ${fmt(today[1])}`, row };
  if (today && mins < today[0])
    return { open: false, note: `откроем в ${fmt(today[0])}`, row };

  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = parseRange(COMPANY.hours[ROW_BY_DAY[d]].time);
    if (next) return { open: false, note: `откроем в ${DAYS_SHORT[d]}, ${fmt(next[0])}`, row };
  }
  return { open: false, note: 'по договорённости', row };
}

/* ── МЕССЕНДЖЕРЫ ────────────────────────────────────────────────────────── */

/** Ник вытаскиваем из самой ссылки, чтобы не держать его в двух местах. */
const handleOf = (url: string) =>
  '@' + (new URL(url).pathname.replace(/\/+$/, '').split('/').pop() ?? '');

const MESSENGERS = [
  { label: 'Telegram', href: CONTACTS.telegram, handle: CONTACTS.telegramHandle, solid: true },
  { label: 'WhatsApp', href: CONTACTS.whatsapp, handle: CONTACTS.phone, solid: false },
  { label: 'ВКонтакте', href: CONTACTS.vk, handle: handleOf(CONTACTS.vk), solid: false },
  { label: 'Instagram', href: CONTACTS.instagram, handle: handleOf(CONTACTS.instagram), solid: false },
];

const ADDRESS_LINES = [COMPANY.address.replace(/^ул\.\s*/, ''), COMPANY.city];

export function Contacts() {
  const reduced = usePrefersReducedMotion();
  const planRef = useRef<HTMLDivElement>(null);
  const planInView = useInView(planRef, { once: true, margin: '-15% 0px -15% 0px' });
  const [status, setStatus] = useState<Status | null>(null);

  // Состояние «сейчас открыто» считаем только после монтирования: на сервере
  // текущего времени нет, и разметка обязана совпасть.
  useEffect(() => {
    const tick = () => setStatus(shopStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.8, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  const copyPhone = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // С клавиатуры событие приходит с координатами 0,0 — тогда ставим вспышку
    // по центру самой кнопки, а не в угол экрана.
    const r = e.currentTarget.getBoundingClientRect();
    const point =
      e.clientX === 0 && e.clientY === 0
        ? { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }
        : { clientX: e.clientX, clientY: e.clientY };
    try {
      await navigator.clipboard.writeText(CONTACTS.phone);
      sushka(point, 'Телефон скопирован');
    } catch {
      // Буфер недоступен — молчим. Подтверждать нечего, а второго жеста здесь нет.
    }
  };

  const registered = reduced || planInView;

  return (
    <section id="kontakty" aria-labelledby="kontakty-title" className="relative px-gutter py-section">
      {/* ── Служебная строка полосы ──────────────────────────────────────── */}
      <motion.div className="t-meta flex items-start justify-between gap-6 text-ink-48" {...rise(0)}>
        <span>
          Полоса 10<span className="hidden sm:inline"> · Контакты</span>
        </span>
        <span className="tab-nums text-right">{COMPANY.region}</span>
      </motion.div>

      {/* ── Адрес кеглем заголовка ───────────────────────────────────────── */}
      <h2
        id="kontakty-title"
        className="t-display mt-8 text-[clamp(2.6rem,12.4vw,12rem)] md:mt-12"
      >
        <Justified
          lines={ADDRESS_LINES}
          srText={COMPANY.addressFull}
          opsz={144}
          weight={900}
          renderLine={(line, i) => (
            <Registration offset={reduced ? 0 : 8} delay={i * 0.09} duration={1.05} className="block">
              {line}
            </Registration>
          )}
        />
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 border-t border-ink-16 pt-10 md:mt-16 lg:grid-cols-12">
        {/* ═════ СХЕМА ═══════════════════════════════════════════════════ */}
        <motion.div className="lg:col-span-7" {...rise(0.05)}>
          <div
            ref={planRef}
            className="relative aspect-[4/3] w-full overflow-hidden border border-ink-16 bg-paper-2 sm:aspect-[16/10]"
          >
            <svg
              viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
              aria-hidden
            >
              {/* Лист: сетка волосяных линий */}
              <g className="text-ink-16" stroke="currentColor" strokeWidth="1">
                {COLS.map((x) => (
                  <line key={`c${x}`} x1={x + 0.5} y1="0" x2={x + 0.5} y2={PLAN_H} />
                ))}
                {ROWS.map((y) => (
                  <line key={`r${y}`} x1="0" y1={y + 0.5} x2={PLAN_W} y2={y + 0.5} />
                ))}
              </g>

              {/* Улицы приходят не в приводке и сходятся на крест */}
              <motion.g
                initial={reduced ? false : { x: -13, y: 8 }}
                animate={registered ? { x: 0, y: 0 } : { x: -13, y: 8 }}
                transition={{ duration: 1.15, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <g className="text-ink-16" stroke="currentColor" strokeWidth="1" fill="none">
                  {STREETS_MINOR.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </g>
                <g className="text-ink-32" stroke="currentColor" strokeWidth="1" fill="none">
                  {STREETS_MAIN.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </g>
              </motion.g>

              {/* Прицел: две линии, упирающиеся в точку */}
              <g className="text-ink-32" stroke="currentColor" strokeWidth="1">
                <line x1={CX - 150} y1={CY + 0.5} x2={CX - 34} y2={CY + 0.5} />
                <line x1={CX + 34} y1={CY + 0.5} x2={CX + 150} y2={CY + 0.5} />
                <line x1={CX + 0.5} y1={CY - 118} x2={CX + 0.5} y2={CY - 34} />
                <line x1={CX + 0.5} y1={CY + 34} x2={CX + 0.5} y2={CY + 118} />
              </g>
            </svg>

            {/* Крест приводки ровно в центре поля + координаты рядом */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <RegistrationMark size={54} strokeWidth={1} className="text-rubine" />
            </div>
            <div className="pointer-events-none absolute left-1/2 top-1/2 ml-10 -translate-y-1/2">
              <p className="t-meta tab-nums whitespace-nowrap text-ink-72">
                {COMPANY.coords.lat.toFixed(6)} N
              </p>
              <p className="t-meta tab-nums mt-1.5 whitespace-nowrap text-ink-72">
                {COMPANY.coords.lng.toFixed(6)} E
              </p>
            </div>

            <span className="t-meta absolute left-4 top-4 text-ink-48">Схема · не карта</span>
            <ControlStrip patch={9} className="absolute bottom-4 right-4" />
            <SheetCorners className="p-3 text-ink-32" />
          </div>

          {/* Настоящая карта живёт снаружи — вот две честные ссылки на неё */}
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
            <a
              href={CONTACTS.maps}
              target="_blank"
              rel="noreferrer"
              data-cursor="Яндекс.Карты"
              className="t-meta group flex items-center gap-2 text-ink-72 transition-colors duration-500 hover:text-ink"
            >
              <span className="underline-ink pb-px">Открыть в Яндекс.Картах</span>
              <span aria-hidden>→</span>
            </a>
            <a
              href={CONTACTS.route}
              target="_blank"
              rel="noreferrer"
              data-cursor="Маршрут"
              className="t-meta group flex items-center gap-2 text-ink-72 transition-colors duration-500 hover:text-ink"
            >
              <span className="underline-ink pb-px">Построить маршрут</span>
              <span aria-hidden>→</span>
            </a>
          </div>
        </motion.div>

        {/* ═════ КОНТАКТНАЯ КОЛОНКА ══════════════════════════════════════ */}
        <motion.div className="lg:col-span-5 lg:pl-4" {...rise(0.12)}>
          <p className="t-meta text-ink-48">Звонок — самый короткий путь</p>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <a
              href={CONTACTS.phoneHref}
              data-cursor="Позвонить"
              className="t-num whitespace-nowrap text-[clamp(1.35rem,3.6vw,2.5rem)] leading-none tracking-[-0.02em] transition-colors duration-500 hover:text-rubine"
            >
              {CONTACTS.phone}
            </a>
            <button
              type="button"
              onClick={copyPhone}
              data-cursor="Скопировать"
              className="t-meta shrink-0 rounded-full border border-ink-16 px-4 py-2.5 text-ink-72 transition-colors duration-500 hover:border-ink-32 hover:text-ink"
            >
              Скопировать
            </button>
          </div>

          {/* Мессенджеры — не сноска, а вторая половина воронки */}
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {MESSENGERS.map((m) => (
              <li key={m.label}>
                <a
                  href={m.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="Написать"
                  className={cn(
                    't-meta group relative flex items-center gap-2.5 overflow-hidden rounded-full px-5 py-3',
                    m.solid
                      ? 'bg-ink text-paper'
                      : 'border border-ink-16 text-ink-72 transition-colors duration-500 hover:border-ink-32 hover:text-ink',
                  )}
                >
                  <span className="relative z-10">{m.label}</span>
                  <span
                    className={cn(
                      'relative z-10 tab-nums',
                      m.solid ? 'text-paper-3' : 'text-ink-32',
                    )}
                  >
                    {m.handle}
                  </span>
                  {m.solid && (
                    <span
                      aria-hidden
                      className="absolute inset-0 z-0 origin-left scale-x-0 bg-rubine transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          {/* Часы работы + живое состояние */}
          <div className="mt-10 border-t border-ink-16 pt-5">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="t-meta text-ink-48">Часы</h3>
              <span className="t-meta text-ink-32">время нальчикское</span>
            </div>

            <dl className="mt-4">
              {COMPANY.hours.map((h, i) => {
                const today = status?.row === i;
                return (
                  <div
                    key={h.days}
                    className={cn(
                      'flex items-baseline justify-between gap-4 border-b border-ink-10 py-2.5 last:border-b-0',
                      today ? 'text-ink' : 'text-ink-48',
                    )}
                  >
                    <dt className="t-meta flex items-center gap-2">
                      {today && (
                        <RegistrationMark size={9} strokeWidth={1.2} className="text-rubine" />
                      )}
                      {h.days}
                    </dt>
                    <dd className="t-meta tab-nums">{h.time}</dd>
                  </div>
                );
              })}
            </dl>

            {/* До монтирования не рендерим ничего: сервер не знает, который час */}
            {status && (
              <p className="t-meta mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className={status.open ? 'text-rubine' : 'text-ink-48'}>
                  {status.open ? 'Сейчас открыто' : 'Сейчас закрыто'}
                </span>
                <span className="text-ink-32" aria-hidden>
                  ·
                </span>
                <span className="tab-nums text-ink-48">{status.note}</span>
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Сервис: то, что есть в цехе на самом деле ────────────────────── */}
      <motion.ul
        className="t-meta mt-14 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink-16 pt-5 text-ink-48"
        {...rise(0.05)}
      >
        {FEATURES.map((f, i) => (
          <li key={f} className="flex items-center gap-3">
            {i > 0 && (
              <span className="text-ink-32" aria-hidden>
                ·
              </span>
            )}
            {f}
          </li>
        ))}
      </motion.ul>
    </section>
  );
}
