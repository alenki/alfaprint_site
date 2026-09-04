'use client';

import { motion } from 'motion/react';
import { H1Justified } from '@/components/type/H1Justified';
import { Screen } from '@/components/print/Screen';
import { TrimMarks } from '@/components/chrome/TrimMarks';
import { ShiftPromise } from '@/components/ui/ShiftStatus';
import { HERO } from '@/content/site';

/**
 * §01 · ПЕРВЫЙ ПРОГОН
 *
 * Первые 2,4 секунды: чёрная форма печатается, следом приходит рубиновая —
 * не в приводке — и садится на место. Кнопок в первом экране нет: WhatsApp
 * стоит в шапке с первого кадра, и это его работа, а не работа героя.
 *
 * Внизу — полоса цветоделения: одно и то же изображение в чёрном, в рубине
 * и в сводке. Она объясняет всю страницу без единого слова.
 */
export function PervyiProgon() {
  const land = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <section
      id="pervyi-progon"
      data-section-ground="paper"
      style={{ ['--gain' as string]: 0.6 }}
      className="ground-paper relative flex min-h-[100svh] flex-col justify-between pt-[clamp(28px,5vh,64px)] pb-[calc(var(--strip-h)+var(--striplabel-h))] md:pb-[calc(var(--strip-h)+var(--striplabel-h))]"
    >
      <div className="trim">
        {/* Кикер */}
        <motion.div
          initial={{ opacity: 0, y: 42 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...land, delay: 0.12 }}
        >
          <p className="t-label pb-3 text-[var(--color-ink-62)]">{HERO.kicker}</p>
          <div className="h-px w-full bg-[var(--color-ink-32)]" />
        </motion.div>

        {/* Заголовок — форма K, печатается снизу вверх */}
        <motion.div
          className="mt-[clamp(28px,5vh,64px)] w-full"
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ ...land, delay: 0.12 }}
        >
          <H1Justified linesDesktop={HERO.linesDesktop} linesMobile={HERO.linesMobile} />
        </motion.div>

        {/* Подстрочник — форма R. Рубин по бумаге на 12 px: 4.79:1, проходит. */}
        <motion.p
          className="t-label mt-6 max-w-[64ch] text-[var(--color-rubine)]"
          initial={{ opacity: 0, x: -26, y: 16 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.42, delay: 0.76, ease: [0.16, 1, 0.3, 1] }}
        >
          {HERO.sub}
        </motion.p>

        {/* Живая строка обещания */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.42, delay: 1.0 }}
        >
          <ShiftPromise className="t-micro mt-4 text-[var(--color-ink-62)]" />
        </motion.div>

        <motion.p
          className="mt-8 md:mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.42, delay: 1.18 }}
        >
          <a
            href="#v-pechat"
            className="link-rule inline-block py-3 text-[18px] font-medium md:py-0"
          >
            {HERO.link} →
          </a>
        </motion.p>
      </div>

      {/* ── ПОЛОСА ЦВЕТОДЕЛЕНИЯ ──────────────────────────────────────────── */}
      <motion.div
        className="ground-ink relative mt-[clamp(32px,6vh,80px)] h-[22vh] w-full md:h-[26vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.42, delay: 0.9 }}
      >
        <TrimMarks className="z-10 text-[var(--color-chalk-30)]" />
        <div className="grid h-full grid-cols-2 md:grid-cols-3">
          <Panel label={HERO.panels[0]}>
            <Screen pitch={6} angle={45} colour="#EDEBE6" fit={0.5} />
          </Panel>

          {/* На 375 px панель «Форма R» вырезается: посадка форм всё равно видна. */}
          <Panel label={HERO.panels[1]} className="hidden md:flex">
            <Screen pitch={6} angle={15} colour="#D50032" fit={0.5} />
          </Panel>

          <Panel label={HERO.panels[2]} delta>
            <div className="absolute inset-0">
              <Screen pitch={6} angle={45} colour="#EDEBE6" fit={0.5} />
            </div>
            <div className="plate-r absolute inset-0" style={{ ['--gain' as string]: 1 }}>
              <Screen pitch={6} angle={15} colour="#D50032" fit={0.5} />
            </div>
          </Panel>
        </div>
      </motion.div>
    </section>
  );
}

function Panel({
  label,
  children,
  className,
  delta,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  delta?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col justify-end overflow-hidden border-l border-[var(--color-chalk-30)] first:border-l-0 ${className ?? ''}`}
    >
      <div className="absolute inset-0">{children}</div>
      {/* Подпись стоит на плашке краски: поверх растра иначе не читается. */}
      <p className="t-micro relative z-10 flex items-baseline gap-3 bg-[var(--color-ink)] px-3 pb-2.5 pt-2 text-[var(--color-chalk-56)] md:px-4 md:pb-3">
        <span>{label}</span>
        {delta && <span className="opacity-70">Δ 0,00 мм</span>}
      </p>
    </div>
  );
}
