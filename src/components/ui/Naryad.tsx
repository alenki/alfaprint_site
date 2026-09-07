'use client';

import { motion } from 'motion/react';
import { ORDER } from '@/content/site';
import { useNaryad } from '@/state/NaryadContext';
import { cn } from '@/lib/cn';

/**
 * НАРЯД: лист поверх краски.
 *
 * Ни одно поле не обязательно. Валидации нет вовсе: если контакт не заполнен,
 * WhatsApp всё равно откроется, просто без строки связи. Чекаут, который
 * надо объяснять, уже проиграл.
 *
 * Полей в рамках нет: строки стоят на волосяных базовых линиях, как в
 * настоящем бланке наряда.
 *
 * Лист несёт свой грунт (ground-paper), а не наследует рубиновый: внутри
 * бланка чёрное снова становится краской, и все смысловые цвета, линии,
 * метки, подсказки, считаются от бумаги, а не от заливки под ним.
 */
export function Naryad() {
  const n = useNaryad();

  return (
    <div className="ground-paper border border-[var(--color-ink)] p-[clamp(18px,1.8vw,40px)]">
      <Field label="Что печатаем">
        {n.items.length > 0 ? (
          <ul className="flex flex-wrap gap-2 py-1">
            {n.items.map((item) => (
              <motion.li
                key={item.id}
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.2, ease: [0.65, 0, 0.35, 1] }}
                className="flex items-center gap-2 border border-[var(--rule)] px-2.5 py-1.5"
              >
                <span className="text-[13px] font-medium">{item.title}</span>
                <button
                  type="button"
                  onClick={() => n.remove(item.id)}
                  aria-label={`Убрать «${item.title}» из наряда`}
                  className="fg-56 transition-colors hover:text-[var(--color-rubine)]"
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
            className="fg w-full bg-transparent py-1.5 text-[15px] outline-none placeholder:text-[var(--fg-56)]"
          />
        )}
      </Field>

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
            className="font-display fg w-28 bg-transparent text-[28px] font-semibold tabular-nums outline-none"
          />
          <Stepper onClick={() => n.setQty(n.qty + 50)} label="Больше">
            +
          </Stepper>
        </div>
      </Field>

      <Field label="Срок">
        <div className="flex py-1">
          {ORDER.deadlines.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => n.setDeadline(n.deadline === d ? '' : d)}
              aria-pressed={n.deadline === d}
              className={cn(
                't-micro flex min-h-[44px] flex-1 items-center justify-center border px-3 transition-colors duration-200',
                n.deadline === d
                  ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : 'fg-70 border-[var(--rule)]'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Как связаться" last>
        <input
          type="text"
          value={n.contact}
          onChange={(e) => n.setContact(e.target.value)}
          placeholder="+7 …  или  @telegram"
          autoComplete="tel"
          className="fg w-full bg-transparent py-1.5 text-[15px] outline-none placeholder:text-[var(--fg-56)]"
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
    <div className={cn('py-3', !last && 'rule-b')}>
      <p className="t-micro fg-56 mb-1.5">{label}</p>
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
      className="fg flex h-11 w-11 items-center justify-center border border-[var(--rule)] text-xl leading-none transition-colors duration-200 hover:border-[var(--color-ink)]"
    >
      {children}
    </button>
  );
}
