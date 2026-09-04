'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RegistrationMark } from './PrintMarks';

/* ═══════════════════════════════════════════════════════════════════════════
   СУШКА

   Единственный жест подтверждения на всём сайте. Ни тостов, ни зелёных
   галочек, ни спиннеров: телефон скопирован, наряд собран, ступень выбрана —
   везде одна и та же вспышка рубиновой приводки на 420 мс, в точке касания.

   Одна марка, одна вспышка, одно значение, ноль интерфейсного мусора.
   ═══════════════════════════════════════════════════════════════════════════ */

type Flash = { id: number; x: number; y: number; label?: string };

const EVENT = 'alfa:sushka';

let seq = 0;

/** Вспышка в точке события. Вызывается из любого места. */
export function sushka(e: { clientX: number; clientY: number } | null, label?: string) {
  if (typeof window === 'undefined') return;
  const x = e?.clientX ?? window.innerWidth / 2;
  const y = e?.clientY ?? window.innerHeight / 2;
  window.dispatchEvent(
    new CustomEvent<Flash>(EVENT, { detail: { id: ++seq, x, y, label } }),
  );
}

export function SushkaLayer() {
  const [flashes, setFlashes] = useState<Flash[]>([]);

  useEffect(() => {
    const onFlash = (e: Event) => {
      const f = (e as CustomEvent<Flash>).detail;
      setFlashes((prev) => [...prev, f]);
      window.setTimeout(
        () => setFlashes((prev) => prev.filter((p) => p.id !== f.id)),
        620,
      );
    };
    window.addEventListener(EVENT, onFlash);
    return () => window.removeEventListener(EVENT, onFlash);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[95] overflow-hidden"
    >
      <AnimatePresence>
        {flashes.map((f) => (
          <motion.div
            key={f.id}
            className="absolute text-rubine"
            style={{ left: f.x, top: f.y }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1.06, 1.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.62, times: [0, 0.12, 0.55, 1], ease: 'easeOut' }}
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
              <RegistrationMark size={30} strokeWidth={1.25} />
            </div>
            {f.label && (
              <span className="t-meta absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-rubine">
                {f.label}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Живое объявление для скринридера — вспышку он не увидит */}
      <span role="status" aria-live="polite" className="sr-only">
        {flashes.length > 0 ? (flashes[flashes.length - 1].label ?? 'Готово') : ''}
      </span>
    </div>
  );
}
