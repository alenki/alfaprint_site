import type { Metadata, Viewport } from 'next';
import { MotionConfig } from 'motion/react';
import './globals.css';
import { fontVariables } from '@/app/fonts';
import { PlateProvider, type SectionMeta } from '@/components/chrome/PlateProvider';
import { TopBar } from '@/components/chrome/TopBar';
import { ControlStrip } from '@/components/chrome/ControlStrip';
import { MobileCta } from '@/components/chrome/MobileCta';
import { CursorTrail } from '@/components/chrome/CursorTrail';
import { Makeready } from '@/components/chrome/Makeready';
import { NaryadProvider } from '@/state/NaryadContext';
import { localBusinessSchema } from '@/lib/schema';
import { SECTIONS } from '@/content/site';

/**
 * АДРЕС ЛИСТА. Сайт стоит в подкаталоге: lumako.ru/alfaprint, см. `next.config.ts`.
 * Отсюда его берут и канонический адрес, и Open Graph, и разметка организации:
 * все три обязаны указывать ТУДА, ГДЕ ЛИСТ ЛЕЖИТ НА САМОМ ДЕЛЕ. Когда клиент
 * заведёт собственный домен, правится эта строка и `basePath` в конфиге.
 */
const SITE_URL = 'https://lumako.ru/alfaprint';

/** Грунт и усиление ухода приводки: у хвоста листа она держится хуже. */
const GROUNDS: Record<string, { ground: string; gain: number }> = {
  '01': { ground: 'paper', gain: 0.6 },
  '02': { ground: 'paper', gain: 0.8 },
  '03': { ground: 'ink', gain: 1.0 },
  '04': { ground: 'paper-hi', gain: 1.0 },
  '05': { ground: 'ink', gain: 1.25 },
  '06': { ground: 'paper', gain: 1.0 },
  '08': { ground: 'ink', gain: 0.5 },
};

const SECTION_META: SectionMeta[] = SECTIONS.map((s) => ({
  id: s.id,
  n: s.n,
  title: s.title,
  ...GROUNDS[s.n],
}));

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Альфа Принт',
    template: '%s · Альфа Принт',
  },
  description:
    'Оперативная полиграфия, широкоформатная и УФ-печать, лазерная резка, гравировка, вышивка и сувениры в Нальчике. Тираж от одного экземпляра, часто в тот же день. Тарчокова, 29.',
  keywords: [
    'типография Нальчик',
    'полиграфия Нальчик',
    'печать визиток Нальчик',
    'баннеры Нальчик',
    'лазерная резка Нальчик',
    'гравировка Нальчик',
    'рекламное агентство Нальчик',
    'УФ-печать КБР',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: 'Альфа Принт',
    title: 'Альфа Принт · печатаем в Нальчике с 2014 года',
    description:
      'Визитки, баннеры, наклейки, гравировка, лазерная резка, печать по акрилу, дереву, ткани и шоколаду. Срочный тираж часто в тот же день.',
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#121110',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning ровно из-за скрипта приладки ниже: он ставит
       data-makeready ДО гидратации, поэтому на возврате в тот же сеанс атрибуты
       <html> у клиента заведомо богаче серверных. Гасится только сам <html>,
       вглубь эта отметка не идёт. */
    <html lang="ru" className={fontVariables} data-ground="paper" suppressHydrationWarning>
      <body>
        {/* ПЕРВОЕ, ЧТО ВЫПОЛНЯЕТСЯ НА СТРАНИЦЕ, и единственное, что обязано
            выполниться до первой отрисовки. Умеет он ровно одно: помнит, что
            приладку в этом сеансе уже смотрели. Метка ставится ДО того, как
            браузер что-нибудь нарисует, поэтому на возврате и на перезагрузке
            лист приладки не мелькает ни кадром; сам лист при этом печатается
            без единой строки JS и без этого скрипта уйдёт точно так же, см.
            `Makeready`. Всё, что скрипт умеет сломать, это лишний показ. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var d=document.documentElement,k="alfa:makeready";' +
              'if(sessionStorage.getItem(k))d.dataset.makeready="seen";' +
              'else sessionStorage.setItem(k,"1")}catch(e){}',
          }}
        />

        <a href="#main" className="skip-link t-label">
          К содержанию
        </a>

        {/* Без JS ракель не проходит, значит, маску надо снять, иначе набор
            останется под ней. Оттиски §03 при этом ложатся стопкой: без JS
            форму не переключить, а прочитать надо все десять. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                [data-reveal]{clip-path:none!important;opacity:1!important}
                .dv-sheet{position:static!important;display:block!important;
                  aspect-ratio:auto!important;max-height:none!important;overflow:visible!important}
                .dv-print{grid-area:auto!important;visibility:visible!important;
                  clip-path:none!important;opacity:1!important}
                .dv-print + .dv-print{margin-top:1.25rem}
                .dv-panel{position:static!important;height:auto!important;right:auto!important;
                  visibility:visible!important;clip-path:none!important;opacity:1!important}
                .dv-item{transform:none!important}
                .dv-plate[hidden]{display:block!important}
                .dv-mount::after{display:none!important}
                .dv-tail,.dv-toggle{display:none!important}
              `,
            }}
          />
        </noscript>

        {/* Лист приладки. Стоит ВНЕ MotionConfig намеренно: движения в нём
            нет ни одного кадра на motion/react, весь ход задан анимацией CSS,
            и жить он обязан раньше, чем оживёт React. */}
        <Makeready />

        <MotionConfig reducedMotion="user">
          <NaryadProvider>
            <PlateProvider sections={SECTION_META} />
            <TopBar />
            {children}
            <ControlStrip />
            <MobileCta />
            {/* Последним ребёнком листа намеренно: холст фиксированный, и
                внутри секции его заперло бы isolation, а внутри содержания
                срезал бы clip-path. Здесь же он не разрывает порядок чтения. */}
            <CursorTrail />
          </NaryadProvider>
        </MotionConfig>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(SITE_URL)) }}
        />
      </body>
    </html>
  );
}
