'use client';

/**
 * КОНТРОЛЬНАЯ ШКАЛА: прогресс, взятый из печатного производства,
 * а не из UI-кита.
 *
 * Двадцать растровых ступеней встык: десять плашек K и десять плашек R.
 * Заполненная часть это прочитанная доля листа. Ступени кликабельны.
 *
 * Шкала молчит: ни номера секции, ни счётчика Δ. Механику видно по краске.
 */

const STEPS = 20;

export function ControlStrip() {
  const jump = (i: number) => {
    const y = ((i + 0.5) / STEPS) * (document.body.scrollHeight - window.innerHeight);
    window.dispatchEvent(new CustomEvent('alfa:scrollto', { detail: { y } }));
  };

  return (
    <div className="controlstrip fixed inset-x-0 bottom-0 z-55 hidden md:block">
      {/* Двадцать ступеней */}
      <div className="relative h-[var(--strip-h)] w-full">
        <div className="absolute inset-0 flex opacity-[0.28]">
          {Array.from({ length: STEPS }, (_, i) => (
            <Step key={i} i={i} />
          ))}
        </div>
        {/* strip-fill это адрес, а не оформление: живую долю прогона цикл
            кладёт инлайном на этот самый узел, а не в :root, где она стоила бы
            пересчёта стиля всего листа на каждый кадр прокрутки. */}
        <div
          className="strip-fill absolute inset-0 flex origin-left"
          style={{ transform: 'scaleX(var(--progress, 0))' }}
        >
          {Array.from({ length: STEPS }, (_, i) => (
            <Step key={i} i={i} />
          ))}
        </div>
        {/* Хит-зона 24 px по высоте, WCAG 2.5.8 */}
        <nav aria-label="Разделы" className="absolute inset-x-0 bottom-0 flex h-6">
          {Array.from({ length: STEPS }, (_, i) => (
            <button
              key={i}
              type="button"
              className="h-full flex-1"
              onClick={() => jump(i)}
              aria-label={`Перейти к ${Math.round(((i + 0.5) / STEPS) * 100)} % страницы`}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

/**
 * Ступень: первые десять это растр K, вторые десять растр R.
 *
 * Краска R берётся из `--strip-r`, а не прямо из токена: на тёмно-синем
 * грунте шкала подменяет её светлой синей, потому что синяя с логотипа там
 * даёт 1,71:1 и ступени слились бы с грунтом (правило в globals.css, у
 * `data-strip-ground`). На бумаге подмены нет, и ступень печатается синей.
 */
function Step({ i }: { i: number }) {
  const isK = i < 10;
  const t = (i % 10) / 9;
  const bg = isK
    ? `color-mix(in srgb, var(--color-ink) ${14 + t * 86}%, transparent)`
    : `color-mix(in srgb, var(--strip-r, var(--color-rubine)) ${15 + t * 85}%, transparent)`;
  return <div className="h-full flex-1" style={{ background: bg }} />;
}
