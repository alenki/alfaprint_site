'use client';

import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Registration } from '@/components/ui/Registration';
import { Justified } from '@/components/ui/Justified';
import { RegistrationMark, SheetCorners } from '@/components/ui/PrintMarks';
import { MATERIALS, CONTACTS } from '@/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';

/* ═══════════════════════════════════════════════════════════════════════════
   ПОЛОСА ШЕСТАЯ — МАТЕРИАЛЫ

   Единственный вопрос, который клиент задаёт на самом деле: «а на моём
   напечатаете?». Ответ — выкраска. В типографии её показывают на ощупь;
   здесь фотографии нет ни одной, поэтому каждый материал нарисован кодом:
   градиент вместо съёмки, повтор вместо текстуры. Ограничение и есть
   содержание — так же печатник получает дерево из четырёх красок.

   Рисунок отделён от данных: MATERIALS живёт в site.ts и ничего не знает
   про CSS, SWATCHES — набор стилевых объектов, подписанных латинским
   именем материала. Добавили материал в данные — здесь появится выкраска.

   Под курсором фактура доводится до резкости: лицо чуть увеличивается
   от нижней кромки, поверх проступает второй, более контрастный слой
   того же рисунка. Только transform и opacity, ни одного filter.
   ═══════════════════════════════════════════════════════════════════════════ */

type Swatch = {
  /** Лицо материала — то, что видно в покое */
  face: CSSProperties;
  /** Тот же рисунок, набранный жёстче. Проступает под курсором */
  grain: CSSProperties;
};

/* Ключ — поле latin из site.ts. Ни одного изображения: только фон,
   повторяющиеся градиенты и внутренние тени без размытия. */
