'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TrimMark } from '@/components/ui/PrintMarks';
import { sushka } from '@/components/ui/Sushka';
import { CAPABILITIES, COMPANY, CONTACTS } from '@/content/site';
import { naryadNumber, useNaryadPatch } from '@/lib/naryad';
import { usePrefersReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ПУЛЬТ ЗАКАЗА

   Настоящая воронка этой типографии — не форма с полем «e-mail», а чат.
   Заказы приходят в WhatsApp и Telegram, и приходят словами: «нужны визитки,
   пятьсот штук, к завтрашнему».

   Поэтому здесь нет формы. Здесь собирается наряд — тот самый бланк, по
   которому цех работает, — и уходит в мессенджер уже заполненным. Ни базы,
   ни бэкенда, ни письма, которое никто не прочитает. Четыре нажатия.

   Строка каталога выше дописывает сюда изделие: производство и пульт —
   один механизм, а не две секции.
   ═══════════════════════════════════════════════════════════════════════════ */

const TIRAZH = ['1 — 10 шт', '50 шт', '100 шт', '500 шт', '1 000 шт', 'больше 1 000'];
const SROK = ['Сегодня', 'Завтра', 'На этой неделе', 'Не горит'];
const MAKET = ['Макет готов', 'Нужен дизайнер', 'Есть идея на словах'];

type State = { chto: string | null; tirazh: string | null; srok: string | null; maket: string | null };

const EMPTY: State = { chto: null, tirazh: null, srok: null, maket: null };

/* ── Ряд переключателей ─────────────────────────────────────────────────── */

function Field({
  label,
  index,
  options,
  value,
  onPick,
}: {
  label: string;
  index: string;
  options: string[];
  value: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <fieldset className="border-t border-ink-16 py-5">
      <legend className="sr-only">{label}</legend>
      <div className="t-meta mb-3.5 flex items-baseline gap-3 text-ink-48">
        <span className="tab-nums text-ink-32">{index}</span>
        <span aria-hidden>{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPick(o)}
              data-cursor={on ? 'Выбрано' : 'Выбрать'}
              className={cn(
                't-meta rounded-full border px-3.5 py-2 transition-colors duration-400',
                on
                  ? 'border-ink bg-ink text-paper'
                  : 'border-ink-16 text-ink-72 hover:border-ink-32 hover:text-ink',
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ── Строка бланка ──────────────────────────────────────────────────────── */

function Row({ k, v, dim }: { k: string; v: string; dim?: boolean }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-3 py-1.5">
      <dt className="t-meta text-ink-32">{k}</dt>
      <dd className={cn('t-meta', dim ? 'text-ink-32' : 'text-ink')}>{v}</dd>
    </div>
  );
}

export function Naryad() {
  const [s, setS] = useState<State>(EMPTY);
  const [touched, setTouched] = useState(false);
  const reduced = usePrefersReducedMotion();

  // Каталог производства дописывает изделие в наряд
  useNaryadPatch((patch) => {
    if (!patch.chto) return;
    const cap = CAPABILITIES.find((c) => c.slug === patch.chto);
    if (cap) setS((prev) => ({ ...prev, chto: cap.title }));
  });

  const number = useMemo(
    () => naryadNumber(`${s.chto}|${s.tirazh}|${s.srok}|${s.maket}`),
    [s],
  );

  const ready = Boolean(s.chto);

  const message = useMemo(() => {
    const lines = [
      `Здравствуйте! Наряд ${number}.`,
      s.chto ? `Изделие: ${s.chto}.` : null,
      s.tirazh ? `Тираж: ${s.tirazh}.` : null,
      s.srok ? `Срок: ${s.srok.toLowerCase()}.` : null,
      s.maket ? `Макет: ${s.maket.toLowerCase()}.` : null,
      'Подскажите цену и сроки.',
    ].filter(Boolean);
    return lines.join('\n');
  }, [s, number]);

  const openWhatsApp = (e: React.MouseEvent) => {
    setTouched(true);
    if (!ready) {
      e.preventDefault();
      return;
    }
    sushka(e.nativeEvent, `Наряд ${number} собран`);
  };

  const openTelegram = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    setTouched(true);
    if (!ready) {
      e.preventDefault();
      return;
    }
    // Telegram не умеет подставлять текст в личный чат по ссылке. Честнее
    // положить наряд в буфер и сказать об этом, чем делать вид, что умеет.
    try {
      await navigator.clipboard.writeText(message);
      sushka(e.nativeEvent, 'Наряд скопирован — вставьте в чат');
    } catch {
      sushka(e.nativeEvent, `Наряд ${number}`);
    }
  };

  return (
    <section id="naryad" className="relative px-gutter py-section">
      <header className="mb-12 md:mb-16">
        <div className="t-meta mb-7 flex items-baseline justify-between gap-6 border-t border-ink-16 pt-4 text-ink-48">
          <span>09 / Заказ</span>
          <span>Четыре поля · без формы и без почты</span>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          <h2 className="t-display text-[clamp(2rem,6.2vw,5.4rem)] leading-[0.9] md:col-span-7">
            Соберите наряд
          </h2>
          <p className="t-lead self-end md:col-span-5 md:pb-2">
            Заказы к нам приходят в мессенджеры, а не письмами. Отметьте четыре
            строки — наряд уйдёт в чат уже заполненным, и разговор начнётся
            с цены и срока, а не с уточнений.
          </p>
        </div>
      </header>

      <div className="grid gap-10 md:grid-cols-12 lg:gap-14">
        {/* ── Поля ───────────────────────────────────────────────────────── */}
        <div className="md:col-span-7">
          <Field
            index="01"
            label="Что печатаем"
            options={CAPABILITIES.map((c) => c.title)}
            value={s.chto}
            onPick={(v) => setS((p) => ({ ...p, chto: v }))}
          />
          <Field
            index="02"
            label="Тираж"
            options={TIRAZH}
            value={s.tirazh}
            onPick={(v) => setS((p) => ({ ...p, tirazh: v }))}
          />
          <Field
            index="03"
            label="Срок"
            options={SROK}
            value={s.srok}
            onPick={(v) => setS((p) => ({ ...p, srok: v }))}
          />
          <Field
            index="04"
            label="Макет"
            options={MAKET}
            value={s.maket}
            onPick={(v) => setS((p) => ({ ...p, maket: v }))}
          />

          <div className="flex items-center justify-between gap-4 border-t border-ink-16 pt-5">
            <p className="t-meta text-ink-32">
              {touched && !ready ? (
                <span className="text-rubine">Наряд не собран — выберите изделие</span>
              ) : (
                'Ничего не отправляется, пока вы не нажмёте'
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setS(EMPTY);
                setTouched(false);
              }}
              className="t-meta text-ink-32 underline-ink pb-px transition-colors duration-400 hover:text-ink"
            >
              Сбросить
            </button>
          </div>
        </div>

        {/* ── Бланк ──────────────────────────────────────────────────────── */}
        <div className="md:col-span-5">
          <div className="sticky top-28">
            <motion.div
              className="relative border border-ink-16 bg-paper-2 p-6 pb-7"
              initial={reduced ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-2 text-ink-32">
                <TrimMark corner="tl" className="absolute left-0 top-0" />
                <TrimMark corner="tr" className="absolute right-0 top-0" />
                <TrimMark corner="bl" className="absolute bottom-0 left-0" />
                <TrimMark corner="br" className="absolute bottom-0 right-0" />
              </div>

              <div className="t-meta flex items-baseline justify-between gap-4 border-b border-ink-16 pb-3">
                <span className="text-ink">Наряд {number}</span>
                <span className="text-ink-32">{COMPANY.short}</span>
              </div>

              <dl className="py-3" aria-live="polite">
                <Row k="Изделие" v={s.chto ?? '— не выбрано'} dim={!s.chto} />
                <Row k="Тираж" v={s.tirazh ?? '— уточним'} dim={!s.tirazh} />
                <Row k="Срок" v={s.srok ?? '— уточним'} dim={!s.srok} />
                <Row k="Макет" v={s.maket ?? '— уточним'} dim={!s.maket} />
              </dl>

              <div className="border-t border-ink-16 pt-3">
                <Row k="Цех" v={`${COMPANY.address}, ${COMPANY.city}`} dim />
                <Row k="Принят" v="— после отправки" dim />
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={`${CONTACTS.whatsapp}?text=${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={openWhatsApp}
                  aria-disabled={!ready}
                  data-cursor="Отправить"
                  className={cn(
                    't-meta group relative overflow-hidden rounded-full px-6 py-3.5 text-center transition-colors duration-400',
                    // Пока наряд не собран, кнопка теряет заливку, но не
                    // читаемость: серый по серому — это не «неактивно»,
                    // это «не видно».
                    ready
                      ? 'bg-ink text-paper'
                      : 'border border-ink-16 bg-paper-2 text-ink-72',
                  )}
                >
                  <span className="relative z-10">Отправить в WhatsApp</span>
                  {ready && (
                    <span className="absolute inset-0 z-0 origin-left scale-x-0 bg-rubine transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                  )}
                </a>

                <a
                  href={CONTACTS.telegram}
                  target="_blank"
                  rel="noreferrer"
                  onClick={openTelegram}
                  aria-disabled={!ready}
                  data-cursor="Скопировать"
                  className={cn(
                    't-meta rounded-full border px-6 py-3.5 text-center transition-colors duration-400',
                    ready
                      ? 'border-ink-32 text-ink hover:border-ink'
                      : 'border-ink-16 text-ink-72',
                  )}
                >
                  Скопировать и открыть Telegram
                </a>
              </div>
            </motion.div>

            <p className="t-meta mt-4 text-ink-32">
              Или просто позвоните:{' '}
              <a href={CONTACTS.phoneHref} className="underline-ink pb-px text-ink-48 tab-nums">
                {CONTACTS.phone}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
