'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { RegistrationMark } from '@/components/ui/PrintMarks';
import { COMPANY, CONTACTS } from '@/content/site';
import { cn } from '@/lib/cn';

/* ═══════════════════════════════════════════════════════════════════════════
   ШАПКА

   Логотип — не картинка, а набор: «АЛЬФА», крест приводки, «ПРИНТ».
   Кегль мелкий, поэтому оптическая ось стоит на 14, а не на 144, как
   в заголовке. Одна гарнитура, честно настроенная под каждый кегль.

   Пункты меню пока ведут на разделы главной: остальные страницы ещё не
   собраны. Когда появятся — сюда придут маршруты, разметка не изменится.
   ═══════════════════════════════════════════════════════════════════════════ */

const LINKS = [
  { label: 'Производство', href: '#proizvodstvo' },
  { label: 'Форматы', href: '#formaty' },
  { label: 'Оттиск', href: '#ottisk' },
  { label: 'Материалы', href: '#materialy' },
  { label: 'Работы', href: '#raboty' },
  { label: 'Контакты', href: '#kontakty' },
];

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-flex items-baseline gap-[0.34em]', className)}
      style={{
        fontFamily: 'var(--font-display)',
        fontVariationSettings: "'opsz' 14, 'wdth' 88, 'GRAD' 0",
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}
    >
      АЛЬФА
      <span className="relative -mb-[0.06em] inline-block">
        <RegistrationMark size={11} strokeWidth={1.1} className="translate-y-[0.1em]" />
      </span>
      ПРИНТ
    </span>
  );
}

/**
 * Над какой землёй сейчас висит шапка.
 *
 * Наблюдаем не всю секцию, а тонкую полосу высотой в шапку у самого верха
 * окна: rootMargin отрезает всё, что ниже. Пересёк полосу тёмный «Оттиск»
 * или подвал — шапка печатается мелом по цеху, иначе краской по бумаге.
 * IntersectionObserver, а не обработчик прокрутки: ни одного замера на кадр.
 */
function useDarkGround(barHeight = 68) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const marks = document.querySelectorAll('[data-ground="dark"]');
    if (!marks.length) return;

    const crossing = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) crossing.add(e.target);
          else crossing.delete(e.target);
        }
        setDark(crossing.size > 0);
      },
      { rootMargin: `0px 0px -${Math.max(0, window.innerHeight - barHeight)}px 0px` },
    );

    marks.forEach((m) => io.observe(m));
    return () => io.disconnect();
  }, [barHeight]);

  return dark;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const dark = useDarkGround();

  useMotionValueEvent(scrollY, 'change', (v) => {
    const next = v > 40;
    if (next !== scrolled) setScrolled(next);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('no-scroll', open);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color,backdrop-filter] duration-500',
          dark && !open ? 'text-chalk' : 'text-ink',
          scrolled && dark && !open && 'border-b border-chalk-24 bg-press/88 backdrop-blur-[10px]',
          scrolled && !(dark && !open) && 'border-b border-ink-16 bg-paper/88 backdrop-blur-[10px]',
          !scrolled && 'border-b border-transparent',
        )}
      >
        <div className="flex items-center justify-between px-gutter py-4 md:py-5">
          <a
            href="#top"
            aria-label={`${COMPANY.name} — на главную`}
            className="text-[0.9375rem] leading-none md:text-base"
          >
            <Wordmark />
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Основная навигация">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="group relative">
                <span className="t-meta underline-ink pb-[2px]">{l.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={CONTACTS.phoneHref}
              className="t-meta hidden tab-nums md:block"
              data-cursor="Позвонить"
            >
              {COMPANY.city.toUpperCase()} · {CONTACTS.phone}
            </a>

            <a
              href="#naryad"
              className={cn(
                't-meta group relative hidden overflow-hidden rounded-full px-5 py-[0.6rem] transition-colors duration-500 sm:block',
                dark && !open ? 'border border-chalk-24' : 'border border-ink',
              )}
              data-cursor="Собрать"
            >
              <span
                className={cn(
                  'relative z-10 transition-colors duration-400',
                  dark && !open ? 'group-hover:text-press' : 'group-hover:text-paper',
                )}
              >
                Собрать наряд
              </span>
              <span
                className={cn(
                  'absolute inset-0 z-0 origin-bottom scale-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100',
                  dark && !open ? 'bg-chalk' : 'bg-ink',
                )}
              />
            </a>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="t-meta relative z-[70] flex items-center gap-2 lg:hidden"
              aria-expanded={open}
              aria-controls="menu-overlay"
            >
              <span className="grid h-[14px] w-4 place-items-center">
                <span
                  className={cn(
                    'absolute h-px w-4 bg-current transition-transform duration-400',
                    open ? 'rotate-45' : '-translate-y-[3px]',
                  )}
                />
                <span
                  className={cn(
                    'absolute h-px w-4 bg-current transition-transform duration-400',
                    open ? '-rotate-45' : 'translate-y-[3px]',
                  )}
                />
              </span>
              {open ? 'Закрыть' : 'Меню'}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-overlay"
            className="fixed inset-0 z-[60] flex flex-col justify-between bg-paper px-gutter pb-10 pt-24"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.62, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav className="flex flex-col gap-1" aria-label="Меню">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="t-display text-[13vw] leading-[0.94] sm:text-[9vw]"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1 + i * 0.045,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>

            <div className="t-meta flex flex-wrap items-end justify-between gap-4">
              <a href={CONTACTS.phoneHref} className="tab-nums">
                {CONTACTS.phone}
              </a>
              <div className="flex gap-4">
                <a href={CONTACTS.telegram}>Telegram</a>
                <a href={CONTACTS.whatsapp}>WhatsApp</a>
                <a href={CONTACTS.instagram}>Instagram</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
