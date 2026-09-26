'use client';

import { PrintReveal } from '@/components/type/PrintReveal';
import { Section, Sheet, Grid } from '@/components/layout/Sheet';
import { useShift } from '@/components/ui/ShiftStatus';
import { HOURS_DISPLAY } from '@/content/hours';
import { CONTACTS } from '@/content/site';
import { K_SECTIONS, K_SVYAZ } from '@/content/kontakty';

/**
 * §K1 · СВЯЗЬ
 *
 * АФИШЕЙ ИДЁТ НОМЕР. Первый экран главной набирает во весь формат имя фирмы,
 * потому что там читатель ещё не знает, куда попал; сюда он приходит, уже
 * зная, и слово «Контакты» в полтораста пунктов повторило бы ему пункт меню,
 * по которому он щёлкнул. Единственное, за чем приходят на этот лист первым
 * делом, это номер, и напечатан он ростом заголовка. Номер и есть заявление
 * полосы: второго заголовка здесь нет.
 *
 * НОМЕР ИДЁТ ОДНОЙ КРАСКОЙ. Разложить его по двум формам, как имя на
 * главной, было соблазнительно и неправильно: номер переписывают глазами и
 * набирают руками, а половина цифр другого цвета читается как выделение
 * части номера, то есть как ошибка в номере.
 *
 * ПЕРЕНОС АВТОРСКИЙ И ЖИВЁТ В СТИЛЕ, А НЕ В РАЗМЕТКЕ. Разметка отдаёт две
 * половины номера, код с оператором и сам номер; встанут они в строку или
 * друг под друга, решает формат, и решает одной сменой направления (см.
 * `.k-phone`). Текста в документе при этом один, и скринридер читает номер
 * целиком, а не двумя огрызками.
 *
 * ЧАСЫ СТОЯТ ЗДЕСЬ, А НЕ В ПОДВАЛЕ ЛИСТА, и стоят рядом с номером не случайно:
 * они отвечают на второй вопрос звонящего, возьмут ли трубку. Подсветка
 * сегодняшней строки взята у §08 главной без единой правки: обещаний живой
 * строкой сайт не печатает. В будний день подсвечены две строки, график и
 * перерыв: обе про сегодня.
 */
export function Svyaz() {
  const shift = useShift();
  const S = K_SECTIONS[0];

  return (
    <Section
      id={S.id}
      ground={S.ground}
      gain={S.gain}
      className="pt-[clamp(88px,9.4vw,208px)] pb-[var(--section-pad)]"
    >
      <Sheet>
        <PrintReveal as="div">
          <a href={CONTACTS.phoneHref} className="k-phone" aria-label={`Позвонить ${CONTACTS.phone}`}>
            {K_SVYAZ.phoneBreak.map((part) => (
              <span key={part}>{part}</span>
            ))}
          </a>
        </PrintReveal>

        <Grid className="mt-[clamp(104px,11vw,240px)] gap-y-[clamp(28px,2.8vw,52px)]">
          <div className="col-span-4 md:col-span-6">
            <PrintReveal as="p" delay={0.04} className="t-lead fg-70 measure">
              {K_SVYAZ.lead}
            </PrintReveal>
          </div>

          <div className="col-span-4 md:col-span-4 md:col-start-9">
            <PrintReveal as="div" delay={0.08}>
              <span className="t-micro fg-56 kp-col-label">{K_SVYAZ.hoursLabel}</span>
              {/* Колонку дней держит сетка по самой длинной метке, а не
                  ширина в знаках: «Перерыв» длиннее «Пн…Пт», и время во
                  всех строках обязано стоять по одной оси. См. `.k-hours`. */}
              <ul className="k-hours">
                {HOURS_DISPLAY.map((h) => {
                  const today =
                    shift.day >= 0 && (h.match as readonly number[]).includes(shift.day);
                  return (
                    <li
                      key={h.days}
                      className="t-mono"
                      style={{ color: today ? 'var(--fg)' : 'var(--fg-70)' }}
                    >
                      <span>{h.days}</span>
                      <span>{h.time}</span>
                    </li>
                  );
                })}
              </ul>
            </PrintReveal>
          </div>
        </Grid>
      </Sheet>
    </Section>
  );
}
