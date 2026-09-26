'use client';

import { useEffect, useState } from 'react';
import { CONTACTS } from '@/content/site';
import { useNaryad } from '@/state/NaryadContext';
import { waHref } from '@/lib/whatsapp';

/**
 * ЕДИНСТВЕННАЯ ГАРАНТИРОВАННАЯ ТОЧКА КОНВЕРСИИ НА ТЕЛЕФОНЕ.
 *
 * На телефоне шапка не несёт ни номера, ни мессенджера, поэтому кнопка
 * появляется на 8 % прокрутки и больше не исчезает нигде: полоса «В печать»,
 * единственное место, где она дублировала бы саму себя, с листа снята.
 *
 * Плашка WhatsApp залита тёмно-синим агентства (`--color-deep`), мел на нём
 * читается с запасом (11,10:1). Номер чата берётся из справочника, см.
 * `lib/whatsapp.ts`.
 */
export function MobileCta() {
  const naryad = useNaryad();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setVisible(max > 0 && window.scrollY / max > 0.08);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const count = naryad.items.length;

  return (
    <div
      className="mobilecta fixed inset-x-0 bottom-0 z-58 flex h-[var(--mobilecta-h)] md:hidden"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 260ms var(--ease-land), opacity 200ms var(--ease-ink)',
      }}
      aria-hidden={!visible}
    >
      <a
        href={waHref(naryad)}
        target="_blank"
        rel="noreferrer"
        className="t-micro flex flex-[1.6] items-center justify-center whitespace-nowrap bg-[var(--color-deep,var(--color-ink))] px-2 text-[var(--color-chalk)]"
        tabIndex={visible ? 0 : -1}
      >
        WhatsApp{count > 0 ? ` · ${count}` : ''}
      </a>
      <a
        href={CONTACTS.phoneHref}
        className="t-micro flex flex-1 items-center justify-center whitespace-nowrap border border-[var(--color-ink)] bg-[var(--color-paper)] px-2 text-[var(--color-ink)]"
        tabIndex={visible ? 0 : -1}
      >
        Позвонить
      </a>
    </div>
  );
}
