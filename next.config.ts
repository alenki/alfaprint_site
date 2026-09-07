import type { NextConfig } from 'next';

/**
 * ПЛОЩАДКА: lumako.ru/alfaprint.
 *
 * Сайт лежит НЕ в корне домена, а в подкаталоге, и отдаётся статикой:
 * `next build` кладёт готовый каталог `out/`, его содержимое поднимается
 * в папку `alfaprint` на сервере. Ни Node, ни `next start` там не нужны.
 *
 * Отсюда три следствия, и все три обязательны:
 *
 * 1. `basePath` — Next сам подставляет `/alfaprint` во все свои ссылки:
 *    `_next/static`, шрифты, иконку, `<Link>`. Строки, написанные руками
 *    в JSX и CSS, он НЕ трогает: для них есть `BASE_PATH` в `lib/base.ts`.
 * 2. `trailingSlash` — на статике адрес приходит каталогом, и файл должен
 *    лежать как `alfaprint/index.html`, а не `alfaprint.html`.
 * 3. `output: 'export'` — ни серверных маршрутов, ни ISR на листе нет,
 *    так что уходить в рантайм не за чем.
 */
const BASE_PATH = '/alfaprint';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: BASE_PATH,
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
  images: { unoptimized: true },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

export default nextConfig;
