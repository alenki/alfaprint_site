'use client';

import { useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { SROK } from '@/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';

/**
 * ПУТЬ ЗАКАЗА.
 *
 * Линия идёт от реза до реза: первый узел стоит на левом поле, последний
 * на правом, а сама линейка уходит за обрез в оба края. Путь заказа это
 * весь лист целиком, и на формате во весь лист он обязан занимать весь
 * лист; в колонке по центру он читался как виджет.
 *
 * НАД УЗЛАМИ СТОЯТ НОМЕРА, А НЕ ЧАСЫ. Прежде это было сменное задание с
 * расписанием от 09:00 до 17:00; часов у срочного заказа фирма не называет
 * нигде, и выдуманное расписание обещало за неё. Номер говорит ровно то,
 * что здесь и надо сказать: порядок. Разбор источника у `SROK`.
 *
 * ПОД НОМЕРОМ И СЛОВОМ СТОИТ СТРОКА МАСТЕРСКОЙ. Прежде узел печатал только
 * номер и слово, и путь отвечал на «в каком порядке», но не на «что там
 * делают». Строка эта взята у фирмы слово в слово, см. `SROK.nodes`.
 *
 * МЕРУ ПОДПИСИ ДЕРЖИТ ЗАЗОР МЕЖДУ УЗЛАМИ, А НЕ ДЛИНА СТРОКИ. Подписи стоят
 * через одну: первая и третья над линией, вторая и четвёртая под, и потому
 * столкнуться могут только соседи через один, за два зазора друг от друга.
 * Отсюда потолок в 4/9 полосы; `--op-cap` держится много ниже него.
 *
 * ВЫСОТУ ПОЛОСЫ ЗАДАЁТ ОТБИВКА, А НЕ ТЕКСТ. Подписи вынуты из потока, и
 * длина строки не двигает линию: место под самую высокую из них отмерено
 * заранее в `--op-pad`. Строка вдвое длиннее не сделает полосу выше.
 *
 * Рубиновая линия растёт строго линейно по прогрессу секции: скрабленная
 * анимация никогда не имеет кривой: иначе она врёт про положение.
 *
 * Узлы загораются от порога, посчитанного из той же переменной, и ни одного
 * слушателя на узлах. У последнего узла дорисовывается галочка: знак бренда
 * появляется ровно в точке сдачи заказа.
 */
export function OrderPath() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.4'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const nodes = SROK.nodes;

  return (
    <div
      ref={ref}
      className="relative mt-[clamp(56px,5vw,112px)]"
      style={
        {
          /** Место под самую высокую подпись: номер, слово и три строки. */
          '--op-pad': 'clamp(150px,9vw,180px)',
          /** Мера подписи. Потолок столкновения 4/9 полосы, здесь много ниже. */
          '--op-cap': 'clamp(240px,22vw,400px)',
        } as CSSProperties
      }
    >
      {/* ── Десктоп: линия во весь лист ──────────────────────────────────── */}
      <div className="relative hidden md:block" style={{ paddingBlock: 'var(--op-pad)' }}>
        {/* Линейка уходит за обрез: путь не начинается и не кончается на поле. */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--rule)]" />
        <motion.div
          className="absolute inset-x-0 top-1/2 h-px origin-left bg-[var(--color-rubine)]"
          style={{ scaleX: reduced ? 1 : scale }}
        />

        <ul className="relative flex justify-between px-[var(--edge)]">
          {nodes.map((node, i) => (
            <Node
              key={node.step}
              node={node}
              i={i}
              threshold={i / (nodes.length - 1)}
              progress={scrollYProgress}
              reduced={reduced}
              edge={i === 0 ? 'start' : i === nodes.length - 1 ? 'end' : 'mid'}
            />
          ))}
        </ul>
      </div>

      {/* ── Мобильный: та же линия в вертикаль ───────────────────────────── */}
      <div className="relative px-[var(--edge)] md:hidden">
        <div className="absolute bottom-0 left-[calc(var(--edge)+5px)] top-0 w-px bg-[var(--rule)]" />
        <motion.div
          className="absolute bottom-0 left-[calc(var(--edge)+5px)] top-0 w-px origin-top bg-[var(--color-rubine)]"
          style={{ scaleY: reduced ? 1 : scale }}
        />
        <ul className="flex flex-col gap-10">
          {nodes.map((node) => (
            <li key={node.step} className="relative pl-6">
              <span className="absolute left-0 top-2 h-[11px] w-[11px] rounded-full border border-[var(--rule)] bg-[var(--color-ink)]" />
              <div className="flex items-baseline gap-5">
                <span className="t-micro fg-56 w-7 shrink-0">{node.step}</span>
                <span className="font-display fg text-2xl font-semibold">{node.title}</span>
              </div>
              {/* Строка встаёт под слово, а не под номер: колонка номеров
                  остаётся колонкой номеров сверху донизу. */}
              <p className="t-body fg-56 measure-tight ml-12 mt-2">{node.body}</p>
            </li>
          ))}
        </ul>
      </div>
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
  node: { step: string; title: string; body: string };
  i: number;
  threshold: number;
  progress: MotionValue<number>;
  reduced: boolean;
  edge: 'start' | 'mid' | 'end';
}) {
  const lit = useTransform(progress, [threshold - 0.02, threshold + 0.06], [0, 1]);
  /* Узел, до которого линия ещё не дошла, ПРИГЛУШЁН, а не спрятан:
     путь надо читать целиком с первого взгляда, иначе половина заказа
     выглядит как сбой вёрстки. */
  const litText = useTransform(lit, [0, 1], [0.42, 1]);
  const litDot = useTransform(lit, [0, 1], [0.22, 1]);
  /* Строка гаснет мягче слова: она и так набрана вполсилы, и та же доля
     увела бы её в ничто. Приглушённая строка обязана читаться. */
  const litBody = useTransform(lit, [0, 1], [0.62, 1]);
  const above = i % 2 === 0;

  /** Крайние подписи прижимаются к своему резу, иначе они уходят за обрез. */
  const place =
    edge === 'start'
      ? 'left-0 text-left'
      : edge === 'end'
        ? 'right-0 text-right'
        : 'left-1/2 -translate-x-1/2 text-center';

  return (
    <li className="relative flex flex-col items-center" style={{ flex: '0 0 auto' }}>
      <div
        className={`absolute w-[var(--op-cap)] ${place}`}
        style={above ? { bottom: '20px' } : { top: '20px' }}
      >
        <p className="t-micro fg-56">{node.step}</p>
        <motion.p
          className="font-display fg mt-1.5 text-[clamp(1.25rem,1.9vw,2.25rem)] font-semibold leading-none"
          style={{ opacity: reduced ? 1 : litText }}
        >
          {node.title}
        </motion.p>
        <motion.p
          className="t-body fg-56 mt-2.5 leading-[1.5]"
          style={{ opacity: reduced ? 1 : litBody }}
        >
          {node.body}
        </motion.p>
      </div>

      {/* Точка узла: сначала мелом, потом заливается рубином. */}
      <span className="relative block h-1.5 w-1.5 rounded-full bg-[var(--rule)]">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: 'var(--color-rubine)', opacity: reduced ? 1 : litDot }}
        />
      </span>

      {/* Знак бренда появляется ровно в точке сдачи заказа. */}
      {edge === 'end' && (
        <motion.svg
          viewBox="0 0 24 22"
          className="absolute right-0 h-6 w-7"
          style={{
            opacity: reduced ? 1 : lit,
            bottom: above ? undefined : '78px',
            top: above ? '20px' : undefined,
          }}
          fill="none"
          aria-hidden
        >
          <motion.path
            d="M2 11.5 L8.5 19.5 L22 1.5"
            stroke="var(--color-rubine)"
            strokeWidth="3"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            /* Длина галки в единицах вьюбокса, а не pathLength: WebKit
               не приводит stroke-dasharray к pathLength, и на iPhone галка
               рассыпалась в пыль. См. тот же разбор в CityFilm. */
            strokeDasharray={32.81}
            initial={{ strokeDashoffset: reduced ? 0 : 32.81 }}
            whileInView={{ strokeDashoffset: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.52, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.svg>
      )}
    </li>
  );
}
