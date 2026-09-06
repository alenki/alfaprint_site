'use client';

import { useEffect, useState } from 'react';
import { Tick } from '@/components/chrome/Mark';
import { CONTACTS } from '@/content/site';
import { useNaryad } from '@/state/NaryadContext';
import { waHref } from '@/lib/whatsapp';

/**
 * ЕДИНСТВЕННАЯ ГАРАНТИРОВАННАЯ ТОЧКА КОНВЕРСИИ НА ТЕЛЕФОНЕ.
 *
 * Трафик «Альфы» это сорок тысяч подписчиков, которые открывают ссылку из шапки
 * инстаграма с телефона. Поэтому кнопка появляется на 8 % прокрутки и больше
 * не исчезает, кроме секции «В печать», где она дублировала бы саму себя.
 */
export function MobileCta() {
  const naryad = useNaryad();
  const [shown, setShown] = useState(false);
  const [inOrder, setInOrder] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setShown(max > 0 && window.scrollY / max > 0.08);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const order = document.getElementById('v-pechat');
    let io: IntersectionObserver | undefined;
    if (order) {
      io = new IntersectionObserver(([e]) => setInOrder(e.isIntersecting), { threshold: 0.12 });
      io.observe(order);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);

  const visible = shown && !inOrder;
  const count = naryad.items.length;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-58 flex h-[var(--mobilecta-h)] md:hidden"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 260ms var(--ease-land)',
      }}
      aria-hidden={!visible}
    >
      <a
        href={waHref(naryad)}
        target="_blank"
        rel="noreferrer"
        className="t-micro flex flex-[1.6] items-center justify-center gap-2 whitespace-nowrap bg-[var(--color-ink)] px-2 text-[var(--color-chalk)]"
        tabIndex={visible ? 0 : -1}
      >
        WhatsApp{count > 0 ? ` · ${count}` : ''}
        <Tick className="h-2.5 w-3 text-[var(--color-rubine)]" strokeWidth={3} />
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