const SWATCHES: Record<string, Swatch> = {
  // Бумага: тёплое неглянцевое поле и волокно в двух направлениях
  Paper: {
    face: {
      backgroundColor: '#f2ede3',
      backgroundImage: [
        'repeating-linear-gradient(92deg, rgba(22,18,15,0.030) 0 1px, transparent 1px 3px)',
        'repeating-linear-gradient(4deg, rgba(22,18,15,0.022) 0 1px, transparent 1px 5px)',
      ].join(','),
    },
    grain: {
      backgroundImage: [
        'repeating-linear-gradient(92deg, rgba(22,18,15,0.058) 0 1px, transparent 1px 3px)',
        'repeating-linear-gradient(4deg, rgba(22,18,15,0.046) 0 1px, transparent 1px 5px)',
        'radial-gradient(circle at 28% 22%, rgba(22,18,15,0.05), transparent 62%)',
      ].join(','),
    },
  },

  // Картон: крафт, по нижней кромке — рифлёный срез гофры
  Board: {
    face: {
      backgroundColor: '#c49a69',
      backgroundImage: [
        'repeating-linear-gradient(90deg, #8b5f33 0 1px, #dcb689 1px 4px, #a8794a 4px 6px, #cba277 6px 9px)',
        'repeating-linear-gradient(102deg, rgba(90,58,28,0.10) 0 1px, transparent 1px 6px)',
        'linear-gradient(168deg, #cda274, #b98a5b)',
      ].join(','),
      backgroundSize: '100% 11px, 100% 100%, 100% 100%',
      backgroundPosition: 'left bottom, left top, left top',
      backgroundRepeat: 'repeat-x, repeat, no-repeat',
    },
    grain: {
      // Лицо крафта — не полосатое. Полоса живёт только на срезе гофры
      // по нижней кромке; сверху идёт лишь крапина волокна.
      backgroundImage:
        'repeating-linear-gradient(27deg, rgba(74,44,16,0.09) 0 1px, transparent 1px 3px)',
    },
  },

  // Оргстекло: слоистая прозрачность, один жёсткий блик,
  // нижний торец — светлее лица, как настоящий рез
  Acrylic: {
    face: {
      backgroundColor: 'rgba(224,235,233,0.62)',
      backgroundImage: [
        'linear-gradient(118deg, rgba(255,255,255,0) 0 41%, rgba(255,255,255,0.94) 41% 43.4%, rgba(255,255,255,0) 43.4%)',
        'linear-gradient(118deg, rgba(255,255,255,0.52) 0 21%, rgba(255,255,255,0.06) 21% 68%, rgba(196,216,214,0.5) 68%)',
        'linear-gradient(180deg, rgba(255,255,255,0.32), rgba(160,190,187,0.30))',
      ].join(','),
      boxShadow:
        'inset 0 -7px 0 rgba(255,255,255,0.62), inset 0 -8px 0 rgba(108,140,138,0.34)',
    },
    grain: {
      backgroundImage: [
        'linear-gradient(118deg, rgba(255,255,255,0) 0 57%, rgba(255,255,255,0.7) 57% 58.4%, rgba(255,255,255,0) 58.4%)',
        'linear-gradient(118deg, rgba(255,255,255,0) 0 41%, rgba(255,255,255,0.55) 41% 43.4%, rgba(255,255,255,0) 43.4%)',
      ].join(','),
    },
  },

  // Дерево: волокно идёт вдоль доски, а не поперёк, поэтому штрих здесь
  // почти горизонтальный. Три слоя с разным шагом сбивают регулярность,
  // два вытянутых пятна работают сучками — без них любой градиент
  // читается тканью, а не срезом.
  Wood: {
    face: {
      backgroundColor: '#a9784a',
      backgroundImage: [
        'radial-gradient(ellipse 26px 9px at 32% 38%, rgba(58,30,10,0.5) 0 40%, rgba(58,30,10,0) 72%)',
        'radial-gradient(ellipse 34px 11px at 74% 71%, rgba(58,30,10,0.38) 0 38%, rgba(58,30,10,0) 74%)',
        'repeating-linear-gradient(3deg, rgba(66,36,12,0.32) 0 1px, rgba(66,36,12,0) 1px 6px, rgba(66,36,12,0.14) 6px 8px, rgba(66,36,12,0) 8px 17px)',
        'repeating-linear-gradient(179deg, rgba(255,224,182,0.22) 0 2px, rgba(255,224,182,0) 2px 11px)',
        'repeating-linear-gradient(2deg, rgba(48,24,8,0.16) 0 1px, rgba(48,24,8,0) 1px 29px)',
        'linear-gradient(100deg, #b8834f, #94643a)',
      ].join(','),
    },
    grain: {
      backgroundImage:
        'repeating-linear-gradient(3deg, rgba(52,28,10,0.24) 0 1px, transparent 1px 9px)',
    },
  },

  // Фанера: берёза и три тонкие полосы шпона по нижнему торцу
  Plywood: {
    face: {
      backgroundColor: '#e2c69b',
      backgroundImage: [
        'linear-gradient(180deg, #c9a675 0 1px, #f2e0bd 1px 4px, #b98f5c 4px 5px, #ecd5ad 5px 8px, #c09769 8px 9px, #e8d0a6 9px 12px)',
        'repeating-linear-gradient(88deg, rgba(140,98,52,0.16) 0 1px, transparent 1px 7px)',
        'linear-gradient(96deg, #ead0a5, #d8b98c)',
      ].join(','),
      backgroundSize: '100% 12px, 100% 100%, 100% 100%',
      backgroundPosition: 'left bottom, left top, left top',
      backgroundRepeat: 'repeat-x, repeat, no-repeat',
    },
    grain: {
      backgroundImage:
        'repeating-linear-gradient(88deg, rgba(120,80,38,0.24) 0 1px, transparent 1px 6px)',
    },
  },

  // Ткань: два встречных повтора 45°/135° — переплёт нити
  Fabric: {
    face: {
      backgroundColor: '#cec8b8',
      backgroundImage: [
        'repeating-linear-gradient(45deg, rgba(22,18,15,0.13) 0 1px, transparent 1px 4px)',
        'repeating-linear-gradient(135deg, rgba(22,18,15,0.11) 0 1px, transparent 1px 4px)',
        'linear-gradient(0deg, #d6d0c1, #c7c0af)',
      ].join(','),
    },
    grain: {
      backgroundImage: [
        'repeating-linear-gradient(45deg, rgba(22,18,15,0.16) 0 1px, transparent 1px 4px)',
        'repeating-linear-gradient(135deg, rgba(22,18,15,0.14) 0 1px, transparent 1px 4px)',
      ].join(','),
    },
  },

  // Одежда: тот же переплёт, темнее, плюс вертикальный рубчик трикотажа
  Apparel: {
    face: {
      backgroundColor: '#5b574d',
      backgroundImage: [
        'repeating-linear-gradient(90deg, rgba(255,250,240,0.055) 0 1px, transparent 1px 5px)',
        'repeating-linear-gradient(45deg, rgba(0,0,0,0.20) 0 1px, transparent 1px 4px)',
        'repeating-linear-gradient(135deg, rgba(0,0,0,0.17) 0 1px, transparent 1px 4px)',
        'linear-gradient(160deg, rgba(102,98,87,0), #2e2b25)',
      ].join(','),
    },
    grain: {
      backgroundImage: [
        'repeating-linear-gradient(45deg, rgba(0,0,0,0.24) 0 1px, transparent 1px 4px)',
        'repeating-linear-gradient(90deg, rgba(255,250,240,0.08) 0 1px, transparent 1px 5px)',
      ].join(','),
    },
  },

  // Холст: переплёт крупнее и грубее, тон тёплый небелёный
  Canvas: {
    face: {
      backgroundColor: '#e0d5bd',
      backgroundImage: [
        'repeating-linear-gradient(45deg, rgba(96,72,40,0.20) 0 2px, transparent 2px 7px)',
        'repeating-linear-gradient(135deg, rgba(96,72,40,0.17) 0 2px, transparent 2px 7px)',
        'linear-gradient(0deg, #e6dcc5, #d7cbb1)',
      ].join(','),
    },
    grain: {
      backgroundImage: [
        'repeating-linear-gradient(45deg, rgba(96,72,40,0.26) 0 2px, transparent 2px 7px)',
        'repeating-linear-gradient(135deg, rgba(96,72,40,0.22) 0 2px, transparent 2px 7px)',
      ].join(','),
    },
  },

  // Плёнка: плотная заливка и косой глянцевый блик
  Vinyl: {
    face: {
      backgroundColor: '#14181a',
      backgroundImage: [
        'linear-gradient(112deg, rgba(255,255,255,0) 0 28%, rgba(255,255,255,0.26) 34%, rgba(255,255,255,0.05) 41% 45%, rgba(255,255,255,0) 53%)',
        'linear-gradient(160deg, #242a2d, #0f1213)',
      ].join(','),
    },
    grain: {
      backgroundImage:
        'linear-gradient(112deg, rgba(255,255,255,0) 0 28%, rgba(255,255,255,0.34) 33%, rgba(255,255,255,0) 39%, rgba(255,255,255,0.12) 62% 64%, rgba(255,255,255,0) 70%)',
    },
  },

  // Металл: шлифовка — многоступенчатый градиент плюс частая штриховка
  Metal: {
    face: {
      backgroundColor: '#a4a9ac',
      backgroundImage: [
        'repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 1px, rgba(28,30,32,0.10) 1px 2px, transparent 2px 3px)',
        'linear-gradient(100deg, #8d9195 0 8%, #c4c8cb 16%, #989ea2 26%, #d7dadb 38%, #888e92 50%, #b7bbbe 62%, #80868a 74%, #c7cbcd 86%, #8f9499 100%)',
      ].join(','),
    },
    grain: {
      backgroundImage:
        'repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 1px, rgba(28,30,32,0.16) 1px 2px, transparent 2px 3px)',
    },
  },

  // Шоколад: тёмное какао, плитка разбита на дольки, кромка вдавлена
  // двумя внутренними тенями по 1px — без единого размытия
  Chocolate: {
    face: {
      backgroundColor: '#3a2318',
      backgroundImage: [
        'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0 1px, rgba(255,232,200,0.10) 1px 2px, transparent 2px 30px)',
        'repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0 1px, rgba(255,232,200,0.09) 1px 2px, transparent 2px 30px)',
        'linear-gradient(140deg, #4d3020, #291710)',
      ].join(','),
      boxShadow:
        'inset 0 1px 0 rgba(255,236,208,0.16), inset 0 -1px 0 rgba(0,0,0,0.55)',
    },
    grain: {
      backgroundImage:
        'linear-gradient(122deg, rgba(255,226,190,0.10) 0 26%, rgba(255,226,190,0) 34%)',
    },
  },
};

