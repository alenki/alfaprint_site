'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { trailAway, trailFrame, trailPointer } from '@/lib/trail';

/**
 * ЕДИНСТВЕННЫЙ rAF-ЦИКЛ НА ВЕСЬ САЙТ.
 *
 * Пишет семь переменных в :root: --miss, --progress, --run-p, --mx/--my и
 * --reg-x/--reg-y, и больше не делает ничего. Ноль слушателей прокрутки на
 * элементах, ноль React-ререндеров при прокрутке: весь уход приводки живёт
 * в CSS.
 *
 * НАВОДКА. --reg-x/--reg-y это единичный вектор от приводочного шильда к
 * курсору, где бы тот ни стоял на листе, и ноль, только пока мышь не двигали
 * или увели за край окна. Считается здесь по той же причине, по которой здесь
 * считается фаза ленты: первая строка этого файла. Сам шильд остаётся
 * серверным узлом без единой строки JS: цикл находит его по
 * data-register-mark.
 *
 * Разгон прокрутки на шильд НЕ распространяется: приводка там держится на
 * одном курсоре. --miss правит всеми прочими формами, но не этой.
 *
 * Атака быстрее отпускания: форма срывается резко, а садится медленно,
 * так ведёт себя настоящая машина.
 *
 * ПОДАЧА. --miss это МОДУЛЬ разгона, он одинаков в обе стороны: форма уходит
 * из приводки и вверх, и вниз. Ленте знаков нужен тот же разгон СО ЗНАКОМ, и
 * потому рядом копится --feed: то же число, но помнящее сторону. Из него
 * растёт --run-p, фаза ленты. Считать её здесь, а не в самой ленте, велит
 * первая строка этого файла: цикл на весь сайт один.
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
    /* Полоса стоит, пока цикл не сказал иного. При отказе от движения цикла
       нет вовсе, и метка остаётся на этом значении навсегда: полоса просто
       не уезжает. */
    root.dataset.bar = 'open';

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
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));

    if (reduced) {
      root.style.setProperty('--miss', '0');
      root.style.setProperty('--progress', '0');
      root.style.setProperty('--run-p', '0');
      root.style.setProperty('--reg-x', '0');
      root.style.setProperty('--reg-y', '0');
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
      /* Отступ читается с самой полосы, а не стоит числом. Раньше здесь было
         -48 при полосе в 68, и заголовок раздела приезжал на двадцать
         пикселей ПОД шапку. Высота полосы теперь ещё и складывается из
         вырубки и поля, так что единственный честный источник это токен. */
      const bar =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')
        ) || 72;
      lenis.scrollTo(target as HTMLElement, { offset: -(bar + 8) });
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
    /* Курсор во вьюпорте нужен для наводки шильда. Копится ДО выхода по лупе:
       ниже стоит `return` для всего, что не лупа, и наводке нужны как раз те
       события, которые он отбрасывает. -1 значит «мышь ещё не двигалась»:
       до первого движения шильд стоит в приводке. */
    let px = -1;
    let py = -1;
    const onPointer = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      /* След курсора едет на ЭТОМ слушателе. Своего у него нет: движение
         мыши слушают в одном месте по той же причине, по какой в одном месте
         крутится кадр. Стоит ДО выхода по лупе: линия обязана знать и о тех
         событиях, которые он отбрасывает. */
      trailPointer(e);
      const host = (e.target as HTMLElement | null)?.closest?.('[data-loupe]');
      if (!host) return;
      const r = (host as HTMLElement).getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      pointerDirty = true;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    /* Мышь ушла за край окна: событий больше не будет, и без этого шильд
       остался бы висеть в последнем уходе, так и не сев в приводку. */
    const onPointerLeave = () => {
      px = -1;
      py = -1;
      trailAway();
    };
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);
    /* Вкладку увели в фон: событий тоже больше не будет, а вернуться мышь
       может уже в другой точке. Без этого линия прочертила бы весь лист
       в первом же кадре после возврата. */
    const onHide = () => {
      if (document.hidden) onPointerLeave();
    };
    document.addEventListener('visibilitychange', onHide);

    /* ── Лента знаков: период прогона читается один раз ────────────────────
       Скорость ленты живёт там же, где список знаков, в `--run` на самой
       полосе (N × 3,1 с). Здесь она только считывается, чтобы цикл знал, за
       сколько секунд фаза проходит от 0 до 1. Полосы на странице может не
       быть вовсе: тогда фаза не копится и переменная не пишется. */
    const band = document.querySelector('.marks');
    const runFor = band ? parseFloat(getComputedStyle(band).getPropertyValue('--run')) : NaN;
    const runRate = runFor > 0 ? 1 / runFor : 0;

    /* ── Наводка: границы прибора ──────────────────────────────────────────
       REG_REACH это плечо, на котором вылет доходит до полного. У самого шильда
       точка стоит в приводке, за 320 px уходит на весь --reg-throw, а дальше
       только поворачивается вокруг креста, куда бы курсор ни ушёл: это прибор,
       а не погоня за мышью. REG_LERP один в обе стороны: тот же след и
       читается как посадка обратно. */
    const REG_REACH = 320;
    const REG_LERP = 0.12;

    /* ── ПОЛОСА УХОДИТ ПОД ВЕРХНИЙ РЕЗ ────────────────────────────────────
       Читают вниз, полоса уезжает за рез и отдаёт набору весь формат; ведут
       лист обратно, она возвращается. Своего слушателя прокрутки у неё
       по-прежнему нет: сторону хода знает этот цикл, и всё, что он пишет,
       это одна метка `data-bar` на :root. Ход формы объявлен в CSS.

       BAR_ARM это шапка листа: на первой сотне пикселей полоса стоит, уходить
       ей оттуда некуда. BAR_STEP это ход, который лист обязан пройти ПОСЛЕ
       разворота, прежде чем полоса ему поверит: двенадцать пикселей отсекают
       и дрожь тачпада, и докат Lenis, и не дают полосе мигать покадрово. */
    const BAR_ARM = 100;
    const BAR_STEP = 12;
    let barY = window.scrollY || 0;
    let barPivot = barY;
    let barDir = 0;
    let barGone = false;

    /* ── Цикл ─────────────────────────────────────────────────────────────── */
    let s = 0;
    let feed = 0;
    let phase = 0;
    let lastFrame = 0;
    let lastCounter = 0;
    let raf = 0;
    let markEl: HTMLElement | null = null;
    let rx = 0;
    let ry = 0;
    let regSettled = true;

    const frame = (t: number) => {
      /* Шаг кадра нужен ЛЕНТЕ: фаза это интеграл, и на 144 Гц она обязана
         набегать та же, что на 60. Потолок в 50 мс стоит на возврат из фоновой
         вкладки: там кадра не было секундами, и без него лента телепортируется. */
      const dt = lastFrame ? Math.min((t - lastFrame) / 1000, 0.05) : 0;
      lastFrame = t;

      lenis.raf(t);

      /* Полоса. Разворот запоминается точкой, от которой считается ход, и
         только пройденный ход переключает метку: сторона сама по себе ничего
         не решает, иначе полоса дёргалась бы на каждой смене знака. */
      const y = lenis.scroll;
      const dir = y > barY ? 1 : y < barY ? -1 : barDir;
      if (dir !== barDir) {
        barDir = dir;
        barPivot = barY;
      }
      barY = y;

      let gone = barGone;
      if (y <= BAR_ARM) gone = false;
      else if (dir > 0 && y - barPivot > BAR_STEP) gone = true;
      else if (dir < 0 && barPivot - y > BAR_STEP) gone = false;
      if (gone !== barGone) {
        barGone = gone;
        root.dataset.bar = gone ? 'gone' : 'open';
      }

      /* След курсора считается и рисуется здесь и только здесь. Холста может
         не быть вовсе (палец, отказ от движения, ещё не смонтировано): тогда
         вызов возвращается сразу, ничего не считая и ничего не рисуя.
         Берёт метку кадра, а не его длину: длина линии это отрезок ВРЕМЕНИ
         на записанном пути, и пересчёт кадров ей не нужен. */
      trailFrame(t);

      if (!coarse) {
        const v = Math.min(Math.abs(lenis.velocity) / 42, 1);
        // Атака 0.35, отпускание 0.055: срывается быстрее, чем садится.
        s += (v - s) * (v > s ? 0.35 : 0.055);
        root.style.setProperty('--miss', s.toFixed(4));

        /* Шильд ищется заново, только если его нет в документе: Dopusk ставит
           его после разной строки на телефоне и на столе, и на смене формата
           узел пересоздаётся. На листах без шильда весь блок пропускается. */
        if (!markEl?.isConnected) markEl = document.querySelector('[data-register-mark]');

        if (markEl) {
          let tx = 0;
          let ty = 0;

          if (px >= 0) {
            /* Границ у наводки нет: где бы курсор ни стоял, хоть в подвале,
               точка смотрит на него. Прибор не выключается оттого, что от
               него отвели взгляд.

               Прямоугольник читается каждый кадр намеренно: лист едет под
               неподвижной мышью, и вектор обязан это видеть. */
            const m = markEl.getBoundingClientRect();
            const dx = px - (m.left + m.width / 2);
            const dy = py - (m.top + m.height / 2);
            const d = Math.hypot(dx, dy);
            // Половина пикселя: курсор ровно на кресте, направления нет.
            if (d > 0.5) {
              const k = Math.min(d / REG_REACH, 1) / d;
              tx = dx * k;
              ty = dy * k;
            }
          }

          rx += (tx - rx) * REG_LERP;
          ry += (ty - ry) * REG_LERP;

          /* Село в приводку, писать перестаём. Последний кадр всё же пишем,
             иначе точка замрёт в сотой доле от нуля. */
          const moving = Math.abs(tx - rx) > 1e-4 || Math.abs(ty - ry) > 1e-4;
          if (moving || !regSettled) {
            root.style.setProperty('--reg-x', rx.toFixed(4));
            root.style.setProperty('--reg-y', ry.toFixed(4));
            regSettled = !moving;
          }
        }
      }

      if (runRate) {
        /* Подача со знаком. Тот же разгон, что у --miss, и та же нормировка
           на 42, но без Math.abs: у Lenis velocity положительна, когда лист
           уходит ВВЕРХ, то есть когда читают ВНИЗ.

           Атака здесь срабатывает ещё и на СМЕНЕ СТОРОНЫ (feed * nv < 0):
           по модулю прокрутка в обратную сторону может быть не сильнее
           прежней, но машину при этом реверсируют, и отрабатывать это
           отпусканием в 0,055 значило бы, что лента думает полсекунды.
           Возврат к нулю остаётся медленным: лента накатом садится на
           свой ход, а не тормозит колодкой. */
        const nv = Math.max(-1, Math.min(lenis.velocity / 42, 1));
        const attack = nv !== 0 && (Math.abs(nv) > Math.abs(feed) || feed * nv < 0);
        feed += (nv - feed) * (attack ? 0.35 : 0.055);

        /* Разгон в девять: на спокойном чтении (подача ≈ 0,15) лента идёт
           вдвое с лишним быстрее, на разгоне всемеро. Он же задаёт точку
           разворота: подача -1/9, и ход обнуляется, дальше лента едет назад.
           Это ≈ 4,7 px за кадр вверх, то есть настоящая прокрутка вверх,
           а не дрожание пальца на тачпаде. */
        phase = (phase + runRate * (1 + feed * 9) * dt) % 1;
        if (phase < 0) phase += 1;
        /* Пять знаков, а не четыре, как у --miss: дорожка вдесятеро длиннее
           полосы, и шаг в 1e-4 дал бы на широком экране полпикселя дребезга. */
        root.style.setProperty('--run-p', phase.toFixed(5));
      }

      root.style.setProperty('--progress', (lenis.progress || 0).toFixed(4));

      if (pointerDirty) {
        root.style.setProperty('--mx', mx + 'px');
        root.style.setProperty('--my', my + 'px');
        pointerDirty = false;
      }

      // 12 Гц: чаще, и цифры начинают мельтешить.
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
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('visibilitychange', onHide);
      lenis.destroy();
      io.disconnect();
    };
  }, [sections]);

  return null;
}
