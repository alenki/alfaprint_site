'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(fallback);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** true, когда пользователь просит уменьшить анимацию */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false);
}

/** true для устройств с точным указателем (мышь/трекпад) */
export function useFinePointer() {
  return useMediaQuery('(pointer: fine)', false);
}

/** Клиент смонтирован — для того, что нельзя рендерить на сервере */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
