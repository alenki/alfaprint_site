'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { DAY } from '@/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * СМЕННОЕ ЗАДАНИЕ.
 *
 * Рубиновая линия растёт строго линейно по прогрессу секции: скрабленная
 * анимация никогда не имеет кривой — иначе она врёт про положение.
 *
 * Узлы загораются от порога, посчитанного из той же переменной, — ни одного
 * слушателя на узлах. У последнего узла дорисовывается галочка: знак бренда
 * появляется ровно в точке сдачи заказа.
 */
export function DayTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.4'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const nodes = DAY.nodes;

  return (
    <div ref={ref} className="relative mt-16 md:mt-24">
      <p className="t-micro mb-8 text-[var(--color-chalk-56)]">{DAY.label}</p>

      {/* ── Десктоп: горизонтальная линия ──────────────────────────────── */}
      <div className="relative hidden md:block" style={{ paddingBlock: '72px' }}>
        <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-chalk-30)]" />
        <motion.div
          className="absolute inset-x-0 top-1/2 h-px origin-left bg-[var(--color-rubine)]"
          style={{ scaleX: reduced ? 1 : scale }}
        />

        <ul className="relative flex justify-between">
          {nodes.map((node, i) => {
            const threshold = i / (nodes.length - 1);
            return (
              <Node
                key={node.time}
                node={node}
                i={i}
                threshold={threshold}
                progress={scrollYProgress}
                reduced={reduced}
                edge={i === 0 ? 'start' : i === nodes.length - 1 ? 'end' : 'mid'}
              />
            );
          })}
        </ul>
      </div>

      {/* ── Мобильный: та же линия в вертикаль ─────────────────────────── */}
      <div className="relative md:hidden">
        <div className="absolute bottom-0 left-[5px] top-0 w-px bg-[var(--color-chalk-30)]" />
        <motion.div
          className="absolute bottom-0 left-[5px] top-0 w-px origin-top bg-[var(--color-rubine)]"
          style={{ scaleY: reduced ? 1 : scale }}
        />
        <ul className="flex flex-col gap-9">
          {nodes.map((node, i) => (
            <li key={node.time} className="relative flex items-baseline gap-5 pl-6">
              <span className="absolute left-0 top-2 h-[11px] w-[11px] -translate-x-[0px] rounded-full border border-[var(--color-chalk-30)] bg-[var(--color-ink)]" />
              <span className="t-micro w-12 shrink-0 text-[var(--color-chalk-56)]">{node.time}</span>
              <span className="font-display text-2xl font-semibold text-[var(--color-chalk)]">
                {node.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="t-micro mt-12 text-[var(--color-chalk-56)]">{DAY.terms}</p>
    </div>
  );
}

function Node({
  node,
  i,
  threshold,
  progress,
  reduced,
  edge,
}: {
  node: { time: string; title: string };
  i: number;
  threshold: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  reduced: boolean;
  edge: 'start' | 'mid' | 'end';
}) {
  const lit = useTransform(progress, [threshold - 0.02, threshold + 0.06], [0, 1]);
  /* Узел, до которого линия ещё не дошла, ПРИГЛУШЁН, а не спрятан:
     расписание надо читать целиком с первого взгляда, иначе половина
     дня выглядит как сбой вёрстки. */
  const litText = useTransform(lit, [0, 1], [0.42, 1]);
  const litDot = useTransform(lit, [0, 1], [0.22, 1]);
  const above = i % 2 === 0;

  /** Крайние подписи прижимаются к краям формата, иначе они уходят за обрез. */
  const place =
    edge === 'start'
      ? 'left-0 text-left'
      : edge === 'end'
        ? 'right-0 text-right'
        : 'left-1/2 -translate-x-1/2 text-center';

  return (
    <li className="relative flex flex-col items-center" style={{ flex: '0 0 auto' }}>
      {/* Подпись чередуется над и под линией */}
      <div
        className={`absolute whitespace-nowrap ${place}`}
        style={above ? { bottom: '18px' } : { top: '18px' }}
      >
        <motion.p
          className="t-micro"
          style={{ color: 'var(--color-chalk-56)', opacity: reduced ? 1 : undefined }}
        >
          {node.time}
        </motion.p>
        <motion.p
          className="mt-1.5 font-display text-[26px] font-semibold leading-none"
          style={{
            color: 'var(--color-chalk)',
            opacity: reduced ? 1 : litText,
          }}
        >
          {node.title}
        </motion.p>
      </div>

      {/* Точка узла: сначала мелом, под линией — потом заливается рубином. */}
      <span className="relative block h-1.5 w-1.5 rounded-full bg-[var(--color-chalk-30)]">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background: 'var(--color-rubine)',
            opacity: reduced ? 1 : litDot,
          }}
        />
      </span>

      {/* Знак бренда появляется ровно в точке сдачи заказа. */}
      {edge === 'end' && (
        <motion.svg
          viewBox="0 0 24 22"
          className="absolute right-0 h-6 w-7"
          style={{ opacity: reduced ? 1 : lit, bottom: above ? undefined : '70px', top: above ? '18px' : undefined }}
          fill="none"
          aria-hidden
        >
          <motion.path
            d="M2 11.5 L8.5 19.5 L22 1.5"
            stroke="var(--color-rubine)"
            strokeWidth="3"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            pathLength={1}
            initial={{ pathLength: reduced ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.52, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.svg>
      )}
    </li>
  );
}