const HEADLINE = ['Печатаем прямо', 'по материалу'];
const SR_HEADLINE = 'Печатаем прямо по материалу';

/* Примечание к материалу на точном указателе спрятано и проявляется под
   курсором; на пальце наводить нечем — там оно видно всегда. Порядок
   классов важен: сначала состояние покоя, следом наведённое. */
const NOTE_REVEAL =
  'opacity-100 translate-y-0 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  '[@media(pointer:fine)]:translate-y-1 [@media(pointer:fine)]:opacity-0 ' +
  '[@media(pointer:fine)]:group-hover:translate-y-0 [@media(pointer:fine)]:group-hover:opacity-100';

export function Materials() {
  const reduced = usePrefersReducedMotion();

  // Шоколад не стоит в общем ряду: он закрывает секцию отдельным блоком
  const grid = MATERIALS.filter((m) => m.latin !== 'Chocolate');
  const chocolate = MATERIALS.find((m) => m.latin === 'Chocolate');

  return (
    <section
      id="materialy"
      aria-labelledby="materialy-title"
      className="relative px-gutter py-section"
    >
      <SheetCorners />

      {/* ── Служебная строка полосы ──────────────────────────────────────── */}
      <div className="t-meta flex items-baseline justify-between gap-6 border-b border-ink-16 pb-5 text-ink-48">
        <span>
          Полоса 06<span className="hidden sm:inline"> · Материалы</span>
        </span>
        <span className="tab-nums text-right">{MATERIALS.length} позиций</span>
      </div>

      {/* ── Заголовок и лид ──────────────────────────────────────────────── */}
      <div className="mt-9 grid grid-cols-1 items-end gap-x-8 gap-y-7 md:mt-12 md:grid-cols-12">
        <h2
          id="materialy-title"
          className="t-display text-[clamp(2.1rem,7.4vw,6.4rem)] md:col-span-7 lg:col-span-8"
        >
          <Justified
            lines={HEADLINE}
            srText={SR_HEADLINE}
            opsz={144}
            weight={900}
            renderLine={(line, i) => (
              <Registration
                offset={reduced ? 0 : 8}
                delay={i * 0.1}
                duration={1.05}
                className="block"
              >
                {line}
              </Registration>
            )}
          />
        </h2>

        <p className="t-lead text-ink-72 md:col-span-5 lg:col-span-4">
          Не наклейка сверху — оттиск в самом материале. УФ-печать ложится на
          акрил, дерево, фанеру, ткань и одежду; лазер режет и жжёт; гравировка
          снимает слой.
        </p>
      </div>

      {/* ── Выкраски ─────────────────────────────────────────────────────── */}
      <ul className="mt-12 grid grid-cols-2 border-l border-t border-ink-16 md:mt-16 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {grid.map((m, i) => {
          const s = SWATCHES[m.latin] ?? SWATCHES.Paper;
          return (
            <motion.li
              key={m.latin}
              className="group relative border-b border-r border-ink-16 p-3.5 md:p-5"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px -8% 0px' }}
              transition={{
                duration: 0.7,
                delay: (i % 5) * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {/* Сама выкраска: лицо и слой резкости, оба декоративные */}
              <div className="relative aspect-[5/4] overflow-hidden border border-ink-16">
                <div
                  aria-hidden
                  className="absolute inset-0 origin-bottom transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  style={s.face}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:opacity-100"
                    style={s.grain}
                  />
                </div>
              </div>

              <div className="mt-3.5 flex items-baseline justify-between gap-2">
                <h3 className="text-[1.0625rem] font-medium leading-tight">
                  {m.name}
                </h3>
                <span className="t-meta shrink-0 text-ink-32">{m.latin}</span>
              </div>

              <p className="t-meta mt-2 text-ink-48">{m.method}</p>

              <p className={`text-micro mt-2 text-ink-72 ${NOTE_REVEAL}`}>
                {m.note}
              </p>
            </motion.li>
          );
        })}
      </ul>

      {/* ── Одиннадцатый материал ────────────────────────────────────────────
          Единственный блок на полосе, вырезанный из листа, — потому и
          единственная тень. Шоколад стоит отдельно не ради шутки: он
          показывает край диапазона. */}
      {chocolate && (
        <motion.div
          className="is-cut mt-12 grid grid-cols-1 border border-ink-16 bg-paper-2 md:mt-16 md:grid-cols-12"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            aria-hidden
            className="min-h-[11rem] w-full md:col-span-5 md:min-h-[15rem] lg:col-span-4"
            style={SWATCHES.Chocolate.face}
          />

          <div className="flex flex-col gap-5 border-t border-ink-16 p-6 md:col-span-7 md:border-l md:border-t-0 md:p-8 lg:col-span-8">
            <div className="t-meta flex flex-wrap items-center gap-2.5 text-ink-48">
              <RegistrationMark
                size={13}
                strokeWidth={1}
                className="shrink-0 text-rubine"
              />
              <span>Одиннадцатый материал</span>
              <span className="text-ink-32">·</span>
              <span>{chocolate.method}</span>
            </div>

            <h3 className="t-didone text-[clamp(1.75rem,3.6vw,3rem)]">
              {chocolate.name}
            </h3>

            <p className="t-body">
              {chocolate.note}: логотип печатается пищевыми чернилами прямо по
              плитке. Здесь он стоит последним, потому что показывает границу —
              краску принимает почти всё, вопрос в машине и в оснастке.
            </p>

            <a
              href={CONTACTS.telegram}
              target="_blank"
              rel="noreferrer"
              data-cursor="Telegram"
              className="t-meta self-start"
            >
              <span className="underline-ink pb-px">
                Спросить про свой материал
              </span>
            </a>
          </div>
        </motion.div>
      )}
    </section>
  );
}
