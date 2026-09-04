'use client';

import { useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { Justified } from '@/components/ui/Justified';
import { ControlStrip, RegistrationMark } from '@/components/ui/PrintMarks';
import { sushka } from '@/components/ui/Sushka';
import { COMPANY, CONTACTS } from '@/content/site';
import { usePrefersReducedMotion } from '@/lib/hooks';

/* ═══════════════════════════════════════════════════════════════════════════
   ПОДВАЛ · КОЛОФОН

   ЗЕМЛЯ: цех, не бумага. Секция «Контакты» над нами стоит на листе, и если
   подвал тоже оставить на бумаге, страница просто кончится. Здесь свет
   в зале гасят, а машина остаётся работать: bg-press, текст мелом. Тёмная
   инверсия уже была в «Оттиске» — подвал её замыкает, и лист закрывается
   тем же цветом, каким его печатали.

   Колофон — последняя страница книги: чем набрано, на чём, кем. Почти ни
   один сайт его не ставит, а для типографии это единственно верная концовка.

   Знак «АЛЬФА ПРИНТ» лежит на нижней кромке и обрезан ею. Формы разведены
   на 2 пикселя и не сходятся никогда — во всём остальном на сайте приводка
   защёлкивается под взглядом, здесь нет. Одна строка под знаком объясняет
   почему, и в ней весь смысл этого подвала.

   Разведение здесь не движение, а печатный дефект: оно остаётся и в покое
   (prefers-reduced-motion), потому что покой убирает анимацию, а не брак
   приводки.
   ═══════════════════════════════════════════════════════════════════════════ */

const LINKS = [
  { label: 'Производство', href: '#proizvodstvo' },
  { label: 'Форматы', href: '#formaty' },
  { label: 'Оттиск', href: '#ottisk' },
  { label: 'Материалы', href: '#materialy' },
  { label: 'Работы', href: '#raboty' },
  { label: 'Контакты', href: '#kontakty' },
];

/** Имя аккаунта — из самой ссылки: второго источника правды быть не должно. */
function handleOf(url: string) {
  return url.replace(/\/+$/, '').split('/').pop() ?? '';
}

const SOCIAL = [
  { label: 'Telegram', note: CONTACTS.telegramHandle, href: CONTACTS.telegram },
  { label: 'WhatsApp', note: 'ответим в рабочие часы', href: CONTACTS.whatsapp },
  { label: 'ВКонтакте', note: handleOf(CONTACTS.vk), href: CONTACTS.vk },
  { label: 'Instagram', note: handleOf(CONTACTS.instagram), href: CONTACTS.instagram },
];

/* Разведение форм в подвале. Два пикселя — ровно столько, сколько печатник
   ловит на глаз и не прощает. */
const SLIP = 2;

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-10% 0px 0px 0px' });
  const [copied, setCopied] = useState(false);

  const shown = reduced || inView;

  const copyPhone = async (e: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(CONTACTS.phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
      sushka(e, 'Номер скопирован');
    } catch {
      /* буфер закрыт политикой браузера — рядом живая ссылка tel: */
    }
  };

  return (
    <footer
      ref={ref}
      id="podval"
      className="relative overflow-hidden bg-press text-chalk"
     data-ground="dark">
      <div className="px-gutter pt-16 md:pt-24">
        {/* ── Служебная строка: выходные данные листа ─────────────────────── */}
        <div className="t-meta flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-chalk-56">
          <span>Колофон · оборот последней полосы</span>
          <span className="tab-nums">
            {COMPANY.city}, {COMPANY.address}
            <span className="hidden sm:inline">
              {' '}
              · {COMPANY.coords.lat.toFixed(4)} N&nbsp;&nbsp;
              {COMPANY.coords.lng.toFixed(4)} E
            </span>
          </span>
        </div>

        {/* ── Три колонки: набор, разделы, связь ──────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 border-t border-chalk-24 pt-10 md:mt-14 md:grid-cols-12 md:pt-12">
          {/* Колофон. Моноширинный, но не прописными: кириллица длинной
              строкой прописных нечитаема — .t-meta остаётся для ярлыков. */}
          <section className="order-3 md:order-none md:col-span-5">
            <h2 className="t-meta mb-5 text-chalk-56">Набрано</h2>
            <p className="max-w-[46ch] font-mono text-micro leading-[1.75] text-chalk-56">
              Roboto Serif — оси opsz, wdth и GRAD; Geologica — ось SHRP;
              Geist&nbsp;Mono.
              <br />
              Строки заголовков выключены в формат по оси ширины, а не шпациями.
              <br />
              Кириллица во всех трёх гарнитурах.
            </p>
          </section>

          {/* Зеркало шапки: те же шесть якорей, тот же порядок */}
          <nav
            aria-label="Разделы страницы"
            className="order-1 md:order-none md:col-span-3"
          >
            <h2 className="t-meta mb-5 text-chalk-56">Разделы</h2>
            <ul className="flex flex-col gap-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} data-cursor="Перейти" className="group relative inline-block">
                    <span className="t-meta">{l.label}</span>
                    {/* Подчёркивание строим здесь, а не .underline-ink:
                        та краска чёрная и на цехе её не видно. Только transform. */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-chalk transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Связь */}
          <section className="order-2 md:order-none md:col-span-4">
            <h2 className="t-meta mb-5 text-chalk-56">Связь</h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={CONTACTS.phoneHref}
                data-cursor="Позвонить"
                className="t-num text-[clamp(1.35rem,3.4vw,1.75rem)] leading-none"
              >
                {CONTACTS.phone}
              </a>
              <button
                type="button"
                onClick={copyPhone}
                data-cursor="Скопировать"
                className="t-meta rounded-full border border-chalk-24 px-4 py-2 text-chalk-56 transition-colors duration-500 hover:border-chalk hover:text-chalk"
              >
                {copied ? 'Скопировано' : 'Скопировать'}
              </button>
            </div>

            <ul className="mt-7 flex flex-col gap-2.5">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="Открыть"
                    className="group flex items-baseline gap-3"
                  >
                    <span className="t-meta">{s.label}</span>
                    <span
                      aria-hidden
                      className="h-px flex-1 origin-left bg-chalk-24 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-[3]"
                    />
                    <span className="t-meta text-chalk-56">{s.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Выходные данные и контрольная шкала ─────────────────────────── */}
        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-8 border-t border-chalk-24 pt-6 md:mt-20 md:flex-row md:items-end">
          <p className="t-meta flex flex-wrap items-center gap-x-3 gap-y-1.5 text-chalk-56">
            <span>{COMPANY.legal}</span>
            <span className="text-chalk-24">·</span>
            <span className="tab-nums">ОГРНИП {COMPANY.ogrnip}</span>
            <span className="text-chalk-24">·</span>
            <span className="tab-nums">ИНН {COMPANY.inn}</span>
            <span className="text-chalk-24">·</span>
            <span className="tab-nums">© {COMPANY.since}—2026</span>
          </p>

          {/* Шкала печатается на бумаге, значит под ней нужен лист */}
          <div className="shrink-0 bg-paper px-2.5 pb-5 pt-2.5 text-ink">
            <ControlStrip showLabels patch={14} />
          </div>
        </div>
      </div>

      {/* ── Знак на кромке ──────────────────────────────────────────────────
          Обрезан нижним краем: строка сидит на 0,14 em ниже фолда, поэтому
          у литер срезаны подошвы. Лист кончился, знак — нет. */}
      <div className="relative mt-12 overflow-hidden px-gutter md:mt-16">
        <p className="t-meta mb-5 flex items-center gap-2.5 text-chalk-56">
          <RegistrationMark size={12} strokeWidth={1} className="shrink-0 text-rubine" />
          Знак в подвале намеренно не сведён: цех не закрыт.
        </p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: '9%' }}
          animate={shown ? { opacity: 1, y: '0%' } : undefined}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Justified
            lines={['АЛЬФА ПРИНТ']}
            srText={COMPANY.name}
            opsz={144}
            weight={900}
            className="t-display -mb-[0.14em] select-none text-[16.5vw]"
            lineClassName="leading-[0.72]"
            renderLine={(line) => <Misregistered>{line}</Misregistered>}
          />
        </motion.div>
      </div>
    </footer>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   НЕСВЕДЁННЫЙ ЗНАК
   Устройство то же, что в Registration: голубая и пурпурная формы позади,
   чёрная — сверху. Отличий два. Формы никуда не едут: разведение постоянное.
   И блендинг здесь screen, а не multiply: на цехе краска не отнимает свет,
   а прибавляет — иначе на #100d0b обе формы просто исчезнут.
   ───────────────────────────────────────────────────────────────────────── */

function Misregistered({ children }: { children: ReactNode }) {
  const plate = (color: string, dx: number, dy: number) => (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
      style={{
        color,
        mixBlendMode: 'screen',
        transform: `translate3d(${dx}px, ${dy}px, 0)`,
      }}
    >
      {children}
    </span>
  );

  return (
    <span className="relative isolate inline-block">
      {plate('var(--color-proc-c)', -SLIP, SLIP * 0.42)}
      {plate('var(--color-proc-m)', SLIP * 0.86, -SLIP * 0.3)}
      <span className="relative">{children}</span>
    </span>
  );
}
