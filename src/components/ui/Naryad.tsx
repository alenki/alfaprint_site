'use client';

import { motion } from 'motion/react';
import { Tick } from '@/components/chrome/Mark';
import { ORDER } from '@/content/site';
import { useNaryad } from '@/state/NaryadContext';
import { cn } from '@/lib/cn';

/**
 * НАРЯД — лист поверх краски.
 *
 * Ни одно поле не обязательно. Валидации нет вовсе: если контакт не заполнен,
 * WhatsApp всё равно откроется, просто без строки связи. Чекаут, который
 * надо объяснять, уже проиграл.
 *
 * Полей в рамках нет: строки стоят на волосяных базовых линиях, как в
 * настоящем бланке наряда.
 */
export function Naryad() {
  const n = useNaryad();

  return (
    <div className="border border-[var(--color-ink)] bg-[var(--color-paper)] p-5 md:p-7">
      {/* Что печатаем */}
      <Field label="Что печатаем">
        {n.items.length > 0 ? (
          <ul className="flex flex-wrap gap-2 py-1">
            {n.items.map((item) => (
              <motion.li
                key={item.id}
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.2, ease: [0.65, 0, 0.35, 1] }}
                className="flex items-center gap-2 border border-[var(--color-ink-32)] px-2.5 py-1.5"
              >
                <span className="text-[13px] font-medium">{item.title}</span>
                <button
                  type="button"
                  onClick={() => n.remove(item.id)}
                  aria-label={`Убрать «${item.title}» из наряда`}
                  className="text-[var(--color-ink-62)] transition-colors hover:text-[var(--color-rubine)]"
                >
                  ✕
                </button>
              </motion.li>
            ))}
          </ul>
        ) : (
          <input
            type="text"
            value={n.freeText}
            onChange={(e) => n.setFreeText(e.target.value)}
            placeholder={ORDER.emptyChips}
            className="w-full bg-transparent py-1.5 text-[15px] outline-none placeholder:text-[var(--color-ink-62)]"
          />
        )}
      </Field>

      {/* Тираж */}
      <Field label="Тираж">
        <div className="flex items-center gap-4 py-1">
          <Stepper onClick={() => n.setQty(Math.max(1, n.qty - 50))} label="Меньше">
            −
          </Stepper>
          <input
            type="number"
            inputMode="numeric"
            value={n.qty}
            min={1}
            onChange={(e) => n.setQty(Math.max(1, Number(e.target.value) || 1))}
            aria-label="Тираж"
            className="w-28 bg-transparent font-display text-[28px] font-semibold tabular-nums outline-none"
          />
          <Stepper onClick={() => n.setQty(n.qty + 50)} label="Больше">
            +
          </Stepper>
        </div>
      </Field>

      {/* Срок */}
      <Field label="Срок">
        <div className="flex py-1">
          {ORDER.deadlines.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => n.setDeadline(n.deadline === d ? '' : d)}
              aria-pressed={n.deadline === d}
              className={cn(
                't-micro flex min-h-[40px] flex-1 items-center justify-center border px-3 transition-colors duration-200',
                n.deadline === d
                  ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : 'border-[var(--color-ink-32)] text-[var(--color-ink-70)]'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </Field>

      {/* Связь */}
      <Field label="Как связаться" last>
        <input
          type="text"
          value={n.contact}
          onChange={(e) => n.setContact(e.target.value)}
          placeholder="+7 …  или  @telegram"
          autoComplete="tel"
          className="w-full bg-transparent py-1.5 text-[15px] outline-none placeholder:text-[var(--color-ink-62)]"
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn('py-3', !last && 'border-b border-[var(--color-ink-32)]')}>
      <p className="t-micro mb-1.5 text-[var(--color-ink-62)]">{label}</p>
      {children}
    </div>
  );
}

function Stepper({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center border border-[var(--color-ink-32)] text-xl leading-none transition-colors duration-200 hover:border-[var(--color-ink)]"
    >
      {children}
    </button>
  );
}

/** «ЧТО ПРИСЛАТЬ» — пять квадратов, заливающихся со стагером. */
export function Checklist() {
  return (
    <div>
      <p className="t-label text-[var(--color-paper)]">{ORDER.checklistTitle}</p>
      <ul className="mt-5 space-y-3">
        {ORDER.checklist.map((item, i) => (
          <li key={item} className="flex items-start gap-3">
            <motion.span
              className="mt-[3px] block h-3 w-3 shrink-0 border border-[var(--color-paper)]"
              initial={{ backgroundColor: 'rgba(242,241,236,0)' }}
              whileInView={{ backgroundColor: 'rgba(242,241,236,1)' }}
              viewport={{ once: true, margin: '-12% 0px' }}
              transition={{ duration: 0.18, delay: i * 0.07, ease: [0.65, 0, 0.35, 1] }}
            />
            <span className="t-micro text-[var(--color-paper)]">{item}</span>
          </li>
        ))}
      </ul>
      <p className="t-micro mt-8 max-w-[38ch] leading-relaxed text-[var(--color-paper)]">
        {ORDER.footnote}
      </p>
    </div>
  );
}

/** Галочка бренда выполняет свою настоящую функцию — утверждает наряд. */
export { Tick };
