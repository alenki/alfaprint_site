'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * ЕДИНСТВЕННЫЙ rAF-ЦИКЛ НА ВЕСЬ САЙТ.
 *
 * Пишет четыре переменные в :root — --miss, --progress, --mx/--my — и больше
 * не делает ничего. Ноль слушателей прокрутки на элементах, ноль React-
 * ререндеров при прокрутке: весь уход приводки живёт в CSS.
 *
 * Атака быстрее отпускания: форма срывается резко, а садится медленно —
 * так ведёт себя настоящая машина.
 *
 * При prefers-reduced-motion не запускается ничего: ни цикл, ни Lenis.
 */

export type SectionMeta = { id: string; n: string; title: string; ground: string; gain: number };

export function PlateProvider({ sections }: { sections: SectionMeta[] }) {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(width < 768px)').matches;

    root.dataset.motion = reduced ? 'reduced' : 'full';

    /* ── Грунт и усиление ухода: один IntersectionObserver на секции ──────── */
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));

    let currentGain = 1;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const meta = sections.find((s) => s.id === e.target.id);
          if (!meta) continue;
          root.dataset.ground = meta.ground;
          root.dataset.section = meta.n;
          root.style.setProperty('--gain', String(meta.gain));
          currentGain = meta.gain;
          window.dispatchEvent(new CustomEvent('alfa:section', { detail: meta }));
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));

    if (reduced) {
      root.style.setProperty('--miss', '0');
      root.style.setProperty('--progress', '0');
      window.dispatchEvent(new CustomEvent('alfa:delta', { detail: { mm: 0 } }));
      return () => io.disconnect();
    }

    /* ── Прокрутка ────────────────────────────────────────────────────────── */
    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      syncTouch: false,
    });

    // Якорные ссылки ведёт Lenis, иначе он «догоняет» нативный прыжок.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -48 });
      history.replaceState(null, '', id);
    };
    document.addEventListener('click', onClick);

    const onScrollTo = (e: Event) => {
      const y = (e as CustomEvent<{ y: number }>).detail?.y;
      if (typeof y === 'number') lenis.scrollTo(y);
    };
    window.addEventListener('alfa:scrollto', onScrollTo);

    /* ── Координаты лупы копятся в замыкании, пишутся раз в кадр ─────────── */
    let mx = 0;
    let my = 0;
    let pointerDirty = false;
    const onPointer = (e: PointerEvent) => {
      const host = (e.target as HTMLElement | null)?.closest?.('[data-loupe]');
      if (!host) return;
      const r = (host as HTMLElement).getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      pointerDirty = true;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    /* ── Цикл ─────────────────────────────────────────────────────────────── */
    let s = 0;
    let lastCounter = 0;
    let raf = 0;

    const frame = (t: number) => {
      lenis.raf(t);

      if (!coarse) {
        const v = Math.min(Math.abs(lenis.velocity) / 42, 1);
        // Атака 0.35, отпускание 0.055 — срывается быстрее, чем садится.
        s += (v - s) * (v > s ? 0.35 : 0.055);
        root.style.setProperty('--miss', s.toFixed(4));
      }

      root.style.setProperty('--progress', (lenis.progress || 0).toFixed(4));

      if (pointerDirty) {
        root.style.setProperty('--mx', mx + 'px');
        root.style.setProperty('--my', my + 'px');
        pointerDirty = false;
      }

      // 12 Гц: чаще — и цифры начинают мельтешить.
      if (t - lastCounter > 83) {
        const mm = (0.007 * s * currentGain * 1000) / 3.7795;
        window.dispatchEvent(new CustomEvent('alfa:delta', { detail: { mm } }));
        lastCounter = t;
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', onClick);
      window.removeEventListener('alfa:scrollto', onScrollTo);
      window.removeEventListener('pointermove', onPointer);
      lenis.destroy();
      io.disconnect();
    };
  }, [sections]);

  return null;
}
