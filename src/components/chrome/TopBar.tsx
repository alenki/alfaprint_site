'use client';

import { useState } from 'react';
import { Mark, Tick } from '@/components/chrome/Mark';
import { NAV, CONTACTS } from '@/content/site';
import { useNaryad } from '@/state/NaryadContext';
import { waHref } from '@/lib/whatsapp';
import { cn } from '@/lib/cn';

/**
 * ВЕРХНЯЯ ПОЛОСА — 48 px, прижата к верху, не плавает и не скруглена.
 *
 * Перекрашивается вслед за грунтом секции: цвет наследуется от data-ground
 * на :root, а не через mix-blend-mode — тот даёт голубое поверх красного
 * и ломает правило двух красок.
 *
 * Навигация говорит словами покупателя. Внутренние заголовки секций
 * остаются цеховыми, но человеку, которому нужно 500 меню, не надо
 * расшифровывать слово «формы».
 */
export function TopBar() {
  const naryad = useNaryad();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = naryad.items.length;

  return (
    <>
      <header className="topbar sticky top-0 z-60 h-[var(--topbar-h)] w-full border-b border-current/20">
        <div className="trim flex h-full items-center justify-between gap-4">
          {/* Знак */}
          <a href="#pervyi-progon" className="flex shrink-0 items-center gap-2.5" aria-label="Альфа Принт — наверх">
            <Mark className="h-5 w-6" gain={0.35} />
            <span className="t-label hidden sm:block">Альфа Принт</span>
          </a>

          {/* Навигация */}
          <nav aria-label="Разделы сайта" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="t-label link-rule opacity-70 transition-opacity duration-200 hover:opacity-100">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Действия */}
          <div className="flex shrink-0 items-center gap-3">
            {count > 0 && (
              <span className="t-micro naryad-badge hidden items-center gap-1.5 sm:flex">
                <Tick className="h-2.5 w-3 text-[var(--color-rubine)]" strokeWidth={3} />
                В наряде {count}
              </span>
            )}

            <a href={CONTACTS.phoneHref} className="t-label link-rule tel-link whitespace-nowrap">
              {CONTACTS.phone}
            </a>

            <a
              href={waHref(naryad)}
              target="_blank"
              rel="noreferrer"
              className="wa-btn t-label hidden h-8 items-center gap-2 px-3 sm:flex"
            >
              WhatsApp
              <Tick className="h-2.5 w-3 text-[var(--color-rubine)]" strokeWidth={3} />
            </a>

            <button
              type="button"
              className="t-label lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? 'Закрыть' : 'Меню'}
            </button>
          </div>
        </div>
      </header>

      {/* Полноэкранный оверлей на чёрном грунте. Без анимаций сложнее clip-path. */}
      <div
        id="mobile-menu"
        data-ground="ink"
        className={cn(
          'ground-ink fixed inset-0 z-55 flex flex-col justify-center gap-1 px-6 lg:hidden',
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        style={{
          clipPath: menuOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
          transition: 'clip-path 260ms var(--ease-blade)',
        }}
        {...(!menuOpen && { inert: true })}
      >
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className="border-b border-[var(--color-chalk-30)] py-4 text-2xl font-medium text-[var(--color-chalk)]"
          >
            {item.label}
          </a>
        ))}
        <a href={CONTACTS.phoneHref} className="py-4 text-2xl font-medium text-[var(--color-chalk)]">
          {CONTACTS.phone}
        </a>
      </div>
    </>
  );
}
